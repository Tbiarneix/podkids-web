import React from "react";
import Image from "next/image";

export function Features() {
  return (
    <section id="features" className="bg-background py-12 md:py-20">
      <div className="mx-auto max-w-[1200px] px-8">
        <h2 className="text-[2.5rem] font-bold text-primary text-center mb-12">Les fonctionnalités principales</h2>

        <div className="flex justify-center items-stretch gap-4 max-[540px]:flex-col">
          <div className="flex-1">
            <h3 className="text-[1.8rem] font-bold text-foreground mb-8 flex items-center gap-3 flex-row-reverse max-[540px]:flex-row">
              <span className="text-[2rem]">
                <Image
                  src="/icons/smartphone-parent.webp"
                  alt=""
                  width={90}
                  height={90}
                />
              </span>
              Côté parents
            </h3>
            <div className="flex flex-col justify-between gap-4 pb-12">
              <div className="bg-card rounded-[16px] pt-7 px-7 pb-3 transition-transform duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:-translate-y-[5px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] h-full min-h-[9rem]">
                <h4 className="text-primary text-xl font-semibold mb-4">Gestion des profils</h4>
                <p className="text-foreground leading-relaxed">
                  Créez des profils individuels pour chaque enfant avec ajout
                  d&apos;un mot de passe.
                </p>
              </div>
              <div className="bg-card rounded-[16px] pt-7 px-7 pb-3 transition-transform duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:-translate-y-[5px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] h-full min-h-[9rem]">
                <h4 className="text-primary text-xl font-semibold mb-4">Filtres avancés</h4>
                <p className="text-foreground leading-relaxed">
                  Filtrez le contenu par âge et thématique pour une expérience
                  adaptée.
                </p>
              </div>
              <div className="bg-card rounded-[16px] pt-7 px-7 pb-3 transition-transform duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:-translate-y-[5px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] h-full min-h-[9rem]">
                <h4 className="text-primary text-xl font-semibold mb-4">Ajout manuel</h4>
                <p className="text-foreground leading-relaxed">
                  Ajoutez manuellement des podcasts pour enrichir l&apos;expérience
                  d&apos;écoute.
                </p>
              </div>
              <div className="bg-card rounded-[16px] pt-7 px-7 pb-3 transition-transform duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:-translate-y-[5px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] h-full min-h-[9rem]">
                <h4 className="text-primary text-xl font-semibold mb-4">Export / Import</h4>
                <p className="text-foreground leading-relaxed">
                  Exportez ou importez une configuration préexistante pour un
                  contrôle simplifié.
                </p>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="w-[2px] bg-border mx-4 self-stretch max-[540px]:hidden" />
          <div className="flex-1">
            <h3 className="text-[1.8rem] font-bold text-foreground mb-8 flex items-center gap-3">
              <span className="text-[2rem]">
                <Image
                  src="/icons/smartphone-enfant.webp"
                  alt=""
                  width={90}
                  height={90}
                />
              </span>
              Côté enfants
            </h3>
            <div className="flex flex-col justify-between gap-4 pb-12">
              <div className="bg-card rounded-[16px] pt-7 px-7 pb-3 transition-transform duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:-translate-y-[5px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] h-full min-h-[9rem]">
                <h4 className="text-primary text-xl font-semibold mb-4">Liste de favoris</h4>
                <p className="text-foreground leading-relaxed">
                  Retrouvez facilement vos podcasts préférés grâce à la liste de
                  favoris.
                </p>
              </div>
              <div className="bg-card rounded-[16px] pt-7 px-7 pb-3 transition-transform duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:-translate-y-[5px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] h-full min-h-[9rem]">
                <h4 className="text-primary text-xl font-semibold mb-4">Tri par thématique</h4>
                <p className="text-foreground leading-relaxed">Explorez les contenus selon vos envies et intérêts.</p>
              </div>
              <div className="bg-card rounded-[16px] pt-7 px-7 pb-3 transition-transform duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:-translate-y-[5px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] h-full min-h-[9rem]">
                <h4 className="text-primary text-xl font-semibold mb-4">Options de tri avancées</h4>
                <p className="text-foreground leading-relaxed">
                  Triez les épisodes du plus ancien au plus récent ou
                  inversement ou affichez uniquement les épisodes déjà écoutés
                  ou non.
                </p>
              </div>
              <div className="bg-card rounded-[16px] pt-7 px-7 pb-3 transition-transform duration-300 shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:-translate-y-[5px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] h-full min-h-[9rem]">
                <h4 className="text-primary text-xl font-semibold mb-4">Création de playlists</h4>
                <p className="text-foreground leading-relaxed">
                  Organisez vos podcasts comme vous voulez en quelques clics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
