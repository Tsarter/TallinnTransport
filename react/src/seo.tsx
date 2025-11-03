import React from "react";
import { Helmet } from "react-helmet";

const Seo: React.FC = () => (
  <Helmet>
    <title>
      Tallinn Live Transport Map - Real-Time Bus, Tram & Trolley Tracking |
      Tallinna Ühistransport
    </title>
    <meta
      name="description"
      content="Track Tallinn public transport in real-time. Live bus, tram, trolley and train locations with departure times. Map for TLT and Elron services in Estonia."
    />

    {/* Open Graph / Facebook */}
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://tallinn.tobo.ee/" />
    <meta
      property="og:title"
      content="Tallinn Live Transport Map - Real-Time Bus & Tram Tracking"
    />
    <meta
      property="og:description"
      content="Track Tallinn public transport in real-time. Live bus, tram, trolley and train locations with departure times."
    />
    <meta
      property="og:image"
      content="https://tallinn.tobo.ee/dist/ogImage.webp"
    />
    <meta property="og:locale" content="et_EE" />
    <meta property="og:locale:alternate" content="en_US" />

    {/* Canonical URL */}
    <link rel="canonical" href="https://tallinn.tobo.ee/" />

    {/* Keywords */}
    <meta
      name="keywords"
      content="Tallinn transport, transport.tallinn.ee, gis.ee/tallinn, real-time bus tracking, Tallinna ühistransport, Elron, live map, Tallinn"
    />

    {/* iOS Safari */}
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Tallinna Ühistransport" />

    <meta name="geo.region" content="EE-37" />
    <meta name="geo.placename" content="Tallinn" />
    <meta name="geo.position" content="59.437;24.745" />
    <meta name="ICBM" content="59.437, 24.745" />

    <meta name="author" content="Tanel Tallo @ Tobo OÜ" />

    {/* Structured Data */}
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Tallinn Live Transport",
        alternateName: "Tallinna Reaalajas Ühistransport",
        url: "https://yourdomain.com",
        description:
          "Real-time public transport tracking for Tallinn, Estonia. Live GPS tracking of buses, trams, trolleys, and trains with departure predictions.",
        applicationCategory: "TravelApplication",
        operatingSystem: "Web Browser",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
        },
        featureList: [
          "Real-time vehicle tracking",
          "Live departure times",
          "Route visualization",
          "Stop information",
          "Service interruption alerts",
        ],
        serviceArea: {
          "@type": "City",
          name: "Tallinn",
          containedInPlace: {
            "@type": "Country",
            name: "Estonia",
          },
        },
        provider: {
          "@type": "Organization",
          name: "Your Organization Name",
        },
      })}
    </script>
  </Helmet>
);

export { Seo };
