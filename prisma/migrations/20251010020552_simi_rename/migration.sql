/*
  Warnings:

  - You are about to drop the column `similEventCode` on the `participation_registers` table. All the data in the column will be lost.
  - You are about to drop the column `similEventCode` on the `proposal_registers` table. All the data in the column will be lost.
  - You are about to drop the column `similEventCode` on the `registrations` table. All the data in the column will be lost.
  - You are about to drop the column `similEventCode` on the `subscription_registers` table. All the data in the column will be lost.
  - You are about to drop the `simil_inactive_events` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `simiEventCode` to the `participation_registers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `simiEventCode` to the `subscription_registers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."simil_inactive_events" DROP CONSTRAINT "simil_inactive_events_userId_fkey";

-- AlterTable
ALTER TABLE "public"."participation_registers" DROP COLUMN "similEventCode",
ADD COLUMN     "simiEventCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."proposal_registers" DROP COLUMN "similEventCode",
ADD COLUMN     "simiEventCode" TEXT;

-- AlterTable
ALTER TABLE "public"."registrations" DROP COLUMN "similEventCode",
ADD COLUMN     "simiEventCode" TEXT;

-- AlterTable
ALTER TABLE "public"."subscription_registers" DROP COLUMN "similEventCode",
ADD COLUMN     "simiEventCode" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."simil_inactive_events";

-- CreateTable
CREATE TABLE "public"."simi_inactive_events" (
    "id" SERIAL NOT NULL,
    "simiEventCode" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "simi_inactive_events_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."simi_inactive_events" ADD CONSTRAINT "simi_inactive_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
