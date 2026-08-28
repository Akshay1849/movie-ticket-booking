import express from "express";

import {
  changeActive,
  changeStatus,
  create,
  getMovie,
  listAllMovies,
  listMovies,
  update,
} from "../controllers/movie.controller.js";
import authenticationRequired from "../middleware/auth.middleware.js";
import requireRoles from "../middleware/role.middleware.js";
import { listMovieShows } from "../controllers/show.controller.js";

const router = express.Router();
const managementAccess = [authenticationRequired, requireRoles("ADMIN", "THEATRE_MANAGER")];

router.get("/admin/all", ...managementAccess, listAllMovies);
router.post("/", ...managementAccess, create);
router.patch("/:id/status", ...managementAccess, changeStatus);
router.patch("/:id/active", ...managementAccess, changeActive);
router.patch("/:id", ...managementAccess, update);
router.get("/:movieId/shows", listMovieShows);
router.get("/", listMovies);
router.get("/:id", getMovie);

export default router;