import prisma from "../config/prisma.js";

const movieSelect = {
  id: true,
  title: true,
  description: true,
  posterUrl: true,
  trailerUrl: true,
  duration: true,
  genre: true,
  language: true,
  status: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

const movieNotFound = () => {
  const error = new Error("Movie not found");
  error.statusCode = 404;
  return error;
};

const listPublicMovies = async (status) => prisma.movie.findMany({
  where: { status, isActive: true },
  orderBy: { createdAt: "desc" },
  select: movieSelect,
});

const getPublicMovie = async (id) => {
  const movie = await prisma.movie.findFirst({
    where: { id, isActive: true },
    select: movieSelect,
  });

  if (!movie) throw movieNotFound();
  return movie;
};

const listAdminMovies = async ({ status, isActive }) => prisma.movie.findMany({
  where: {
    ...(status ? { status } : {}),
    ...(isActive === undefined ? {} : { isActive }),
  },
  orderBy: { createdAt: "desc" },
  select: movieSelect,
});

const createMovie = async (data) => prisma.movie.create({
  data,
  select: movieSelect,
});

const updateMovie = async (id, data) => {
  const existingMovie = await prisma.movie.findUnique({ where: { id } });
  if (!existingMovie) throw movieNotFound();

  return prisma.movie.update({ where: { id }, data, select: movieSelect });
};

const updateMovieStatus = async (id, status) => updateMovie(id, { status });

const updateMovieActive = async (id, isActive) => updateMovie(id, { isActive });

export {
  createMovie,
  getPublicMovie,
  listAdminMovies,
  listPublicMovies,
  updateMovie,
  updateMovieActive,
  updateMovieStatus,
};