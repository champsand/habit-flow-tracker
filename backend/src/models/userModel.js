function createUserRecord({ name, email, passwordHash }) {
  return {
    name,
    email,
    passwordHash
  };
}

function toPublicUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

module.exports = {
  createUserRecord,
  toPublicUser
};
