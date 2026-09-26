import { createBrand } from "../actions";
import { BrandForm } from "../brand-form";

export default async function NewBrandPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="admin-page narrow"><header className="admin-page-header"><div><p className="admin-kicker">برند جدید</p><h1>افزودن برند</h1><p>بعد از ساخت، برند در فرم محصولات قابل انتخاب است.</p></div></header><BrandForm action={createBrand} error={error} /></main>;
}
