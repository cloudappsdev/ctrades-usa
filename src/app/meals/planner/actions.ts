"use server";

import { prisma } from "@/src/lib/prisma";

export async function saveMealPlan(formData: FormData) {
  const planName = String(formData.get("planName") ?? "").trim();
  const primaryIngredient = String(
    formData.get("primaryIngredient") ?? "",
  ).trim();
  const startDate = String(formData.get("startDate") ?? "");
  const mealFrequency = Number(formData.get("mealFrequency"));

  if (!planName || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    throw new Error("Plan name and a valid start date are required");
  }

  if (![2, 3, 4].includes(mealFrequency)) {
    throw new Error("Meal frequency must be 2, 3, or 4");
  }

  await prisma.mealPlan.create({
    data: {
      planName,
      primaryIngredient: primaryIngredient || null,
      startDate: new Date(`${startDate}T00:00:00.000Z`),
      mealFrequency,
      vegetarian: formData.get("vegetarian") === "on",
      autoGenerate: formData.get("autoGenerate") === "on",
    },
  });
}
