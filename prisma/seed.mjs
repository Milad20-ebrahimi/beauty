import {
  BudgetTier,
  PrismaClient,
  ProductRole,
  ProductStatus,
  ReviewSource,
  SkinType
} from "@prisma/client";

const prisma = new PrismaClient();

const concerns = [
  ["acne", "جوش و آکنه", "برای کاربرانی که نگران جوش، منافذ بسته و التهاب هستند."],
  ["dryness", "خشکی پوست", "برای پوست‌هایی که کشیدگی، پوسته‌پوسته شدن یا کم‌آبی دارند."],
  ["sensitivity", "حساسیت", "برای کاربرانی که با عطر، الکل یا ترکیبات تحریک‌کننده مشکل دارند."],
  ["sun-protection", "محافظت در برابر آفتاب", "برای انتخاب ضدآفتاب مناسب مصرف روزانه."],
  ["basic-routine", "روتین ساده", "برای ساخت روتین کم‌ریسک و قابل انجام."]
];

const categories = [
  ["sunscreen", "ضدآفتاب"],
  ["cleanser", "شوینده"],
  ["moisturizer", "مرطوب‌کننده"],
  ["serum", "سرم"]
];

const brands = [
  ["derma-safe", "Derma Safe", "Iran"],
  ["pure-lab", "Pure Lab", "Turkey"],
  ["luma-care", "Luma Care", "France"]
];

const ingredients = [
  ["niacinamide", "نیاسینامید", "به کنترل چربی و تقویت ظاهر سد دفاعی پوست کمک می‌کند."],
  ["zinc-oxide", "زینک اکساید", "فیلتر معدنی محافظت‌کننده در برابر پرتوهای خورشید."],
  ["panthenol", "پانتنول", "ترکیب آرام‌بخش و رطوبت‌رسان برای پوست حساس."],
  ["glycerin", "گلیسیرین", "رطوبت را در پوست نگه می‌دارد و از خشکی جلوگیری می‌کند."],
  ["ceramide", "سرامید", "به بازسازی و حفظ سد دفاعی پوست کمک می‌کند."],
  ["squalane", "اسکوالان", "نرم‌کننده سبک برای کاهش خشکی و زبری پوست."]
];

const products = [
  {
    slug: "derma-safe-oil-control-sunscreen",
    title: "ضدآفتاب کنترل چربی Derma Safe SPF50",
    subtitle: "مناسب پوست چرب و مستعد جوش",
    description: "ضدآفتاب سبک برای مصرف روزانه با تمرکز روی کنترل برق پوست.",
    brandSlug: "derma-safe",
    categorySlug: "sunscreen",
    role: ProductRole.SUNSCREEN,
    price: 420000,
    budgetTier: BudgetTier.BALANCED,
    fragranceFree: true,
    alcoholFree: true,
    suitableForSensitive: true,
    imageUrl: "/products/derma-safe-sunscreen.webp",
    ingredients: ["zinc-oxide", "niacinamide", "panthenol"],
    concerns: ["acne", "sun-protection"],
    skinScores: {
      [SkinType.OILY]: 18,
      [SkinType.COMBINATION]: 12,
      [SkinType.SENSITIVE]: 8,
      [SkinType.DRY]: -4,
      [SkinType.NORMAL]: 6
    },
    reviews: [
      ["پوستم کمتر برق می‌افتد", "برای پوست مختلط من سبک بود و زیر آرایش هم خوب نشست.", 5, SkinType.COMBINATION, true],
      ["برای من خوب بود", "جوش جدید نداد ولی باید خوب پاک شود.", 4, SkinType.OILY, true]
    ]
  },
  {
    slug: "pure-lab-gentle-cleanser",
    title: "ژل شست‌وشوی ملایم Pure Lab",
    subtitle: "شوینده روزانه بدون عطر",
    description: "شوینده ساده برای شروع روتین پوست حساس یا خشک.",
    brandSlug: "pure-lab",
    categorySlug: "cleanser",
    role: ProductRole.CLEANSER,
    price: 260000,
    budgetTier: BudgetTier.ECONOMY,
    fragranceFree: true,
    alcoholFree: true,
    suitableForSensitive: true,
    imageUrl: "/products/pure-lab-cleanser.webp",
    ingredients: ["glycerin", "panthenol"],
    concerns: ["dryness", "sensitivity", "basic-routine"],
    skinScores: {
      [SkinType.DRY]: 16,
      [SkinType.SENSITIVE]: 14,
      [SkinType.NORMAL]: 8,
      [SkinType.COMBINATION]: 5,
      [SkinType.OILY]: 2
    },
    reviews: [
      ["خشک نکرد", "بعد از شست‌وشو حس کشیدگی نداشتم.", 5, SkinType.DRY, true],
      ["برای پوست حساس مناسب بود", "عطر نداشت و صورتم قرمز نشد.", 4, SkinType.SENSITIVE, true]
    ]
  },
  {
    slug: "luma-care-barrier-moisturizer",
    title: "کرم مرطوب‌کننده Barrier Luma Care",
    subtitle: "تمرکز روی سد دفاعی پوست",
    description: "مرطوب‌کننده متعادل برای پوست خشک، حساس و آسیب‌دیده.",
    brandSlug: "luma-care",
    categorySlug: "moisturizer",
    role: ProductRole.MOISTURIZER,
    price: 610000,
    budgetTier: BudgetTier.PREMIUM,
    fragranceFree: true,
    alcoholFree: true,
    suitableForSensitive: true,
    imageUrl: "/products/luma-care-moisturizer.webp",
    ingredients: ["ceramide", "squalane", "glycerin"],
    concerns: ["dryness", "sensitivity", "basic-routine"],
    skinScores: {
      [SkinType.DRY]: 20,
      [SkinType.SENSITIVE]: 14,
      [SkinType.NORMAL]: 10,
      [SkinType.COMBINATION]: 4,
      [SkinType.OILY]: -6
    },
    reviews: [
      ["گرانه ولی مؤثر بود", "برای خشکی گونه‌هایم خیلی کمک کرد.", 5, SkinType.DRY, true],
      ["برای تی‌زونم سنگین بود", "روی گونه‌ها خوب بود ولی پیشانی‌ام کمی برق افتاد.", 3, SkinType.COMBINATION, false]
    ]
  }
];

async function main() {
  const concernBySlug = new Map();
  for (const [slug, title, description] of concerns) {
    const concern = await prisma.concern.upsert({
      where: { slug },
      update: { title, description },
      create: { slug, title, description }
    });
    concernBySlug.set(slug, concern);
  }

  const categoryBySlug = new Map();
  for (const [slug, title] of categories) {
    const category = await prisma.category.upsert({
      where: { slug },
      update: { title },
      create: { slug, title }
    });
    categoryBySlug.set(slug, category);
  }

  const brandBySlug = new Map();
  for (const [slug, name, country] of brands) {
    const brand = await prisma.brand.upsert({
      where: { slug },
      update: { name, country },
      create: { slug, name, country }
    });
    brandBySlug.set(slug, brand);
  }

  const ingredientBySlug = new Map();
  for (const [slug, name, description] of ingredients) {
    const ingredient = await prisma.ingredient.upsert({
      where: { slug },
      update: { name, description },
      create: { slug, name, description }
    });
    ingredientBySlug.set(slug, ingredient);
  }

  for (const item of products) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        status: ProductStatus.ACTIVE,
        role: item.role,
        price: item.price,
        budgetTier: item.budgetTier,
        stock: 25,
        fragranceFree: item.fragranceFree,
        alcoholFree: item.alcoholFree,
        suitableForSensitive: item.suitableForSensitive,
        brandId: brandBySlug.get(item.brandSlug).id,
        categoryId: categoryBySlug.get(item.categorySlug).id
      },
      create: {
        slug: item.slug,
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        status: ProductStatus.ACTIVE,
        role: item.role,
        price: item.price,
        budgetTier: item.budgetTier,
        stock: 25,
        fragranceFree: item.fragranceFree,
        alcoholFree: item.alcoholFree,
        suitableForSensitive: item.suitableForSensitive,
        brandId: brandBySlug.get(item.brandSlug).id,
        categoryId: categoryBySlug.get(item.categorySlug).id
      }
    });

    await prisma.productConcern.deleteMany({ where: { productId: product.id } });
    await prisma.productSkinSuitability.deleteMany({ where: { productId: product.id } });
    await prisma.productMedia.deleteMany({ where: { productId: product.id } });
    await prisma.productIngredient.deleteMany({ where: { productId: product.id } });
    await prisma.review.deleteMany({ where: { productId: product.id, source: ReviewSource.IMPORTED } });

    await prisma.productMedia.create({
      data: {
        productId: product.id,
        url: item.imageUrl,
        alt: `تصویر ${item.title}`,
        sortOrder: 0
      }
    });

    await prisma.productIngredient.createMany({
      data: item.ingredients.map((slug, position) => ({
        productId: product.id,
        ingredientId: ingredientBySlug.get(slug).id,
        position: position + 1
      }))
    });

    await prisma.productConcern.createMany({
      data: item.concerns.map((slug) => ({
        productId: product.id,
        concernId: concernBySlug.get(slug).id,
        strength: 1
      }))
    });

    await prisma.productSkinSuitability.createMany({
      data: Object.entries(item.skinScores).map(([skinType, score]) => ({
        productId: product.id,
        skinType,
        score,
        note: score > 0 ? "برای این نوع پوست مناسب‌تر ثبت شده است." : "برای این نوع پوست نیاز به احتیاط دارد."
      }))
    });

    for (const [title, body, rating, skinTypeAtReview, wouldRepurchase] of item.reviews) {
      await prisma.review.create({
        data: {
          productId: product.id,
          source: ReviewSource.IMPORTED,
          status: "APPROVED",
          rating,
          title,
          body,
          skinTypeAtReview,
          budgetTierAtReview: item.budgetTier,
          wouldRepurchase,
          outcome: {
            create: {
              satisfaction: rating,
              irritation: rating <= 2,
              helpedConcern: rating >= 4,
              daysUsed: 21,
              outcomeSummary: wouldRepurchase ? "تجربه مثبت و احتمال خرید مجدد." : "تجربه متوسط یا نیازمند جایگزین."
            }
          }
        }
      });
    }
  }

  console.log("Seed completed: concerns, categories, brands, products, and reviews are ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
