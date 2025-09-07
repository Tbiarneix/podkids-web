import { Footer } from "@/components/homepage/Footer";
import { NavActions } from "@/components/webplayer/NavActions";
import { ActiveProfileInitializer } from "@/components/webplayer/ActiveProfileInitializer";
import { Branding } from "@/components/webplayer/Branding";
import { AudioPlayerProvider } from "@/components/webplayer/AudioPlayerProvider";
import { PlayerBar } from "@/components/webplayer/PlayerBar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center">
      <AudioPlayerProvider>
        <div className="flex w-full flex-1 flex-col items-center gap-20 pb-24">
          <ActiveProfileInitializer />
          <nav className="flex h-16 w-full justify-center border-b border-b-foreground/10 bg-card">
            <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
              <Branding />
              <NavActions />
            </div>
          </nav>
          <div className="w-full">{children}</div>
        </div>
        <PlayerBar />
      </AudioPlayerProvider>
      <Footer />
    </main>
  );
}
