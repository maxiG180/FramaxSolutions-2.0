import { Metadata } from "next";
import { Outfit, Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import RootClientWrapper from "./RootClientWrapper";
import { Analytics } from "@vercel/analytics/react";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
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
    icon: "/favicon.ico",
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
      <body
        suppressHydrationWarning
        className={`${outfit.variable} ${inter.variable} ${playfair.variable} antialiased font-sans bg-background text-foreground overflow-x-hidden`}
      >
        <RootClientWrapper>{children}</RootClientWrapper>
        <Analytics />

        {/* Plerdy Analytics */}
        <Script
          id="plerdy-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var _protocol="https:"==document.location.protocol?"https://":"http://";
              _site_hash_code = "a46e1a6ed345c493b7ada52b389bae24",_suid=71280, plerdyScript=document.createElement("script");
              plerdyScript.setAttribute("defer",""),plerdyScript.dataset.plerdymainscript="plerdymainscript",
              plerdyScript.src="https://a.plerdy.com/public/js/click/main.js?v="+Math.random();
              var plerdymainscript=document.querySelector("[data-plerdymainscript='plerdymainscript']");
              plerdymainscript&&plerdymainscript.parentNode.removeChild(plerdymainscript);
              try{document.head.appendChild(plerdyScript)}catch(t){console.log(t,"unable add script tag")}
            `,
          }}
        />
      </body>
    </html>
  );
}
