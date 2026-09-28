"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BudgetTier, ProductRole, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { removeManagedProductImages, saveProductImages } from "@/lib/product-media";

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
  await requireAdmin();
  const data = productData(formData);
  const error = validateProduct(data);
  if (error) redirect(`/admin/products/new?error=${encodeURIComponent(error)}`);

  const concernSlugs = formData.getAll("concerns").filter((value): value is string => typeof value === "string");
  const imageUrl = readOptional(formData, "imageUrl");
  let uploadedUrls: string[] = [];

  try {
    uploadedUrls = await saveProductImages(formData);
    const mediaUrls = [...uploadedUrls, ...(imageUrl ? [imageUrl] : [])];
    const concerns = await prisma.concern.findMany({ where: { slug: { in: concernSlugs } }, select: { id: true } });
    await prisma.product.create({
      data: {
        ...data,
        media: mediaUrls.length ? { create: mediaUrls.map((url, sortOrder) => ({ url, alt: `تصویر ${data.title}`, sortOrder })) } : undefined,
        concerns: { create: concerns.map((concern) => ({ concernId: concern.id, strength: 1 })) }
      }
    });
  } catch (caught) {
    await removeManagedProductImages(uploadedUrls);
    const message = caught instanceof Error && (caught.message.includes("مگابایت") || caught.message.includes("فرمت") || caught.message.includes("حداکثر"))
      ? caught.message
      : "اسلاگ محصول تکراری است یا اطلاعات واردشده معتبر نیست.";
    redirect(`/admin/products/new?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/recommendations");
  redirect("/admin/products?success=created");
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();
  const data = productData(formData);
  const error = validateProduct(data);
  if (error) redirect(`/admin/products/${id}/edit?error=${encodeURIComponent(error)}`);

  const concernSlugs = formData.getAll("concerns").filter((value): value is string => typeof value === "string");
  const imageUrl = readOptional(formData, "imageUrl");
  const existingUrls = formData.getAll("existingMedia").filter((value): value is string => typeof value === "string");
  const removedUrls = new Set(formData.getAll("removeMedia").filter((value): value is string => typeof value === "string"));
  const keptUrls = existingUrls.filter((url) => !removedUrls.has(url));
  let uploadedUrls: string[] = [];

  try {
    uploadedUrls = await saveProductImages(formData);
    const allMediaUrls = Array.from(new Set([...keptUrls, ...uploadedUrls, ...(imageUrl ? [imageUrl] : [])]));
    if (allMediaUrls.length > 6) throw new Error("گالری هر محصول حداکثر می‌تواند ۶ تصویر داشته باشد.");
    const mediaUrls = allMediaUrls;
    const concerns = await prisma.concern.findMany({ where: { slug: { in: concernSlugs } }, select: { id: true } });
    await prisma.$transaction(async (tx) => {
      await tx.productConcern.deleteMany({ where: { productId: id } });
      await tx.productMedia.deleteMany({ where: { productId: id } });
      await tx.product.update({
        where: { id },
        data: {
          ...data,
          media: mediaUrls.length ? { create: mediaUrls.map((url, sortOrder) => ({ url, alt: `تصویر ${data.title}`, sortOrder })) } : undefined,
          concerns: { create: concerns.map((concern) => ({ concernId: concern.id, strength: 1 })) }
        }
      });
    });
  } catch (caught) {
    await removeManagedProductImages(uploadedUrls);
    const message = caught instanceof Error && (caught.message.includes("مگابایت") || caught.message.includes("فرمت") || caught.message.includes("حداکثر"))
      ? caught.message
      : "ذخیره انجام نشد؛ اسلاگ یا اطلاعات محصول را بررسی کن.";
    redirect(`/admin/products/${id}/edit?error=${encodeURIComponent(message)}`);
  }

  await removeManagedProductImages(Array.from(removedUrls));

  revalidatePath("/admin/products");
  revalidatePath(`/products/${data.slug}`);
  revalidatePath("/recommendations");
  redirect("/admin/products?success=updated");
}

export async function archiveProduct(formData: FormData) {
  await requireAdmin();
  const id = readText(formData, "id");
  if (id) await prisma.product.update({ where: { id }, data: { status: ProductStatus.ARCHIVED } });
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/recommendations");
}
