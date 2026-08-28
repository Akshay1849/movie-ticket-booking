import { getCurrentUser } from "../services/auth.service.js";
import { verifyToken } from "../utils/jwt.js";

const authenticationRequired = async (req, res, next) => {
  try {
    const authorization = req.get("authorization");
    const [scheme, token] = authorization?.split(" ") || [];

    if (scheme !== "Bearer" || !token) {
      const error = new Error("Authentication required");
      error.statusCode = 401;
      throw error;
    }

    const payload = verifyToken(token);
    if (!payload || typeof payload !== "object" || typeof payload.sub !== "string") {
      const error = new Error("Invalid token");
      error.statusCode = 401;
      throw error;
    }

    req.user = await getCurrentUser(payload.sub);
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      error.statusCode = 401;
      error.message = "Invalid or expired token";
    }
    next(error);
  }
};

export default authenticationRequired;