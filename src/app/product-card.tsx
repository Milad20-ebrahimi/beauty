"use client";

import Image from "next/image";
import { Heart, Plus } from "@phosphor-icons/react";
import { useState,useTransition } from "react";
import { quickAddInline,toggleFavoriteInline } from "./product-card-actions";

export type ProductCardData={id:string;slug:string;title:string;subtitle:string|null;price:number;compareAtPrice:number|null;stock:number;reservedStock:number;brand:{name:string};media:{url:string;alt:string|null}[];reviews:{rating:number}[]};
const money=(value:number)=>new Intl.NumberFormat("fa-IR").format(value);
export function ProductCard({product,initialFavorite=false,returnTo="/"}:{product:ProductCardData;initialFavorite?:boolean;returnTo?:string}){
  const [favorite,setFavorite]=useState(initialFavorite);const [message,setMessage]=useState("");const [pending,startTransition]=useTransition();
  const available=Math.max(0,product.stock-product.reservedStock);const primary=product.media[0],secondary=product.media[1];const rating=product.reviews.length?product.reviews.reduce((sum,item)=>sum+item.rating,0)/product.reviews.length:0;
  const favoriteClick=()=>startTransition(async()=>{const result=await toggleFavoriteInline(product.id,returnTo);if(result.loginUrl){window.location.href=result.loginUrl;return;}if(result.ok){setFavorite(result.favorite);setMessage(result.favorite?"در علاقه‌مندی‌ها ذخیره شد.":"از علاقه‌مندی‌ها حذف شد.");}});
  const add=()=>startTransition(async()=>{const result=await quickAddInline(product.id);setMessage(result.message);});
  return <article className="premium-product-card" data-product-id={product.id}>
    <div className="premium-product-visual"><a href={`/products/${product.slug}`} aria-label={`مشاهده ${product.title}`} data-analytics="product_click">{primary?<><Image className="product-image-primary" src={primary.url} alt={primary.alt||`${product.title} از ${product.brand.name}`} fill sizes="(max-width: 760px) 82vw, (max-width: 1280px) 25vw, 20vw"/>{secondary?<Image className="product-image-secondary" src={secondary.url} alt="" fill sizes="(max-width: 760px) 82vw, (max-width: 1280px) 25vw, 20vw"/>:null}</>:<span className="product-image-missing">تصویر به‌زودی</span>}</a><button type="button" className={`product-wishlist ${favorite?"selected":""}`} onClick={favoriteClick} disabled={pending} aria-label={favorite?`حذف ${product.title} از علاقه‌مندی‌ها`:`افزودن ${product.title} به علاقه‌مندی‌ها`} aria-pressed={favorite}><Heart size={22} weight={favorite?"fill":"duotone"}/></button><button type="button" className="product-quick-add" onClick={add} disabled={!available||pending} aria-label={available?`افزودن ${product.title} به سبد خرید`:`${product.title} ناموجود است`}><Plus size={23} weight="light"/><span>{available?"افزودن سریع":"ناموجود"}</span></button>{!available?<small className="product-stock-badge">ناموجود</small>:null}</div>
    <div className="premium-product-info"><p>{product.brand.name}</p><h3><a href={`/products/${product.slug}`}>{product.title}</a></h3>{product.subtitle?<small>{product.subtitle}</small>:null}<div><strong>{money(product.price)} <small>تومان</small></strong>{product.compareAtPrice&&product.compareAtPrice>product.price?<del>{money(product.compareAtPrice)}</del>:null}{rating?<span>★ {new Intl.NumberFormat("fa-IR",{maximumFractionDigits:1}).format(rating)}</span>:null}</div></div><span className="product-card-feedback" aria-live="polite">{message}</span>
  </article>;
}
