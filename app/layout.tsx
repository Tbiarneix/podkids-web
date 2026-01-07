import { ThemeProvider } from "next-themes";
import "./globals.css";
import { ToasterProvider } from "@/providers/ToasterProvider";
import { generateMetadata as buildMetadata } from "@/utils/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = buildMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToasterProvider>{children}</ToasterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
