import { useEffect } from 'react';

export interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  noIndex?: boolean;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  schemaJson?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_OG_IMAGE = '/logo-event-yuk.png';
const SITE_NAME = 'Event Yuk';

export function SEOHead({
  title,
  description,
  keywords = 'event organizer, vendor konser, booking band festival, sewa booth bazaar, sponsor pensi, escrow midtrans, pks digital',
  noIndex = false,
  canonicalPath = '',
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  schemaJson,
}: SEOHeadProps) {
  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://eventyuk.id';
  const canonicalUrl = `${currentOrigin}${canonicalPath || (typeof window !== 'undefined' ? window.location.pathname : '')}`;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${currentOrigin}${ogImage}`;
  const robotsDirective = noIndex ? 'noindex, nofollow' : 'index, follow';

  useEffect(() => {
    // 1. Synchronize document title
    document.title = title;

    // Helper to set or update meta tag
    const setMetaTag = (attributeName: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attributeName, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Set core SEO Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'robots', robotsDirective);

    // 3. Set Open Graph (Social Sharing) Meta Tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', fullOgImage);
    setMetaTag('property', 'og:site_name', SITE_NAME);

    // 4. Set Twitter Card Meta Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', fullOgImage);

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // 6. JSON-LD Structured Data Schema
    let schemaScript = document.getElementById('json-ld-schema') as HTMLScriptElement | null;
    if (schemaJson) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'json-ld-schema';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schemaJson);
    } else if (schemaScript) {
      schemaScript.remove();
    }
  }, [title, description, keywords, noIndex, canonicalUrl, fullOgImage, ogType, robotsDirective, schemaJson]);

  // React 19 native hoisting support
  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robotsDirective} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      {schemaJson && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaJson) }} />
      )}
    </>
  );
}

export default SEOHead;
