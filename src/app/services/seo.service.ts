import { Injectable, Inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Meta } from '@angular/platform-browser';
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

@Injectable({
  providedIn: 'root'
})

export class SEOService {

  constructor(
    @Inject(DOCUMENT) private dom: Document,
    private router: Router,
    private meta: Meta) {

    this.subscribeToRouteChange();
  }

  private seoData: SEOData = seoDataJson as unknown as SEOData;

  private generate(dataItem: SEODataItem): void {
    dataItem.title = this.getTitle();

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

    return route.snapshot.title || '';
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

  private subscribeToRouteChange(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.removePrerenderTags();
      }

      if (event instanceof NavigationEnd) {
        const routerUrl = this.router.url === '/' ? 'landing' : this.router.url.substring(1);
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
