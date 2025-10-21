-- CreateTable
CREATE TABLE "public"."document_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "document_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dependencies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dependencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "loginByCode" BOOLEAN NOT NULL DEFAULT false,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "user_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "documentNumber" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "userTypeId" INTEGER NOT NULL,
    "documentTypeId" INTEGER NOT NULL,
    "dependencyId" INTEGER,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."simil_inactive_events" (
    "id" SERIAL NOT NULL,
    "simiEventCode" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "simil_inactive_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_codes" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "isLogin" BOOLEAN NOT NULL DEFAULT false,
    "isVerification" BOOLEAN NOT NULL DEFAULT false,
    "isPasswordRecovery" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."participation_mechanisms" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "participation_mechanisms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."registrations" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "participationMechanismId" INTEGER NOT NULL,
    "similEventCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."participation_registers" (
    "id" SERIAL NOT NULL,
    "registrationId" INTEGER NOT NULL,
    "similEventCode" TEXT NOT NULL,
    "ownUser" BOOLEAN NOT NULL,
    "organizationName" TEXT,
    "organizationNit" TEXT,
    "organizationEmail" TEXT,
    "organizationRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "participation_registers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proposal_statuses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "proposal_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."proposal_registers" (
    "id" SERIAL NOT NULL,
    "similEventCode" TEXT,
    "politicalTopic" TEXT,
    "politicalTopicJustification" TEXT,
    "files" JSONB,
    "registrationId" INTEGER NOT NULL,
    "proposalStatusId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "proposal_registers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."registration_cites" (
    "id" SERIAL NOT NULL,
    "proposalRegisterId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "registration_cites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cite_questions" (
    "id" SERIAL NOT NULL,
    "registrationCiteId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT,
    "answeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "cite_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."subscription_registers" (
    "id" SERIAL NOT NULL,
    "similEventCode" TEXT NOT NULL,
    "organizationRole" TEXT,
    "registrationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "subscription_registers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "document_types_name_key" ON "public"."document_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "document_types_abbreviation_key" ON "public"."document_types"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_userTypeId_fkey" FOREIGN KEY ("userTypeId") REFERENCES "public"."user_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_documentTypeId_fkey" FOREIGN KEY ("documentTypeId") REFERENCES "public"."document_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_dependencyId_fkey" FOREIGN KEY ("dependencyId") REFERENCES "public"."dependencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."simil_inactive_events" ADD CONSTRAINT "simil_inactive_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."verification_codes" ADD CONSTRAINT "verification_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registrations" ADD CONSTRAINT "registrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registrations" ADD CONSTRAINT "registrations_participationMechanismId_fkey" FOREIGN KEY ("participationMechanismId") REFERENCES "public"."participation_mechanisms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."participation_registers" ADD CONSTRAINT "participation_registers_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "public"."registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proposal_registers" ADD CONSTRAINT "proposal_registers_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "public"."registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."proposal_registers" ADD CONSTRAINT "proposal_registers_proposalStatusId_fkey" FOREIGN KEY ("proposalStatusId") REFERENCES "public"."proposal_statuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registration_cites" ADD CONSTRAINT "registration_cites_proposalRegisterId_fkey" FOREIGN KEY ("proposalRegisterId") REFERENCES "public"."proposal_registers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registration_cites" ADD CONSTRAINT "registration_cites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cite_questions" ADD CONSTRAINT "cite_questions_registrationCiteId_fkey" FOREIGN KEY ("registrationCiteId") REFERENCES "public"."registration_cites"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."subscription_registers" ADD CONSTRAINT "subscription_registers_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "public"."registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
