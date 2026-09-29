"use client";

import { useEffect, useState } from "react";

type Props = {
  mediaType: string;
  desktopImage: string | null;
  mobileImage: string | null;
  desktopVideo: string | null;
  mobileVideo: string | null;
  desktopPoster: string | null;
  mobilePoster: string | null;
  alt: string;
  fit: string;
  position: string;
  customPosition: string | null;
};

const objectPosition = (position: string, custom: string | null) => position === "CUSTOM" && custom ? custom : ({ CENTER:"center", TOP:"top", BOTTOM:"bottom", LEFT:"left", RIGHT:"right" }[position] || "center");

function ResponsivePicture({ desktop, mobile, alt, fit, position }: { desktop:string|null; mobile:string|null; alt:string; fit:string; position:string }) {
  if (!desktop && !mobile) return <div className="hero-media-placeholder" aria-hidden="true"><span>BEAUTY / CAMPAIGN</span></div>;
  return <picture><source media="(max-width: 767px)" srcSet={mobile || desktop || ""}/><img src={desktop || mobile || ""} alt={alt} fetchPriority="high" decoding="async" style={{ objectFit: fit as "cover"|"contain", objectPosition: position }}/></picture>;
}

export function HeroMedia(props: Props) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { setIsMobile(mobile.matches); setReduceMotion(reduced.matches); setVideoReady(false); setVideoFailed(false); };
    sync(); mobile.addEventListener("change", sync); reduced.addEventListener("change", sync);
    return () => { mobile.removeEventListener("change", sync); reduced.removeEventListener("change", sync); };
  }, []);
  const position = objectPosition(props.position, props.customPosition);
  if (props.mediaType === "IMAGE") return <div className="homepage-hero-media"><ResponsivePicture desktop={props.desktopImage} mobile={props.mobileImage} alt={props.alt} fit={props.fit.toLowerCase()} position={position}/></div>;
  const posterDesktop = props.desktopPoster || props.desktopImage;
  const posterMobile = props.mobilePoster || props.mobileImage || posterDesktop;
  const videoSrc = isMobile === null || reduceMotion ? null : isMobile ? props.mobileVideo : props.desktopVideo;
  return <div className={`homepage-hero-media video-mode ${videoReady ? "video-ready" : ""}`}>
    <div className="hero-poster"><ResponsivePicture desktop={posterDesktop} mobile={posterMobile} alt={props.alt} fit={props.fit.toLowerCase()} position={position}/></div>
    {videoSrc && !videoFailed ? <video key={videoSrc} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" onCanPlay={() => setVideoReady(true)} onError={() => setVideoFailed(true)} style={{ objectFit: props.fit.toLowerCase() as "cover"|"contain", objectPosition: position }}><source src={videoSrc}/></video> : null}
  </div>;
}
