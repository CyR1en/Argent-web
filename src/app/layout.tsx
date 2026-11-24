import type { Metadata, Viewport } from "next";
import { Fragment_Mono } from "next/font/google";
import localFont from "next/font/local";
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

const SITE_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://argent-film.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Argent — Raw files, developed as film.",
  description:
    "Native macOS 27 darkroom for Sony a7 IV RAW files. Modelled colour negative and optical print across 14 Kodak, Fujifilm, and tungsten emulsions on Apple silicon.",
  openGraph: {
    title: "Argent — Raw files, developed as film.",
    description:
      "Scene-linear Sony a7 IV RAW developed through modelled colour negative and optical paper print. Open source for macOS 27 on Apple silicon.",
    images: [
      {
        url: "/images/banner.jpg",
        width: 2000,
        height: 667,
        alt: "Argent. Raw files, developed as film.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Argent — Raw files, developed as film.",
    description:
      "Native RAW development for Sony a7 IV. Modelled colour negative and print. Made for Mac.",
    images: ["/images/banner.jpg"],
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
