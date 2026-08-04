import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationStart, Router } from '@angular/router';

// Per-page JSON-LD.
//
// The site-wide LocalBusiness and WebSite graphs live statically in index.html and
// are inherited by every prerendered page. Anything that varies per route —
// BreadcrumbList, FAQPage, Service — has to be injected, which is what this does.
//
// Scripts written here carry data-page-schema so they can be cleared on navigation
// without touching the two static graphs in the document head.
//
// This runs on the server too: the prerenderer serialises the DOM after the route
// settles, so the schema lands in the static HTML rather than depending on a crawler
// executing JavaScript. Same reason SEOService writes the canonical link this way.
@Injectable({ providedIn: 'root' })
export class StructuredDataService {

  private static readonly MARKER = 'data-page-schema';

  constructor(
    @Inject(DOCUMENT) private dom: Document,
    router: Router) {

    // Clear before the next route renders — otherwise a gallery's breadcrumb would
    // survive onto the page the visitor navigates to next.
    router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.clear();
      }
    });
  }

  public set(graphs: object[]): void {
    this.clear();

    for (const graph of graphs) {
      const script = this.dom.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute(StructuredDataService.MARKER, '');
      script.textContent = JSON.stringify(graph);
      this.dom.head.appendChild(script);
    }
  }

  private clear(): void {
    const existing = this.dom.head.querySelectorAll(`script[${StructuredDataService.MARKER}]`);
    existing.forEach((node) => node.parentNode?.removeChild(node));
  }

  // ---- Builders ------------------------------------------------------------

  // Google reads BreadcrumbList to render the "phbyviki.com › Сватби › Лора и Асен"
  // trail instead of a bare URL in the result.
  public breadcrumbs(trail: { name: string; url: string }[]): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': trail.map((crumb, index) => ({
        '@type': 'ListItem',
        'position': index + 1,
        'name': crumb.name,
        'item': crumb.url,
      })),
    };
  }

  // FAQ rich results are restricted to government and health sites since 2023, so
  // this will not draw an expandable answer box. It stays because the markup still
  // states plainly what the page answers, which matters to the systems that read
  // pages rather than rank them.
  public faq(items: { q: string; a: string }[]): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': items.map((item) => ({
        '@type': 'Question',
        'name': item.q,
        'acceptedAnswer': { '@type': 'Answer', 'text': item.a },
      })),
    };
  }

  public service(params: { name: string; description: string; url: string }): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      'name': params.name,
      'description': params.description,
      'url': params.url,
      'serviceType': params.name,
      'provider': { '@id': 'https://phbyviki.com/#business' },
      'areaServed': [
        { '@type': 'City', 'name': 'София' },
        { '@type': 'City', 'name': 'Видин' },
        { '@type': 'Country', 'name': 'България' },
      ],
      'availableChannel': {
        '@type': 'ServiceChannel',
        'serviceUrl': 'https://phbyviki.com/kontakti',
      },
    };
  }

  // A gallery page is a collection of photographs of one event.
  public imageGallery(params: { name: string; description: string; url: string; images: string[] }): object {
    return {
      '@context': 'https://schema.org',
      '@type': 'ImageGallery',
      'name': params.name,
      'description': params.description,
      'url': params.url,
      'author': { '@id': 'https://phbyviki.com/#viktoria' },
      'copyrightHolder': { '@id': 'https://phbyviki.com/#business' },
      'image': params.images,
    };
  }

}
