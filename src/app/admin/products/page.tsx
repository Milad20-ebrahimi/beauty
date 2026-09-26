import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { archiveProduct } from "./actions";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = { ACTIVE: "فعال", DRAFT: "پیش‌نویس", ARCHIVED: "آرشیو" };

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price);
}

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const { success } = await searchParams;
  const products = await prisma.product.findMany({
    include: { brand: true, category: true, media: { take: 1, orderBy: { sortOrder: "asc" } }, _count: { select: { reviews: true } } },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div><p className="admin-kicker">کاتالوگ</p><h1>مدیریت محصولات</h1><p>اطلاعات، قیمت، موجودی و وضعیت نمایش محصولات را کنترل کن.</p></div>
        <a href="/admin/products/new" className="primary-action">+ محصول جدید</a>
      </header>

      {success ? <div className="admin-alert success">{success === "created" ? "محصول با موفقیت ایجاد شد." : "تغییرات محصول ذخیره شد."}</div> : null}

      <div className="admin-table-wrap">
        <div className="admin-table-head"><span>{products.length} محصول</span><small>مرتب‌شده براساس آخرین تغییر</small></div>
        {products.length ? (
          <div className="admin-product-list">
            {products.map((product) => {
              const available = Math.max(0, product.stock - product.reservedStock);
              return (
                <article key={product.id} className="admin-product-row">
                  <div className="admin-product-thumb">
                    {product.media[0] ? <Image src={product.media[0].url} alt={product.title} width={72} height={72} /> : <span>بدون تصویر</span>}
                  </div>
                  <div className="admin-product-name"><strong>{product.title}</strong><span>{product.brand.name} · {product.category.title}</span></div>
                  <div className="admin-product-cell"><small>قیمت</small><strong>{formatPrice(product.price)} تومان</strong></div>
                  <div className="admin-product-cell"><small>موجودی</small><strong className={available <= 3 ? "low-stock" : ""}>{available}</strong></div>
                  <div className="admin-product-cell"><small>وضعیت</small><span className={`admin-status ${product.status.toLowerCase()}`}>{statusLabels[product.status]}</span></div>
                  <div className="admin-row-actions">
                    <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer" title="مشاهده محصول">مشاهده</a>
                    <a href={`/admin/products/${product.id}/edit`} className="edit-link">ویرایش</a>
                    {product.status !== "ARCHIVED" ? <form action={archiveProduct}><input type="hidden" name="id" value={product.id} /><button type="submit">آرشیو</button></form> : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-empty"><strong>هنوز محصولی ثبت نشده است.</strong><p>اولین محصول کاتالوگ را بساز.</p><a href="/admin/products/new" className="primary-action">افزودن محصول</a></div>
        )}
      </div>
    </main>
  );
}
