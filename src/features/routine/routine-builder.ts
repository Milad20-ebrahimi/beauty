import type { BudgetTier, ProductRole, RoutinePeriod, SkinType } from "@prisma/client";
import { calculateMatchScore, type MatchProfile, type MatchScoreResult } from "@/features/recommendation/match-score";

export const routineSlots: Array<{
  key: string;
  period: RoutinePeriod;
  role: ProductRole;
  title: string;
  description: string;
  order: number;
}> = [
  { key: "morning-cleanser", period: "MORNING", role: "CLEANSER", title: "شست‌وشو", description: "پاک‌کردن چربی و آلودگی شب", order: 1 },
  { key: "morning-serum", period: "MORNING", role: "SERUM", title: "سرم هدفمند", description: "مرحله اختیاری برای دغدغه اصلی پوست", order: 2 },
  { key: "morning-moisturizer", period: "MORNING", role: "MOISTURIZER", title: "مرطوب‌کننده", description: "حفظ رطوبت و سد دفاعی پوست", order: 3 },
  { key: "morning-sunscreen", period: "MORNING", role: "SUNSCREEN", title: "ضدآفتاب", description: "آخرین مرحله و ضروری در طول روز", order: 4 },
  { key: "night-cleanser", period: "NIGHT", role: "CLEANSER", title: "شست‌وشو", description: "پاک‌کردن ضدآفتاب و آلودگی روز", order: 1 },
  { key: "night-serum", period: "NIGHT", role: "SERUM", title: "سرم هدفمند", description: "مرحله اختیاری برای مراقبت شب", order: 2 },
  { key: "night-moisturizer", period: "NIGHT", role: "MOISTURIZER", title: "مرطوب‌کننده", description: "کمک به بازسازی سد دفاعی در شب", order: 3 }
];

export type RoutineCandidate = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  price: number;
  role: ProductRole;
  budgetTier: BudgetTier;
  fragranceFree: boolean | null;
  alcoholFree: boolean | null;
  imageUrl: string | null;
  score: MatchScoreResult;
};

type ProductForRoutine = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  price: number;
  role: ProductRole;
  budgetTier: BudgetTier;
  fragranceFree: boolean | null;
  alcoholFree: boolean | null;
  media: Array<{ url: string }>;
  concerns: Array<{ concern: { slug: string } }>;
  skinSuitability: Array<{ skinType: SkinType; score: number }>;
};

export function scoreRoutineProducts(profile: MatchProfile, products: ProductForRoutine[]): RoutineCandidate[] {
  return products.map((product) => ({
    id: product.id,
    slug: product.slug,
    title: product.title,
    subtitle: product.subtitle,
    price: product.price,
    role: product.role,
    budgetTier: product.budgetTier,
    fragranceFree: product.fragranceFree,
    alcoholFree: product.alcoholFree,
    imageUrl: product.media[0]?.url ?? null,
    score: calculateMatchScore(profile, {
      budgetTier: product.budgetTier,
      fragranceFree: product.fragranceFree,
      alcoholFree: product.alcoholFree,
      concernSlugs: product.concerns.map((item) => item.concern.slug),
      skinSuitability: Object.fromEntries(product.skinSuitability.map((item) => [item.skinType, item.score]))
    })
  })).sort((a, b) => b.score.score - a.score.score);
}
