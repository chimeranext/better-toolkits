import type { Metadata } from "next";
import DoctrineClient from "./DoctrineClient";

export const metadata: Metadata = {
  title: "Multi-harness SSOT — better-toolkits",
  description:
    "Protocol markdown SSOT plus stderr baseline across Claude Code, Cursor, OpenCode2, and Antigravity.",
  openGraph: {
    title: "Multi-harness SSOT — better-toolkits",
    description:
      "One protocol contract, one stderr detector, N harness entries. Not a Cursor-vs-Claude dichotomy.",
    url: "https://toolkits.chimeranext.dev/doctrine",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "better-toolkits — pick the toolkits your startup needs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export default function DoctrinePage() {
  return <DoctrineClient />;
}
