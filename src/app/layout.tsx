import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cleaire — Custom Web & Internal Systems",
  description: "Kami membangun website kustom, dasbor internal, dan profil bisnis minimalis dengan kecepatan maksimal di Bali.",
  metadataBase: new URL("https://cleaire.com"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Cleaire — Custom Web & Internal Systems",
    description: "Kami membangun website kustom, dasbor internal, dan profil bisnis minimalis dengan kecepatan maksimal di Bali.",
    url: "https://cleaire.com",
    siteName: "Cleaire",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/og-image.jpg", // Make sure this image is present in your public folder later
        width: 1200,
        height: 630,
        alt: "Cleaire — Custom Web & Internal Systems",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cleaire — Custom Web & Internal Systems",
    description: "Kami membangun website kustom, dasbor internal, dan profil bisnis minimalis dengan kecepatan maksimal.",
    images: ["/og-image.jpg"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Cleaire",
    "image": "https://cleaire.com/og-image.jpg",
    "description": "Kami membangun website kustom, dasbor internal, dan profil bisnis minimalis dengan kecepatan maksimal di Bali.",
    "url": "https://cleaire.com",
    "telephone": "+6285707098428",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Sanur",
      "addressLocality": "Denpasar",
      "addressRegion": "Bali",
      "postalCode": "80228",
      "addressCountry": "ID"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -8.6792,
      "longitude": 115.258
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    },
    "sameAs": [
      "https://joglosekarmunduk.com",
      "https://berdikariconsultant.com"
    ]
  };

  return (
    <html
      lang="id"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F9F6F0] text-[#1B2A4A] font-sans antialiased selection:bg-[#1B2A4A] selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}



