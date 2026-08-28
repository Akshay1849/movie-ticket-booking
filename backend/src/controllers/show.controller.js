import {
  createShow,
  getPublicShow,
  listAdminShows,
  listPublicMovieShows,
  listPublicShows,
  updateShow,
  updateShowStatus,
} from "../services/show.service.js";
import {
  SHOW_STATUSES,
  parseDate,
  validateCreateShow,
  validateId,
  validateStatus,
  validateUpdateShow,
} from "../validators/show.validator.js";

const listShows = async (req, res, next) => {
  try {
    const shows = await listPublicShows(parseDate(req.query.date));
    res.status(200).json({ success: true, shows });
  } catch (error) { next(error); }
};

const listMovieShows = async (req, res, next) => {
  try {
    const shows = await listPublicMovieShows(validateId(req.params.movieId, "movie ID"), parseDate(req.query.date));
    res.status(200).json({ success: true, shows });
  } catch (error) { next(error); }
};

const getShow = async (req, res, next) => {
  try {
    const show = await getPublicShow(validateId(req.params.id, "show ID"));
    res.status(200).json({ success: true, show });
  } catch (error) { next(error); }
};

const listAllShows = async (req, res, next) => {
  try {
    const showDate = req.query.date === undefined ? undefined : parseDate(req.query.date);
    const shows = await listAdminShows(showDate);
    res.status(200).json({ success: true, shows });
  } catch (error) { next(error); }
};

const create = async (req, res, next) => {
  try {
    const show = await createShow(validateCreateShow(req.body));
    res.status(201).json({ success: true, show });
  } catch (error) { next(error); }
};

const update = async (req, res, next) => {
  try {
    const show = await updateShow(validateId(req.params.id, "show ID"), validateUpdateShow(req.body));
    res.status(200).json({ success: true, show });
  } catch (error) { next(error); }
};

const changeStatus = async (req, res, next) => {
  try {
    const show = await updateShowStatus(validateId(req.params.id, "show ID"), validateStatus(req.body?.status));
    res.status(200).json({ success: true, show });
  } catch (error) { next(error); }
};

export { changeStatus, create, getShow, listAllShows, listMovieShows, listShows, update };