"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import screenshotData from "./screenshot.json";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function Screenshot() {
  const containerRef = useRef<HTMLUListElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === screenshotData.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? screenshotData.length - 1 : prevIndex - 1
    );
  };

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
    [prevSlide, nextSlide]
  );

  // Effet pour synchroniser le défilement avec currentIndex
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const items = Array.from(container.children) as HTMLElement[];
      
      if (items.length > 0 && items[currentIndex]) {
        const item = items[currentIndex];
        
        // Calcul de la position pour centrer l'élément actif
        const scrollLeft = item.offsetLeft - (container.clientWidth / 2) + (item.offsetWidth / 2);
        
        // Utiliser scrollTo avec behavior: 'smooth' pour une animation fluide
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex]);

  return (
    <section
      id="screenshots"
      className="w-full mx-auto py-20 bg-card overflow-hidden relative"
      aria-labelledby="screenshots-title"
      onKeyDown={handleKeyDown}
      role="region"
      aria-roledescription="Carrousel de captures d'écran"
    >
      <h2 id="screenshots-title" className="text-[2.5rem] font-bold text-primary text-center mb-12">
        Découvre Podkids en images
      </h2>
      <div className="max-w-[1200px] mx-auto relative">
        <ul
          ref={containerRef}
          className="flex gap-8 max-w-[1200px] mx-auto py-4 px-16 list-none overflow-x-auto snap-x snap-proximity [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden max-[768px]:w-full max-[768px]:gap-0 max-[768px]:snap-mandatory max-[768px]:[scroll-padding:0_calc((100%_-_60%)_/_2)] max-[768px]:[mask-image:linear-gradient(to_right,transparent,black_5rem,black_calc(100%_-_5rem),transparent)] max-[768px]:[-webkit-mask-image:linear-gradient(to_right,transparent,black_5rem,black_calc(100%_-_5rem),transparent)] max-[1400px]:w-[85%] max-[1400px]:[mask-image:linear-gradient(to_right,transparent,black_5rem,black_calc(100%_-_5rem),transparent)] max-[1400px]:[-webkit-mask-image:linear-gradient(to_right,transparent,black_5rem,black_calc(100%_-_5rem),transparent)]"
          role="list"
          aria-live="polite"
        >
          {screenshotData.map((screenshot, index) => (
            <li 
              key={screenshot.id} 
              tabIndex={0}
              className={`shrink-0 transition-transform duration-300 snap-center max-[768px]:basis-[60%] max-[768px]:mx-[1.2rem] ${index === currentIndex ? 'scale-105' : ''}`}
            >
              <h3 className="sr-only">{screenshot.title}</h3>
              <p className="sr-only" dangerouslySetInnerHTML={{ __html: screenshot.description }}></p>
              <Image
                src={screenshot.src}
                alt={screenshot.title}
                width={280}
                height={560}
                className="rounded-[24px] border-4 border-primary transition-all duration-300 hover:-translate-y-[5px] focus-within:-translate-y-[5px]"
              />
            </li>
          ))}
        </ul>
        <div className="flex justify-center items-center mx-auto p-8 gap-8">
          <button
            onClick={prevSlide}
            className="flex items-center justify-center w-10 h-10 text-background bg-primary rounded-full shadow cursor-pointer transition-all duration-200 border-0 hover:border-[3px] hover:border-primary hover:text-primary hover:bg-background focus:border-[3px] active:border-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Voir les captures d'écran précédentes"
          >
            <ChevronLeft />
          </button>
          <div className="flex justify-center gap-4">
            {Array.from({ length: screenshotData.length }).map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full cursor-pointer transition-all duration-300 ${index === currentIndex ? 'bg-primary scale-[1.2]' : 'bg-foreground/60'}`}
                onClick={() => goToSlide(index)}
                role="button"
                tabIndex={0}
                aria-label={`Aller à la capture d'écran ${index + 1}`}
                onKeyDown={(e) => e.key === 'Enter' && goToSlide(index)}
              />
            ))}
          </div>
          <button
            onClick={nextSlide}
            className="flex items-center justify-center w-10 h-10 text-background bg-primary rounded-full shadow cursor-pointer transition-all duration-200 border-0 hover:border-[3px] hover:border-primary hover:text-primary hover:bg-background focus:border-[3px] active:border-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Voir les captures d'écran suivantes"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}
