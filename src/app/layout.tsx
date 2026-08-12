import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ServiceWorkerRegistrar } from "@/components/features/PWA";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plant Tamagotchi",
  description: "Cuidá tu planta, sumá puntos y ganá el premio de la semana",
  appleWebApp: {
    capable: true,
    title: "Planta",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1d21",
  // La app se instala en el celular: sin esto, iOS deja una franja blanca
  // en los teléfonos con notch cuando corre en standalone.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
