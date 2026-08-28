import express from "express";

import { dashboard } from "../controllers/admin.controller.js";
import authenticationRequired from "../middleware/auth.middleware.js";
import requireRoles from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/dashboard", authenticationRequired, requireRoles("ADMIN", "THEATRE_MANAGER"), dashboard);

export default router;