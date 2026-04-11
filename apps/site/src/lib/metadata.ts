import type { Metadata } from 'next';

export const siteConfig = {
  name: 'Raino',
  description: 'Agentic PCB & PCBA Workflow Platform',
  url: 'https://raino.dev',
  ogImage: '/og-image.png',
  links: {
    github: 'https://github.com/tudsds/raino',
  },
};

export function generateMetadata({
  title,
  description,
  path = '/',
}: {
  title?: string;
  description?: string;
  path?: string;
} = {}): Metadata {
  const fullTitle = title
    ? `${title} — ${siteConfig.name}`
    : `${siteConfig.name} — ${siteConfig.description}`;
  const fullDescription = description || siteConfig.description;
  const url = `${siteConfig.url}${path}`;

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: ['PCB', 'PCBA', 'hardware design', 'KiCad', 'manufacturing', 'EDA', 'electronics'],
    authors: [{ name: 'Raino' }],
    creator: 'Raino',
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      title: fullTitle,
      description: fullDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [siteConfig.ogImage],
    },
  };
}
