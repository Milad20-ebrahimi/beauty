import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateCategory } from "../../actions";
import { CategoryForm } from "../../category-form";

export default async function EditCategoryPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const [category, parents] = await Promise.all([prisma.category.findUnique({ where: { id } }), prisma.category.findMany({ orderBy: { title: "asc" } })]);
  if (!category) notFound();
  return <main className="admin-page narrow"><header className="admin-page-header"><div><p className="admin-kicker">ویرایش دسته</p><h1>{category.title}</h1><p>تغییر عنوان روی تمام محصولات این دسته نمایش داده می‌شود.</p></div></header><CategoryForm action={updateCategory.bind(null, id)} category={category} parents={parents} error={error} /></main>;
}
