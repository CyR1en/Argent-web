import type { Metadata, Viewport } from "next";
import { Fragment_Mono } from "next/font/google";
import localFont from "next/font/local";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const hankenGrotesk = localFont({
  src: "./fonts/HankenGrotesk-Variable.ttf",
  variable: "--font-hanken",
  display: "swap",
});

const fragmentMono = Fragment_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fragment",
  display: "swap",
});

const TITLE = "Argent — Raw files, developed as film.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "Native macOS 27 darkroom for Sony RAW files. Modelled colour negative and optical print across 14 Kodak, Fujifilm, and tungsten emulsions on Apple silicon.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: TITLE,
    description:
      "Scene-linear Sony RAW developed through modelled colour negative and optical paper print. Open source for macOS 27 on Apple silicon.",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "Native development for Sony RAW files. Modelled colour negative and print. Made for Mac.",
  },
};

export const viewport: Viewport = {
  themeColor: "#141518",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hankenGrotesk.variable} ${fragmentMono.variable}`}
    >
      <body className="antialiased selection:bg-[#f1c24c] selection:text-[#141518]">
        {children}
      </body>
    </html>
  );
}
