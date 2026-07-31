import { Injectable, Inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

import seoDataJson from '../../assets/seo.json';

interface SEODataItem {
  title?: string;
  description: string;
  keywords: string;
  ogImage?: string;
}

interface SEOData {
  [key: string]: SEODataItem;
}

const SITE_URL = 'https://phbyviki.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/img/landing.webp`;
const DEFAULT_TITLE = 'Фотосесия | Галерия | Виктория Борисова';

// Per-category wording for single-gallery pages. Each gallery is its own indexable page,
// so it gets a title/description built from the couple/person name rather than inheriting
// the generic site-wide copy. Keyed by the BG URL slug (see SLUG_TO_TYPE).
const GALLERY_TYPE_COPY: Record<string, { noun: string; adjective: string; keywords: string }> = {
  'svatbi': { noun: 'Сватбена фотосесия', adjective: 'сватбена', keywords: 'сватбен фотограф София, сватбен фотограф Видин, сватбени снимки' },
  'abiturienti': { noun: 'Абитуриентска фотосесия', adjective: 'абитуриентска', keywords: 'фотограф абитуриентски бал София, абитуриентска фотосесия, абитуриентски снимки' },
  'lichni': { noun: 'Лична фотосесия', adjective: 'лична', keywords: 'лична фотосесия София, портретна фотосесия Видин, фотограф за рожден ден' },
  'krushteneta': { noun: 'Фотосесия от кръщене', adjective: 'от кръщене', keywords: 'фотограф за кръщене София, фотограф за кръщавка, снимки от кръщене' },
  'korporativni': { noun: 'Корпоративна фотосесия', adjective: 'корпоративна', keywords: 'корпоративен фотограф София, фотограф за събитие, бизнес фотография' },
  'rojdeni-dni': { noun: 'Фотосесия за рожден ден', adjective: 'за рожден ден', keywords: 'фотограф за рожден ден София, детски рожден ден, фотограф за юбилей' },
  'semeyni': { noun: 'Семейна фотосесия', adjective: 'семейна', keywords: 'семеен фотограф София, семейна фотосесия, детска фотосесия' },
};

@Injectable({
  providedIn: 'root'
})

export class SEOService {

  constructor(
    @Inject(DOCUMENT) private dom: Document,
    private router: Router,
    private meta: Meta,
    private title: Title) {

    this.subscribeToRouteChange();
  }

  private seoData: SEOData = seoDataJson as unknown as SEOData;

  // titleOverride is used by routes whose title depends on the URL (single galleries) and
  // therefore can't be a static route title.
  private generate(dataItem: SEODataItem, titleOverride?: string): void {
    if (titleOverride) {
      dataItem.title = titleOverride;
      this.title.setTitle(titleOverride);
    } else {
      dataItem.title = this.getTitle();
    }

    this.createDescriptionAndKeywords(dataItem);
    this.generateCannonicalLink();
    this.generateOpenGraphTags(dataItem);
    this.generateRobotsTag(true);
  }

  private getTitle(): string {
    let route = this.router.routerState.root;

    while (route.firstChild) {
      route = route.firstChild;
    }

    // Routes that build their title from the URL declare no static title; fall back to the
    // site title so og:title is never empty.
    return route.snapshot.title || DEFAULT_TITLE;
  }

  private createDescriptionAndKeywords(dataItem: SEODataItem): void {
    this.meta.updateTag({ name: 'description', content: dataItem.description });
    this.meta.updateTag({ name: 'keywords', content: dataItem.keywords });
  }

  private getCurrentUrl(): string {
    const path = this.router.url.split('?')[0];
    return `${SITE_URL}${path === '/' ? '/' : path}`;
  }

  private generateCannonicalLink(): void {
    const canonicalUrl = this.getCurrentUrl();

    // Query the head every time so this works on both server and client
    // without holding a stale element reference across hydration.
    const existing = this.dom.head.querySelector('link[rel="canonical"]');
    if (existing) {
      existing.parentNode?.removeChild(existing);
    }

    const link = this.dom.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', canonicalUrl);
    this.dom.head.appendChild(link);
  }

  private generateOpenGraphTags(dataItem: SEODataItem): void {
    const url = this.getCurrentUrl();
    const image = dataItem.ogImage || DEFAULT_OG_IMAGE;
    const title = dataItem.title || '';
    const description = dataItem.description;

    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:locale', content: 'bg_BG' });
    this.meta.updateTag({ property: 'og:site_name', content: 'phbyviki — Виктория Борисова' });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }

  private generateRobotsTag(shouldIndex: boolean): void {
    if (this.meta.getTag('name="robots"')) {
      this.meta.removeTag('name="robots"');
    }

    if (shouldIndex) {
      this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    } else {
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    }
  }

  private generatePageNotFoundTag(): void {
    if (!this.meta.getTag('name="prerender-status-code"')) {
      this.meta.updateTag({ name: 'prerender-status-code', content: '404' });
    }
  }

  private removePrerenderTags(): void {
    this.meta.removeTag('name="prerender-status-code"');
    this.meta.removeTag('name="prerender-header"');
  }

  // Builds meta for a single-gallery URL, or null if this isn't one. Handles both the
  // canonical "/galeriya/<slug>/<name>" and the legacy "/galeriya/<slug>%2F<name>" shapes —
  // decoding the tail covers both, since %2F decodes to the same separator.
  private buildGalleryMeta(routerUrl: string): { item: SEODataItem; title: string } | null {
    const PREFIX = 'galeriya/';
    if (!routerUrl.startsWith(PREFIX)) {
      return null;
    }

    let decoded: string;
    try {
      decoded = decodeURIComponent(routerUrl.slice(PREFIX.length));
    } catch {
      return null; // malformed percent-encoding — fall through to the normal lookup
    }

    const separator = decoded.indexOf('/');
    if (separator === -1) {
      return null; // a bare category like /galeriya/lichni, not a single gallery
    }

    const slug = decoded.slice(0, separator);
    const name = decoded.slice(separator + 1).trim();

    const copy = GALLERY_TYPE_COPY[slug];
    if (!copy || !name) {
      return null;
    }

    return {
      title: `${name} — ${copy.noun} | Виктория Борисова`,
      item: {
        description: `${copy.noun} „${name}“ от Виктория Борисова (phbyviki) — фотограф в София и Видин. Разгледайте кадрите от деня и запазете дата за вашата ${copy.adjective} фотосесия.`,
        keywords: `${name}, ${copy.keywords}, Виктория Борисова, phbyviki`,
      },
    };
  }

  private subscribeToRouteChange(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removePrerenderTags();
      }

      if (event instanceof NavigationEnd) {
        const routerUrl = this.router.url === '/' ? 'landing' : this.router.url.substring(1);

        // Single galleries get meta derived from the URL — there is no seo.json entry per couple.
        const galleryMeta = this.buildGalleryMeta(routerUrl);
        if (galleryMeta) {
          this.generate(galleryMeta.item, galleryMeta.title);
          return;
        }

        const index = routerUrl.includes('/') ? routerUrl.indexOf('/') : routerUrl.length;
        let key = routerUrl.substring(0, index) as keyof SEOData;

        // Two-segment keys: galleries/X, galerii/X, galeriya/X, gallery/X
        if (key === 'galleries' || key === 'galerii' || key === 'galeriya' || key === 'gallery') {
          const twoSegment = routerUrl.split('/').slice(0, 2).join('/');
          if (this.seoData[twoSegment]) {
            key = twoSegment;
          }
        }

        if (this.seoData[key]) {
          this.generate(this.seoData[key]);
        } else {
          this.createDescriptionAndKeywords(this.seoData['not-found']);
          this.generateRobotsTag(false);
          this.generatePageNotFoundTag();
        }
      }
    });
  }

}
