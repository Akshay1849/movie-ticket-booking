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

const validateCreateBooking = (body = {}) => {
  const allowedFields = ["showId", "seatIds"];
  const unknownFields = Object.keys(body).filter((field) => !allowedFields.includes(field));
  if (unknownFields.length) throw createValidationError(`Unsupported booking fields: ${unknownFields.join(", ")}`);

  if (!Array.isArray(body.seatIds) || body.seatIds.length === 0) {
    throw createValidationError("At least one seat must be selected");
  }

  const seatIds = body.seatIds.map((seatId) => validateId(seatId, "seat ID"));
  if (new Set(seatIds).size !== seatIds.length) {
    throw createValidationError("Duplicate seat IDs are not allowed");
  }

  return {
    showId: validateId(body.showId, "show ID"),
    seatIds,
  };
};

const validateBookingId = (id) => validateId(id, "booking ID");

export { validateBookingId, validateCreateBooking };