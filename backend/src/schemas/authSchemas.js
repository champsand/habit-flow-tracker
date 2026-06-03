const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(body) {
  const errors = {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || name.length < 2 || name.length > 80) {
    errors.name = "Name must be between 2 and 80 characters.";
  }

  if (!email || email.length > 254 || !emailPattern.test(email)) {
    errors.email = "A valid email is required.";
  }

  if (!password || password.length < 8 || password.length > 128) {
    errors.password = "Password must be between 8 and 128 characters.";
  } else if (password.trim().length === 0) {
    errors.password = "Password cannot be only spaces.";
  }

  return {
    value: { name, email, password },
    errors
  };
}

function validateLogin(body) {
  const errors = {};
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || email.length > 254 || !emailPattern.test(email)) {
    errors.email = "A valid email is required.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return {
    value: { email, password },
    errors
  };
}

module.exports = {
  validateRegister,
  validateLogin
};
