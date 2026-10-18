import type { Metadata } from "next";
import { DM_Sans, Inter_Tight } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const interTight = Inter_Tight({ variable: "--font-inter-tight", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Opsvo: AI shopping companion with explained recommendations",
  description:
    "Describe what you need in plain words. Opsvo returns a short, explained shortlist, compares what matters and waits for your approval before anything happens.",
  openGraph: {
    title: "Opsvo. Say what you need. See why it fits.",
    description: "A calm AI shopping companion that shows its reasoning and keeps you in control.",
    type: "website",
    images: [{ url: "/og/hero.png", width: 1200, height: 630, alt: "Opsvo" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} ${interTight.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
