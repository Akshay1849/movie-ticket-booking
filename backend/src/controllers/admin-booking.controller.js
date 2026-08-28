import { getAdminBooking, listAdminBookings, updateAdminBookingStatus } from "../services/admin-booking.service.js";
import { validateListFilters, validateStatusBody, validateUuid } from "../validators/admin-booking.validator.js";

const list = async (req, res, next) => {
  try {
    const bookings = await listAdminBookings(validateListFilters(req.query));
    res.status(200).json({ success: true, bookings });
  } catch (error) { next(error); }
};

const details = async (req, res, next) => {
  try {
    const booking = await getAdminBooking(validateUuid(req.params.id, "booking ID"));
    res.status(200).json({ success: true, booking });
  } catch (error) { next(error); }
};

const changeStatus = async (req, res, next) => {
  try {
    const booking = await updateAdminBookingStatus(
      validateUuid(req.params.id, "booking ID"),
      validateStatusBody(req.body),
    );
    res.status(200).json({ success: true, booking });
  } catch (error) { next(error); }
};

export { changeStatus, details, list };