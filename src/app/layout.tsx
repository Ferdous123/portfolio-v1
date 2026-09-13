import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/constants/site";
// @ts-ignore: allow importing CSS module without type declarations
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  keywords: [
    "Ferdus Hossain",
    "distributionally robust optimisation",
    "Wasserstein DRO",
    "CVaR",
    "UAV route planning",
    "conformal prediction",
    "differential privacy",
    "trustworthy machine learning",
    "Bangladesh",
    "AIUB",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${plusJakarta.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      {/*
       * Inline script: set html.js BEFORE paint so CSS-gated reveal
       * animations know JS is present. The 3 s failsafe un-hides everything
       * in case a component stalls. Must run before React hydration.
       */}
      {/* biome-ignore lint: intentional inline script for progressive enhancement */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{document.documentElement.classList.add('js');setTimeout(function(){document.documentElement.classList.add('js-ready');},3000);}catch(e){}})();`,
        }}
      />
      {/* When JS is disabled, framer-motion inline styles stay at opacity:0.
          This noscript block forces everything visible. */}
      <noscript>
        <style>{`
          *,*::before,*::after{
            opacity:1!important;
            transform:none!important;
            transition:none!important;
            animation:none!important;
          }
        `}</style>
      </noscript>
      <body
        className={`${plusJakarta.className} antialiased bg-canvas text-fg overflow-x-hidden transition-colors duration-300`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
