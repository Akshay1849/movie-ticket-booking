import jwt from "jsonwebtoken";

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET is not configured");
    error.statusCode = 500;
    throw error;
  }

  return process.env.JWT_SECRET;
};

const generateToken = (user) => jwt.sign(
  { sub: user.id, role: user.role },
  getJwtSecret(),
  { expiresIn: "7d" },
);

const verifyToken = (token) => jwt.verify(token, getJwtSecret());

export { generateToken, verifyToken };