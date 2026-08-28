import { getShowSeatAvailability } from "../services/seat.service.js";
import { validateId } from "../validators/show.validator.js";

const getSeats = async (req, res, next) => {
  try {
    const availability = await getShowSeatAvailability(validateId(req.params.showId, "show ID"));
    res.status(200).json({ success: true, ...availability });
  } catch (error) {
    next(error);
  }
};

export { getSeats };