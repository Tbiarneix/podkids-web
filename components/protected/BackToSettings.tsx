"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BackToSettings() {
  const pathname = usePathname();
  const show = pathname.startsWith("/protected") && pathname !== "/protected";
  if (!show) return null;

  return (
    <div className="mb-2">
      <Button asChild variant="link" size="sm" className="text-white hover:text-white" aria-label="Retour aux paramètres">
        <Link href="/protected" prefetch>
          <ChevronLeft className="mr-1 text-white" aria-hidden />
          Retour aux paramètres
        </Link>
      </Button>
    </div>
  );
}
