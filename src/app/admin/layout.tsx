import { requireAdmin } from "@/lib/auth";
import { logoutAdmin } from "./logout-action";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireAdmin();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-head">
          <span className="brand-symbol">B</span>
          <div><strong>مدیریت BeautyOS</strong><small>پنل مدیریت فروشگاه</small></div>
        </div>
        <nav className="admin-nav" aria-label="منوی مدیریت">
          <a href="/admin">نمای کلی</a>
          <a href="/admin/products">محصولات</a>
          <a href="/admin/brands">برندها</a>
          <a href="/admin/categories">دسته‌بندی‌ها</a>
          <a href="/admin/ingredients">ترکیبات</a>
          <span>نظرات <small>به‌زودی</small></span>
          <span>کاربران <small>به‌زودی</small></span>
        </nav>
        <div className="admin-sidebar-user">
          <span>{user.displayName?.charAt(0) || "م"}</span>
          <div><strong>{user.displayName || "مدیر"}</strong><small>{user.role === "MANAGER" ? "مدیر کل" : "ادمین"}</small></div>
          <form action={logoutAdmin}><button type="submit" title="خروج از حساب">خروج</button></form>
        </div>
        <a href="/" className="admin-store-link">مشاهده فروشگاه ←</a>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
