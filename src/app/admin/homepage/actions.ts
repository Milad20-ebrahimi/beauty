"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const read = (data: FormData, key: string) => String(data.get(key) || "").trim();
const optional = (data: FormData, key: string) => read(data, key) || null;
const enabled = (data: FormData, key: string) => data.get(key) === "on";
function url(data: FormData, key: string, required = false) { const result = optional(data, key); if (!result && !required) return null; if (result && (result.startsWith("/") || /^https?:\/\//i.test(result))) return result; throw new Error("INVALID_URL"); }

export async function saveHomepage(formData: FormData) {
  await requireAdmin();
  const requiredFields = ["heroTitle","heroButtonText","posterOneTitle","posterOneButtonText","posterTwoTitle","posterTwoButtonText","newProductsTitle","bestSellersTitle","needsTitle","passportTitle","passportButtonText"];
  if (requiredFields.some((key) => !read(formData, key))) redirect("/admin/homepage?error=required");
  try {
    const settings = {
      heroEnabled: enabled(formData,"heroEnabled"), heroVideoUrl: url(formData,"heroVideoUrl"), heroPosterUrl: url(formData,"heroPosterUrl"), heroEyebrow: read(formData,"heroEyebrow"), heroTitle: read(formData,"heroTitle"), heroDescription: optional(formData,"heroDescription"), heroButtonText: read(formData,"heroButtonText"), heroButtonLink: url(formData,"heroButtonLink",true)!, heroSecondaryText: optional(formData,"heroSecondaryText"), heroSecondaryLink: url(formData,"heroSecondaryLink"),
      postersEnabled: enabled(formData,"postersEnabled"), posterOneImageUrl: url(formData,"posterOneImageUrl"), posterOneKicker: optional(formData,"posterOneKicker"), posterOneTitle: read(formData,"posterOneTitle"), posterOneDescription: optional(formData,"posterOneDescription"), posterOneButtonText: read(formData,"posterOneButtonText"), posterOneLink: url(formData,"posterOneLink",true)!, posterTwoImageUrl: url(formData,"posterTwoImageUrl"), posterTwoKicker: optional(formData,"posterTwoKicker"), posterTwoTitle: read(formData,"posterTwoTitle"), posterTwoDescription: optional(formData,"posterTwoDescription"), posterTwoButtonText: read(formData,"posterTwoButtonText"), posterTwoLink: url(formData,"posterTwoLink",true)!,
      newProductsEnabled: enabled(formData,"newProductsEnabled"), newProductsTitle: read(formData,"newProductsTitle"), newProductsDescription: optional(formData,"newProductsDescription"), bestSellersEnabled: enabled(formData,"bestSellersEnabled"), bestSellersTitle: read(formData,"bestSellersTitle"), bestSellersDescription: optional(formData,"bestSellersDescription"), needsEnabled: enabled(formData,"needsEnabled"), needsTitle: read(formData,"needsTitle"), needsDescription: optional(formData,"needsDescription"),
      passportEnabled: enabled(formData,"passportEnabled"), passportEyebrow: read(formData,"passportEyebrow"), passportTitle: read(formData,"passportTitle"), passportDescription: optional(formData,"passportDescription"), passportButtonText: read(formData,"passportButtonText"), passportButtonLink: url(formData,"passportButtonLink",true)!
    };
    await prisma.homePageSettings.upsert({ where: { id: "default" }, update: settings, create: { id: "default", ...settings } });
  } catch (error) { if (error instanceof Error && error.message === "INVALID_URL") redirect("/admin/homepage?error=url"); throw error; }
  revalidatePath("/"); revalidatePath("/admin/homepage"); redirect("/admin/homepage?success=saved");
}
