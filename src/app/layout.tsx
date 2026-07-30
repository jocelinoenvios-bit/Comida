import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { BRAND } from "@/lib/constants";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — Delivery de ${BRAND.launchCity}`,
    template: `%s | ${BRAND.name}`,
  },
  description:
    "Boraqui reúne todos os deliveries da sua cidade em um só lugar. Peça e finalize direto no WhatsApp do estabelecimento.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: BRAND.name,
  },
  icons: {
    icon: "/favicon.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff5a1f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-gray-50 text-navy-900">
        <Providers>
          <Header />
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
          <BottomNav />
          <ServiceWorkerRegister />
        </Providers>
      </body>
    </html>
  );
}
