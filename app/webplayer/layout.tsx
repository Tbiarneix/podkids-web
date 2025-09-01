import Image from "next/image";
import { Footer } from "@/components/homepage/Footer";
import { NavActions } from "@/components/webplayer/NavActions";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Image
                src="/images/Logo.webp"
                alt="Podkids"
                width={48}
                height={48}
                priority
              />
              <span className="text-[1.8rem] font-bold text-primary">Podkids</span>
            </div>
            <NavActions />
          </div>
        </nav>
        <div className="w-full">
          {children}
        </div>

      </div>
      <Footer />
    </main>
  );
}
