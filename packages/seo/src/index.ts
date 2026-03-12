/** SEO utilities: meta tags and JSON-LD structured data */

export interface MetaTagOptions {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  ogImage?: string;
}

export function generateMetaTags(options: MetaTagOptions): string {
  const ogTitle = options.ogTitle ?? options.title;
  const ogDesc = options.ogDescription ?? options.description;
  const ogUrl = options.ogUrl ?? options.canonical;
  const ogImage = options.ogImage ?? 'https://swapture.com/og-image.png';

  return `
  <title>${options.title}</title>
  <meta name="description" content="${options.description}" />
  <meta name="keywords" content="${options.keywords}" />
  <link rel="canonical" href="${options.canonical}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${ogTitle}" />
  <meta property="og:description" content="${ogDesc}" />
  <meta property="og:url" content="${ogUrl}" />
  <meta property="og:image" content="${ogImage}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${ogTitle}" />
  <meta name="twitter:description" content="${ogDesc}" />
  `.trim();
}

export interface WebApplicationSchema {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  operatingSystem?: string;
}

export function generateWebApplicationSchema(app: WebApplicationSchema): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: app.name,
    description: app.description,
    url: app.url,
    applicationCategory: app.applicationCategory ?? 'UtilitiesApplication',
    operatingSystem: app.operatingSystem ?? 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQSchema(faqs: FAQItem[]): string {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
  return `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`;
}
