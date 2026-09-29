"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
const read=(data:FormData,key:string)=>String(data.get(key)||"").trim();
const safeUrl=(value:string)=>!value||value.startsWith("/")||/^https?:\/\//i.test(value);
const color=(value:string,fallback:string)=>/^#[0-9a-f]{6}$/i.test(value)?value:fallback;
export async function saveHeaderSettings(formData:FormData){
  await requireAdmin();
  const announcementText=read(formData,"announcementText"); const announcementLink=read(formData,"announcementLink");
  if(!announcementText||!safeUrl(announcementLink)) redirect("/admin/header?error=invalid");
  const navItems=Array.from({length:6},(_,index)=>({label:read(formData,`navLabel${index}`),href:read(formData,`navHref${index}`),active:formData.get(`navActive${index}`)==="on"})).filter((item)=>item.label&&item.href);
  if(!navItems.length||navItems.some((item)=>!safeUrl(item.href))) redirect("/admin/header?error=nav");
  const data={announcementActive:formData.get("announcementActive")==="on",announcementText,announcementLink:announcementLink||null,announcementLinkText:read(formData,"announcementLinkText")||null,announcementBackground:color(read(formData,"announcementBackground"),"#D8A7B1"),announcementColor:color(read(formData,"announcementColor"),"#4A1729"),navItems};
  await prisma.headerSettings.upsert({where:{id:"default"},update:data,create:{id:"default",...data}});
  revalidatePath("/","layout"); revalidatePath("/admin/header"); redirect("/admin/header?success=saved");
}
