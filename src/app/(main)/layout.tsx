import type { Metadata } from "next";
import { Anton, IBM_Plex_Mono, IBM_Plex_Sans, Inter } from "next/font/google";
import "../globals.css";
import ClientLayout from "../ClientLayout";
import { NavBar } from "@/components/shared/NavBar";
import { Footer } from "@/components/shared/Footer";
import { GoogleTagManager } from "@next/third-parties/google";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
});

const title = "Quadratic Acceleration";
const description =
  "The Quadratic Accelerator is pioneering a novel tokenization protocol that combines the best features of Quadratic Funding (QF) and Augmented Bonding Curves (ABCs).";
const image = "/images/banners/banner-lg.jpg";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    images: [
      {
        url: image,
        alt: title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${anton.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} ${inter.variable} font-ibm antialiased dark bg-qacc-black`}
      >
        <ClientLayout>
          <NavBar />
          <div className="min-h-screen">{children}</div>
          <Footer />
        </ClientLayout>
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID || ''} />
      </body>
    </html>
  );
}
