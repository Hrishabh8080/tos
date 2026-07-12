import "./globals.css";
import { Inter, Sora } from "next/font/google";
import { SITE } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Total Office Solutions | Wholesale Electrical & Office Supply Partner",
    template: "%s | Total Office Solutions",
  },
  description:
    "Total Office Solutions is a trusted B2B wholesale supplier of genuine electrical products, wires, cables, switchgear & office supplies. Bulk supply, corporate orders, fast delivery and authorized brands.",
  keywords: [
    "wholesale electrical supplier", "bulk electrical supply", "B2B electrical distributor",
    "Havells dealer", "Polycab wires", "Legrand", "KEI cables", "Finolex", "Schneider Electric",
    "corporate office supplies", "industrial electrical wholesale", "Total Office Solutions",
  ],
  authors: [{ name: "Total Office Solutions" }],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: "Total Office Solutions | Wholesale Electrical & Office Supply Partner",
    description:
      "Trusted electrical & office supply partner for businesses — bulk supply, corporate orders, fast delivery, genuine brands.",
    url: SITE.url,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Total Office Solutions | Wholesale Electrical & Office Supply Partner",
    description:
      "Trusted electrical & office supply partner for businesses — bulk supply, corporate orders, fast delivery, genuine brands.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE.url },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0F172A",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE.name,
  image: `${SITE.url}/og.jpg`,
  url: SITE.url,
  telephone: SITE.phones[0],
  email: SITE.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: SITE.address.street,
    addressLocality: SITE.address.city,
    addressRegion: SITE.address.state,
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: SITE.geo.lat,
    longitude: SITE.geo.lng,
  },
  priceRange: "₹₹",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
