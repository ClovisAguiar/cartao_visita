import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { EquipeButton } from "@/components/EquipeButton";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cartão de visita digital",
  description: "Crie um cartão de visita digital com foto, links e QR code em um minuto.",
};

export const viewport: Viewport = {
  themeColor: "#2340d1",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${bricolage.variable} h-full antialiased`}>
      <body className="min-h-full bg-mist font-sans text-ink">
        {children}
        <EquipeButton />
      </body>
    </html>
  );
}
