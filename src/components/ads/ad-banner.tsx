import { getAds } from "@/lib/cms";
import { sanitizeAdHtml } from "@/lib/sanitize/ad-html";
import { cn } from "@/lib/utils";
import { ds } from "@/lib/design";
import type { AdPosition } from "@/lib/cms/types";

interface AdBannerProps {
  position: AdPosition | string;
  className?: string;
  label?: string;
}

export async function AdBanner({ position, className, label }: AdBannerProps) {
  const ads = await getAds(position);
  if (!ads.length) return null;

  return (
    <div className={cn(ds.stackSm, className)}>
      {ads.map((ad) => (
        <div key={ad.id} className={ds.panel}>
          {label && (
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground px-3 pt-2">{label}</p>
          )}
          <AdContent
            title={ad.title || ad.name}
            htmlCode={ad.htmlCode}
            imageUrl={ad.imageUrl}
            linkUrl={ad.linkUrl}
          />
        </div>
      ))}
    </div>
  );
}

function AdContent({
  title,
  htmlCode,
  imageUrl,
  linkUrl,
}: {
  title: string;
  htmlCode: string;
  imageUrl: string;
  linkUrl: string;
}) {
  const safeHtml = htmlCode ? sanitizeAdHtml(htmlCode) : "";
  if (safeHtml) {
    const inner = (
      <div
        className="p-3 text-sm [&_img]:max-w-full [&_a]:text-primary"
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    );
    if (linkUrl) {
      return (
        <a href={linkUrl} target="_blank" rel="noopener noreferrer sponsored" className="block hover:opacity-95 transition-opacity">
          {inner}
        </a>
      );
    }
    return inner;
  }

  if (imageUrl) {
    const inner = (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt={title} className="w-full h-auto object-cover" />
    );
    if (linkUrl) {
      return (
        <a href={linkUrl} target="_blank" rel="noopener noreferrer sponsored" className="block">
          {inner}
        </a>
      );
    }
    return inner;
  }

  if (linkUrl) {
    return (
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="block p-4 text-sm text-primary hover:underline"
      >
        {title}
      </a>
    );
  }

  return null;
}
