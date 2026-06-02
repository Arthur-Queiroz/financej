-- CreateEnum
CREATE TYPE "VaultDirection" AS ENUM ('IN', 'OUT');

-- AlterTable
ALTER TABLE "VaultDeposit" ADD COLUMN     "direction" "VaultDirection" NOT NULL DEFAULT 'IN';
