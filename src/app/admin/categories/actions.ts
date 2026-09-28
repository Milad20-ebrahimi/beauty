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

async function createsCycle(categoryId: string, parentId: string | null) {
  if (!parentId) return false;
  const categories = await prisma.category.findMany({ select: { id: true, parentId: true } });
  const parentById = new Map(categories.map((category) => [category.id, category.parentId]));
  let currentId: string | null = parentId;
  const visited = new Set<string>();
  while (currentId) {
    if (currentId === categoryId || visited.has(currentId)) return true;
    visited.add(currentId);
    currentId = parentById.get(currentId) || null;
  }
  return false;
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const title = text(formData, "title");
  const categorySlug = slug(text(formData, "slug"));
  const parentId = text(formData, "parentId") || null;
  if (!title || !categorySlug) redirect("/admin/categories?error=عنوان و اسلاگ دسته‌بندی الزامی هستند.");
  try {
    await prisma.category.create({ data: { title, slug: categorySlug, parentId } });
  } catch {
    redirect("/admin/categories?error=اسلاگ تکراری است یا دسته والد معتبر نیست.");
  }
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products/new");
  redirect("/admin/categories?success=created");
}

export async function updateCategory(id: string, formData: FormData) {
  await requireAdmin();
  const title = text(formData, "title");
  const categorySlug = slug(text(formData, "slug"));
  const parentId = text(formData, "parentId") || null;
  if (!title || !categorySlug) redirect(`/admin/categories/${id}/edit?error=عنوان و اسلاگ دسته‌بندی الزامی هستند.`);
  if (await createsCycle(id, parentId)) redirect(`/admin/categories/${id}/edit?error=این انتخاب یک چرخه در دسته‌بندی‌ها ایجاد می‌کند.`);
  try {
    await prisma.category.update({ where: { id }, data: { title, slug: categorySlug, parentId } });
  } catch {
    redirect(`/admin/categories/${id}/edit?error=ذخیره انجام نشد؛ اسلاگ یا دسته والد را بررسی کن.`);
  }
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  redirect("/admin/categories?success=updated");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = text(formData, "id");
  if (!id) return;
  const [productCount, childCount] = await Promise.all([
    prisma.product.count({ where: { categoryId: id } }),
    prisma.category.count({ where: { parentId: id } })
  ]);
  if (productCount > 0 || childCount > 0) redirect("/admin/categories?error=این دسته محصول یا زیردسته دارد و قابل حذف نیست.");
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  redirect("/admin/categories?success=deleted");
}
