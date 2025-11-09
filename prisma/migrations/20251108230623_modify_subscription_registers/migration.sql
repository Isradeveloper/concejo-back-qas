/*
  Warnings:

  - You are about to drop the column `organizationRole` on the `subscription_registers` table. All the data in the column will be lost.
  - You are about to drop the column `simiEventCode` on the `subscription_registers` table. All the data in the column will be lost.
  - Added the required column `simiTopicId` to the `subscription_registers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `topic` to the `subscription_registers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."subscription_registers" DROP COLUMN "organizationRole",
DROP COLUMN "simiEventCode",
ADD COLUMN     "simiTopicId" TEXT NOT NULL,
ADD COLUMN     "topic" TEXT NOT NULL;
