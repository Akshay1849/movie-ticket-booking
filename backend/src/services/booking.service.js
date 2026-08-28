import prisma from "../config/prisma.js";
import { createBookingReference } from "../utils/booking-reference.js";

const bookingSelect = {
  id: true,
  bookingReference: true,
  status: true,
  totalAmount: true,
  createdAt: true,
  show: {
    select: {
      id: true,
      showDate: true,
      startTime: true,
      screen: {
        select: {
          id: true,
          name: true,
          theatre: { select: { id: true, name: true } },
        },
      },
      movie: { select: { id: true, title: true, posterUrl: true } },
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

const notFoundError = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

const conflictError = (message) => {
  const error = new Error(message);
  error.statusCode = 409;
  return error;
};

const decimalToCents = (value) => {
  const text = value.toString();
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text);
  if (!match) return null;
  return BigInt(match[1]) * 100n + BigInt((match[2] || "").padEnd(2, "0") || "0");
};

const centsToAmount = (cents) => {
  const whole = cents / 100n;
  const fraction = String(cents % 100n).padStart(2, "0");
  return `${whole}.${fraction}`;
};

const formatBooking = (booking) => ({
  id: booking.id,
  bookingReference: booking.bookingReference,
  status: booking.status,
  show: {
    id: booking.show.id,
    showDate: booking.show.showDate.toISOString().slice(0, 10),
    startTime: booking.show.startTime.toISOString().slice(11, 19),
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
  totalAmount: booking.totalAmount.toFixed(2),
  createdAt: booking.createdAt,
});

const loadOwnedBooking = async (userId, bookingId) => {
  const booking = await prisma.booking.findFirst({ where: { id: bookingId, userId }, select: bookingSelect });
  if (!booking) throw notFoundError("Booking not found");
  return formatBooking(booking);
};

const cancelBooking = async (userId, bookingId) => prisma.$transaction(async (transaction) => {
  const booking = await transaction.booking.findFirst({
    where: { id: bookingId, userId },
    select: { id: true, status: true },
  });
  if (!booking) throw notFoundError("Booking not found");
  if (booking.status === "CANCELLED") throw conflictError("Booking is already cancelled");

  await transaction.booking.update({
    where: { id: booking.id },
    data: { status: "CANCELLED" },
  });

  const updatedBooking = await transaction.booking.findUnique({ where: { id: booking.id }, select: bookingSelect });
  return formatBooking(updatedBooking);
});

const listMyBookings = async (userId) => {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: bookingSelect,
  });
  return bookings.map(formatBooking);
};

const createBooking = async (userId, { showId, seatIds }) => {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(async (transaction) => {
        const show = await transaction.show.findUnique({
          where: { id: showId },
          select: {
            id: true,
            status: true,
            screenId: true,
            movie: { select: { isActive: true } },
            prices: { select: { category: true, amount: true } },
          },
        });
        if (!show || show.status !== "ACTIVE" || !show.movie.isActive) {
          throw notFoundError("Show not found or unavailable");
        }

        const seats = await transaction.seat.findMany({
          where: { id: { in: seatIds } },
          select: { id: true, screenId: true, category: true, isActive: true },
        });
        if (seats.length !== seatIds.length) throw notFoundError("One or more seats were not found");
        if (seats.some((seat) => seat.screenId !== show.screenId)) throw conflictError("One or more seats do not belong to this show");
        if (seats.some((seat) => !seat.isActive)) throw conflictError("One or more seats are inactive");

        const priceByCategory = new Map(show.prices.map((price) => [price.category, decimalToCents(price.amount)]));
        const bookingSeatData = seats.map((seat) => {
          const price = priceByCategory.get(seat.category);
          if (price === undefined || price === null) throw conflictError(`Price is not configured for ${seat.category}`);
          return { showId, seatId: seat.id, price: centsToAmount(price), cents: price };
        });
        const totalCents = bookingSeatData.reduce((total, seat) => total + seat.cents, 0n);

        const alreadyBooked = await transaction.bookingSeat.findMany({
          where: { showId, seatId: { in: seatIds } },
          select: { seatId: true },
        });
        if (alreadyBooked.length) throw conflictError("One or more selected seats are already booked");

        const booking = await transaction.booking.create({
          data: {
            bookingReference: createBookingReference(),
            userId,
            showId,
            totalAmount: centsToAmount(totalCents),
            seats: { create: bookingSeatData.map(({ cents: _cents, ...seat }) => seat) },
          },
          select: bookingSelect,
        });
        return formatBooking(booking);
      });
    } catch (error) {
      if (error.code === "P2002" && attempt < 2) continue;
      if (error.code === "P2002") throw conflictError("One or more selected seats are already booked");
      throw error;
    }
  }
  throw conflictError("Could not create booking");
};

export { cancelBooking, createBooking, listMyBookings, loadOwnedBooking };