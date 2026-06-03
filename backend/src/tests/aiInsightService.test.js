process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://user:pass@localhost:5432/habit_flow";

const assert = require("assert");
const test = require("node:test");

function loadAiInsightService() {
  delete require.cache[require.resolve("../config/env")];
  delete require.cache[require.resolve("../services/aiInsightService")];
  return require("../services/aiInsightService");
}

test("Gemini insight service parses successful API responses", async (t) => {
  process.env.GEMINI_API_KEY = "test-key";
  process.env.GEMINI_MODEL = "gemini-test-model";

  const originalFetch = global.fetch;

  t.after(() => {
    global.fetch = originalFetch;
    process.env.GEMINI_API_KEY = "";
    delete require.cache[require.resolve("../config/env")];
    delete require.cache[require.resolve("../services/aiInsightService")];
  });

  global.fetch = async (url, options) => {
    assert.match(url, /gemini-test-model:generateContent/);
    assert.equal(options.method, "POST");

    return {
      ok: true,
      async json() {
        return {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      insightText: "You stayed consistent with study sessions this week. Your check-ins show steady energy, which likely helped you keep momentum.",
                      recommendationText: "Keep study sessions short and schedule them before low-energy hours."
                    })
                  }
                ]
              }
            }
          ]
        };
      }
    };
  };

  const aiInsightService = loadAiInsightService();
  const insight = await aiInsightService.generateInsight(
    {
      weekStartDate: "2026-04-27",
      weekEndDate: "2026-05-03",
      progressData: [],
      rankingData: [],
      topHabit: { name: "Study" },
      habitsNeedingAttention: [],
      readableSummary: "Study was strongest."
    },
    []
  );

  assert.equal(insight.provider, "gemini");
  assert.equal(insight.model, "gemini-test-model");
  assert.equal(insight.providerConfigured, true);
  assert.equal(insight.fallback, undefined);
  assert.match(insight.insightText, /study sessions/i);
  assert.match(insight.recommendationText, /short/i);
});
