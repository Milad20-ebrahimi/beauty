export type BeautyPassportDraft = {
  skinType: "OILY" | "DRY" | "COMBINATION" | "NORMAL" | "SENSITIVE" | "UNKNOWN";
  concerns: string[];
  budgetTier: "ECONOMY" | "BALANCED" | "PREMIUM";
  fragranceFree: boolean;
  alcoholFree: boolean;
};

