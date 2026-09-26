import { getAdminUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { loginAdmin } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [user, { error }] = await Promise.all([getAdminUser(), searchParams]);
  if (user) redirect("/admin");

  return (
    <main className="admin-login-page">
      <section className="admin-login-panel">
        <a href="/" className="brand-mark">
          <span className="brand-symbol">B</span>
          <span className="brand-copy"><strong>BeautyOS</strong><small>ورود امن مدیریت</small></span>
        </a>
        <div className="admin-login-copy">
          <p className="admin-kicker">پنل مدیریت</p>
          <h1>خوش برگشتی</h1>
          <p>برای مدیریت محصولات و اطلاعات فروشگاه وارد حساب مدیر شو.</p>
        </div>
        {error ? <div className="admin-alert error">{error}</div> : null}
        <form action={loginAdmin} className="admin-login-form">
          <label><span>شماره موبایل مدیر</span><input type="tel" name="phone" inputMode="numeric" dir="ltr" required placeholder="09123456789" autoComplete="username" /></label>
          <label><span>کد دسترسی</span><input type="password" name="code" dir="ltr" required minLength={6} placeholder="••••••••" autoComplete="current-password" /></label>
          <button type="submit" className="primary-action">ورود به پنل</button>
        </form>
        <p className="admin-login-note">اطلاعات ورود از تنظیمات امن محیط خوانده می‌شود و داخل دیتابیس یا GitHub ذخیره نمی‌شود.</p>
      </section>
      <section className="admin-login-aside" aria-label="امکانات پنل">
        <div><span>BeautyOS Admin</span><h2>کاتالوگ را با اطمینان مدیریت کن.</h2><p>دسترسی فقط برای نقش مدیر و ادمین فعال است و هر سشن پس از ۱۲ ساعت منقضی می‌شود.</p></div>
      </section>
    </main>
  );
}
