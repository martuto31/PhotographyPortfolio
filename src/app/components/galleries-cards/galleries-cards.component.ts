import { Component, Inject, Input, OnChanges, OnInit, PLATFORM_ID, SimpleChanges } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { FaqComponent } from './../shared/faq/faq.component';
import { CtaBandComponent } from './../shared/cta-band/cta-band.component';
import { CategoryNavComponent } from './../shared/category-nav/category-nav.component';
import { GalleryWallComponent, WallItem } from './../shared/gallery-wall/gallery-wall.component';

import { StructuredDataService } from './../../services/structured-data.service';
import { fetchManifest } from './../../config';
import { GalleryListing, manifestGalleries, snapshotGalleries } from './../../services/gallery-list';
import { SERVICE_BY_SLUG, SERVICE_TITLES, ServiceCopy } from './../../content/services';

// Maps BG URL slug -> internal type key + R2 prefix used by the gallery component.
// Add a new entry here when introducing a new service category and the rest of the
// SEO config (seo.json, sitemap.xml, JSON-LD offers) will pick it up.
export const SLUG_TO_TYPE: Record<string, string> = {
  'svatbi': 'Weddings',
  'abiturienti': 'Graduates',
  'lichni': 'Personal',
  'krushteneta': 'Baptisms',
  'rojdeni-dni': 'Birthdays',
  'semeyni': 'Family',
  // Legacy direct values (when arriving via old EN routes that didn't redirect)
  'Weddings': 'Weddings',
  'Graduates': 'Graduates',
  'Personal': 'Personal',
};

// Fallback <title> wording for the legacy English slugs, which have no SERVICE_TITLES entry.
const TYPE_LABEL_BG: Record<string, { heading: string }> = {
  'Weddings': { heading: 'Сватбени' },
  'Graduates': { heading: 'Абитуриентски' },
  'Personal': { heading: 'Лични' },
  'Baptisms': { heading: 'Кръщенета' },
  'Birthdays': { heading: 'Рождени дни' },
  'Family': { heading: 'Семейни' },
};

// Alt-text prefix per type, used for SEO-friendly image alt attributes.
const TYPE_ALT_PREFIX: Record<string, string> = {
  'Weddings': 'Сватбена фотография - ',
  'Graduates': 'Абитуриентска фотосесия - ',
  'Personal': 'Лична фотосесия - ',
  'Baptisms': 'Фотосесия от кръщене - ',
  'Birthdays': 'Рожден ден - ',
  'Family': 'Семейна фотосесия - ',
};

@Component({
  selector: 'app-galleries-cards',
  templateUrl: './galleries-cards.component.html',
  styleUrls: ['./galleries-cards.component.css'],
  standalone: true,
  imports: [
    RouterLink,
    FaqComponent,
    CtaBandComponent,
    CategoryNavComponent,
    GalleryWallComponent,
  ],
})

export class GalleriesCardsComponent implements OnInit, OnChanges {

  constructor(
    private title: Title,
    private structuredData: StructuredDataService,
    @Inject(PLATFORM_ID) private platformId: object) { }

  @Input() galleryType: string = 'svatbi';

  // Resolved internal type key (Weddings/Graduates/Personal/etc.)
  public type: string = 'Weddings';
  public pageHeading: string = '';
  public pageSubheading: string = '';
  public wall: WallItem[] = [];
  private altPrefix: string = '';

  // Service prose for this category. Four of the seven categories have no
  // published galleries, and until this existed those URLs rendered a heading over
  // an empty grid — while the LocalBusiness JSON-LD advertised them as offers.
  public service?: ServiceCopy;

  // Counts the loads started, so a manifest that arrives for a category the
  // visitor has already left is dropped.
  private loadGeneration = 0;

  public ngOnInit(): void {
    void this.load();
  }

  // The router keeps this component from one category to the next (the row of
  // categories above the wall) and only changes the input - no new ngOnInit.
  // Without this the URL said abiturienti while the page still showed weddings.
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['galleryType']?.firstChange === false) {
      void this.load();
    }
  }

  private async load(): Promise<void> {
    const generation = ++this.loadGeneration;

    this.type = SLUG_TO_TYPE[this.galleryType] || this.galleryType;
    this.altPrefix = TYPE_ALT_PREFIX[this.type] || '';
    this.service = SERVICE_BY_SLUG[this.galleryType];
    this.setHeadings();
    this.setTitle();
    this.setStructuredData();

    // Render the build-time snapshot first — synchronously, on server and client alike — so
    // the prerendered HTML carries a crawlable <a> per gallery instead of an empty wall.
    this.wall = this.tiles(snapshotGalleries(this.type));

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Then refresh from the live manifest, so galleries published since the last deploy
    // still show up without a code change. A failed fetch keeps the snapshot on screen.
    const manifest = await fetchManifest();
    if (manifest && generation === this.loadGeneration) {
      this.wall = this.tiles(manifestGalleries(manifest, this.type));
    }
  }

  private tiles(galleries: GalleryListing[]): WallItem[] {
    return galleries.map((gallery) => ({
      name: gallery.name,
      imageSrc: gallery.imageSrc,
      imageSrcset: gallery.imageSrcset,
      link: ['/galeriya', this.galleryType, gallery.name],
      alt: `${this.altPrefix}${gallery.name} - фотограф София и Видин`,
    }));
  }

  private setHeadings(): void {
    const headings: Record<string, { h1: string; sub: string }> = {
      'Weddings': { h1: 'Сватбен фотограф - София и Видин', sub: 'Сватбени галерии от Виктория Борисова' },
      'Graduates': { h1: 'Фотограф за абитуриентски бал - София и Видин', sub: 'Галерии с абитуриентски фотосесии от Виктория Борисова' },
      'Personal': { h1: 'Други събития - София и Видин', sub: 'Галерии с индивидуални фотосесии, рождени дни, кръщенета и други събития от Виктория Борисова' },
      'Baptisms': { h1: 'Фотограф за кръщене - София и Видин', sub: 'Кръщенета и семейни тайнства' },
      'Birthdays': { h1: 'Фотограф за рожден ден - София и Видин', sub: 'Детски рождени дни, юбилеи и семейни празненства' },
      'Family': { h1: 'Семеен фотограф - София и Видин', sub: 'Семейни и детски фотосесии' },
    };

    const h = headings[this.type];
    if (h) {
      this.pageHeading = h.h1;
      this.pageSubheading = h.sub;
    }
  }

  private setTitle(): void {
    const title = SERVICE_TITLES[this.galleryType];
    if (title) {
      this.title.setTitle(title);
      return;
    }

    // Legacy English slugs (/galleries/Weddings) reach here without a BG slug.
    const labels = TYPE_LABEL_BG[this.type];
    if (labels) {
      this.title.setTitle(`${labels.heading} фотосесии | Виктория Борисова`);
    }
  }

  private setStructuredData(): void {
    if (!this.service) {
      return;
    }

    const url = `https://phbyviki.com/galerii/${this.service.slug}`;

    this.structuredData.set([
      this.structuredData.breadcrumbs([
        { name: 'Начало', url: 'https://phbyviki.com/' },
        { name: 'Галерия', url: 'https://phbyviki.com/galerii' },
        { name: this.service.label, url },
      ]),
      this.structuredData.service({
        name: this.service.eyebrow,
        description: this.service.lead,
        url,
      }),
      this.structuredData.faq(this.service.faq),
    ]);
  }

}
