import React from 'react';
import Image from 'next/image';

export function Hero() {
  return (
    <section
      id="main-content"
      className="bg-background relative overflow-hidden mx-auto max-w-[1400px] flex flex-row justify-between items-center text-left gap-8 p-8 pb-16 min-h-full md:min-h-[90vh] md:gap-12 md:p-8 lg:px-16"
    >
      <div className="w-full max-w-full lg:max-w-[50%]">
        <h1 className="text-[3rem] lg:text-[4rem]">Podkids</h1>
        <h2 className="text-foreground font-medium text-2xl lg:text-3xl mb-6 max-w-[600px] leading-snug mx-0">
          L'application de podcast sécurisée pour les enfants
        </h2>
        <p className="text-foreground text-xl mb-8 max-w-[500px] leading-relaxed mx-0">
          Une application simple, accessible et sans pub !
        </p>
        <div className="mt-8">
          <a
            href="#download"
            className="inline-block bg-primary text-secondary font-bold py-4 px-8 rounded-[50px] text-lg transition-all duration-300 shadow-[0_4px_15px_rgba(255,193,7,0.3)] hover:-translate-y-[3px] hover:shadow-[0_8px_25px_rgba(255,193,7,0.4)]"
          >
            Télécharger
          </a>
        </div>
      </div>
      <div className="relative flex-shrink-0 flex flex-col items-center gap-5">
        <div className="relative z-10 mb-[-20px] lg:mb-0">
          <Image
            src="/images/Hero-Illustration.webp"
            alt=""
            width={500}
            height={400}
            className="w-[500px] h-auto object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
};
