"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCustomerUser } from "@/lib/auth";
import { CART_COOKIE } from "@/lib/cart";

export async function toggleFavoriteInline(productId:string,returnTo:string){
  const user=await getCustomerUser();
  if(!user)return {ok:false,loginUrl:`/login?next=${encodeURIComponent(returnTo)}`,favorite:false,count:0};
  const product=await prisma.product.findFirst({where:{id:productId,status:"ACTIVE"},select:{id:true}});
  if(!product)return {ok:false,favorite:false,count:await prisma.favorite.count({where:{userId:user.id}})};
  const existing=await prisma.favorite.findUnique({where:{userId_productId:{userId:user.id,productId}}});
  if(existing)await prisma.favorite.delete({where:{id:existing.id}});else await prisma.favorite.create({data:{userId:user.id,productId}});
  const count=await prisma.favorite.count({where:{userId:user.id}});
  await prisma.analyticsEvent.create({data:{userId:user.id,name:existing?"wishlist_remove":"wishlist_add",payload:{productId}}});
  revalidatePath("/","layout");revalidatePath("/account/favorites");revalidatePath("/products");
  return {ok:true,favorite:!existing,count};
}

export async function quickAddInline(productId:string){
  const product=await prisma.product.findFirst({where:{id:productId,status:"ACTIVE"},select:{id:true,stock:true,reservedStock:true}});
  if(!product||product.stock-product.reservedStock<=0)return {ok:false,message:"این محصول در حال حاضر موجود نیست."};
  const cookieStore=await cookies();let sessionId=cookieStore.get(CART_COOKIE)?.value;
  if(!sessionId){sessionId=randomUUID();cookieStore.set(CART_COOKIE,sessionId,{httpOnly:true,sameSite:"lax",maxAge:60*60*24*30,path:"/"});}
  let cart=await prisma.cart.findFirst({where:{sessionId},select:{id:true}});
  if(!cart)cart=await prisma.cart.create({data:{sessionId},select:{id:true}});
  const existing=await prisma.cartItem.findUnique({where:{cartId_productId:{cartId:cart.id,productId}},select:{id:true,quantity:true}});
  if(existing)await prisma.cartItem.update({where:{id:existing.id},data:{quantity:Math.min(existing.quantity+1,product.stock-product.reservedStock)}});else await prisma.cartItem.create({data:{cartId:cart.id,productId,quantity:1}});
  const count=await prisma.cartItem.aggregate({where:{cartId:cart.id},_sum:{quantity:true}});
  await prisma.analyticsEvent.create({data:{sessionId,name:"quick_add",payload:{productId}}});
  revalidatePath("/","layout");revalidatePath("/cart");
  return {ok:true,message:"به سبد خرید اضافه شد.",count:count._sum.quantity||1};
}
