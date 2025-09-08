import Image from "next/image";
import Link from "next/link";

export default function AuthFormHeader() {
  return (
    <div className="fixed left-1/2 top-12 z-10 -translate-x-1/2">
      <Link
        href="/"
        aria-label="Revenir à la page d’accueil"
        className="inline-flex items-center gap-2 rounded-md bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Image src="/images/Logo.webp" alt="Podkids" width={48} height={48} priority />
        <span className="text-[1.8rem] font-bold text-primary">Podkids</span>
      </Link>
    </div>
  );
}
