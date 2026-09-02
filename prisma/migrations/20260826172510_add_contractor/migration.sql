-- CreateEnum
CREATE TYPE "ContractorType" AS ENUM ('INDIVIDUAL', 'BUSINESS');

-- CreateTable
CREATE TABLE "Contractor" (
    "id" TEXT NOT NULL,
    "cName" TEXT NOT NULL,
    "contractorType" "ContractorType" NOT NULL,
    "tradeCategory" TEXT NOT NULL,
    "mostRecentlyActive" TIMESTAMP(3),
    "mostRecentlyUpdated" TIMESTAMP(3) NOT NULL,
    "metroArea" TEXT,
    "city" TEXT,
    "about" TEXT,
    "services" TEXT,

    CONSTRAINT "Contractor_pkey" PRIMARY KEY ("id")
);
