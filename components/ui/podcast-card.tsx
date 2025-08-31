import * as React from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type PodcastCardProps = React.HTMLAttributes<HTMLDivElement> & {
  name: string;
  author: string;
  episodesCount: number;
  coverUrl?: string;
  categories?: string[];
  href?: string;
  isSubscribed?: boolean;
  onSubscribe?: (next: boolean) => void;
};

const PodcastCard = React.forwardRef<HTMLDivElement, PodcastCardProps>(
  ({ className, name, author, episodesCount, coverUrl, categories, href, isSubscribed = false, onSubscribe, ...rest }, ref) => {
    const coverSrc = coverUrl && coverUrl.trim() !== "" ? coverUrl : "/images/Logo.webp";
    const [subscribed, setSubscribed] = React.useState<boolean>(isSubscribed);
    React.useEffect(() => setSubscribed(isSubscribed), [isSubscribed]);

    // console.log(categories)
    
    const content = (
      <div
        ref={ref}
        className={cn(
          "group flex h-full w-full items-stretch gap-8 rounded-2xl border bg-card/95 text-card-foreground shadow-sm transition-colors hover:bg-card",
          "p-4 sm:p-6",
          className,
        )}
        {...rest}
      >
        <div className="shrink-0">
          <Image
            src={coverSrc}
            alt={name}
            width={96}
            height={96}
            className="h-20 w-20 rounded-xl object-cover sm:h-24 sm:w-24"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold sm:text-2xl">{name}</h2>
            <p className="mt-0.5 truncate text-sm text-muted-foreground sm:text-base">
              {author} 
              <span className="mx-1">•</span> {episodesCount} épisodes
            </p>
          </div>
          <div className="flex flex-col items-start gap-5">
            <Button
              variant={subscribed ? "default" : "outline"}
              className={cn(
                "rounded-full px-4 py-2 font-semibold",
                subscribed
                  ? "bg-white text-slate-900 hover:bg-white/90"
                  : "border-white text-white hover:bg-white/10 hover:text-white",
              )}
              aria-pressed={subscribed}
              onClick={(e) => {
                e.preventDefault();
                const next = !subscribed;
                setSubscribed(next);
                onSubscribe?.(next);
              }}
            >
              {subscribed ? "Abonné" : "S'abonner"}
            </Button>
            {Array.isArray(categories) && categories.length > 0 ? (
              <div className="flex flex-wrap items-center gap-4">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full border-2 border-yellow-400 px-3 py-1 text-sm font-semibold text-yellow-400"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            ) : null}
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
