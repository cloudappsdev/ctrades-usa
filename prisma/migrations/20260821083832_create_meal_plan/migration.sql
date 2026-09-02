-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "primaryIngredient" TEXT,
    "startDate" DATE NOT NULL,
    "mealFrequency" INTEGER NOT NULL,
    "vegetarian" BOOLEAN NOT NULL DEFAULT false,
    "autoGenerate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);
