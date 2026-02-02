import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const baseUrl = url.origin;
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin and private areas
Disallow: /admin/
Disallow: /private/
Disallow: /_astro/
Disallow: /node_modules/

# English (default): /, /home, /mission, etc. Spanish: /es/
Allow: /
Allow: /es/

# Crawl delay for respectful crawling
Crawl-delay: 1

# Host directive for canonical domain
Host: ${baseUrl}`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400' // Cache por 24 horas
    }
  });
};
