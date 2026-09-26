"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BudgetTier, ProductRole, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function readOptional(formData: FormData, name: string) {
  const value = readText(formData, name);
  return value || null;
}

function readNumber(formData: FormData, name: string, fallback = 0) {
  const value = Number(readText(formData, name));
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : fallback;
}

function readBoolean(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function readEnum<T extends Record<string, string>>(source: T, value: string, fallback: T[keyof T]) {
  return Object.values(source).includes(value) ? (value as T[keyof T]) : fallback;
}

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function productData(formData: FormData) {
  return {
    title: readText(formData, "title"),
    slug: normalizeSlug(readText(formData, "slug")),
    subtitle: readOptional(formData, "subtitle"),
    description: readOptional(formData, "description"),
    price: readNumber(formData, "price"),
    compareAtPrice: readNumber(formData, "compareAtPrice") || null,
    stock: readNumber(formData, "stock"),
    status: readEnum(ProductStatus, readText(formData, "status"), ProductStatus.DRAFT),
    role: readEnum(ProductRole, readText(formData, "role"), ProductRole.OTHER),
    budgetTier: readEnum(BudgetTier, readText(formData, "budgetTier"), BudgetTier.BALANCED),
    fragranceFree: readBoolean(formData, "fragranceFree"),
    alcoholFree: readBoolean(formData, "alcoholFree"),
    suitableForSensitive: readBoolean(formData, "suitableForSensitive"),
    brandId: readText(formData, "brandId"),
    categoryId: readText(formData, "categoryId")
  };
}

function validateProduct(data: ReturnType<typeof productData>) {
  if (!data.title || !data.slug || !data.brandId || !data.categoryId) return "عنوان، اسلاگ، برند و دسته‌بندی الزامی هستند.";
  if (data.price <= 0) return "قیمت محصول باید بیشتر از صفر باشد.";
  return null;
}

export async function createProduct(formData: FormData) {
  const data = productData(formData);
  const error = validateProduct(data);
  if (error) redirect(`/admin/products/new?error=${encodeURIComponent(error)}`);

  const concernSlugs = formData.getAll("concerns").filter((value): value is string => typeof value === "string");
  const imageUrl = readOptional(formData, "imageUrl");

  try {
    const concerns = await prisma.concern.findMany({ where: { slug: { in: concernSlugs } }, select: { id: true } });
    await prisma.product.create({
      data: {
        ...data,
        media: imageUrl ? { create: { url: imageUrl, alt: `تصویر ${data.title}`, sortOrder: 0 } } : undefined,
        concerns: { create: concerns.map((concern) => ({ concernId: concern.id, strength: 1 })) }
      }
    });
  } catch {
    redirect("/admin/products/new?error=اسلاگ محصول تکراری است یا اطلاعات واردشده معتبر نیست.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/recommendations");
  redirect("/admin/products?success=created");
}

export async function updateProduct(id: string, formData: FormData) {
  const data = productData(formData);
  const error = validateProduct(data);
  if (error) redirect(`/admin/products/${id}/edit?error=${encodeURIComponent(error)}`);

  const concernSlugs = formData.getAll("concerns").filter((value): value is string => typeof value === "string");
  const imageUrl = readOptional(formData, "imageUrl");

  try {
    const concerns = await prisma.concern.findMany({ where: { slug: { in: concernSlugs } }, select: { id: true } });
    await prisma.$transaction(async (tx) => {
      await tx.productConcern.deleteMany({ where: { productId: id } });
      await tx.productMedia.deleteMany({ where: { productId: id } });
      await tx.product.update({
        where: { id },
        data: {
          ...data,
          media: imageUrl ? { create: { url: imageUrl, alt: `تصویر ${data.title}`, sortOrder: 0 } } : undefined,
          concerns: { create: concerns.map((concern) => ({ concernId: concern.id, strength: 1 })) }
        }
      });
    });
  } catch {
    redirect(`/admin/products/${id}/edit?error=ذخیره انجام نشد؛ اسلاگ یا اطلاعات محصول را بررسی کن.`);
  }

  revalidatePath("/admin/products");
  revalidatePath(`/products/${data.slug}`);
  revalidatePath("/recommendations");
  redirect("/admin/products?success=updated");
}

export async function archiveProduct(formData: FormData) {
  const id = readText(formData, "id");
  if (id) await prisma.product.update({ where: { id }, data: { status: ProductStatus.ARCHIVED } });
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/recommendations");
}
