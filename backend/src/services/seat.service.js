import prisma from "../config/prisma.js";

const showNotFound = () => {
  const error = new Error("Show not found");
  error.statusCode = 404;
  return error;
};

const formatDate = (value) => value.toISOString().slice(0, 10);
const formatTime = (value) => value.toISOString().slice(11, 19);

const getShowSeatAvailability = async (showId) => {
  const show = await prisma.show.findFirst({
    where: { id: showId, status: "ACTIVE" },
    select: {
      id: true,
      showDate: true,
      startTime: true,
      movie: {
        select: { id: true, title: true, posterUrl: true },
      },
      screen: {
        select: {
          id: true,
          name: true,
          seats: {
            where: { isActive: true },
            select: { id: true, seatCode: true, category: true, row: true, seatNumber: true },
            orderBy: [{ row: "asc" }, { seatNumber: "asc" }],
          },
        },
      },
      prices: {
        select: { category: true, amount: true },
      },
      bookingSeats: {
        where: { booking: { status: { in: ["PENDING", "CONFIRMED"] } } },
        select: { seatId: true },
      },
    },
  });

  if (!show) throw showNotFound();

  const pricesByCategory = new Map(show.prices.map((price) => [price.category, price.amount.toFixed(2)]));
  const bookedSeatIds = new Set(show.bookingSeats.map((bookingSeat) => bookingSeat.seatId));

  return {
    show: {
      id: show.id,
      showDate: formatDate(show.showDate),
      startTime: formatTime(show.startTime),
      movie: show.movie,
      screen: { id: show.screen.id, name: show.screen.name },
    },
    seats: show.screen.seats.map((seat) => ({
      ...seat,
      status: bookedSeatIds.has(seat.id) ? "BOOKED" : "AVAILABLE",
      price: pricesByCategory.get(seat.category) ?? null,
    })),
  };
};

export { getShowSeatAvailability };