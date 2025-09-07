import { ThemeProvider } from "next-themes";
import "./globals.css";
import { ToasterProvider } from "@/providers/ToasterProvider";
import { generateMetadata } from "@/utils/metadata";

export { generateMetadata as metadata };

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
          <ToasterProvider>
            {children}
          </ToasterProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
