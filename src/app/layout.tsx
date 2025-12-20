import { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import RootClientWrapper from "./RootClientWrapper";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-mono",
  subsets: ["latin"],
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
        url: "/logos/framax_icon.png",
        width: 512,
        height: 512,
        alt: "Framax Solutions Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Framax Solutions",
    description: "Empowering businesses through cutting-edge digital solutions.",
    images: ["/logos/framax_icon.png"],
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
        className={`${outfit.variable} ${inter.variable} antialiased font-sans bg-background text-foreground overflow-x-hidden`}
      >
        <RootClientWrapper>{children}</RootClientWrapper>
      </body>
    </html>
  );
}
