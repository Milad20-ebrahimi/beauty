import "server-only";
import { prisma } from "@/lib/prisma";

export type HeaderNavItem = { label:string; href:string; active:boolean };
export const DEFAULT_NAV_ITEMS: HeaderNavItem[] = [
  {label:"فروشگاه",href:"/products",active:true},
  {label:"براساس نیاز",href:"/needs",active:true},
  {label:"پیشنهادهای من",href:"/recommendations",active:true},
  {label:"Beauty Passport",href:"/passport",active:true},
  {label:"روتین من",href:"/routine",active:true}
];
export const HEADER_DEFAULTS = { id:"default", announcementActive:true, announcementText:"ارسال رایگان برای سفارش‌های منتخب", announcementLink:"/products", announcementLinkText:"خرید کنید", announcementBackground:"#D8A7B1", announcementColor:"#4A1729", navItems:DEFAULT_NAV_ITEMS, updatedAt:new Date(0) };
export async function getHeaderSettings() {
  const settings = await prisma.headerSettings.findUnique({where:{id:"default"}});
  if (!settings) return HEADER_DEFAULTS;
  const navItems = Array.isArray(settings.navItems) ? settings.navItems.filter((item): item is HeaderNavItem => Boolean(item && typeof item === "object" && "label" in item && "href" in item)).map((item)=>({label:String(item.label),href:String(item.href),active:item.active !== false})) : DEFAULT_NAV_ITEMS;
  return {...settings,navItems};
}
