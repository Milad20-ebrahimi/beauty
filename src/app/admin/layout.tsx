export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
          <span>برندها <small>به‌زودی</small></span>
          <span>دسته‌بندی‌ها <small>به‌زودی</small></span>
          <span>نظرات <small>به‌زودی</small></span>
          <span>کاربران <small>به‌زودی</small></span>
        </nav>
        <a href="/" className="admin-store-link">مشاهده فروشگاه ←</a>
      </aside>
      <div className="admin-content">{children}</div>
    </div>
  );
}
