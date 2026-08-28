const SHOW_STATUSES = ["ACTIVE", "CANCELLED"];
const SEAT_CATEGORIES = ["BALCONY", "FIRST_CLASS"];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const createValidationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const validateId = (id, field) => {
  if (!uuidPattern.test(id)) throw createValidationError(`Invalid ${field}`);
  return id;
};

const parseDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw createValidationError("showDate must use YYYY-MM-DD format");
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw createValidationError("showDate must be a valid calendar date");
  }

  return date;
};

const parseTime = (value) => {
  if (typeof value !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value)) {
    throw createValidationError("startTime must use HH:mm or HH:mm:ss format");
  }

  const [hours, minutes, seconds = "0"] = value.split(":").map(Number);
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, seconds));
};

const validateStatus = (status) => {
  if (!SHOW_STATUSES.includes(status)) throw createValidationError("status must be ACTIVE or CANCELLED");
  return status;
};

const validatePrices = (prices) => {
  if (!Array.isArray(prices) || prices.length !== 2) {
    throw createValidationError("prices must contain exactly BALCONY and FIRST_CLASS");
  }

  const categories = new Set();
  const validatedPrices = prices.map((price) => {
    if (!price || !SEAT_CATEGORIES.includes(price.category)) {
      throw createValidationError("Each price category must be BALCONY or FIRST_CLASS");
    }
    if (categories.has(price.category)) throw createValidationError("Duplicate price categories are not allowed");
    categories.add(price.category);

    const amount = typeof price.amount === "number" ? String(price.amount) : price.amount;
    if (typeof amount !== "string" || !/^\d+(?:\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) {
      throw createValidationError("Price amounts must be positive decimals with at most 2 decimal places");
    }

    return { category: price.category, amount };
  });

  if (!SEAT_CATEGORIES.every((category) => categories.has(category))) {
    throw createValidationError("Both BALCONY and FIRST_CLASS prices are required");
  }

  return validatedPrices;
};

const validateCreateShow = (body = {}) => {
  const allowedFields = ["movieId", "showDate", "startTime", "prices"];
  const unknownFields = Object.keys(body).filter((field) => !allowedFields.includes(field));
  if (unknownFields.length) throw createValidationError(`Unsupported show fields: ${unknownFields.join(", ")}`);

  return {
    movieId: validateId(body.movieId, "movie ID"),
    showDate: parseDate(body.showDate),
    startTime: parseTime(body.startTime),
    prices: validatePrices(body.prices),
  };
};

const validateUpdateShow = (body = {}) => {
  const allowedFields = ["movieId", "showDate", "startTime", "prices"];
  const fields = Object.keys(body);
  const unknownFields = fields.filter((field) => !allowedFields.includes(field));
  if (unknownFields.length) throw createValidationError(`Unsupported show fields: ${unknownFields.join(", ")}`);
  if (!fields.length) throw createValidationError("At least one editable show field is required");

  const data = {};
  if (body.movieId !== undefined) data.movieId = validateId(body.movieId, "movie ID");
  if (body.showDate !== undefined) data.showDate = parseDate(body.showDate);
  if (body.startTime !== undefined) data.startTime = parseTime(body.startTime);
  if (body.prices !== undefined) data.prices = validatePrices(body.prices);
  return data;
};

export {
  SHOW_STATUSES,
  parseDate,
  validateCreateShow,
  validateId,
  validateStatus,
  validateUpdateShow,
};