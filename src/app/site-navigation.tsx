"use client";

import { usePathname } from "next/navigation";

type SiteLink = { href: string; label: string; short: string; icon: string; mobileHidden?: boolean };

const links: SiteLink[] = [
  { href: "/", label: "خانه", short: "خانه", icon: "⌂" },
  { href: "/needs", label: "انتخاب براساس نیاز", short: "نیازها", icon: "◇", mobileHidden: true },
  { href: "/recommendations", label: "پیشنهادهای من", short: "پیشنهادها", icon: "✦" },
  { href: "/routine", label: "روتین من", short: "روتین", icon: "☼" },
  { href: "/cart", label: "سبد خرید", short: "سبد", icon: "▣" },
  { href: "/passport", label: "Beauty Passport", short: "پروفایل", icon: "◎", mobileHidden: true },
  { href: "/account", label: "حساب من", short: "حساب", icon: "●" }
];

export function SiteNavigation({ cartCount = 0 }: { cartCount?: number }) {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label="ناوبری اصلی">
      {links.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <a key={link.href} href={link.href} className={`${active ? "active" : ""} ${link.href === "/account" ? "nav-cta" : ""} ${link.mobileHidden ? "mobile-hidden" : ""}`} aria-current={active ? "page" : undefined}>
            <span className="nav-icon" aria-hidden="true">{link.icon}</span>
            <span className="nav-label">{link.label}</span>
            <span className="nav-short">{link.short}</span>
            {link.href === "/cart" && cartCount > 0 ? <span className="nav-cart-count">{new Intl.NumberFormat("fa-IR").format(cartCount)}</span> : null}
          </a>
        );
      })}
    </nav>
  );
}
