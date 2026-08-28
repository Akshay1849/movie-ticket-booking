import express from "express";

import { changeStatus, details, list } from "../controllers/admin-booking.controller.js";
import authenticationRequired from "../middleware/auth.middleware.js";
import requireRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.use(authenticationRequired, requireRoles("ADMIN", "THEATRE_MANAGER"));
router.get("/", list);
router.patch("/:id/status", changeStatus);
router.get("/:id", details);

export default router;