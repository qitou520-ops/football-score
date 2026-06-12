"use client";

import useSWR from "swr";
import { ds } from "@/lib/design";
import { sanitizeAdHtml } from "@/lib/sanitize/ad-html";

interface AdItem {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  htmlCode: string;
}

export function InlineAd({ position }: { position: string }) {
  const { data } = useSWR<AdItem[]>(`/api/ads?position=${position}`, (url: string) =>
    fetch(url).then((r) => r.json())
  );

  const ad = data?.[0];
  if (!ad) return null;

  const safeHtml = ad.htmlCode ? sanitizeAdHtml(ad.htmlCode) : "";
  if (safeHtml) {
    return (
      <div
        className={ds.panel + " p-3"}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    );
  }

  if (!ad.imageUrl && !ad.linkUrl) return null;

  const content = ad.imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={ad.imageUrl} alt={ad.title} className="w-full rounded-md object-cover max-h-24" />
  ) : (
    <span className="text-sm font-medium">{ad.title}</span>
  );

  return (
    <div className={ds.panel + " p-3 text-center"}>
      {ad.linkUrl ? (
        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer sponsored">
          {content}
        </a>
      ) : (
        content
      )}
    </div>
  );
}
