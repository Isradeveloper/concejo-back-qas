/*
  Warnings:

  - Added the required column `type` to the `participation_mechanisms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."participation_mechanisms" ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "type" TEXT NOT NULL;
