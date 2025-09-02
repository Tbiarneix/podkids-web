import { Footer } from "@/components/homepage/Footer";
import { NavActions } from "@/components/webplayer/NavActions";
import { ActiveProfileInitializer } from "@/components/webplayer/ActiveProfileInitializer";
import { Branding } from "@/components/webplayer/Branding";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <ActiveProfileInitializer />
        <nav className="w-full bg-card flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <Branding />
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
