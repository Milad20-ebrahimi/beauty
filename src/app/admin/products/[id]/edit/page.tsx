import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProduct } from "../../actions";
import { ProductForm } from "../../product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const [product, brands, categories, concerns, ingredients] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { media: { orderBy: { sortOrder: "asc" } }, concerns: true, ingredients: true, skinSuitability: true } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { title: "asc" } }),
    prisma.concern.findMany({ orderBy: { title: "asc" } }),
    prisma.ingredient.findMany({ orderBy: { name: "asc" } })
  ]);
  if (!product) notFound();

  const action = updateProduct.bind(null, product.id);

  return (
    <main className="admin-page narrow">
      <header className="admin-page-header"><div><p className="admin-kicker">ویرایش محصول</p><h1>{product.title}</h1><p>تغییرات بعد از ذخیره در پیشنهادها و صفحه محصول دیده می‌شوند.</p></div><a href={`/products/${product.slug}`} target="_blank" rel="noreferrer" className="secondary-action">مشاهده محصول</a></header>
      <ProductForm action={action} product={product} brands={brands} categories={categories} concerns={concerns} ingredients={ingredients} error={error} />
    </main>
  );
}
