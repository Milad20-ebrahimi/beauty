import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getHomeSettings } from "@/lib/home-settings";

export const dynamic = "force-dynamic";
const successful: OrderStatus[] = ["PAID","PROCESSING","SHIPPED","DELIVERED"];
const price = (value: number) => new Intl.NumberFormat("fa-IR").format(value);
const needs = [["پوستم جوش می‌زند","انتخاب‌های سازگارتر با پوست مستعد جوش","جوش و منافذ"],["پوستم خشک است","مراقبت ملایم برای خشکی و کشیدگی","خشکی پوست"],["ضدآفتاب می‌خواهم","محافظت روزانه متناسب با پوست تو","ضدآفتاب"],["روتین ساده می‌خواهم","یک مسیر کوتاه برای صبح و شب","روتین ساده"],["انتخاب اقتصادی","محصولات مؤثر در محدوده بودجه کمتر","محصول اقتصادی"],["نمی‌دانم چی بخرم","با چند سؤال ساده انتخاب را شروع کن","راهنمای خرید"]];
type HomeProduct = { id: string; slug: string; title: string; subtitle: string | null; price: number; compareAtPrice: number | null; media: { url: string; alt: string | null }[]; brand: { name: string } };

const ProductRail = ({ title, description, products }: { title: string; description?: string | null; products: HomeProduct[] }) => <section className="editorial-products"><header><div><h2>{title}</h2>{description ? <p>{description}</p> : null}</div><a href="/products">مشاهده همه ←</a></header><div className="editorial-product-rail">{products.map((product) => <article key={product.id}><a href={`/products/${product.slug}`} className="editorial-product-image">{product.media[0] ? <img src={product.media[0].url} alt={product.media[0].alt || product.title} /> : <span>BeautyOS</span>}</a><div><p>{product.brand.name}</p><h3><a href={`/products/${product.slug}`}>{product.title}</a></h3>{product.subtitle ? <small>{product.subtitle}</small> : null}<strong>{price(product.price)} <small>تومان</small></strong></div></article>)}</div></section>;

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
  return <main className="luxury-home">
    {home.heroEnabled ? <section className="video-hero"><div className="video-hero-media">{home.heroVideoUrl ? <video autoPlay muted loop playsInline poster={home.heroPosterUrl || undefined}><source src={home.heroVideoUrl} /></video> : home.heroPosterUrl ? <img src={home.heroPosterUrl} alt={home.heroTitle} /> : <div className="video-placeholder"><span>BEAUTY / INTELLIGENCE</span><b>تصویر ویدیویی برند تو</b></div>}</div><div className="video-hero-copy"><span>{home.heroEyebrow}</span><h1>{home.heroTitle}</h1>{home.heroDescription ? <p>{home.heroDescription}</p> : null}<div><a className="luxury-button dark" href={home.heroButtonLink}>{home.heroButtonText}</a>{home.heroSecondaryText && home.heroSecondaryLink ? <a className="luxury-button light" href={home.heroSecondaryLink}>{home.heroSecondaryText}</a> : null}</div></div></section> : null}
    {home.postersEnabled ? <section className="duo-posters">{[[home.posterOneImageUrl,home.posterOneKicker,home.posterOneTitle,home.posterOneDescription,home.posterOneButtonText,home.posterOneLink],[home.posterTwoImageUrl,home.posterTwoKicker,home.posterTwoTitle,home.posterTwoDescription,home.posterTwoButtonText,home.posterTwoLink]].map((poster,index)=><article key={index} className={!poster[0] ? `poster-placeholder tone-${index+1}` : ""}>{poster[0] ? <img src={poster[0]} alt={poster[2] || "پوستر"} /> : <div className="poster-art"><i/><i/><i/></div>}<div className="poster-copy">{poster[1] ? <span>{poster[1]}</span> : null}<h2>{poster[2]}</h2>{poster[3] ? <p>{poster[3]}</p> : null}<a href={poster[5] || "/products"}>{poster[4]} ←</a></div></article>)}</section> : null}
    {home.newProductsEnabled && newest.length ? <ProductRail title={home.newProductsTitle} description={home.newProductsDescription} products={newest} /> : null}
    {home.needsEnabled ? <section className="luxury-needs"><header><h2>{home.needsTitle}</h2>{home.needsDescription ? <p>{home.needsDescription}</p> : null}</header><div>{needs.map(([title,description,intent],index)=><a href={`/needs?intent=${encodeURIComponent(intent)}`} key={title}><span>0{index+1}</span><h3>{title}</h3><p>{description}</p><b>شروع ←</b></a>)}</div></section> : null}
    {home.bestSellersEnabled && bestProducts.length ? <ProductRail title={home.bestSellersTitle} description={home.bestSellersDescription} products={bestProducts} /> : null}
    {home.passportEnabled ? <section className="passport-editorial"><div className="passport-visual"><span>PERSONAL BEAUTY SYSTEM</span><div><i/><i/><i/><i/></div></div><div><span>{home.passportEyebrow}</span><h2>{home.passportTitle}</h2>{home.passportDescription ? <p>{home.passportDescription}</p> : null}<a href={home.passportButtonLink} className="luxury-button dark">{home.passportButtonText}</a></div></section> : null}
  </main>;
}
