import * as React from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/utils/sanitize";

type PodcastCardProps = React.HTMLAttributes<HTMLDivElement> & {
  name: string;
  author: string;
  episodesCount: number;
  coverUrl?: string;
  categories?: string[];
  href?: string;
  isSubscribed?: boolean;
  onSubscribe?: (next: boolean) => void;
  description?: string;
  onCategoryClick?: (label: string) => void;
};

const PodcastCard = React.forwardRef<HTMLDivElement, PodcastCardProps>(
  ({ className, name, author, episodesCount, coverUrl, categories, href, isSubscribed = false, onSubscribe, description, onCategoryClick, ...rest }, ref) => {
    const direct = coverUrl && coverUrl.trim() !== "" ? coverUrl.trim() : "";
    const coverSrc = direct ? `/api/image-proxy?src=${encodeURIComponent(direct)}` : "/images/Logo.webp";
    const [subscribed, setSubscribed] = React.useState<boolean>(isSubscribed);
    React.useEffect(() => setSubscribed(isSubscribed), [isSubscribed]);
    
    const content = (
      <div
        ref={ref}
        className={cn(
          "group relative flex h-full w-full items-stretch gap-8 rounded-2xl border bg-card/95 text-card-foreground shadow-sm transition-colors hover:bg-card",
          "p-4 sm:p-6",
          className,
        )}
        {...rest}
      >
        <button
          type="button"
          aria-label={subscribed ? "Se désabonner" : "S'abonner"}
          title={subscribed ? "Se désabonner" : "S'abonner"}
          aria-pressed={subscribed}
          className={cn(
            "absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full",
            "text-yellow-400 hover:text-yellow-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          )}
          onClick={(e) => {
            e.preventDefault();
            const next = !subscribed;
            setSubscribed(next);
            onSubscribe?.(next);
          }}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill={subscribed ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="sr-only">{subscribed ? "Se désabonner" : "S'abonner"}</span>
        </button>
        <div className="shrink-0">
          <Image
            src={coverSrc}
            alt={name}
            width={96}
            height={96}
            className="h-20 w-20 rounded-xl object-cover sm:h-24 sm:w-24"
            unoptimized
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 pr-[4%]">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold sm:text-2xl">{name}</h2>
            <p className="mt-0.5 truncate text-sm text-muted-foreground sm:text-base">
              {author} 
              <span className="mx-1">•</span> {episodesCount} épisodes
            </p>
            {description ? (
              <div
                className="mt-1 text-sm text-muted-foreground line-clamp-1"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
              />
            ) : null}
          </div>
          <div className="flex flex-col items-start gap-5">
            {Array.isArray(categories) && categories.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 overflow-hidden h-[72px]">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className="rounded-full border-2 border-yellow-400 px-3 py-1 text-sm font-semibold text-yellow-400 hover:bg-yellow-400/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onCategoryClick?.(cat);
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-[72px]" />
            )}
          </div>
        </div>
      </div>
    );

    if (href) {
      return (
        <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          {content}
        </Link>
      );
    }

    return content;
  },
);

PodcastCard.displayName = "PodcastCard";

export {
  PodcastCard,
};
