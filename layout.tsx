import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ESP32 Relay Dashboard",
  description: "Realtime-ish dashboard for ESP32 relays and switch",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
