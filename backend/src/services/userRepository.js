const prisma = require("../config/prisma");
const { isUuid } = require("../utils/id");

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function findByEmail(email) {
  return prisma.user.findUnique({
    where: {
      email: normalizeEmail(email)
    }
  });
}

async function findById(id) {
  if (!isUuid(id)) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      id
    }
  });
}

async function create(user) {
  return prisma.user.create({
    data: user
  });
}

async function update(userId, changes) {
  return prisma.user.update({
    where: {
      id: userId
    },
    data: changes
  });
}

module.exports = {
  normalizeEmail,
  findByEmail,
  findById,
  create,
  update
};
