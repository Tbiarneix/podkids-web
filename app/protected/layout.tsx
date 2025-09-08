import { AuthButton } from "@/components/auth-button";

import Image from "next/image";
import { Footer } from "@/components/homepage/Footer";
import BackToSettings from "@/components/protected/BackToSettings";
import SkiplinksProtected from "@/components/protected/SkiplinksProtected";
import { RouteFocusMain } from "@/components/webplayer/RouteFocusMain";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <SkiplinksProtected />
      <div className="flex w-full flex-1 flex-col items-center gap-0">
        <nav id="protected-action-bar" className="flex h-16 w-full justify-center border-b border-b-foreground/10">
          <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
            <div className="flex items-center gap-5 font-semibold">
              <Image src="/images/Logo.webp" alt="Podkids" width={48} height={48} priority />
              <span className="text-[1.8rem] font-bold text-primary">Podkids</span>
            </div>
            <AuthButton />
          </div>
        </nav>
        <div className="flex min-h-[calc(100vh-4rem)] max-w-5xl flex-1 flex-col gap-8 px-5 pb-12 pt-6" role="main" id="main-content">
          <RouteFocusMain />
          <BackToSettings />
          {children}
        </div>
      </div>
      <Footer />
    </main>
  );
}
