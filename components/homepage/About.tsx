import React from "react";
import Image from "next/image";

const About: React.FC = () => {
  return (
    <section className="bg-card py-12 md:py-20">
      <div className="mx-auto max-w-[1200px] px-8">
        <h2 className="mb-8 text-center text-[2.5rem] font-bold text-primary">
          Qu&apos;est-ce que Podkids&nbsp;?
        </h2>
        <p className="mx-auto mb-16 max-w-[800px] text-center text-[1.2rem] leading-[1.7] text-foreground">
          Podkids est une application de gestion de podcasts conçue spécialement pour les enfants.
          Offrant un environnement sûr et adapté, elle permet aux jeunes auditeurs de découvrir des
          contenus enrichissants tout en garantissant un contrôle parental optimal.
        </p>
        <div className="mt-12">
          <h3 className="mb-10 text-center text-[2rem] font-bold text-foreground">
            Pourquoi choisir Podkids&nbsp;?
          </h3>
          <ul className="grid list-none grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <li className="flex flex-col items-center gap-4 rounded-[16px] bg-background p-8 shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:-translate-y-[5px] sm:flex-row sm:items-start">
              <span className="shrink-0 text-[2.5rem]">
                <Image src="/icons/cadenas.webp" alt="" width={50} height={50} />
              </span>
              <div>
                <h4 className="mb-3 text-xl font-semibold text-primary">
                  100% sécurisée et sans publicité
                </h4>
                <p className="leading-relaxed text-foreground">
                  Nous ne diffusons aucune publicité ni contenu inadapté. Pas besoin de compte,
                  toutes les données restent sur votre téléphone.
                </p>
              </div>
            </li>
            <li className="flex flex-col items-center gap-4 rounded-[16px] bg-background p-8 shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:-translate-y-[5px] sm:flex-row sm:items-start">
              <span className="shrink-0 text-[2.5rem]">
                <Image src="/icons/enfant.webp" alt="" width={50} height={50} />
              </span>
              <div>
                <h4 className="mb-3 text-xl font-semibold text-primary">
                  Une interface pensée pour les enfants
                </h4>
                <p className="leading-relaxed text-foreground">
                  Simple, intuitive et accessible, l&apos;interface est faite pour être facilement
                  prise en main et pour retrouver facilement tous vos podcasts.
                </p>
              </div>
            </li>
            <li className="flex flex-col items-center gap-4 rounded-[16px] bg-background p-8 shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:-translate-y-[5px] sm:flex-row sm:items-start">
              <span className="shrink-0 text-[2.5rem]">
                <Image src="/icons/bouclier-humain.webp" alt="" width={50} height={50} />
              </span>
              <div>
                <h4 className="mb-3 text-xl font-semibold text-primary">
                  Un contrôle parental complet
                </h4>
                <p className="leading-relaxed text-foreground">
                  Gérez les accès et filtrez les contenus selon l&apos;âge et les centres
                  d&apos;intérêt de vos enfants.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default About;
