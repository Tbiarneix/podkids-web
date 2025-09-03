import { AuthButton } from "@/components/auth-button";

import Image from "next/image";
import { Footer } from "@/components/homepage/Footer";
import BackToSettings from "@/components/protected/BackToSettings";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-0 items-center">
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
            <AuthButton />
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-8 max-w-5xl pt-6 pb-12 px-5 min-h-[calc(100vh-4rem)]">
          <BackToSettings />
          {children}
        </div>

        
      </div>
      <Footer />
    </main>
  );
}
