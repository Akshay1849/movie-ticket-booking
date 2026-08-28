const MOVIE_STATUSES = ["NOW_SHOWING", "UPCOMING"];
const editableFields = [
  "title",
  "description",
  "posterUrl",
  "trailerUrl",
  "duration",
  "genre",
  "language",
];

const createValidationError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const validateText = (value, field) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw createValidationError(`${field} is required`);
  }

  return value.trim();
};

const validateOptionalText = (value, field) => {
  if (value === null) return null;
  if (typeof value !== "string") {
    throw createValidationError(`${field} must be a string or null`);
  }

  return value.trim();
};

const validateOptionalUrl = (value, field) => {
  if (value === null) return null;
  if (typeof value !== "string") {
    throw createValidationError(`${field} must be a valid HTTP/HTTPS URL or null`);
  }

  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
  } catch {
    throw createValidationError(`${field} must be a valid HTTP/HTTPS URL`);
  }

  return value;
};

const validateStatus = (status) => {
  if (!MOVIE_STATUSES.includes(status)) {
    throw createValidationError("status must be NOW_SHOWING or UPCOMING");
  }

  return status;
};

const validateDuration = (duration) => {
  if (!Number.isInteger(duration) || duration <= 0) {
    throw createValidationError("duration must be a positive integer");
  }

  return duration;
};

const validateCreateMovie = (body = {}) => {
  const allowedFields = new Set([...editableFields, "status"]);
  const unknownFields = Object.keys(body).filter((field) => !allowedFields.has(field));
  if (unknownFields.length > 0) {
    throw createValidationError(`Unsupported movie fields: ${unknownFields.join(", ")}`);
  }

  return {
    title: validateText(body.title, "title"),
    description: body.description === undefined ? null : validateOptionalText(body.description, "description"),
    posterUrl: body.posterUrl === undefined ? null : validateOptionalUrl(body.posterUrl, "posterUrl"),
    trailerUrl: body.trailerUrl === undefined ? null : validateOptionalUrl(body.trailerUrl, "trailerUrl"),
    duration: validateDuration(body.duration),
    genre: validateText(body.genre, "genre"),
    language: validateText(body.language, "language"),
    status: validateStatus(body.status),
  };
};

const validateUpdateMovie = (body = {}) => {
  const fields = Object.keys(body);
  const unknownFields = fields.filter((field) => !editableFields.includes(field));
  if (unknownFields.length > 0) {
    throw createValidationError(`Unsupported movie fields: ${unknownFields.join(", ")}`);
  }
  if (fields.length === 0) {
    throw createValidationError("At least one editable movie field is required");
  }

  const data = {};
  if (body.title !== undefined) data.title = validateText(body.title, "title");
  if (body.description !== undefined) data.description = validateOptionalText(body.description, "description");
  if (body.posterUrl !== undefined) data.posterUrl = validateOptionalUrl(body.posterUrl, "posterUrl");
  if (body.trailerUrl !== undefined) data.trailerUrl = validateOptionalUrl(body.trailerUrl, "trailerUrl");
  if (body.duration !== undefined) data.duration = validateDuration(body.duration);
  if (body.genre !== undefined) data.genre = validateText(body.genre, "genre");
  if (body.language !== undefined) data.language = validateText(body.language, "language");

  return data;
};

const validateMovieId = (id) => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw createValidationError("Invalid movie ID");
  }

  return id;
};

const validateActive = (isActive) => {
  if (typeof isActive !== "boolean") {
    throw createValidationError("isActive must be a boolean");
  }

  return isActive;
};

export {
  MOVIE_STATUSES,
  validateActive,
  validateCreateMovie,
  validateMovieId,
  validateStatus,
  validateUpdateMovie,
};