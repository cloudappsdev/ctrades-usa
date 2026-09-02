export const TRADE_CATEGORIES = [
  "plumbing",
  "windows",
  "electric",
  "carpentry",
  "roofing",
  "hvac",
  "masonry",
  "painting",
  "landscaping",
] as const;

export const CONTRACTOR_TYPES = [
  { value: "INDIVIDUAL", label: "Individual / Sole Proprietor" },
  { value: "BUSINESS", label: "Business" },
] as const;

export type ContractorFormState = {
  ok: boolean;
  message: string;
  errors: Record<string, string>;
  /** Id of the record just created. Changes per save, so the form can remount to clear itself. */
  savedId?: string;
};

export const emptyContractorFormState: ContractorFormState = {
  ok: false,
  message: "",
  errors: {},
};
