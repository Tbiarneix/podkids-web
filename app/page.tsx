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
      <Footer />
    </main>
  );
}
