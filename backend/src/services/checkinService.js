const prisma = require("../config/prisma");
const ApiError = require("../utils/apiError");
const { toCheckinResponse } = require("../models/checkinModel");
const { toDateOnly } = require("../utils/date");
const { assertUuid } = require("../utils/id");

async function listCheckins(userId) {
  const checkins = await prisma.dailyCheckin.findMany({
    where: {
      userId
    },
    orderBy: {
      date: "desc"
    }
  });

  return checkins.map(toCheckinResponse);
}

async function createCheckin(userId, data) {
  const date = toDateOnly(data.date);
  const existingCheckin = await prisma.dailyCheckin.findUnique({
    where: {
      userId_date: {
        userId,
        date
      }
    }
  });

  if (existingCheckin) {
    throw new ApiError(409, "A check-in already exists for this date.");
  }

  const checkin = await prisma.dailyCheckin.create({
    data: {
      userId,
      date,
      mood: data.mood,
      energy: data.energy,
      note: data.note
    }
  });

  return toCheckinResponse(checkin);
}

async function getCheckinByDate(userId, dateString) {
  const checkin = await prisma.dailyCheckin.findUnique({
    where: {
      userId_date: {
        userId,
        date: toDateOnly(dateString)
      }
    }
  });

  if (!checkin) {
    throw new ApiError(404, "Check-in not found.");
  }

  return toCheckinResponse(checkin);
}

async function updateCheckin(userId, checkinId, data) {
  assertUuid(checkinId, "Check-in id");

  const existingCheckin = await prisma.dailyCheckin.findFirst({
    where: {
      id: checkinId,
      userId
    }
  });

  if (!existingCheckin) {
    throw new ApiError(404, "Check-in not found.");
  }

  const checkin = await prisma.dailyCheckin.update({
    where: {
      id: checkinId
    },
    data
  });

  return toCheckinResponse(checkin);
}

module.exports = {
  listCheckins,
  createCheckin,
  getCheckinByDate,
  updateCheckin
};
