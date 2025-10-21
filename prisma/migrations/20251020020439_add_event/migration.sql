-- AlterTable
ALTER TABLE "public"."registrations" ADD COLUMN     "eventId" INTEGER;

-- CreateTable
CREATE TABLE "public"."events" (
    "id" SERIAL NOT NULL,
    "simiEventCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hour" TEXT NOT NULL,
    "place" TEXT NOT NULL,
    "topic" TEXT,
    "specializedProfessional" TEXT,
    "coordinator" TEXT,
    "speakers" TEXT[],
    "members" JSONB,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."registrations" ADD CONSTRAINT "registrations_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
