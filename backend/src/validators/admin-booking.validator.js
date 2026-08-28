const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED"];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const createValidationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const validateUuid = (value, field) => {
  if (!uuidPattern.test(value)) throw createValidationError(`Invalid ${field}`);
  return value;
};

const validateDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw createValidationError("date must use YYYY-MM-DD format");
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw createValidationError("date must be a valid calendar date");
  }

  return date;
};

const validateStatus = (status) => {
  if (!BOOKING_STATUSES.includes(status)) {
    throw createValidationError("status must be PENDING, CONFIRMED, or CANCELLED");
  }
  return status;
};

const validateListFilters = (query = {}) => {
  const filters = {};
  if (query.date !== undefined) filters.date = validateDate(query.date);
  if (query.showId !== undefined) filters.showId = validateUuid(query.showId, "show ID");
  if (query.status !== undefined) filters.status = validateStatus(query.status);
  if (query.search !== undefined) {
    if (typeof query.search !== "string" || query.search.trim().length === 0) {
      throw createValidationError("search must be a non-empty string");
    }
    filters.search = query.search.trim();
  }
  return filters;
};

const validateStatusBody = (body = {}) => {
  const fields = Object.keys(body);
  if (fields.length !== 1 || fields[0] !== "status") {
    throw createValidationError("Only status is allowed in this request");
  }
  return validateStatus(body.status);
};

export { validateDate, validateListFilters, validateStatusBody, validateUuid };