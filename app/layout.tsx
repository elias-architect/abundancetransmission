import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { LangProvider } from "@/lib/lang-context";
import PublicCouncilChat from "@/components/public-council-chat";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Abundance Transmission | The Memory Library Speaks Through the Charts",
    template: "%s | Abundance Transmission",
  },
  description:
    "Conscious Forex Sovereignty — Pattern Mastery, AI-Enhanced Edges & Empathic Abundance Transmission. By Niko.",
  keywords: [
    "forex trading",
    "conscious trading",
    "abundance transmission",
    "pattern mastery",
    "AI trading",
    "XAUUSD",
    "gold trading",
  ],
  openGraph: {
    title: "Abundance Transmission",
    description: "The Memory Library Speaks Through the Charts",
    url: "https://abundancetransmission.com",
    siteName: "Abundance Transmission",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Abundance Transmission",
    description: "The Memory Library Speaks Through the Charts",
  },
  metadataBase: new URL("https://abundancetransmission.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-deep">
        <LangProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
          <PublicCouncilChat />
        </LangProvider>
      </body>
    </html>
  );
}
