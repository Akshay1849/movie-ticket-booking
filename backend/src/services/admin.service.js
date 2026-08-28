import prisma from "../config/prisma.js";

const activeBookingStatuses = new Set(["PENDING", "CONFIRMED"]);

const decimalToCents = (value) => {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value.toString());
  if (!match) return 0n;
  return BigInt(match[1]) * 100n + BigInt((match[2] || "").padEnd(2, "0") || "0");
};

const centsToAmount = (cents) => `${cents / 100n}.${String(cents % 100n).padStart(2, "0")}`;
const formatDate = (date) => date.toISOString().slice(0, 10);
const formatTime = (time) => time.toISOString().slice(11, 16);

const getDashboard = async ({ date }) => {
  const shows = await prisma.show.findMany({
    where: { showDate: date },
    orderBy: { startTime: "asc" },
    select: {
      id: true,
      movieId: true,
      showDate: true,
      startTime: true,
      status: true,
      movie: { select: { title: true } },
      screen: {
        select: {
          seats: { where: { isActive: true }, select: { id: true } },
        },
      },
      bookings: {
        select: {
          status: true,
          seats: { select: { price: true } },
        },
      },
    },
  });

  const summary = {
    totalBookings: 0,
    activeBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalRevenueCents: 0n,
  };

  const showSummaries = shows.map((show) => {
    const bookedSeats = show.bookings
      .filter((booking) => activeBookingStatuses.has(booking.status))
      .reduce((count, booking) => count + booking.seats.length, 0);
    let revenueCents = 0n;
    let activeBookings = 0;
    let cancelledBookings = 0;

    for (const booking of show.bookings) {
      summary.totalBookings += 1;
      if (booking.status === "CONFIRMED") {
        summary.confirmedBookings += 1;
        activeBookings += 1;
        for (const seat of booking.seats) revenueCents += decimalToCents(seat.price);
      } else if (booking.status === "PENDING") {
        summary.pendingBookings += 1;
        activeBookings += 1;
      } else if (booking.status === "CANCELLED") {
        summary.cancelledBookings += 1;
        cancelledBookings += 1;
      }
    }

    summary.activeBookings += activeBookings;
    summary.totalRevenueCents += revenueCents;
    const totalSeats = show.screen.seats.length;

    return {
      showId: show.id,
      movieId: show.movieId,
      movieTitle: show.movie.title,
      showDate: formatDate(show.showDate),
      startTime: formatTime(show.startTime),
      showStatus: show.status,
      totalSeats,
      bookedSeats,
      availableSeats: totalSeats - bookedSeats,
      totalBookings: show.bookings.length,
      activeBookings,
      cancelledBookings,
      revenue: centsToAmount(revenueCents),
    };
  });

  return {
    date: formatDate(date),
    summary: {
      totalBookings: summary.totalBookings,
      activeBookings: summary.activeBookings,
      confirmedBookings: summary.confirmedBookings,
      pendingBookings: summary.pendingBookings,
      cancelledBookings: summary.cancelledBookings,
      totalRevenue: centsToAmount(summary.totalRevenueCents),
    },
    shows: showSummaries,
  };
};

export { getDashboard };