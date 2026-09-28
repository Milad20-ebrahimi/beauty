import { createIngredient } from "../actions";
import { IngredientForm } from "../ingredient-form";

export default async function NewIngredientPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <main className="admin-page narrow"><header className="admin-page-header"><div><p className="admin-kicker">ترکیب جدید</p><h1>افزودن ترکیب</h1><p>پس از ایجاد، در فرم محصولات قابل انتخاب خواهد بود.</p></div></header><IngredientForm action={createIngredient} error={error} /></main>;
}
