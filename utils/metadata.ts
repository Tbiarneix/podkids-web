import type { Metadata } from 'next';

// Configuration de base pour les métadonnées
const baseUrl = process.env.VERCEL_URL
? `https://${process.env.VERCEL_URL}`
: "http://localhost:3000";
const defaultTitle = 'Podkids - L\'application de podcast sécurisée pour les enfants';
const defaultDescription = 'Podkids est une application de gestion de podcasts conçue spécialement pour les enfants. Offrant un environnement sûr et adapté, elle permet aux jeunes auditeurs de découvrir des contenus enrichissants tout en garantissant un contrôle parental optimal.';
const defaultOgImage = '/images/opengraph-image.jpg';
const defaultTwitterImage = '/images/twitter-image.jpg';

// Types pour les options de métadonnées
interface MetadataOptions {
  title?: string;
  description?: string;
  ogImage?: string;
  twitterImage?: string;
  path?: string;
}

/**
 * Génère les métadonnées pour les pages de l'application
 * @param options Options pour personnaliser les métadonnées
 * @returns Objet Metadata compatible avec Next.js
 */
export function generateMetadata(options: MetadataOptions = {}): Metadata {
  const {
    title = defaultTitle,
    description = defaultDescription,
    ogImage = defaultOgImage,
    twitterImage = defaultTwitterImage,
    path = '',
  } = options;

  const url = `${baseUrl}${path}`;
  
  return {
    title,
    description,
    icons: {
      icon: '/favicon.ico',
      apple: '/images/Logo.webp',
    },
    // Open Graph metadata
    openGraph: {
      type: 'website',
      locale: 'fr_FR',
      url,
      title,
      description,
      siteName: 'Podkids',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    // Twitter Card metadata
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [twitterImage],
      creator: '@podkids',
      site: '@podkids',
    },
  };
}

/**
 * Génère des métadonnées spécifiques pour une page
 * @param pageName Nom de la page
 * @param pageDescription Description spécifique à la page
 * @param pagePath Chemin de la page (sans le domaine)
 * @returns Objet Metadata compatible avec Next.js
 */
export function generatePageMetadata(
  pageName: string,
  pageDescription?: string,
  pagePath?: string
): Metadata {
  const title = pageName ? `${pageName} | Podkids` : defaultTitle;
  const description = pageDescription || defaultDescription;
  
  return generateMetadata({
    title,
    description,
    path: pagePath || '',
  });
}
