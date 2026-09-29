"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutFromHeader } from "./header-actions";
import type { HeaderNavItem } from "@/lib/header-settings";

type CartItem={id:string;quantity:number;product:{slug:string;title:string;price:number;media:{url:string;alt:string|null}[]}};
type HeaderUser={displayName:string|null;phone:string|null;role:"CUSTOMER"|"ADMIN"|"MANAGER"}|null;
const money=(value:number)=>new Intl.NumberFormat("fa-IR").format(value);

export function SiteNavigation({navItems,cartItems=[],cartCount=0,notificationCount=0,user}:{navItems:HeaderNavItem[];cartItems?:CartItem[];cartCount?:number;notificationCount?:number;user:HeaderUser}){
  const pathname=usePathname(); const [searchOpen,setSearchOpen]=useState(false);
  const active=(href:string)=>href==="/"?pathname==="/":pathname.startsWith(href);
  const isAdmin=user?.role==="ADMIN"||user?.role==="MANAGER";
  const accountHref=isAdmin?"/admin":user?"/account":"/login?next=/account";
  const total=cartItems.reduce((sum,item)=>sum+item.product.price*item.quantity,0);
  const mobileLinks=[{href:"/",label:"خانه",icon:"⌂"},{href:"/products",label:"فروشگاه",icon:"□"},{href:"/routine",label:"روتین",icon:"☼"},{href:"/cart",label:"سبد",icon:"▣"},{href:accountHref,label:isAdmin?"ادمین":"حساب",icon:"●"}];
  return <>
    <nav className="editorial-nav" aria-label="منوی اصلی">{navItems.filter((item)=>item.active).map((item)=><a key={`${item.href}-${item.label}`} href={item.href} className={active(item.href)?"active":""}>{item.label}</a>)}</nav>
    <nav className="editorial-actions" aria-label="ابزارهای حساب">
      <div className="header-tool search-tool"><button type="button" onClick={()=>setSearchOpen(!searchOpen)} aria-expanded={searchOpen} aria-label="جست‌وجو"><span>⌕</span><small>جست‌وجو</small></button></div>
      <div className="header-tool account-tool"><a href={accountHref} aria-label="حساب"><span>♙</span><small>{isAdmin?"مدیریت":user?"حساب من":"ورود"}</small>{notificationCount?<b>{money(notificationCount)}</b>:null}</a><div className="header-dropdown account-dropdown">{user?<><header><span>{user.displayName?.charAt(0)||"ک"}</span><p><strong>{user.displayName||"کاربر BeautyOS"}</strong><small dir="ltr">{user.phone}</small></p></header>{isAdmin?<a href="/admin">ورود به پنل مدیریت</a>:<><a href="/account">پروفایل و سفارش‌ها</a><a href="/account/favorites">علاقه‌مندی‌ها</a><a href="/account/notifications">اعلان‌ها {notificationCount?`(${money(notificationCount)})`:""}</a></>}<form action={logoutFromHeader}><button>خروج از حساب</button></form></>:<><h3>حساب BeautyOS</h3><p>برای دیدن سفارش‌ها و علاقه‌مندی‌ها وارد شو.</p><a className="dropdown-primary" href="/login?next=/account">ورود یا ساخت حساب</a></>}</div></div>
      <div className="header-tool cart-tool"><a href="/cart" aria-label="سبد خرید"><span>▢</span><small>سبد خرید</small>{cartCount?<b>{money(cartCount)}</b>:null}</a><div className="header-dropdown cart-dropdown"><header><strong>سبد خرید من</strong><span>{money(cartCount)} کالا</span></header>{cartItems.length?<><div className="mini-cart-items">{cartItems.slice(0,4).map((item)=><a href={`/products/${item.product.slug}`} key={item.id}>{item.product.media[0]?<img src={item.product.media[0].url} alt={item.product.media[0].alt||item.product.title}/>:<span/>}<p><strong>{item.product.title}</strong><small>{money(item.quantity)} عدد</small></p><b>{money(item.product.price*item.quantity)} تومان</b></a>)}</div><footer><p><span>جمع سبد</span><strong>{money(total)} تومان</strong></p><a href="/cart">مشاهده و تکمیل خرید</a></footer></>:<div className="mini-cart-empty"><span>▢</span><strong>سبد خریدت خالی است.</strong><a href="/products">دیدن محصولات</a></div>}</div></div>
    </nav>
    <div className={`header-search-drawer ${searchOpen?"open":""}`}><form action="/products" method="get"><button type="button" onClick={()=>setSearchOpen(false)} aria-label="بستن">×</button><label><span>دنبال چه محصولی هستی؟</span><input name="q" autoFocus={searchOpen} placeholder="نام محصول، برند یا نیاز پوستی..." autoComplete="off"/></label><button type="submit">جست‌وجو</button></form><div><a href="/products">همه محصولات</a><a href="/needs">انتخاب براساس نیاز</a><a href="/recommendations">پیشنهاد شخصی</a></div></div>
    <nav className="mobile-site-nav" aria-label="منوی موبایل">{mobileLinks.map((link)=><a key={link.href} href={link.href} className={active(link.href)?"active":""}><span>{link.icon}</span><small>{link.label}</small>{link.href==="/cart"&&cartCount?<b>{money(cartCount)}</b>:null}{link.href===accountHref&&notificationCount?<b>{money(notificationCount)}</b>:null}</a>)}</nav>
  </>;
}
