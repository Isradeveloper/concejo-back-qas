-- DropForeignKey
ALTER TABLE "public"."verification_codes" DROP CONSTRAINT "verification_codes_userId_fkey";

-- AddForeignKey
ALTER TABLE "public"."verification_codes" ADD CONSTRAINT "verification_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
