import { onMounted } from 'vue';

interface SeoOptions {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function useSeo(options: SeoOptions) {
  const fullTitle = options.title ? `${options.title} - GenSI` : 'GenSI';

  onMounted(() => {
    document.title = fullTitle;

    setMetaTag('name', 'description', options.description);
    if (options.keywords) {
      setMetaTag('name', 'keywords', options.keywords);
    }

    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', options.description);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:site_name', 'GenSI');
    if (options.ogUrl) {
      setMetaTag('property', 'og:url', options.ogUrl);
    }
    if (options.ogImage) {
      setMetaTag('property', 'og:image', options.ogImage);
    }

    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', options.description);
    if (options.ogImage) {
      setMetaTag('name', 'twitter:image', options.ogImage);
    }
  });
}

/** Update SEO meta tags dynamically (for detail pages with async data) */
export function updateSeo(options: Partial<SeoOptions>) {
  if (options.title) {
    const fullTitle = `${options.title} - GenSI`;
    document.title = fullTitle;
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('name', 'twitter:title', fullTitle);
  }
  if (options.description) {
    setMetaTag('name', 'description', options.description);
    setMetaTag('property', 'og:description', options.description);
    setMetaTag('name', 'twitter:description', options.description);
  }
  if (options.keywords) {
    setMetaTag('name', 'keywords', options.keywords);
  }
  if (options.ogImage) {
    setMetaTag('property', 'og:image', options.ogImage);
    setMetaTag('name', 'twitter:image', options.ogImage);
  }
  if (options.ogUrl) {
    setMetaTag('property', 'og:url', options.ogUrl);
  }
}
