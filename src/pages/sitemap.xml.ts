import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
  const baseUrl = url.origin;
  const currentDate = new Date().toISOString();
  
  // Sections: English without prefix, Spanish with /es
  const sections = [
    { path: '/home', pathEn: '/home', priority: '1.0', changefreq: 'weekly' as const },
    { path: '/mission', pathEn: '/mission', priority: '0.9', changefreq: 'monthly' as const },
    { path: '/services', pathEn: '/services', priority: '0.9', changefreq: 'monthly' as const },
    { path: '/contact', pathEn: '/contact', priority: '0.8', changefreq: 'monthly' as const },
  ];

  const urls: string[] = [];
  
  for (const section of sections) {
    const urlEn = `${baseUrl}${section.pathEn}`;
    const urlEs = `${baseUrl}/es${section.path}`;
    urls.push(`
    <url>
      <loc>${urlEn}</loc>
      <lastmod>${currentDate}</lastmod>
      <changefreq>${section.changefreq}</changefreq>
      <priority>${section.priority}</priority>
      <xhtml:link rel="alternate" hreflang="en" href="${urlEn}" />
      <xhtml:link rel="alternate" hreflang="es" href="${urlEs}" />
      <xhtml:link rel="alternate" hreflang="x-default" href="${urlEn}" />
    </url>
    <url>
      <loc>${urlEs}</loc>
      <lastmod>${currentDate}</lastmod>
      <changefreq>${section.changefreq}</changefreq>
      <priority>${section.priority}</priority>
      <xhtml:link rel="alternate" hreflang="en" href="${urlEn}" />
      <xhtml:link rel="alternate" hreflang="es" href="${urlEs}" />
      <xhtml:link rel="alternate" hreflang="x-default" href="${urlEn}" />
    </url>`);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600' // Cache por 1 hora
    }
  });
};
