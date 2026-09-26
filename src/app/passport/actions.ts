"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BudgetTier, HairType, SkinType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const LOCAL_USER_PHONE = "local-demo-user";

function readBoolean(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function readEnum<T extends Record<string, string>>(source: T, value: FormDataEntryValue | null, fallback: T[keyof T]) {
  const textValue = typeof value === "string" ? value : "";
  return Object.values(source).includes(textValue) ? (textValue as T[keyof T]) : fallback;
}

export async function saveBeautyPassport(formData: FormData) {
  const concernSlugs = formData.getAll("concerns").filter((value): value is string => typeof value === "string");

  const user = await prisma.user.upsert({
    where: { phone: LOCAL_USER_PHONE },
    update: { displayName: "کاربر تست BeautyOS" },
    create: {
      phone: LOCAL_USER_PHONE,
      displayName: "کاربر تست BeautyOS"
    }
  });

  const profile = await prisma.beautyProfile.create({
    data: {
      userId: user.id,
      label: "پروفایل تست محلی",
      skinType: readEnum(SkinType, formData.get("skinType"), SkinType.UNKNOWN),
      hairType: readEnum(HairType, formData.get("hairType"), HairType.UNKNOWN),
      budgetTier: readEnum(BudgetTier, formData.get("budgetTier"), BudgetTier.BALANCED),
      fragranceFree: readBoolean(formData.get("fragranceFree")),
      alcoholFree: readBoolean(formData.get("alcoholFree")),
      sensitivityLevel: readBoolean(formData.get("sensitive")) ? 2 : 0,
      medicalDisclaimerAt: new Date()
    }
  });

  if (concernSlugs.length > 0) {
    const concerns = await prisma.concern.findMany({
      where: { slug: { in: concernSlugs } },
      select: { id: true }
    });

    await prisma.profileConcern.createMany({
      data: concerns.map((concern) => ({
        profileId: profile.id,
        concernId: concern.id,
        weight: 1
      }))
    });
  }

  const cookieStore = await cookies();
  cookieStore.set("beauty_profile_id", profile.id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 90,
    path: "/"
  });

  redirect("/recommendations");
}

