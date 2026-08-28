import {
  createMovie,
  getPublicMovie,
  listAdminMovies,
  listPublicMovies,
  updateMovie,
  updateMovieActive,
  updateMovieStatus,
} from "../services/movie.service.js";
import {
  MOVIE_STATUSES,
  validateActive,
  validateCreateMovie,
  validateMovieId,
  validateStatus,
  validateUpdateMovie,
} from "../validators/movie.validator.js";

const listMovies = async (req, res, next) => {
  try {
    if (!MOVIE_STATUSES.includes(req.query.status)) {
      const error = new Error("status must be NOW_SHOWING or UPCOMING");
      error.statusCode = 400;
      throw error;
    }

    const movies = await listPublicMovies(req.query.status);
    res.status(200).json({ success: true, movies });
  } catch (error) {
    next(error);
  }
};

const getMovie = async (req, res, next) => {
  try {
    const movie = await getPublicMovie(validateMovieId(req.params.id));
    res.status(200).json({ success: true, movie });
  } catch (error) {
    next(error);
  }
};

const listAllMovies = async (req, res, next) => {
  try {
    const { status, isActive } = req.query;
    if (status !== undefined) validateStatus(status);
    let activeFilter;
    if (isActive !== undefined) {
      if (!["true", "false"].includes(isActive)) {
        const error = new Error("isActive must be true or false");
        error.statusCode = 400;
        throw error;
      }
      activeFilter = isActive === "true";
    }

    const movies = await listAdminMovies({ status, isActive: activeFilter });
    res.status(200).json({ success: true, movies });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const movie = await createMovie(validateCreateMovie(req.body));
    res.status(201).json({ success: true, movie });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const movie = await updateMovie(validateMovieId(req.params.id), validateUpdateMovie(req.body));
    res.status(200).json({ success: true, movie });
  } catch (error) {
    next(error);
  }
};

const changeStatus = async (req, res, next) => {
  try {
    const movie = await updateMovieStatus(
      validateMovieId(req.params.id),
      validateStatus(req.body?.status),
    );
    res.status(200).json({ success: true, movie });
  } catch (error) {
    next(error);
  }
};

const changeActive = async (req, res, next) => {
  try {
    const movie = await updateMovieActive(
      validateMovieId(req.params.id),
      validateActive(req.body?.isActive),
    );
    res.status(200).json({ success: true, movie });
  } catch (error) {
    next(error);
  }
};

export { changeActive, changeStatus, create, getMovie, listAllMovies, listMovies, update };