"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

const configuredPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const metaPixelId =
  configuredPixelId && /^\d+$/.test(configuredPixelId)
    ? configuredPixelId
    : null;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: (...args: unknown[]) => void;
  }
}

export function MetaPixel() {
  const pathname = usePathname();
  const skippedInitialPageView = useRef(false);

  useEffect(() => {
    if (!metaPixelId) return;

    if (!skippedInitialPageView.current) {
      skippedInitialPageView.current = true;
      return;
    }

    window.fbq?.("track", "PageView");
  }, [pathname]);

  if (!metaPixelId) return null;

  return (
    <Script
      id="meta-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');
        `,
      }}
    />
  );
}
