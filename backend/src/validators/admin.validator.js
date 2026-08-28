const createValidationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const parseDashboardDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw createValidationError("date must use YYYY-MM-DD format");
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw createValidationError("date must be a valid calendar date");
  }

  return { value, date };
};

const getDashboardDate = (value) => {
  if (value === undefined) {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    return { value: `${year}-${month}-${day}`, date: new Date(Date.UTC(year, now.getUTCMonth(), now.getUTCDate())) };
  }

  return parseDashboardDate(value);
};

export { getDashboardDate };