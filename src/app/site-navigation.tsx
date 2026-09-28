"use client";

import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "خانه", short: "خانه", icon: "⌂" },
  { href: "/needs", label: "انتخاب براساس نیاز", short: "نیازها", icon: "◇" },
  { href: "/recommendations", label: "پیشنهادهای من", short: "پیشنهادها", icon: "✦" },
  { href: "/routine", label: "روتین من", short: "روتین", icon: "☼" },
  { href: "/passport", label: "Beauty Passport", short: "پروفایل", icon: "◎" }
];

export function SiteNavigation() {
  const pathname = usePathname();

  return (
    <nav className="site-nav" aria-label="ناوبری اصلی">
      {links.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <a key={link.href} href={link.href} className={`${active ? "active" : ""} ${link.href === "/passport" ? "nav-cta" : ""}`} aria-current={active ? "page" : undefined}>
            <span className="nav-icon" aria-hidden="true">{link.icon}</span>
            <span className="nav-label">{link.label}</span>
            <span className="nav-short">{link.short}</span>
          </a>
        );
      })}
    </nav>
  );
}
