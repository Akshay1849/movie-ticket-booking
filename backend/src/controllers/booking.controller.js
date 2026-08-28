import { cancelBooking, createBooking, listMyBookings, loadOwnedBooking } from "../services/booking.service.js";
import { validateBookingId, validateCreateBooking } from "../validators/booking.validator.js";

const create = async (req, res, next) => {
  try {
    const booking = await createBooking(req.user.id, validateCreateBooking(req.body));
    res.status(201).json({ success: true, message: "Booking created successfully", booking });
  } catch (error) { next(error); }
};

const mine = async (req, res, next) => {
  try {
    const bookings = await listMyBookings(req.user.id);
    res.status(200).json({ success: true, bookings });
  } catch (error) { next(error); }
};

const details = async (req, res, next) => {
  try {
    const booking = await loadOwnedBooking(req.user.id, validateBookingId(req.params.id));
    res.status(200).json({ success: true, booking });
  } catch (error) { next(error); }
};

const cancel = async (req, res, next) => {
  try {
    const booking = await cancelBooking(req.user.id, validateBookingId(req.params.id));
    res.status(200).json({ success: true, message: "Booking cancelled successfully", booking });
  } catch (error) { next(error); }
};

export { cancel, create, details, mine };