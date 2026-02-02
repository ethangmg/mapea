import type { SupportedLanguage } from '../i18n/types';

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  /** Current path (e.g. /home or /es/home). If canonical is not passed, baseUrl + pathname is used. */
  pathname?: string;
  lang: SupportedLanguage;
  alternateUrls?: Record<SupportedLanguage, string>;
}


/**
 * Genera meta tags SEO optimizados para cada idioma
 */
export function generateSEOTags(config: SEOConfig) {
  const {
    title,
    description,
    keywords,
    ogImage = '/og-image.jpg',
    ogType = 'website',
    canonical,
    lang,
    alternateUrls
  } = config;

  const baseUrl = 'https://mapea.cr';
  const pathname = config.pathname;
  const canonicalUrl = canonical || (pathname != null ? `${baseUrl}${pathname}` : `${baseUrl}/${lang === 'es' ? 'es/home' : 'home'}`);
  const imageUrl = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

  return {
    title: `${title} | MAPEA`,
    description,
    keywords,
    canonical: canonicalUrl,
    og: {
      type: ogType,
      url: canonicalUrl,
      title: `${title} | MAPEA`,
      description,
      image: imageUrl,
      siteName: 'MAPEA',
      locale: lang === 'es' ? 'es_ES' : 'en_US'
    },
    twitter: {
      card: 'summary_large_image',
      url: canonicalUrl,
      title: `${title} | MAPEA`,
      description,
      image: imageUrl
    },
    alternate: alternateUrls || {
      en: `${baseUrl}/home`,
      es: `${baseUrl}/es/home`
    }
  };
}


/**
 * Genera JSON-LD estructurado para SEO
 */
export function generateJSONLD(config: SEOConfig) {
  const baseUrl = 'https://mapea.cr';
  const currentUrl = config.canonical || `${baseUrl}/${config.lang}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'MAPEA',
    description: config.description,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    image: `${baseUrl}/og-image.jpg`,
    telephone: '+506-8695-1112',
    email: 'info@mapea.cr',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'Costa Rica'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '9.7489',
      longitude: '-83.7534'
    },
    openingHours: 'Mo-Fr 08:00-17:00',
    priceRange: '$$',
    serviceArea: {
      '@type': 'Country',
      name: 'Costa Rica'
    },
    sameAs: [
      'https://facebook.com/mapea',
      'https://instagram.com/mapea',
      'https://linkedin.com/company/mapea',
      'https://twitter.com/mapea'
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: config.lang === 'es' ? 'Servicios de Levantamiento LiDAR' : 'LiDAR Surveying Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: config.lang === 'es' ? 'Mapeo LiDAR 3D' : '3D LiDAR Mapping',
            description: config.lang === 'es' 
              ? 'Mapeo 3D de alta precisión utilizando tecnología de drones LiDAR'
              : 'High-precision 3D mapping using LiDAR drone technology'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: config.lang === 'es' ? 'Informes Catastrales' : 'Cadastral Reports',
            description: config.lang === 'es'
              ? 'Servicios profesionales de levantamiento y reportes catastrales'
              : 'Professional cadastral surveying and reporting services'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: config.lang === 'es' ? 'Análisis Territorial' : 'Territorial Analysis',
            description: config.lang === 'es'
              ? 'Análisis territorial integral y planificación del uso del suelo'
              : 'Comprehensive territorial analysis and land use planning'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: config.lang === 'es' ? 'Asesoría Inmobiliaria' : 'Property Advisory',
            description: config.lang === 'es'
              ? 'Servicios de consultoría y asesoramiento experto en propiedades'
              : 'Expert property consulting and advisory services'
          }
        }
      ]
    }
  };

  return jsonLd;
}

/**
 * Detecta el idioma preferido del usuario basado en headers del navegador
 */
export function detectUserLanguage(request: Request): SupportedLanguage {
  const acceptLanguage = request.headers.get('accept-language');
  
  if (!acceptLanguage) return 'en';
  
  // Parsear idiomas aceptados
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, quality] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0], // Solo el código principal (es, en)
        quality: quality ? parseFloat(quality) : 1.0
      };
    })
    .sort((a, b) => b.quality - a.quality);

  // Buscar español o inglés
  for (const lang of languages) {
    if (lang.code === 'es') return 'es';
    if (lang.code === 'en') return 'en';
  }

  return 'en'; // Default a inglés
}

/**
 * Genera URLs alternativas para hreflang.
 * Inglés sin prefijo (/home), español con /es (/es/home).
 */
export function generateAlternateUrls(
  currentPath: string,
  currentLang: SupportedLanguage
): Record<SupportedLanguage, string> {
  const baseUrl = 'https://mapea.cr';
  // Source: /es/home -> /home, /home -> /home
  const basePath = currentPath.replace(/^\/es/, '').replace(/^\/en/, '') || '/';
  const sectionPath = basePath === '/' ? '/home' : basePath;
  return {
    en: `${baseUrl}${sectionPath}`,
    es: `${baseUrl}/es${sectionPath}`,
  };
}
