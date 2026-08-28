import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const layouts = {
  BALCONY: {
    A: [[1, 11], [12, 14], [16, 21]],
    B: [[1, 8], [10, 19]],
    C: [[1, 9], [10, 21], [22, 30]],
    D: [[1, 9], [10, 21], [22, 30]],
    E: [[1, 9], [10, 21], [22, 30]],
    F: [[1, 9], [10, 21], [22, 30]],
    G: [[1, 7], [8, 19], [20, 28]],
  },
  FIRST_CLASS: {
    A: [[1, 5], [6, 17], [19, 23]],
    B: [[1, 5], [6, 17], [19, 23]],
    C: [[1, 6], [7, 18], [20, 24]],
    D: [[1, 6], [7, 18], [20, 24]],
    E: [[1, 6], [7, 18], [20, 24]],
    F: [[1, 6], [7, 18], [20, 24]],
    G: [[1, 6], [7, 18], [20, 23]],
    H: [[1, 6], [7, 18], [20, 23]],
    I: [[1, 6], [7, 18], [20, 23]],
    J: [[1, 6], [7, 18], [20, 23]],
    K: [[1, 5], [6, 17], [19, 24]],
    L: [[1, 6], [7, 18], [20, 25]],
    M: [[1, 6], [7, 18], [20, 25]],
    N: [[1, 6], [7, 18], [20, 25]],
    O: [[1, 6], [7, 18], [20, 25]],
    P: [[1, 6], [7, 18], [20, 25]],
    Q: [[1, 5], [6, 17], [19, 24]],
  },
};

function buildSeats(screenId) {
  return Object.entries(layouts).flatMap(([category, rows]) =>
    Object.entries(rows).flatMap(([row, blocks]) =>
      blocks.flatMap(([firstSeat, lastSeat]) =>
        Array.from({ length: lastSeat - firstSeat + 1 }, (_, index) => {
          const seatNumber = firstSeat + index;
          const prefix = category === "BALCONY" ? "BAL" : "FC";

          return {
            screenId,
            seatCode: `${prefix}-${row}${seatNumber}`,
            category,
            row,
            seatNumber,
            isActive: true,
          };
        }),
      ),
    ),
  );
}

function verifySeatData(seats) {
  const balconyCount = seats.filter((seat) => seat.category === "BALCONY").length;
  const firstClassCount = seats.filter((seat) => seat.category === "FIRST_CLASS").length;
  const seatCodes = seats.map((seat) => seat.seatCode);
  const screenSeatKeys = seats.map((seat) => `${seat.screenId}:${seat.seatCode}`);
  const categoryByCode = new Map();

  for (const seat of seats) {
    const existingCategory = categoryByCode.get(seat.seatCode);
    if (existingCategory && existingCategory !== seat.category) {
      throw new Error(`Seat belongs to multiple categories: ${seat.seatCode}`);
    }
    categoryByCode.set(seat.seatCode, seat.category);
  }

  if (balconyCount !== 186 || firstClassCount !== 390 || seats.length !== 576) {
    throw new Error(
      `Seat count mismatch: total=${seats.length}, balcony=${balconyCount}, firstClass=${firstClassCount}`,
    );
  }
  if (new Set(seatCodes).size !== seatCodes.length) {
    throw new Error("Duplicate seatCode detected");
  }
  if (new Set(screenSeatKeys).size !== screenSeatKeys.length) {
    throw new Error("Duplicate [screenId, seatCode] detected");
  }

  return { total: seats.length, balcony: balconyCount, firstClass: firstClassCount };
}

const initialSeatData = buildSeats("screen-1");
const expectedCounts = verifySeatData(initialSeatData);

try {
  // Neon pooler (PgBouncer transaction mode) cannot reliably start Prisma
  // interactive transactions ($transaction(async ...)), which caused P2028.
  const theatre = await prisma.theatre.upsert({
    where: { id: "theatre-vasundhara-70mm" },
    update: { name: "Vasundhara Theatre 70MM" },
    create: { id: "theatre-vasundhara-70mm", name: "Vasundhara Theatre 70MM" },
  });

  const screen = await prisma.screen.upsert({
    where: { theatreId_name: { theatreId: theatre.id, name: "Screen 1" } },
    update: {},
    create: {
      id: "screen-vasundhara-1",
      name: "Screen 1",
      theatreId: theatre.id,
    },
  });

  const seats = initialSeatData.map(({ screenId: _screenId, ...seat }) => ({
    ...seat,
    screenId: screen.id,
  }));

  const existingSeats = await prisma.seat.findMany({
    where: { screenId: screen.id },
    select: {
      seatCode: true,
      category: true,
      row: true,
      seatNumber: true,
      isActive: true,
    },
  });
  const existingByCode = new Map(existingSeats.map((seat) => [seat.seatCode, seat]));

  const seatsToCreate = seats.filter((seat) => !existingByCode.has(seat.seatCode));
  const seatsToUpdate = seats.filter((seat) => {
    const existing = existingByCode.get(seat.seatCode);
    return (
      existing &&
      (existing.category !== seat.category ||
        existing.row !== seat.row ||
        existing.seatNumber !== seat.seatNumber ||
        existing.isActive !== true)
    );
  });

  if (seatsToCreate.length > 0) {
    await prisma.seat.createMany({ data: seatsToCreate });
  }

  for (const seat of seatsToUpdate) {
    await prisma.seat.update({
      where: { screenId_seatCode: { screenId: screen.id, seatCode: seat.seatCode } },
      data: {
        category: seat.category,
        row: seat.row,
        seatNumber: seat.seatNumber,
        isActive: true,
      },
    });
  }

  const [total, balcony, firstClass] = await Promise.all([
    prisma.seat.count({ where: { screenId: screen.id } }),
    prisma.seat.count({ where: { screenId: screen.id, category: "BALCONY" } }),
    prisma.seat.count({ where: { screenId: screen.id, category: "FIRST_CLASS" } }),
  ]);

  if (total !== expectedCounts.total || balcony !== expectedCounts.balcony || firstClass !== expectedCounts.firstClass) {
    throw new Error(`Database seat count mismatch: total=${total}, balcony=${balcony}, firstClass=${firstClass}`);
  }

  console.log(
    `Seed verification: theatre=${theatre.id}, screen=${screen.id}, total=${total}, balcony=${balcony}, firstClass=${firstClass}`,
  );
} finally {
  await prisma.$disconnect();
}