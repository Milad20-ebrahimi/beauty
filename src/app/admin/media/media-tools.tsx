"use client";
import { useState } from "react";

export function CopyMediaUrl({ url }: { url: string }) {
  const [copied,setCopied] = useState(false);
  return <button type="button" onClick={async()=>{await navigator.clipboard.writeText(url);setCopied(true);setTimeout(()=>setCopied(false),1600);}}>{copied ? "کپی شد ✓" : "کپی آدرس"}</button>;
}
