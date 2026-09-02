"use server";

import { prisma } from "@/src/lib/prisma";
import { CONTRACTOR_TYPES, type ContractorFormState } from "./options";

const MAX_LENGTHS = {
  cName: 120,
  tradeCategory: 60,
  metroArea: 80,
  city: 80,
  about: 2000,
  services: 2000,
} as const;

/** Trades are free-form, so normalize aggressively to limit duplicate spellings. */
const TRADE_CATEGORY_PATTERN = /^[a-z0-9][a-z0-9 \-/&'.]*$/;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function normalizeTradeCategory(raw: string) {
  return raw.toLowerCase().replace(/\s+/g, " ").trim();
}

export async function saveContractor(
  _prevState: ContractorFormState,
  formData: FormData,
): Promise<ContractorFormState> {
  const cName = text(formData, "cName");
  const contractorType = text(formData, "contractorType");
  const tradeCategory = normalizeTradeCategory(text(formData, "tradeCategory"));
  const metroArea = text(formData, "metroArea");
  const city = text(formData, "city");
  const about = text(formData, "about");
  const services = text(formData, "services");

  const errors: Record<string, string> = {};

  if (!cName) {
    errors.cName = "Name is required";
  } else if (cName.length > MAX_LENGTHS.cName) {
    errors.cName = `Name must be ${MAX_LENGTHS.cName} characters or fewer`;
  }

  if (!CONTRACTOR_TYPES.some((t) => t.value === contractorType)) {
    errors.contractorType =
      "Choose whether you are an individual or a business";
  }

  if (!tradeCategory) {
    errors.tradeCategory = "Enter or choose a trade category";
  } else if (tradeCategory.length > MAX_LENGTHS.tradeCategory) {
    errors.tradeCategory = `Trade must be ${MAX_LENGTHS.tradeCategory} characters or fewer`;
  } else if (!TRADE_CATEGORY_PATTERN.test(tradeCategory)) {
    errors.tradeCategory = "Use letters, numbers, spaces, and - / & ' . only";
  }

  for (const [field, value] of Object.entries({
    metroArea,
    city,
    about,
    services,
  })) {
    const max = MAX_LENGTHS[field as keyof typeof MAX_LENGTHS];
    if (value.length > max) {
      errors[field] = `Must be ${max} characters or fewer`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Please fix the errors below.", errors };
  }

  let savedId: string;

  try {
    const saved = await prisma.contractor.create({
      select: { id: true },
      data: {
        cName,
        contractorType: contractorType as "INDIVIDUAL" | "BUSINESS",
        tradeCategory,
        metroArea: metroArea || null,
        city: city || null,
        about: about || null,
        services: services || null,
        mostRecentlyActive: new Date(),
      },
    });
    savedId = saved.id;
  } catch (error) {
    console.error("Failed to save contractor", error);
    return {
      ok: false,
      message: "Could not save your information. Please try again.",
      errors: {},
    };
  }

  return {
    ok: true,
    message: `${cName} was saved.`,
    errors: {},
    savedId,
  };
}
