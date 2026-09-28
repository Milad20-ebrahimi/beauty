import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { routineSlots, scoreRoutineProducts } from "@/features/routine/routine-builder";
import type { MatchProfile } from "@/features/recommendation/match-score";
import { RoutineEditor } from "./routine-editor";

export const dynamic = "force-dynamic";

export default async function RoutinePage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const params = await searchParams;
  const profileId = (await cookies()).get("beauty_profile_id")?.value;
  const profile = profileId ? await prisma.beautyProfile.findUnique({
    where: { id: profileId },
    include: { concerns: { include: { concern: true } } }
  }) : null;

  if (!profile) return (
    <main className="home-shell routine-page">
      <section className="compact-hero results-header"><div className="hero-content"><p className="eyebrow">روتین هوشمند</p><h1>صبح و شب، قدم‌به‌قدم</h1><p className="hero-copy">برای ساخت روتین شخصی اول باید نوع پوست، دغدغه‌ها و بودجه‌ات را بدانیم.</p></div></section>
      <section className="empty-state"><h2>Beauty Passport هنوز ساخته نشده است.</h2><p>پاسپورت را بساز؛ بعد بهترین محصولات هر مرحله خودکار انتخاب می‌شوند.</p><a className="primary-action" href="/passport">ساخت Beauty Passport</a></section>
    </main>
  );

  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", role: { in: ["CLEANSER", "SERUM", "MOISTURIZER", "SUNSCREEN"] } },
    include: {
      media: { take: 1, orderBy: { sortOrder: "asc" } },
      concerns: { include: { concern: true } },
      skinSuitability: true
    }
  });
  const matchProfile: MatchProfile = {
    skinType: profile.skinType,
    budgetTier: profile.budgetTier,
    fragranceFree: profile.fragranceFree,
    alcoholFree: profile.alcoholFree,
    concernSlugs: profile.concerns.map((item) => item.concern.slug)
  };
  const candidates = scoreRoutineProducts(matchProfile, products);
  const savedRoutine = await prisma.routine.findFirst({
    where: { profileId: profile.id, title: "روتین هوشمند من" },
    orderBy: { updatedAt: "desc" },
    include: { items: { include: { product: { select: { role: true } } } } }
  });
  const slots = routineSlots.map((slot) => ({
    key: slot.key,
    period: slot.period,
    title: slot.title,
    description: slot.description,
    order: slot.order,
    options: candidates.filter((product) => product.role === slot.role)
  }));
  const initialSelected = Object.fromEntries(routineSlots.flatMap((slot) => {
    const item = savedRoutine?.items.find((candidate) => candidate.period === slot.period && candidate.stepOrder === slot.order && candidate.product.role === slot.role);
    return item ? [[slot.key, item.productId]] : [];
  }));

  return (
    <main className="home-shell routine-page">
      <section className="compact-hero routine-hero">
        <div className="hero-content"><p className="eyebrow">ساخته‌شده از Beauty Passport</p><h1>روتین هوشمند صبح و شب تو</h1><p className="hero-copy">محصول‌ها براساس نوع پوست، دغدغه‌ها، ترجیحات و بودجه مرتب شده‌اند. ترتیب مراحل را از بالا به پایین انجام بده.</p></div>
        <div className="routine-profile-chip"><span>پروفایل فعال</span><strong>{profile.label}</strong><a href="/passport">ویرایش اطلاعات</a></div>
      </section>
      {params.error ? <div className="routine-error">ذخیره انجام نشد؛ انتخاب‌ها معتبر نبودند. دوباره تلاش کن.</div> : null}
      <RoutineEditor slots={slots} saved={params.saved === "1"} initialSelected={initialSelected} />
      <section className="routine-disclaimer"><strong>نکته مهم</strong><p>این پیشنهاد مراقبتی است و جایگزین تشخیص پزشک نیست. محصولات جدید را ابتدا روی بخش کوچکی از پوست تست کن و در صورت تحریک مصرف را متوقف کن.</p></section>
    </main>
  );
}
