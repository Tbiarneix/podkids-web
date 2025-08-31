"use client";

import { Toaster } from "sonner";

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: "#FFC107",
          color: "#001D3D",
          border: "1px solid #FFC107",
        },
      }} />
    </>
  );
}
