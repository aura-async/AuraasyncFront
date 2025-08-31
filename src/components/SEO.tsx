import React from 'react';
import Head from 'next/head';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  structuredData?: any;
  noIndex?: boolean;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  canonical,
  ogImage = '/hero-image.jpg',
  ogType = 'website',
  structuredData,
  noIndex = false,
}) => {
  const fullTitle = `${title} | Auraasync`;
  const fullDescription = `${description} Discover your unique fashion personality with AI-powered analysis and personalized style recommendations.`;
  const defaultKeywords = [
    'fashion analysis',
    'body type detection',
    'face shape analysis',
    'skin tone analysis',
    'personalized fashion',
    'style recommendations',
    'AI fashion',
    'fashion personality',
    ...keywords,
  ];

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={defaultKeywords.join(', ')} />
              <meta name="author" content="Auraasync Team" />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
              <meta property="og:site_name" content="Auraasync" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={ogImage} />
              <meta name="twitter:site" content="@auraasync" />
              <meta name="twitter:creator" content="@auraasync" />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
      
      {/* Additional SEO Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black" />
              <meta name="apple-mobile-web-app-title" content="Auraasync" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    </Head>
  );
};

export default SEO;
