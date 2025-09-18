import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./providers";
import "@/styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FlowCall | アウトバウンドコール支援MVP",
    template: "%s | FlowCall",
  },
  description:
    "アウトバウンド営業のリアルタイム台本生成を支援するMVPダッシュボードです。",
  metadataBase: new URL("https://flow-call.example.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-canvas text-neutral-foreground antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
