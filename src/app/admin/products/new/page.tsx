import { prisma } from "@/lib/prisma";
import { createProduct } from "../actions";
import { ProductForm } from "../product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [{ error }, brands, categories, concerns] = await Promise.all([
    searchParams,
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { title: "asc" } }),
    prisma.concern.findMany({ orderBy: { title: "asc" } })
  ]);

  return (
    <main className="admin-page narrow">
      <header className="admin-page-header"><div><p className="admin-kicker">محصول جدید</p><h1>افزودن به کاتالوگ</h1><p>اطلاعات اصلی محصول را وارد کن؛ بعداً می‌توانی آن را کامل‌تر کنی.</p></div></header>
      <ProductForm action={createProduct} brands={brands} categories={categories} concerns={concerns} error={error} />
    </main>
  );
}
