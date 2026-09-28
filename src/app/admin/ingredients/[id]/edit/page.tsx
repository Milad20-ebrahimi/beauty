import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateIngredient } from "../../actions";
import { IngredientForm } from "../../ingredient-form";

export default async function EditIngredientPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const ingredient = await prisma.ingredient.findUnique({ where: { id } });
  if (!ingredient) notFound();
  return <main className="admin-page narrow"><header className="admin-page-header"><div><p className="admin-kicker">ویرایش ترکیب</p><h1>{ingredient.name}</h1><p>تغییر توضیح در تمام صفحات محصولات مرتبط نمایش داده می‌شود.</p></div></header><IngredientForm action={updateIngredient.bind(null, id)} ingredient={ingredient} error={error} /></main>;
}
