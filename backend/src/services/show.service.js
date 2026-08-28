import prisma from "../config/prisma.js";

const showSelect = {
  id: true,
  movieId: true,
  screenId: true,
  showDate: true,
  startTime: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  movie: {
    select: {
      id: true,
      title: true,
      posterUrl: true,
      trailerUrl: true,
      duration: true,
      genre: true,
      language: true,
      status: true,
    },
  },
  prices: {
    select: { category: true, amount: true },
    orderBy: { category: "asc" },
  },
};

const notFoundError = () => {
  const error = new Error("Show not found");
  error.statusCode = 404;
  return error;
};

const conflictError = (message) => {
  const error = new Error(message);
  error.statusCode = 409;
  return error;
};

const validateActiveMovie = async (transaction, movieId) => {
  const movie = await transaction.movie.findFirst({ where: { id: movieId, isActive: true }, select: { id: true } });
  if (!movie) {
    const error = new Error("Active movie not found");
    error.statusCode = 404;
    throw error;
  }
};

const findScreenOne = async (transaction) => {
  const screen = await transaction.screen.findFirst({
    where: { name: "Screen 1", theatre: { name: "Vasundhara Theatre 70MM" } },
    select: { id: true },
  });
  if (!screen) {
    const error = new Error("Active Screen 1 is not configured");
    error.statusCode = 404;
    throw error;
  }
  return screen;
};

const listShows = (where, orderBy) => prisma.show.findMany({ where, orderBy, select: showSelect });

const listPublicShows = (showDate) => listShows(
  { showDate, status: "ACTIVE" },
  { startTime: "asc" },
);

const listPublicMovieShows = (movieId, showDate) => listShows(
  { movieId, showDate, status: "ACTIVE", movie: { isActive: true } },
  { startTime: "asc" },
);

const getPublicShow = async (id) => {
  const show = await prisma.show.findFirst({ where: { id, status: "ACTIVE" }, select: showSelect });
  if (!show) throw notFoundError();
  return show;
};

const listAdminShows = (showDate) => listShows(
  showDate ? { showDate } : {},
  [{ showDate: "asc" }, { startTime: "asc" }],
);

const createShow = async ({ movieId, showDate, startTime, prices }) => prisma.$transaction(async (transaction) => {
  await validateActiveMovie(transaction, movieId);
  const screen = await findScreenOne(transaction);

  try {
    return await transaction.show.create({
      data: {
        movieId,
        screenId: screen.id,
        showDate,
        startTime,
        prices: { create: prices },
      },
      select: showSelect,
    });
  } catch (error) {
    if (error.code === "P2002") throw conflictError("A show already exists at this screen, date, and time");
    throw error;
  }
});

const updatePrices = async (transaction, showId, prices) => {
  for (const price of prices) {
    await transaction.showPrice.upsert({
      where: { showId_category: { showId, category: price.category } },
      update: { amount: price.amount },
      create: { showId, category: price.category, amount: price.amount },
    });
  }
};

const updateShow = async (id, data) => prisma.$transaction(async (transaction) => {
  const existingShow = await transaction.show.findUnique({
    where: { id },
    select: { id: true, movieId: true, screenId: true, showDate: true, startTime: true, bookings: { select: { id: true }, take: 1 } },
  });
  if (!existingShow) throw notFoundError();

  const hasBookings = existingShow.bookings.length > 0;
  const scheduleChanged = data.movieId !== undefined || data.showDate !== undefined || data.startTime !== undefined;
  if (hasBookings && scheduleChanged) {
    const error = new Error("Movie, date, and start time cannot change after bookings exist");
    error.statusCode = 409;
    throw error;
  }

  if (data.movieId !== undefined) await validateActiveMovie(transaction, data.movieId);

  const { prices, ...showData } = data;
  try {
    if (Object.keys(showData).length) {
      await transaction.show.update({ where: { id }, data: showData });
    }
    if (prices) await updatePrices(transaction, id, prices);
  } catch (error) {
    if (error.code === "P2002") throw conflictError("A show already exists at this screen, date, and time");
    throw error;
  }

  return transaction.show.findUnique({ where: { id }, select: showSelect });
});

const updateShowStatus = async (id, status) => {
  const show = await prisma.show.findUnique({ where: { id }, select: { id: true } });
  if (!show) throw notFoundError();
  return prisma.show.update({ where: { id }, data: { status }, select: showSelect });
};

export {
  createShow,
  getPublicShow,
  listAdminShows,
  listPublicMovieShows,
  listPublicShows,
  updateShow,
  updateShowStatus,
};