import express from "express";

import { getMe, loginUser, register } from "../controllers/auth.controller.js";
import authenticationRequired from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", loginUser);
router.get("/me", authenticationRequired, getMe);

export default router;