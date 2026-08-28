import express from "express";

import { cancel, create, details, mine } from "../controllers/booking.controller.js";
import authenticationRequired from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticationRequired);
router.post("/", create);
router.get("/my", mine);
router.patch("/:id/cancel", cancel);
router.get("/:id", details);

export default router;