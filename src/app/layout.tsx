import { Metadata } from "next";
import { Outfit } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import RootClientWrapper from "./RootClientWrapper";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Framax Solutions | Digital Transformation",
  description: "Empowering businesses through cutting-edge digital solutions. Web development, UI/UX design, and AI integration tailored for your success.",
  metadataBase: new URL("https://framaxsolutions.com"),
  openGraph: {
    title: "Framax Solutions",
    description: "Empowering businesses through cutting-edge digital solutions.",
    url: "https://framaxsolutions.com",
    siteName: "Framax Solutions",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Framax Solutions - Digital Transformation",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Framax Solutions",
    description: "Empowering businesses through cutting-edge digital solutions.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/logos/framax_icon.png",
    apple: "/logos/framax_icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* dns-prefetch for analytics — non-blocking */}
        <link rel="dns-prefetch" href="https://a.plerdy.com" />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
        {/* preconnect for TechStack icon CDN — establishes TCP+TLS before images lazy-load */}
        <link rel="preconnect" href="https://cdn.simpleicons.org" />
      </head>
      <body
        suppressHydrationWarning
        className={`${outfit.variable} antialiased font-sans bg-background text-foreground overflow-x-hidden`}
      >
        <RootClientWrapper>{children}</RootClientWrapper>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
