import "dotenv/config";

import prisma from "../src/config/prisma.js";

const theatreId = "theatre-vasundhara-70mm";
const screenName = "Screen 1";
const developmentDate = new Date("2026-08-28T00:00:00.000Z");
const showTimesByMovie = [[11, 18], [14, 21]];
const oldDevelopmentMovieIds = [
  "dev-movie-midnight-signal",
  "dev-movie-last-monsoon",
  "dev-movie-orbit-seven",
  "dev-movie-paper-kites",
];
const prices = [
  { category: "BALCONY", amount: "180.00" },
  { category: "FIRST_CLASS", amount: "120.00" },
];

const developmentMovies = [
  {
    title: "Midnight Signal",
    description: "A radio engineer follows a mysterious transmission through a city-wide blackout.",
    posterUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900",
    trailerUrl: "https://www.youtube.com/watch?v=demo-midnight-signal",
    duration: 128,
    genre: "Sci-Fi Thriller",
    language: "English",
    status: "NOW_SHOWING",
    isActive: true,
  },
  {
    title: "The Last Monsoon",
    description: "Two estranged siblings return home to settle an old promise before the rains end.",
    posterUrl: "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=900",
    trailerUrl: "https://www.youtube.com/watch?v=demo-last-monsoon",
    duration: 116,
    genre: "Drama",
    language: "Hindi",
    status: "NOW_SHOWING",
    isActive: true,
  },
  {
    title: "Orbit Seven",
    description: "A rookie astronaut must choose between a rescue mission and the discovery of a lifetime.",
    posterUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=900",
    trailerUrl: "https://www.youtube.com/watch?v=demo-orbit-seven",
    duration: 135,
    genre: "Adventure",
    language: "English",
    status: "UPCOMING",
    isActive: true,
  },
  {
    title: "Paper Kites",
    description: "A young designer rebuilds her family workshop and finds an unexpected new beginning.",
    posterUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900",
    trailerUrl: "https://www.youtube.com/watch?v=demo-paper-kites",
    duration: 104,
    genre: "Family",
    language: "Telugu",
    status: "UPCOMING",
    isActive: true,
  },
];

function getStartTime(hour) {
  return new Date(Date.UTC(1970, 0, 1, hour, 0, 0));
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

async function verifyScreen(transaction) {
  const theatre = await transaction.theatre.findUnique({ where: { id: theatreId } });
  if (!theatre) throw new Error(`Seeded theatre not found: ${theatreId}`);

  const screen = await transaction.screen.findUnique({
    where: { theatreId_name: { theatreId: theatre.id, name: screenName } },
  });
  if (!screen) throw new Error(`Seeded screen not found: ${screenName}`);

  return screen;
}

async function removeLegacyDevelopmentData(transaction) {
  const legacyShowWithBooking = await transaction.show.findFirst({
    where: { movieId: { in: oldDevelopmentMovieIds }, bookings: { some: {} } },
    select: { id: true },
  });
  const legacyShowWithBookedSeat = await transaction.show.findFirst({
    where: { movieId: { in: oldDevelopmentMovieIds }, bookingSeats: { some: {} } },
    select: { id: true },
  });

  if (legacyShowWithBooking || legacyShowWithBookedSeat) {
    throw new Error("Legacy development data has bookings and cannot be removed safely");
  }

  const deletedShows = await transaction.show.deleteMany({ where: { movieId: { in: oldDevelopmentMovieIds } } });
  const deletedMovies = await transaction.movie.deleteMany({ where: { id: { in: oldDevelopmentMovieIds } } });
  return { deletedMovies: deletedMovies.count, deletedShows: deletedShows.count };
}

async function upsertMovie(transaction, movie) {
  const existingMovie = await transaction.movie.findFirst({ where: { title: movie.title } });
  const savedMovie = existingMovie
    ? await transaction.movie.update({ where: { id: existingMovie.id }, data: movie })
    : await transaction.movie.create({ data: movie });

  return { movie: savedMovie, action: existingMovie ? "updated" : "created" };
}

async function upsertShow(transaction, screenId, movieId, hour) {
  const startTime = getStartTime(hour);
  const where = { screenId_showDate_startTime: { screenId, showDate: developmentDate, startTime } };
  const existingShow = await transaction.show.findUnique({ where });

  if (existingShow && existingShow.movieId !== movieId) {
    throw new Error(`A non-development show already uses ${formatDate(developmentDate)} at ${hour}:00`);
  }

  const show = await transaction.show.upsert({
    where,
    update: { movieId, status: "ACTIVE" },
    create: { movieId, screenId, showDate: developmentDate, startTime, status: "ACTIVE" },
  });

  for (const price of prices) {
    await transaction.showPrice.upsert({
      where: { showId_category: { showId: show.id, category: price.category } },
      update: { amount: price.amount },
      create: { showId: show.id, category: price.category, amount: price.amount },
    });
  }

  return { action: existingShow ? "updated" : "created" };
}

async function main() {
  const summary = { moviesCreated: 0, moviesUpdated: 0, showsCreated: 0, showsUpdated: 0, legacyMoviesRemoved: 0, legacyShowsRemoved: 0 };

  await prisma.$transaction(async (transaction) => {
    const removed = await removeLegacyDevelopmentData(transaction);
    summary.legacyMoviesRemoved = removed.deletedMovies;
    summary.legacyShowsRemoved = removed.deletedShows;

    const screen = await verifyScreen(transaction);
    const savedMovies = [];

    for (const movie of developmentMovies) {
      const result = await upsertMovie(transaction, movie);
      savedMovies.push(result.movie);
      summary[result.action === "created" ? "moviesCreated" : "moviesUpdated"] += 1;
    }

    const nowShowingMovies = savedMovies.filter(({ status }) => status === "NOW_SHOWING");
    for (const [movieIndex, movie] of nowShowingMovies.entries()) {
      for (const hour of showTimesByMovie[movieIndex]) {
        const result = await upsertShow(transaction, screen.id, movie.id, hour);
        summary[result.action === "created" ? "showsCreated" : "showsUpdated"] += 1;
      }
    }
  });

  console.log(`Development data seeded for ${formatDate(developmentDate)}`);
  console.log(`Movies: ${summary.moviesCreated} created, ${summary.moviesUpdated} updated`);
  console.log(`Shows: ${summary.showsCreated} created, ${summary.showsUpdated} updated`);
  console.log(`Legacy development records removed: ${summary.legacyMoviesRemoved} movies, ${summary.legacyShowsRemoved} shows`);
  console.log("Counts: 4 movies, 4 active shows, 2 prices per show");
}

try {
  await main();
} catch (error) {
  console.error(`Development data seed failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
