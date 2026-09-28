"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { routineSlots } from "@/features/routine/routine-builder";

export async function saveRoutine(formData: FormData) {
  const cookieStore = await cookies();
  const profileId = cookieStore.get("beauty_profile_id")?.value;
  if (!profileId) redirect("/passport");

  const profile = await prisma.beautyProfile.findUnique({ where: { id: profileId }, select: { id: true, budgetTier: true } });
  if (!profile) redirect("/passport");

  const choices = routineSlots.flatMap((slot) => {
    const value = formData.get(slot.key);
    return typeof value === "string" && value ? [{ slot, productId: value }] : [];
  });

  if (choices.length === 0) redirect("/routine?error=empty");

  const productIds = [...new Set(choices.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, status: "ACTIVE" },
    select: { id: true, role: true }
  });
  const productById = new Map(products.map((product) => [product.id, product]));
  const validChoices = choices.filter(({ slot, productId }) => productById.get(productId)?.role === slot.role);

  if (validChoices.length !== choices.length) redirect("/routine?error=invalid");

  await prisma.$transaction(async (tx) => {
    await tx.routine.deleteMany({ where: { profileId: profile.id, title: "روتین هوشمند من" } });
    await tx.routine.create({
      data: {
        profileId: profile.id,
        title: "روتین هوشمند من",
        budgetTier: profile.budgetTier,
        items: {
          create: validChoices.map(({ slot, productId }) => ({
            productId,
            period: slot.period,
            stepOrder: slot.order,
            note: slot.description
          }))
        }
      }
    });
  });

  redirect("/routine?saved=1");
}
