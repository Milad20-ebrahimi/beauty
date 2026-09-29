"use client";
import Image from "next/image";
import { useState } from "react";

type Media={id:string;url:string;alt:string|null};
export function ProductGallery({media,title}:{media:Media[];title:string}){
  const [active,setActive]=useState(0);const selected=media[active]||media[0];
  if(!selected)return <div className="detail-image-empty">تصویر محصول به‌زودی اضافه می‌شود</div>;
  return <div className="editorial-product-gallery"><div className="detail-gallery-stage"><Image src={selected.url} alt={selected.alt||title} fill priority sizes="(max-width: 900px) 100vw, 58vw"/></div>{media.length>1?<div className="detail-gallery-thumbs" role="list" aria-label="تصاویر محصول">{media.map((item,index)=><button type="button" key={item.id} className={index===active?"active":""} onClick={()=>setActive(index)} aria-label={`نمایش تصویر ${index+1}`} aria-current={index===active}><Image src={item.url} alt="" width={140} height={140}/></button>)}</div>:null}</div>;
}
