import { Footer } from "@/components/homepage/Footer";
import { NavActions } from "@/components/webplayer/NavActions";
import { ActiveProfileInitializer } from "@/components/webplayer/ActiveProfileInitializer";
import { Branding } from "@/components/webplayer/Branding";
import { AudioPlayerProvider } from "@/components/webplayer/AudioPlayerProvider";
import { PlayerBar } from "@/components/webplayer/PlayerBar";
import { RouteFocusMain } from "@/components/webplayer/RouteFocusMain";
import SkiplinksWebplayer from "@/components/webplayer/SkiplinksWebplayer";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center bg-card">
      <SkiplinksWebplayer />
      <AudioPlayerProvider>
        <div className="flex w-full flex-1 flex-col items-center gap-20 bg-background pb-24">
          <RouteFocusMain />
          <ActiveProfileInitializer />
          <div className="flex h-16 w-full justify-center border-b border-b-foreground/10 bg-card">
            <div className="flex w-full max-w-5xl items-center justify-between p-3 px-5 text-sm">
              <Branding />
              <NavActions />
            </div>
          </div>
          <div className="w-full" role="main">
            {children}
          </div>
        </div>
        <PlayerBar />
      </AudioPlayerProvider>
      <Footer />
    </main>
  );
}
