-- CreateEnum
CREATE TYPE "ShowStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- AlterTable
ALTER TABLE "Show" ADD COLUMN     "status" "ShowStatus" NOT NULL DEFAULT 'ACTIVE';
