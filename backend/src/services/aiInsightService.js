const config = require("../config/env");
const { toDateString } = require("../utils/date");

function buildInsightInput(summaryData, checkins) {
  return {
    weekStartDate: summaryData.weekStartDate,
    weekEndDate: summaryData.weekEndDate,
    readableSummary: summaryData.readableSummary,
    progressData: summaryData.progressData,
    rankingData: summaryData.rankingData,
    topHabit: summaryData.topHabit,
    habitsNeedingAttention: summaryData.habitsNeedingAttention,
    checkins: checkins.map((checkin) => ({
      date: checkin.date instanceof Date ? toDateString(checkin.date) : checkin.date,
      mood: checkin.mood,
      energy: checkin.energy,
      note: checkin.note
    }))
  };
}

async function generateInsight(summaryData, checkins = []) {
  const input = buildInsightInput(summaryData, checkins);

  if (!config.geminiApiKey) {
    return createFallbackInsight(input, "GEMINI_API_KEY is not configured.");
  }

  try {
    const geminiResponse = await callGemini(input);
    return {
      insightText: geminiResponse.insightText,
      recommendationText: geminiResponse.recommendationText,
      provider: "gemini",
      model: config.geminiModel,
      providerConfigured: true,
      input
    };
  } catch (error) {
    return createFallbackInsight(input, `Gemini insight generation failed: ${error.message}`);
  }
}

async function callGemini(input) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    config.geminiModel
  )}:generateContent?key=${encodeURIComponent(config.geminiApiKey)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: buildGeminiPrompt(input)
            }
          ]
        }
      ],
      generationConfig: {
        temperature: config.geminiTemperature,
        maxOutputTokens: config.geminiMaxOutputTokens,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API returned ${response.status}: ${errorText.slice(0, 160)}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();

  if (!text) {
    throw new Error("Gemini API returned an empty response.");
  }

  return parseGeminiText(text);
}

function buildGeminiPrompt(input) {
  return [
    "You are Habit Flow's weekly insight writer for a responsive web habit tracker.",
    "Use the user's weekly habit progress and daily check-ins to give calm, practical feedback.",
    "Return only valid compact JSON with exactly these string keys: insightText, recommendationText.",
    "insightText: 1-2 short supportive sentences, maximum 220 characters.",
    "recommendationText: 1 specific next action, maximum 160 characters.",
    "Do not mention streaks, shame, diagnosis, therapy, or medical advice.",
    "Focus on weekly consistency and small next steps.",
    "",
    JSON.stringify(input, null, 2)
  ].join("\n");
}

function parseGeminiText(text) {
  try {
    const parsed = JSON.parse(extractJsonObject(stripJsonFence(text)));
    return normalizeInsightResult(parsed.insightText, parsed.recommendationText);
  } catch (error) {
    return normalizeInsightResult(text, "Choose one habit to make easier before the next weekly check-in.");
  }
}

function stripJsonFence(text) {
  return text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
}

function extractJsonObject(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return text;
  }

  return text.slice(start, end + 1);
}

function normalizeInsightResult(insightText, recommendationText) {
  return {
    insightText: cleanFrontendText(
      insightText,
      "Your weekly habit data is still light, so the best next step is to keep tracking consistently.",
      280
    ),
    recommendationText: cleanFrontendText(
      recommendationText,
      "Log at least one habit and one check-in this week.",
      180
    )
  };
}

function cleanFrontendText(value, fallback, maxLength) {
  const text = typeof value === "string" && value.trim() ? value.trim().replace(/\s+/g, " ") : fallback;

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}...`;
}

function createFallbackInsight(input, reason) {
  const topHabitName = input.topHabit?.name;
  const attentionHabitName = input.habitsNeedingAttention?.[0]?.name;
  const insightText = topHabitName
    ? `${topHabitName} had the strongest consistency this week. Keep the weekly focus simple and use your check-ins to notice what helped.`
    : "There is not enough weekly habit data yet to generate a detailed insight. Start with one small habit and log it consistently this week.";
  const recommendationText = attentionHabitName
    ? `Pick one small action to make ${attentionHabitName} easier next week.`
    : "Add or log at least one habit so next week's summary has useful patterns.";

  return {
    insightText,
    recommendationText,
    provider: "gemini",
    model: config.geminiModel,
    providerConfigured: Boolean(config.geminiApiKey),
    fallback: true,
    reason,
    input
  };
}

module.exports = {
  buildInsightInput,
  buildGeminiPrompt,
  generateInsight
};
