import React from "react";
import Image from "next/image";

export function Hero() {
  return (
    <section
      id="main-content"
      className="relative mx-auto flex min-h-full max-w-[1400px] flex-col items-center justify-between gap-8 overflow-hidden bg-background p-8 pb-16 text-left md:min-h-[90vh] md:gap-12 md:p-8 lg:flex-row lg:px-16"
    >
      <div className="flex w-full max-w-full flex-col items-center lg:max-w-full lg:items-start">
        <h1 className="text-[3rem] lg:text-[4rem]">Podkids</h1>
        <h2 className="mx-0 mb-6 text-center text-2xl font-medium leading-snug text-foreground lg:text-left lg:text-3xl">
          L&apos;application de podcast sécurisée pour les enfants
        </h2>
        <p className="mx-0 mb-8 text-center text-xl leading-relaxed text-foreground lg:text-left">
          Une application simple, accessible et sans pub&nbsp;!
        </p>
        <div className="mt-8">
          <a
            href="#download"
            className="inline-block rounded-[50px] bg-primary px-8 py-4 text-lg font-bold text-secondary shadow-[0_4px_15px_rgba(255,193,7,0.3)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_8px_25px_rgba(255,193,7,0.4)]"
          >
            Télécharger
          </a>
        </div>
      </div>
      <div className="relative flex flex-shrink-0 flex-col items-center gap-5 lg:mt-8">
        <div className="relative z-10 mb-[-20px] lg:mb-0">
          <Image
            src="/images/Hero-Illustration.webp"
            alt=""
            width={500}
            height={400}
            className="h-auto w-[500px] object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
}
