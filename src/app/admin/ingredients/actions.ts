"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

export async function createIngredient(formData: FormData) {
  await requireAdmin();
  const name = text(formData, "name");
  const ingredientSlug = slug(text(formData, "slug"));
  if (!name || !ingredientSlug) redirect("/admin/ingredients/new?error=نام و اسلاگ ترکیب الزامی هستند.");
  try {
    await prisma.ingredient.create({ data: { name, slug: ingredientSlug, description: text(formData, "description") || null } });
  } catch {
    redirect("/admin/ingredients/new?error=این اسلاگ قبلاً استفاده شده است.");
  }
  revalidatePath("/admin/ingredients");
  revalidatePath("/admin/products/new");
  redirect("/admin/ingredients?success=created");
}

export async function updateIngredient(id: string, formData: FormData) {
  await requireAdmin();
  const name = text(formData, "name");
  const ingredientSlug = slug(text(formData, "slug"));
  if (!name || !ingredientSlug) redirect(`/admin/ingredients/${id}/edit?error=نام و اسلاگ ترکیب الزامی هستند.`);
  try {
    await prisma.ingredient.update({ where: { id }, data: { name, slug: ingredientSlug, description: text(formData, "description") || null } });
  } catch {
    redirect(`/admin/ingredients/${id}/edit?error=ذخیره انجام نشد؛ اسلاگ را بررسی کن.`);
  }
  revalidatePath("/admin/ingredients");
  revalidatePath("/admin/products");
  redirect("/admin/ingredients?success=updated");
}

export async function deleteIngredient(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;
  const productCount = await prisma.productIngredient.count({ where: { ingredientId: id } });
  if (productCount > 0) redirect("/admin/ingredients?error=این ترکیب به محصول متصل است و قابل حذف نیست.");
  await prisma.ingredient.delete({ where: { id } });
  revalidatePath("/admin/ingredients");
  redirect("/admin/ingredients?success=deleted");
}
