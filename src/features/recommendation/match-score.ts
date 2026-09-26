import { z } from "zod";

export const matchProfileSchema = z.object({
  skinType: z.enum(["OILY", "DRY", "COMBINATION", "NORMAL", "SENSITIVE", "UNKNOWN"]),
  budgetTier: z.enum(["ECONOMY", "BALANCED", "PREMIUM"]),
  fragranceFree: z.boolean(),
  alcoholFree: z.boolean(),
  concernSlugs: z.array(z.string())
});

export const matchProductSchema = z.object({
  budgetTier: z.enum(["ECONOMY", "BALANCED", "PREMIUM"]),
  fragranceFree: z.boolean().nullable(),
  alcoholFree: z.boolean().nullable(),
  concernSlugs: z.array(z.string()),
  skinSuitability: z.record(z.string(), z.number())
});

export type MatchProfile = z.infer<typeof matchProfileSchema>;
export type MatchProduct = z.infer<typeof matchProductSchema>;

export type MatchScoreResult = {
  score: number;
  positiveReasons: string[];
  warnings: string[];
  missingData: string[];
  ruleVersion: string;
};

const RULE_VERSION = "mvp-0.1";

export function calculateMatchScore(profile: MatchProfile, product: MatchProduct): MatchScoreResult {
  let score = 50;
  const positiveReasons: string[] = [];
  const warnings: string[] = [];
  const missingData: string[] = [];

  const skinScore = product.skinSuitability[profile.skinType];
  if (typeof skinScore === "number") {
    score += skinScore;
    if (skinScore > 0) positiveReasons.push("با نوع پوست شما سازگار ثبت شده است.");
    if (skinScore < 0) warnings.push("برای نوع پوست شما ممکن است انتخاب ایده‌آلی نباشد.");
  } else if (profile.skinType !== "UNKNOWN") {
    missingData.push("داده کافی درباره سازگاری این محصول با نوع پوست شما نداریم.");
  }

  const matchedConcerns = profile.concernSlugs.filter((slug) => product.concernSlugs.includes(slug));
  if (matchedConcerns.length > 0) {
    score += Math.min(20, matchedConcerns.length * 8);
    positiveReasons.push("با دغدغه‌ای که انتخاب کرده‌اید هم‌پوشانی دارد.");
  }

  if (profile.budgetTier === product.budgetTier) {
    score += 10;
    positiveReasons.push("در محدوده بودجه انتخابی شما قرار دارد.");
  } else if (profile.budgetTier === "ECONOMY" && product.budgetTier === "PREMIUM") {
    score -= 15;
    warnings.push("ممکن است برای بودجه اقتصادی شما گران باشد.");
  }

  if (profile.fragranceFree) {
    if (product.fragranceFree === true) {
      score += 8;
      positiveReasons.push("با ترجیح بدون عطر شما سازگار است.");
    } else if (product.fragranceFree === false) {
      score -= 12;
      warnings.push("این محصول بدون عطر ثبت نشده است.");
    } else {
      missingData.push("وضعیت عطر در داده محصول مشخص نیست.");
    }
  }

  if (profile.alcoholFree) {
    if (product.alcoholFree === true) {
      score += 8;
      positiveReasons.push("با ترجیح بدون الکل شما سازگار است.");
    } else if (product.alcoholFree === false) {
      score -= 12;
      warnings.push("این محصول بدون الکل ثبت نشده است.");
    } else {
      missingData.push("وضعیت الکل در داده محصول مشخص نیست.");
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    positiveReasons,
    warnings,
    missingData,
    ruleVersion: RULE_VERSION
  };
}

