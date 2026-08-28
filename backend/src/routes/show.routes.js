import express from "express";

import {
  changeStatus,
  create,
  getShow,
  listAllShows,
  listShows,
  update,
} from "../controllers/show.controller.js";
import authenticationRequired from "../middleware/auth.middleware.js";
import requireRoles from "../middleware/role.middleware.js";

const router = express.Router();
const managementAccess = [authenticationRequired, requireRoles("ADMIN", "THEATRE_MANAGER")];

router.get("/admin/all", ...managementAccess, listAllShows);
router.post("/", ...managementAccess, create);
router.patch("/:id/status", ...managementAccess, changeStatus);
router.patch("/:id", ...managementAccess, update);
router.get("/", listShows);
router.get("/:id", getShow);

export default router;