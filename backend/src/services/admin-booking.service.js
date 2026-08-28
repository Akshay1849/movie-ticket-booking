import prisma from "../config/prisma.js";

const bookingSelect = {
  id: true,
  bookingReference: true,
  status: true,
  totalAmount: true,
  createdAt: true,
  user: { select: { id: true, email: true, mobile: true } },
  show: {
    select: {
      id: true,
      showDate: true,
      startTime: true,
      status: true,
      movie: { select: { id: true, title: true, posterUrl: true } },
      screen: {
        select: {
          id: true,
          name: true,
          theatre: { select: { id: true, name: true } },
        },
      },
    },
  },
  seats: {
    select: {
      seatId: true,
      price: true,
      seat: { select: { seatCode: true, category: true, row: true, seatNumber: true } },
    },
    orderBy: { seat: { seatCode: "asc" } },
  },
};

const notFoundError = () => {
  const error = new Error("Booking not found");
  error.statusCode = 404;
  return error;
};

const conflictError = (message) => {
  const error = new Error(message);
  error.statusCode = 409;
  return error;
};

const formatBooking = (booking) => ({
  id: booking.id,
  bookingReference: booking.bookingReference,
  status: booking.status,
  totalAmount: booking.totalAmount.toFixed(2),
  createdAt: booking.createdAt,
  customer: booking.user,
  show: {
    id: booking.show.id,
    showDate: booking.show.showDate.toISOString().slice(0, 10),
    startTime: booking.show.startTime.toISOString().slice(11, 19),
    status: booking.show.status,
    movie: booking.show.movie,
    screen: booking.show.screen,
  },
  seats: booking.seats.map((seat) => ({
    seatId: seat.seatId,
    seatCode: seat.seat.seatCode,
    category: seat.seat.category,
    row: seat.seat.row,
    seatNumber: seat.seat.seatNumber,
    price: seat.price.toFixed(2),
  })),
});

const listAdminBookings = async ({ date, showId, status, search }) => {
  const bookings = await prisma.booking.findMany({
    where: {
      ...(showId ? { showId } : {}),
      ...(status ? { status } : {}),
      ...(date ? { show: { showDate: date } } : {}),
      ...(search ? { bookingReference: { contains: search, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: bookingSelect,
  });
  return bookings.map(formatBooking);
};

const getAdminBooking = async (id) => {
  const booking = await prisma.booking.findUnique({ where: { id }, select: bookingSelect });
  if (!booking) throw notFoundError();
  return formatBooking(booking);
};

const updateAdminBookingStatus = async (id, nextStatus) => prisma.$transaction(async (transaction) => {
  const booking = await transaction.booking.findUnique({ where: { id }, select: { id: true, status: true } });
  if (!booking) throw notFoundError();

  const allowedTransitions = {
    PENDING: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["CANCELLED"],
    CANCELLED: [],
  };
  if (!allowedTransitions[booking.status].includes(nextStatus)) {
    throw conflictError(`Cannot change booking status from ${booking.status} to ${nextStatus}`);
  }

  const updatedBooking = await transaction.booking.update({
    where: { id },
    data: { status: nextStatus },
    select: bookingSelect,
  });
  return formatBooking(updatedBooking);
});

export { getAdminBooking, listAdminBookings, updateAdminBookingStatus };