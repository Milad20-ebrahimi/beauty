import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest { return { name: "BeautyOS", short_name: "BeautyOS", description: "انتخاب هوشمند محصولات زیبایی", start_url: "/", display: "standalone", background_color: "#f7f5f0", theme_color: "#176b52", lang: "fa", dir: "rtl" }; }
