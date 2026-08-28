const createValidationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const normalizeEmail = (email) => {
  if (typeof email !== "string") {
    throw createValidationError("A valid email is required");
  }

  return email.trim().toLowerCase();
};

const validateCredentials = ({ email, password } = {}) => {
  const normalizedEmail = normalizeEmail(email);

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw createValidationError("A valid email is required");
  }
  if (typeof password !== "string" || password.length === 0) {
    throw createValidationError("Password is required");
  }

  return { email: normalizedEmail, password };
};

const validateRegistration = (credentials) => {
  const validated = validateCredentials(credentials);

  if (validated.password.length < 8) {
    throw createValidationError("Password must be at least 8 characters long");
  }

  return validated;
};

export { validateCredentials, validateRegistration };