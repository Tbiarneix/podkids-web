import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/homepage/Hero";
import { Header } from "@/components/homepage/Header";
import About from "@/components/homepage/About";
import { Footer } from "@/components/homepage/Footer";
import { Features } from "@/components/homepage/Features";
import Screenshots from "@/components/homepage/Screenshot/Screenshot";
import Download from "@/components/homepage/Download";
import Skiplinks from "@/components/homepage/Skiplinks";

export default function Home() {
  return (
    <main>
      <Skiplinks />
      <Header />
      <Hero />
      <About />
      <Features />
      <Screenshots />
      <Download />
      <div className="flex flex-col items-center mb-16">
        <p className="text-[1.1rem] text-foreground mb-8 leading-[1.5]">
          Pour l'instant les téléchargement sont suspendus, mais tu peux utiliser la version web&nbsp;:
        </p>
        <AuthButton />
      </div>
      <Footer />
    </main>
  );
}
