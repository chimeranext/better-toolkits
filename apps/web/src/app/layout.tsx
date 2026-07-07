import "./globals.css";
import type { Metadata } from "next";
import { Sora, Inter, JetBrains_Mono } from "next/font/google";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["600", "800"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

const title = "better-toolkits — pick the toolkits your startup needs";
const description =
  "10 battle-tested Claude Code toolkits. One marketplace, one command, source-available (BSL-1.1). Operate like a venture studio from day one.";

export const metadata: Metadata = {
  metadataBase: new URL("https://toolkits.chimeranext.dev"),
  title,
  description,
  applicationName: "better-toolkits",
  keywords: ["claude code", "toolkits", "plugins", "marketplace", "venture studio", "source-available", "BSL-1.1"],
  authors: [{ name: "Luis Andres Pena Castillo" }],
  openGraph: {
    title,
    description,
    url: "https://toolkits.chimeranext.dev",
    siteName: "better-toolkits",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${sora.variable} ${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
