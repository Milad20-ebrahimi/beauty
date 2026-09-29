import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getHomeSettings } from "@/lib/home-settings";
import { HeroMedia } from "./hero-media";
import type { CSSProperties } from "react";

export const dynamic = "force-dynamic";
const successful: OrderStatus[] = ["PAID","PROCESSING","SHIPPED","DELIVERED"];
const price = (value: number) => new Intl.NumberFormat("fa-IR").format(value);
const needs = [["پوستم جوش می‌زند","انتخاب‌های سازگارتر با پوست مستعد جوش","جوش و منافذ"],["پوستم خشک است","مراقبت ملایم برای خشکی و کشیدگی","خشکی پوست"],["ضدآفتاب می‌خواهم","محافظت روزانه متناسب با پوست تو","ضدآفتاب"],["روتین ساده می‌خواهم","یک مسیر کوتاه برای صبح و شب","روتین ساده"],["انتخاب اقتصادی","محصولات مؤثر در محدوده بودجه کمتر","محصول اقتصادی"],["نمی‌دانم چی بخرم","با چند سؤال ساده انتخاب را شروع کن","راهنمای خرید"]];
type HomeProduct = { id: string; slug: string; title: string; subtitle: string | null; price: number; compareAtPrice: number | null; media: { url: string; alt: string | null }[]; brand: { name: string } };

const ProductRail = ({ title, description, products }: { title: string; description?: string | null; products: HomeProduct[] }) => <section className="editorial-products"><header><div><h2>{title}</h2>{description ? <p>{description}</p> : null}</div><a href="/products">مشاهده همه ←</a></header><div className="editorial-product-rail">{products.map((product) => <article key={product.id}><a href={`/products/${product.slug}`} className="editorial-product-image">{product.media[0] ? <img src={product.media[0].url} alt={product.media[0].alt || product.title} /> : <span>BeautyOS</span>}</a><div><p>{product.brand.name}</p><h3><a href={`/products/${product.slug}`}>{product.title}</a></h3>{product.subtitle ? <small>{product.subtitle}</small> : null}<strong>{price(product.price)} <small>تومان</small></strong></div></article>)}</div></section>;
const placement = (value:string) => value.toLowerCase().replaceAll("_","-");

export default async function HomePage() {
  const [home, newest, grouped] = await Promise.all([
    getHomeSettings(),
    prisma.product.findMany({ where: { status: "ACTIVE" }, select: { id:true,slug:true,title:true,subtitle:true,price:true,compareAtPrice:true,media:{ take:1,orderBy:{sortOrder:"asc"},select:{url:true,alt:true}},brand:{select:{name:true}} }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.orderItem.groupBy({ by:["productId"], where:{ order:{ status:{in:successful} } }, _sum:{quantity:true}, orderBy:{_sum:{quantity:"desc"}}, take:8 })
  ]);
  const popularRaw = await prisma.product.findMany({ where:{ id:{in:grouped.map((item)=>item.productId)},status:"ACTIVE" }, select:{ id:true,slug:true,title:true,subtitle:true,price:true,compareAtPrice:true,media:{take:1,orderBy:{sortOrder:"asc"},select:{url:true,alt:true}},brand:{select:{name:true}} } });
  const map = new Map(popularRaw.map((item)=>[item.id,item]));
  const popular = grouped.map((item)=>map.get(item.productId)).filter((item): item is HomeProduct => Boolean(item));
  const bestProducts = popular.length ? popular : newest.slice(0,8);
  const now = new Date();
  const heroVisible = home.heroEnabled && (!home.heroStartDate || home.heroStartDate <= now) && (!home.heroEndDate || home.heroEndDate >= now);
  const banners = [
    {enabled:home.posterOneEnabled,image:home.posterOneImageUrl,mobile:home.posterOneMobileImageUrl,alt:home.posterOneAlt,kicker:home.posterOneKicker,title:home.posterOneTitle,description:home.posterOneDescription,button:home.posterOneButtonText,href:home.posterOneLink,position:home.posterOneTextPosition,theme:home.posterOneTextTheme,overlay:home.posterOneOverlayEnabled,strength:home.posterOneOverlayStrength},
    {enabled:home.posterTwoEnabled,image:home.posterTwoImageUrl,mobile:home.posterTwoMobileImageUrl,alt:home.posterTwoAlt,kicker:home.posterTwoKicker,title:home.posterTwoTitle,description:home.posterTwoDescription,button:home.posterTwoButtonText,href:home.posterTwoLink,position:home.posterTwoTextPosition,theme:home.posterTwoTextTheme,overlay:home.posterTwoOverlayEnabled,strength:home.posterTwoOverlayStrength}
  ].filter((banner)=>banner.enabled);
  return <main className="luxury-home">
    {heroVisible ? <section className={`homepage-hero theme-${home.heroTextTheme.toLowerCase()} text-${placement(home.heroTextPosition)}`} style={{"--hero-overlay":home.heroOverlayEnabled ? home.heroOverlayStrength/100 : 0} as CSSProperties}><HeroMedia mediaType={home.heroMediaType} desktopImage={home.heroDesktopImageUrl} mobileImage={home.heroMobileImageUrl} desktopVideo={home.heroVideoUrl} mobileVideo={home.heroMobileVideoUrl} desktopPoster={home.heroPosterUrl} mobilePoster={home.heroMobilePosterUrl} alt={home.heroImageAlt || home.heroTitle} fit={home.heroMediaFit} position={home.heroMediaPosition} customPosition={home.heroCustomPosition}/><div className="homepage-hero-overlay"/><div className="homepage-hero-content"><span>{home.heroEyebrow}</span><h1>{home.heroTitle}</h1>{home.heroDescription ? <p>{home.heroDescription}</p> : null}<div>{home.heroPrimaryEnabled && home.heroButtonText && home.heroButtonLink ? <a className="hero-cta primary" href={home.heroButtonLink}>{home.heroButtonText}</a> : null}{home.heroSecondaryEnabled && home.heroSecondaryText && home.heroSecondaryLink ? <a className="hero-cta secondary" href={home.heroSecondaryLink}>{home.heroSecondaryText}</a> : null}</div></div></section> : null}
    {home.postersEnabled && banners.length ? <section className={`promo-banner-section count-${banners.length}`}>{banners.map((banner,index)=><article key={index} className={`promo-banner theme-${banner.theme.toLowerCase()} text-${placement(banner.position)} ${!banner.image ? `poster-placeholder tone-${index+1}`:""}`} style={{"--banner-overlay":banner.overlay ? banner.strength/100 : 0} as CSSProperties}>{banner.image || banner.mobile ? <picture><source media="(max-width: 767px)" srcSet={banner.mobile || banner.image || ""}/><img src={banner.image || banner.mobile || ""} alt={banner.alt || banner.title} loading="lazy" decoding="async"/></picture> : <div className="poster-art"><i/><i/><i/></div>}<div className="promo-banner-overlay"/><div className="promo-banner-copy">{banner.kicker ? <span>{banner.kicker}</span>:null}<h2>{banner.title}</h2>{banner.description ? <p>{banner.description}</p>:null}<a href={banner.href}>{banner.button}<b aria-hidden="true">←</b></a></div></article>)}</section> : null}
    {home.newProductsEnabled && newest.length ? <ProductRail title={home.newProductsTitle} description={home.newProductsDescription} products={newest} /> : null}
    {home.needsEnabled ? <section className="luxury-needs"><header><h2>{home.needsTitle}</h2>{home.needsDescription ? <p>{home.needsDescription}</p> : null}</header><div>{needs.map(([title,description,intent],index)=><a href={`/needs?intent=${encodeURIComponent(intent)}`} key={title}><span>0{index+1}</span><h3>{title}</h3><p>{description}</p><b>شروع ←</b></a>)}</div></section> : null}
    {home.bestSellersEnabled && bestProducts.length ? <ProductRail title={home.bestSellersTitle} description={home.bestSellersDescription} products={bestProducts} /> : null}
    {home.passportEnabled ? <section className="passport-editorial"><div className="passport-visual"><span>PERSONAL BEAUTY SYSTEM</span><div><i/><i/><i/><i/></div></div><div><span>{home.passportEyebrow}</span><h2>{home.passportTitle}</h2>{home.passportDescription ? <p>{home.passportDescription}</p> : null}<a href={home.passportButtonLink} className="luxury-button dark">{home.passportButtonText}</a></div></section> : null}
  </main>;
}
