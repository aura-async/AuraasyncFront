import type { Metadata } from "next";
import { Montserrat, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import ConditionalFooter from '../components/ConditionalFooter';
import FlowController from '../components/FlowController';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import { Suspense } from 'react'

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const popin=Poppins({
  subsets: ["latin"],
  variable: "--font-popins",
  display: "swap",
  weight: "700"
})

export const metadata: Metadata = {
        title: "Auraasync - AI-Powered Fashion Analysis & Style Recommendations",
    description: "Discover your unique fashion personality with Auraasync's AI-powered body analysis, face shape detection, skin tone analysis, and personalized style recommendations. Get expert fashion advice tailored to your body type, personality, and preferences.",
  keywords: [
    "fashion analysis",
    "body type detection",
    "face shape analysis",
    "skin tone analysis",
    "personalized fashion",
    "style recommendations",
    "AI fashion",
    "fashion personality",
    "body shape analysis",
    "fashion advice",
    "personal styling",
    "fashion technology"
  ],
      authors: [{ name: "Auraasync Team" }],
      creator: "Auraasync",
      publisher: "Auraasync",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
      metadataBase: new URL('https://auraasync.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "Auraasync - AI-Powered Fashion Analysis & Style Recommendations",
    description: "Discover your unique fashion personality with AI-powered analysis. Get personalized style recommendations based on your body type, face shape, and personality.",
          url: 'https://auraasync.com',
          siteName: 'Auraasync',
    images: [
      {
        url: '/hero-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Auraasync Fashion Analysis Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Auraasync - AI-Powered Fashion Analysis",
    description: "Discover your unique fashion personality with AI-powered analysis and personalized style recommendations.",
    images: ['/hero-image.jpg'],
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${popin.variable} ${playfair.variable}`}>
      <body className="bg-black text-white flex flex-col min-h-screen">
        {process.env.NODE_ENV === 'production' && (
          <Suspense fallback={null}>
            <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!} />
          </Suspense>
          )}
        <FlowController>
          <div className="flex-grow">
            {children}
          </div>
          <ConditionalFooter />
        </FlowController>
      </body>
    </html>
  );
}
