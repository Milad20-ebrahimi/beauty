"use client";
import { useState } from "react";

type Asset = { id:string; url:string; kind:string; alt:string|null };
export function HomepageMediaPicker({ assets }: { assets: Asset[] }) {
  const [open,setOpen] = useState(false);
  const [message,setMessage] = useState("");
  const choose = (name:string,url:string,label:string) => {
    const input = document.querySelector<HTMLInputElement>(`[name="${name}"]`);
    if (input) { input.value = url; input.dispatchEvent(new Event("input",{bubbles:true})); setMessage(`${label} انتخاب شد؛ برای انتشار، پایین صفحه ذخیره کن.`); }
  };
  return <section className="homepage-media-picker"><header><div><strong>انتخاب سریع از کتابخانه</strong><p>فایل آپلودشده را مستقیم برای ویدیو یا پوستر انتخاب کن.</p></div><button type="button" onClick={()=>setOpen(!open)}>{open ? "بستن" : "بازکردن کتابخانه"}</button></header>{message ? <div>{message}</div> : null}{open ? assets.length ? <div className="homepage-media-strip">{assets.map((asset)=><article key={asset.id}>{asset.kind === "VIDEO" ? <video src={asset.url} muted preload="metadata"/> : <img src={asset.url} alt={asset.alt || "رسانه"}/>}<small>{asset.kind === "VIDEO" ? "ویدیو" : "تصویر"}</small><p>{asset.kind === "VIDEO" ? <button type="button" onClick={()=>choose("heroVideoUrl",asset.url,"ویدیوی اصلی")}>ویدیوی اصلی</button> : <><button type="button" onClick={()=>choose("heroPosterUrl",asset.url,"کاور ویدیو")}>کاور ویدیو</button><button type="button" onClick={()=>choose("posterOneImageUrl",asset.url,"پوستر اول")}>پوستر ۱</button><button type="button" onClick={()=>choose("posterTwoImageUrl",asset.url,"پوستر دوم")}>پوستر ۲</button></>}</p></article>)}</div> : <p className="media-picker-empty">هنوز فایلی آپلود نشده است. از بخش «کتابخانه رسانه» فایل اضافه کن.</p> : null}</section>;
}
