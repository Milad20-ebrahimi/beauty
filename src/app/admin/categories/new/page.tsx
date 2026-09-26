import { prisma } from "@/lib/prisma";
import { createCategory } from "../actions";
import { CategoryForm } from "../category-form";

export default async function NewCategoryPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ error }, parents] = await Promise.all([searchParams, prisma.category.findMany({ orderBy: { title: "asc" } })]);
  return <main className="admin-page narrow"><header className="admin-page-header"><div><p className="admin-kicker">دسته جدید</p><h1>افزودن دسته‌بندی</h1><p>دسته اصلی یا زیردسته جدید برای کاتالوگ بساز.</p></div></header><CategoryForm action={createCategory} parents={parents} error={error} /></main>;
}
