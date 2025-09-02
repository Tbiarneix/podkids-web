"use client";

// import { useState } from "react";
import Image from "next/image";
// import { toast } from "sonner";

export default function Download() {
  // const [email, setEmail] = useState("");
  // const [isSubmitting, setIsSubmitting] = useState(false);
  // const [isFocused, setIsFocused] = useState(false);
  // const [honeypot, setHoneypot] = useState("");

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);

  //   if (honeypot) {
  //     await new Promise(resolve => setTimeout(resolve, 500));
  //     toast.success(
  //       "Super ! Tu fais maintenant partie de la liste d'attente.",
  //       {
  //         description:
  //           "On te tient au courant dès que l'application est disponible !",
  //         duration: 5000,
  //       }
  //     );
      
  //     setEmail("");
  //     return;
  //   }
    
  //   try {
  //     const response = await fetch("/api/subscribe", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ email }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Erreur lors de l'inscription");
  //     }

  //     toast.success(
  //       "Super ! Tu fais maintenant partie de la liste d'attente.",
  //       {
  //         description:
  //           "On te tient au courant dès que l'application est disponible !",
  //         duration: 5000,
  //       }
  //     );

  //     setEmail("");
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Oups ! Une erreur est survenue.", {
  //       description:
  //         "Merci de réessayer plus tard ou de nous contacter directement.",
  //       duration: 5000,
  //     });
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  return (
    <section id="download" className="py-20 md:py-20 bg-background">
      <div className="max-w-[1000px] mx-auto px-8 text-center">
        <h2 className="text-[2.5rem] text-primary font-bold mb-6">Télécharge Podkids</h2>
        <p className="text-[1.3rem] text-foreground mb-8 leading-[1.5]">
          Offre à ton enfant une expérience d&apos;écoute sécurisée et enrichissante&nbsp;!
        </p>

        {/* <div className="mb-10">
          <p className="text-muted-foreground leading-[1.6] text-[1.1rem]">Bientôt disponible sur iOS et Android. Inscris-toi pour être informé du lancement.</p>
          <p className="text-muted-foreground leading-[1.6] text-[1.1rem]">(Promis ce sera que pour ça)</p>
        </div> */}

        {/* <div className="my-10 mx-auto max-w-[600px]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row">
            <div className="relative w-full md:w-[70%]">
              <input
                type="email"
                id="email"
                required
                className="w-full h-full px-6 py-4 rounded-full border-2 border-border bg-card text-foreground text-base outline-none transition-colors focus:outline-[4px] focus:outline-[#FFC107] focus:outline-offset-0 focus-visible:outline-[4px] focus-visible:outline-[#FFC107] focus-visible:outline-offset-0"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
              <label
                htmlFor="email"
                className={`absolute left-6 top-1/2 -translate-y-1/2 bg-transparent p-0 text-muted-foreground pointer-events-none transition-all duration-300 text-base z-10 ${
                  isFocused || email
                    ? 'top-0 left-12 -translate-y-1/2 text-base font-medium py-[0.2rem] px-[0.6rem] bg-primary rounded-full text-[var(--text-tertiary)]'
                    : ''
                }`}
              >
                Ton adresse email
              </label>
            </div> */}
            {/* Honeypot anti-spam field (hidden from users) */}
            {/* <div className="sr-only">
              <label htmlFor="website">Laissez ce champ vide</label>
              <input
                type="text"
                id="website"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                autoComplete="off"
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>
            <button
              type="submit"
              className="w-full md:w-[30%] px-8 py-4 rounded-full border-0 bg-primary text-[var(--text-tertiary)] font-bold text-base cursor-pointer transition-all duration-300 shadow-[0_4px_15px_rgba(255,193,7,0.3)] hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(255,193,7,0.4)]"
            >
              {isSubmitting ? "Inscription en cours..." : "Recevoir une alerte"}
            </button>
          </form>
        </div> */}

        <div className="flex justify-center gap-6 flex-wrap max-w-[30rem] mt-12 mx-auto">
          <div className="flex justify-center items-center flex-1 gap-3 bg-card border-2 border-border rounded-2xl px-6 py-3 cursor-not-allowed opacity-80 transition-opacity hover:opacity-100">
            <span className="text-2xl">
              <Image src="/icons/apple.webp" alt="" width={50} height={50} />
            </span>
            <span className="flex flex-col items-start text-left">
              <small className="text-xs text-muted-foreground">Bientôt sur</small>
              <strong className="text-[1.1rem] text-foreground">App Store</strong>
            </span>
          </div>
          <div className="flex justify-center items-center flex-1 gap-3 bg-card border-2 border-border rounded-2xl px-6 py-3 cursor-not-allowed opacity-80 transition-opacity hover:opacity-100">
            <span className="text-2xl">
              <Image src="/icons/android.webp" alt="" width={50} height={50} />
            </span>
            <span className="flex flex-col items-start text-left">
              <small className="text-xs text-muted-foreground">Bientôt sur</small>
              <strong className="text-[1.1rem] text-foreground">Google Play</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
