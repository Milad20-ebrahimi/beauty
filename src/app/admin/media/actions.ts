"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { removeMediaFile, saveMediaAsset } from "@/lib/media-library";

export async function uploadMedia(formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || !file.size) redirect("/admin/media?error=file");
  let saved: Awaited<ReturnType<typeof saveMediaAsset>>;
  try { saved = await saveMediaAsset(file); } catch (error) { redirect(`/admin/media?error=${error instanceof Error ? error.message.toLowerCase() : "file"}`); }
  try { await prisma.mediaAsset.create({ data: { ...saved, alt: String(formData.get("alt") || "").trim() || null } }); }
  catch (error) { await removeMediaFile(saved.url); throw error; }
  revalidatePath("/admin/media");
  redirect("/admin/media?success=uploaded");
}

export async function deleteMedia(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) redirect("/admin/media?error=missing");
  const [home, store, productUse] = await Promise.all([
    prisma.homePageSettings.findFirst({ where: { OR: [{heroVideoUrl:asset.url},{heroPosterUrl:asset.url},{posterOneImageUrl:asset.url},{posterTwoImageUrl:asset.url}] }, select:{id:true} }),
    prisma.storeSettings.findFirst({ where: { logoUrl: asset.url }, select:{id:true} }),
    prisma.productMedia.count({ where: { url: asset.url } })
  ]);
  if (home || store || productUse) redirect("/admin/media?error=used");
  await prisma.mediaAsset.delete({ where: { id } });
  await removeMediaFile(asset.url);
  revalidatePath("/admin/media");
  redirect("/admin/media?success=deleted");
}
