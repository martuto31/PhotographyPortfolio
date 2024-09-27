import { Injectable, Inject } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

interface SEODataItem {
  title: string;
  description: string;
  keywords: string;
}

interface SEOData {
  [key: string]: SEODataItem;
}

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

  private seoData!: SEOData;

  private cannonicalLink!: HTMLLinkElement;

  private generate(dataItem: SEODataItem): void {
    dataItem.title = this.getTitle();

    this.createDescriptionAndKeywords(dataItem);
    this.generateCannonicalLink();
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

  private generateCannonicalLink(): void {
    const canonicaUrl = this.dom.URL.split('?')[0];

    if (this.cannonicalLink) {
      this.dom.head.removeChild(this.cannonicalLink);
    }

    this.cannonicalLink = this.dom.createElement('link');
    this.cannonicalLink.setAttribute('rel', 'canonical');
    this.cannonicalLink.setAttribute('href', canonicaUrl);

    this.dom.head.appendChild(this.cannonicalLink);
  }

  private removeCannonicalLink(): void {
    if (this.cannonicalLink) {
      this.dom.head.removeChild(this.cannonicalLink);
      this.cannonicalLink = null as any;
    }
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
      this.meta.updateTag({ name: 'prerender-status-code', content: '404'});
    }
  }

  private removePrerenderTags(): void {
    this.meta.removeTag('name="prerender-status-code"');
    this.meta.removeTag('name="prerender-header"');
  }

  private async subscribeToRouteChange(): Promise<void> {
    if (!this.seoData) {
      this.seoData = await this.getSeoData();
    }

    this.router.events.subscribe(async event => {
      if (event instanceof NavigationStart) {
        this.removePrerenderTags();
        this.removeCannonicalLink();
      }

      if (event instanceof NavigationEnd) {
        const routerUrl = this.router.url === '/' ? 'landing' : this.router.url.substring(1);
        const index = routerUrl.includes('/') ? routerUrl.indexOf('/') : routerUrl.length;
        let key = routerUrl.substring(0, index) as keyof SEOData;

        if (key === 'galleries') {
            key = routerUrl;
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

  private async getSeoData(): Promise<SEOData> {
    const filePath = './../../assets/seo.json';

    const seoData = await new Promise<SEOData>(resolve => {
      fetch(filePath)
        .then(response => response.json())
        .then(json => resolve(json));
    });

    return seoData;
  }

}
