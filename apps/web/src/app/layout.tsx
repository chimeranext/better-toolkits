import "./globals.css";
import type { Metadata } from "next";
import { Alegreya, Alegreya_Sans, Inconsolata, Piazzolla } from "next/font/google";

// Chimera design-system fonts: Alemreya (display), Piazzolla (epic),
// Alegreya Sans (body), Inconsolata (mono).
const display = Alegreya({ subsets: ["latin"], variable: "--font-display", weight: ["600", "700", "800"] });
const epic = Piazzolla({ subsets: ["latin"], variable: "--font-epic", weight: ["500", "700"] });
const body = Alegreya_Sans({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "700"] });
const mono = Inconsolata({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

const title = "better-toolkits — pick the toolkits your startup needs";
const description =
  "10 battle-tested Claude Code toolkits. One marketplace, one command, source-available (BSL-1.1). Operate like a venture studio from day one.";

const ogImage = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "better-toolkits — pick the toolkits your startup needs",
} as const;

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
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage.url],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${display.variable} ${epic.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
