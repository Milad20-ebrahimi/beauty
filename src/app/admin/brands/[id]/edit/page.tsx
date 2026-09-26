import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateBrand } from "../../actions";
import { BrandForm } from "../../brand-form";

export default async function EditBrandPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) notFound();
  return <main className="admin-page narrow"><header className="admin-page-header"><div><p className="admin-kicker">ویرایش برند</p><h1>{brand.name}</h1><p>تغییر نام برند روی تمام محصولات آن نمایش داده می‌شود.</p></div></header><BrandForm action={updateBrand.bind(null, id)} brand={brand} error={error} /></main>;
}
