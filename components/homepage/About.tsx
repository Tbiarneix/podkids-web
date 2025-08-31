import React from 'react';
import Image from 'next/image';

const About: React.FC = () => {
  return (
    <section className="bg-card py-12 md:py-20">
      <div className="mx-auto max-w-[1200px] px-8">
        <h2 className="text-[2.5rem] font-bold text-primary text-center mb-8">Qu'est-ce que Podkids&nbsp;?</h2>
        <p className="text-[1.2rem] leading-[1.7] text-foreground text-center max-w-[800px] mx-auto mb-16">
          Podkids est une application de gestion de podcasts conçue spécialement pour les enfants. 
          Offrant un environnement sûr et adapté, elle permet aux jeunes auditeurs de découvrir 
          des contenus enrichissants tout en garantissant un contrôle parental optimal.
        </p>
        <div className="mt-12">
          <h3 className="text-[2rem] font-bold text-foreground text-center mb-10">Pourquoi choisir Podkids&nbsp;?</h3>
          <ul className="list-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <li className="bg-background rounded-[16px] p-8 flex flex-col items-center gap-4 transition-transform duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:-translate-y-[5px] sm:flex-row sm:items-start">
              <span className="text-[2.5rem] shrink-0">
                <Image 
                  src="/icons/cadenas.webp" 
                  alt="" 
                  width={50} 
                  height={50}
                />
              </span>
              <div>
                <h4 className="text-xl font-semibold text-primary mb-3">100% sécurisée et sans publicité</h4>
                <p className="text-foreground leading-relaxed">Nous ne diffusons aucune publicité ni contenu inadapté. Pas besoin de compte, toutes les données restent sur votre téléphone.</p>
              </div>
            </li>
            <li className="bg-background rounded-[16px] p-8 flex flex-col items-center gap-4 transition-transform duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:-translate-y-[5px] sm:flex-row sm:items-start">
              <span className="text-[2.5rem] shrink-0">
                <Image 
                  src="/icons/enfant.webp" 
                  alt="" 
                  width={50} 
                  height={50}
                />
              </span>
              <div>
                <h4 className="text-xl font-semibold text-primary mb-3">Une interface pensée pour les enfants</h4>
                <p className="text-foreground leading-relaxed">Simple, intuitive et accessible, l'interface est faite pour être facilement prise en main et pour retrouver facilement tous vos podcasts.</p>
              </div>
            </li>
            <li className="bg-background rounded-[16px] p-8 flex flex-col items-center gap-4 transition-transform duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:-translate-y-[5px] sm:flex-row sm:items-start">
              <span className="text-[2.5rem] shrink-0">
              <Image 
                  src="/icons/bouclier-humain.webp" 
                  alt="" 
                  width={50} 
                  height={50}
                />
              </span>
              <div>
                <h4 className="text-xl font-semibold text-primary mb-3">Un contrôle parental complet</h4>
                <p className="text-foreground leading-relaxed">Gérez les accès et filtrez les contenus selon l'âge et les centres d'intérêt de vos enfants.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default About;
