"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import screenshotData from "./screenshot.json";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function Screenshot() {
  const containerRef = useRef<HTMLUListElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const total = screenshotData.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === total - 1 ? 0 : prevIndex + 1));
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? total - 1 : prevIndex - 1));
  }, [total]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Gestion du clavier pour l'accessibilité
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      }
    },
    [prevSlide, nextSlide],
  );

  // Effet pour synchroniser le défilement avec currentIndex
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const items = Array.from(container.children) as HTMLElement[];

      if (items.length > 0 && items[currentIndex]) {
        const item = items[currentIndex];
        const scrollLeft = item.offsetLeft - container.clientWidth / 2 + item.offsetWidth / 2;
        container.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    }
  }, [currentIndex]);

  return (
    <section
      id="screenshots"
      className="relative mx-auto w-full overflow-hidden bg-card py-20"
      aria-labelledby="screenshots-title"
      onKeyDown={handleKeyDown}
      role="region"
      aria-roledescription="Carrousel de captures d'écran"
    >
      <h2 id="screenshots-title" className="mb-12 text-center text-[2.5rem] font-bold text-primary">
        Découvre Podkids en images
      </h2>
      <div className="relative mx-auto max-w-[1200px]">
        <ul
          ref={containerRef}
          className="mx-auto flex max-w-[1200px] snap-x snap-proximity list-none gap-8 overflow-x-auto px-16 py-4 [-ms-overflow-style:none] [scrollbar-width:none] max-[1400px]:w-[85%] max-[1400px]:[-webkit-mask-image:linear-gradient(to_right,transparent,black_5rem,black_calc(100%_-_5rem),transparent)] max-[1400px]:[mask-image:linear-gradient(to_right,transparent,black_5rem,black_calc(100%_-_5rem),transparent)] max-[768px]:w-full max-[768px]:snap-mandatory max-[768px]:gap-0 max-[768px]:[-webkit-mask-image:linear-gradient(to_right,transparent,black_5rem,black_calc(100%_-_5rem),transparent)] max-[768px]:[mask-image:linear-gradient(to_right,transparent,black_5rem,black_calc(100%_-_5rem),transparent)] max-[768px]:[scroll-padding:0_calc((100%_-_60%)_/_2)] [&::-webkit-scrollbar]:hidden"
          role="list"
          aria-live="polite"
        >
          {screenshotData.map((screenshot, index) => (
            <li
              key={screenshot.id}
              tabIndex={0}
              className={`shrink-0 snap-center transition-transform duration-300 max-[768px]:mx-[1.2rem] max-[768px]:basis-[60%] ${index === currentIndex ? "scale-105" : ""}`}
            >
              <h3 className="sr-only">{screenshot.title}</h3>
              <p
                className="sr-only"
                dangerouslySetInnerHTML={{ __html: screenshot.description }}
              ></p>
              <Image
                src={screenshot.src}
                alt={screenshot.title}
                width={280}
                height={560}
                className="rounded-[24px] border-4 border-primary transition-all duration-300 focus-within:-translate-y-[5px] hover:-translate-y-[5px]"
              />
            </li>
          ))}
        </ul>
        <div className="mx-auto flex items-center justify-center gap-8 p-8">
          <button
            onClick={prevSlide}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-primary text-background shadow transition-all duration-200 hover:border-[3px] hover:border-primary hover:bg-background hover:text-primary focus:border-[3px] active:border-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Voir les captures d'écran précédentes"
          >
            <ChevronLeft />
          </button>
          <div className="flex justify-center gap-4">
            {Array.from({ length: screenshotData.length }).map((_, index) => (
              <div
                key={index}
                className={`h-3 w-3 cursor-pointer rounded-full transition-all duration-300 ${index === currentIndex ? "scale-[1.2] bg-primary" : "bg-foreground/60"}`}
                onClick={() => goToSlide(index)}
                role="button"
                tabIndex={0}
                aria-label={`Aller à la capture d'écran ${index + 1}`}
                onKeyDown={(e) => e.key === "Enter" && goToSlide(index)}
              />
            ))}
          </div>
          <button
            onClick={nextSlide}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-0 bg-primary text-background shadow transition-all duration-200 hover:border-[3px] hover:border-primary hover:bg-background hover:text-primary focus:border-[3px] active:border-[3px] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Voir les captures d'écran suivantes"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}
