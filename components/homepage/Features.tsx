import React from "react";
import Image from "next/image";

export function Features() {
  return (
    <section id="features" className="bg-background py-12 md:py-20">
      <div className="mx-auto max-w-[1200px] px-8">
        <h2 className="mb-12 text-center text-[2.5rem] font-bold text-primary">
          Les fonctionnalités principales
        </h2>

        <div className="flex items-stretch justify-center gap-4 max-[540px]:flex-col">
          <div className="flex-1">
            <h3 className="mb-8 flex flex-row-reverse items-center gap-3 text-[1.8rem] font-bold text-foreground max-[540px]:flex-row">
              <span className="text-[2rem]">
                <Image src="/icons/smartphone-parent.webp" alt="" width={90} height={90} />
              </span>
              Côté parents
            </h3>
            <div className="flex flex-col justify-between gap-4 pb-12">
              <div className="h-full min-h-[9rem] rounded-[16px] bg-card px-7 pb-3 pt-7 shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:-translate-y-[5px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)]">
                <h4 className="mb-4 text-xl font-semibold text-primary">Gestion des profils</h4>
                <p className="leading-relaxed text-foreground">
                  Créez des profils individuels pour chaque enfant avec ajout d&apos;un mot de
                  passe.
                </p>
              </div>
              <div className="h-full min-h-[9rem] rounded-[16px] bg-card px-7 pb-3 pt-7 shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:-translate-y-[5px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)]">
                <h4 className="mb-4 text-xl font-semibold text-primary">Filtres avancés</h4>
                <p className="leading-relaxed text-foreground">
                  Filtrez le contenu par âge et thématique pour une expérience adaptée.
                </p>
              </div>
              <div className="h-full min-h-[9rem] rounded-[16px] bg-card px-7 pb-3 pt-7 shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:-translate-y-[5px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)]">
                <h4 className="mb-4 text-xl font-semibold text-primary">Ajout manuel</h4>
                <p className="leading-relaxed text-foreground">
                  Ajoutez manuellement des podcasts pour enrichir l&apos;expérience d&apos;écoute.
                </p>
              </div>
              <div className="h-full min-h-[9rem] rounded-[16px] bg-card px-7 pb-3 pt-7 shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:-translate-y-[5px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)]">
                <h4 className="mb-4 text-xl font-semibold text-primary">Export / Import</h4>
                <p className="leading-relaxed text-foreground">
                  Exportez ou importez une configuration préexistante pour un contrôle simplifié.
                </p>
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="mx-4 w-[2px] self-stretch bg-border max-[540px]:hidden"
          />
          <div className="flex-1">
            <h3 className="mb-8 flex items-center gap-3 text-[1.8rem] font-bold text-foreground">
              <span className="text-[2rem]">
                <Image src="/icons/smartphone-enfant.webp" alt="" width={90} height={90} />
              </span>
              Côté enfants
            </h3>
            <div className="flex flex-col justify-between gap-4 pb-12">
              <div className="h-full min-h-[9rem] rounded-[16px] bg-card px-7 pb-3 pt-7 shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:-translate-y-[5px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)]">
                <h4 className="mb-4 text-xl font-semibold text-primary">Liste de favoris</h4>
                <p className="leading-relaxed text-foreground">
                  Retrouvez facilement vos podcasts préférés grâce à la liste de favoris.
                </p>
              </div>
              <div className="h-full min-h-[9rem] rounded-[16px] bg-card px-7 pb-3 pt-7 shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:-translate-y-[5px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)]">
                <h4 className="mb-4 text-xl font-semibold text-primary">Tri par thématique</h4>
                <p className="leading-relaxed text-foreground">
                  Explorez les contenus selon vos envies et intérêts.
                </p>
              </div>
              <div className="h-full min-h-[9rem] rounded-[16px] bg-card px-7 pb-3 pt-7 shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:-translate-y-[5px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)]">
                <h4 className="mb-4 text-xl font-semibold text-primary">Options de tri avancées</h4>
                <p className="leading-relaxed text-foreground">
                  Triez les épisodes du plus ancien au plus récent ou inversement ou affichez
                  uniquement les épisodes déjà écoutés ou non.
                </p>
              </div>
              <div className="h-full min-h-[9rem] rounded-[16px] bg-card px-7 pb-3 pt-7 shadow-[0_8px_16px_rgba(0,0,0,0.1)] transition-transform duration-300 hover:-translate-y-[5px] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)]">
                <h4 className="mb-4 text-xl font-semibold text-primary">Création de playlists</h4>
                <p className="leading-relaxed text-foreground">
                  Organisez vos podcasts comme vous voulez en quelques clics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
