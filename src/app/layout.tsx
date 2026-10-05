import { Metadata } from "next";
import { Outfit } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import RootClientWrapper from "./RootClientWrapper";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  // Defaults for pages without their own metadata; public pages use pageMetadata() from @/lib/seo
  title: "Framax Solutions | Software that automates your business",
  description: "Custom software and automations for small businesses: bookings, invoicing, reminders, CRM and websites. Based in Portugal. Book a free call.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/logos/framax_icon.png",
    apple: "/logos/framax_icon.png",
  },
  other: {
    "format-detection": "telephone=no, date=no, email=no, address=no",
    "supported-color-schemes": "dark",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var ua = navigator.userAgent;
                var isLinkedIn = ua.indexOf('LinkedInApp') > -1 || ua.indexOf('LinkedIn') > -1;
                if (isLinkedIn && /Android/i.test(ua)) {
                  window.location.href = 'intent://' + window.location.host + window.location.pathname + window.location.search + '#Intent;scheme=https;package=com.android.chrome;end';
                }
              })();
            `,
          }}
        />
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
