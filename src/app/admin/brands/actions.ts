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

export async function createBrand(formData: FormData) {
  await requireAdmin();
  const name = text(formData, "name");
  const brandSlug = slug(text(formData, "slug"));
  if (!name || !brandSlug) redirect("/admin/brands?error=نام و اسلاگ برند الزامی هستند.");

  try {
    await prisma.brand.create({ data: { name, slug: brandSlug, country: text(formData, "country") || null, description: text(formData, "description") || null } });
  } catch {
    redirect("/admin/brands?error=این اسلاگ قبلاً استفاده شده است.");
  }
  revalidatePath("/admin/brands");
  revalidatePath("/admin/products/new");
  redirect("/admin/brands?success=created");
}

export async function updateBrand(id: string, formData: FormData) {
  await requireAdmin();
  const name = text(formData, "name");
  const brandSlug = slug(text(formData, "slug"));
  if (!name || !brandSlug) redirect(`/admin/brands/${id}/edit?error=نام و اسلاگ برند الزامی هستند.`);

  try {
    await prisma.brand.update({ where: { id }, data: { name, slug: brandSlug, country: text(formData, "country") || null, description: text(formData, "description") || null } });
  } catch {
    redirect(`/admin/brands/${id}/edit?error=ذخیره انجام نشد؛ اسلاگ را بررسی کن.`);
  }
  revalidatePath("/admin/brands");
  revalidatePath("/admin/products");
  redirect("/admin/brands?success=updated");
}

export async function deleteBrand(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;
  const productCount = await prisma.product.count({ where: { brandId: id } });
  if (productCount > 0) redirect("/admin/brands?error=این برند محصول دارد و قابل حذف نیست.");
  await prisma.brand.delete({ where: { id } });
  revalidatePath("/admin/brands");
  revalidatePath("/admin");
  redirect("/admin/brands?success=deleted");
}
