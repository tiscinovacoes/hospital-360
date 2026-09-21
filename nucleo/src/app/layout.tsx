import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./Providers";

const inter = { variable: "font-sans" };
const jetbrainsMono = { variable: "font-mono" };

export const metadata: Metadata = {
  title: "Hospital 360 — Ecossistema de Gestão para Condomínio Hospitalar",
  description:
    "Sistema integrado de gestão para condomínio hospitalar: da administração ao médico proprietário, com autonomia de faturamento e segurança 360°.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F9FAFB] text-[#111928] font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
