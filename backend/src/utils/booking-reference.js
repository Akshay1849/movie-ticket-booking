import crypto from "node:crypto";

const createBookingReference = () => {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `VT-${date}-${suffix}`;
};

export { createBookingReference };