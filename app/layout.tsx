import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Business Portrait Generator | Portrait Banana",
  description: "Transform your casual photos into professional business portraits using AI. Get high-quality headshots for LinkedIn, resumes, and professional profiles in minutes.",
  keywords: "AI portrait, business headshot, professional photo, LinkedIn photo, AI headshot generator, business portrait",
  authors: [{ name: "Portrait Banana" }],
  creator: "Portrait Banana",
  publisher: "Portrait Banana",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: "AI Business Portrait Generator | Portrait Banana",
    description: "Transform your casual photos into professional business portraits using AI. Get high-quality headshots in minutes.",
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: "Portrait Banana",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Business Portrait Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "AI Business Portrait Generator | Portrait Banana",
    description: "Transform your casual photos into professional business portraits using AI.",
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
