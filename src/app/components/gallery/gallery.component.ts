import { Component, HostListener, Inject, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

import { CtaBandComponent } from './../shared/cta-band/cta-band.component';

import { DimensionService } from './../../services/dimension.service';
import { StructuredDataService } from './../../services/structured-data.service';

import { COVER_FILENAME, PHONE_SLOT, ResponsiveImage, fetchManifest, galleryImages } from './../../config';
import { GALLERY_SNAPSHOT, GallerySnapshotItem } from './../../generated/galleries';

type SiblingGallery = GallerySnapshotItem;

// Heading wording + the label of the category this gallery belongs to, keyed by URL slug.
const TYPE_HEADING: Record<string, { noun: string; category: string }> = {
  'svatbi': { noun: 'Сватбена фотосесия', category: 'Сватбени галерии' },
  'abiturienti': { noun: 'Абитуриентска фотосесия', category: 'Абитуриентски галерии' },
  'lichni': { noun: 'Фотосесия', category: 'Други събития' },
  'krushteneta': { noun: 'Фотосесия от кръщене', category: 'Кръщенета' },
  'korporativni': { noun: 'Корпоративно събитие', category: 'Корпоративни събития' },
  'rojdeni-dni': { noun: 'Рожден ден', category: 'Рождени дни' },
  'semeyni': { noun: 'Семейна фотосесия', category: 'Семейни галерии' },
};

// BG URL slug -> R2 manifest prefix / GALLERY_SNAPSHOT key.
const SLUG_TO_PREFIX: Record<string, string> = {
  'svatbi': 'Weddings',
  'abiturienti': 'Graduates',
  'lichni': 'Personal',
  'krushteneta': 'Baptisms',
  'korporativni': 'Corporate',
  'rojdeni-dni': 'Birthdays',
  'semeyni': 'Family',
};

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
  standalone: true,
  imports: [
    RouterLink,
    CtaBandComponent,
  ],
})

export class GalleryComponent implements OnInit, OnDestroy {

  constructor(
    public dimensionsService: DimensionService,
    private structuredData: StructuredDataService,
    @Inject(DOCUMENT) private dom: Document,
    @Inject(PLATFORM_ID) private platformId: object) { }

  @Input() galleryName: string = 'Други';

  // Set only by the canonical two-segment route (/galeriya/:galleryType/:galleryName).
  // The legacy one-segment route leaves it empty and carries the slug inside galleryName.
  @Input() galleryType: string = '';

  // The "<slug>/<gallery>" path used to look the gallery up, from either route shape.
  private get slugPath(): string {
    return this.galleryType ? `${this.galleryType}/${this.galleryName}` : this.galleryName;
  }

  public images: ResponsiveImage[] = [];

  // The grid is three columns inside a 1400px shell, two on tablet and one on
  // mobile — the breakpoints mirror DimensionService, which drives the CSS.
  public readonly gridSizes = `(max-width: 480px) ${PHONE_SLOT}, (max-width: 960px) 48vw, (min-width: 1440px) 440px, 31vw`;

  // The sibling strip stays three-up from tablet width and goes full-bleed on mobile.
  public readonly siblingSizes = `(max-width: 480px) ${PHONE_SLOT}, (min-width: 1440px) 425px, 31vw`;

  public areImagesLoaded = false;
  // Counts images that have finished (loaded or errored). The skeleton mask
  // lifts once the first screenful has settled rather than waiting for every
  // tile: images are lazy-loaded, so the ones below the fold won't fire until
  // scrolled into view, and gating on all of them would never lift the mask.
  private settledImages = 0;
  private static readonly REVEAL_THRESHOLD = 6;
  private static readonly REVEAL_FALLBACK_MS = 2500;

  public isModalOpen = false;
  public modalImage = '';
  public currentModalImageIndex!: number;

  // The thumbnail that opened the modal, so focus can return to it on close.
  private modalTrigger: HTMLElement | null = null;

  // Visible heading + breadcrumb, resolved synchronously so they don't depend on the
  // manifest fetch. Title/description are derived from the URL by SEOService on NavigationEnd.
  public pageHeading = '';
  public categoryLabel = '';
  public categoryLink = '';
  public categorySlug = '';
  public displayName = '';

  // Other galleries in the same category. A gallery page used to carry three
  // internal links and nothing to do at the bottom — a visitor who scrolled 154
  // photographs arrived at a dead end. Read from the build-time snapshot so the
  // strip is in the prerendered HTML rather than waiting on the manifest fetch.
  public siblings: SiblingGallery[] = [];

  private static readonly MAX_SIBLINGS = 3;

  // Marks the <link rel="preload"> this component owns, so leaving the page removes
  // that one and not the preloads belonging to the document itself.
  private static readonly PRELOAD_MARKER = 'data-hero-preload';

  // Tiles rendered eagerly. Three fills the first row of the widest layout; everything
  // below stays lazy, which is the whole point on a 154-photograph gallery.
  public static readonly EAGER_IMAGES = 3;

  async ngOnInit(): Promise<void> {
    this.setHeadings();
    this.setSiblings();
    this.setSeedImages();
    this.setStructuredData();
    this.setHeroPreload();

    // The manifest fetch happens on the client only. The seed above is what the
    // prerendered HTML ships; loadImages() replaces it with the full gallery.
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    await this.loadImages();
  }

  ngOnDestroy(): void {
    // Guard against leaving the page scroll-locked if the component is torn
    // down (e.g. route change) while the modal is open.
    this.unlockBodyScroll();
    this.clearHeroPreload();
  }

  // Arrow keys navigate and Escape closes — but only while the modal is open,
  // otherwise this document-level listener would hijack keys on the page.
  @HostListener('document:keydown', ['$event'])
  public onKeydown(event: KeyboardEvent): void {
    if (!this.isModalOpen) {
      return;
    }

    switch (event.key) {
      case 'Escape':
        this.closeModal();
        break;
      case 'ArrowRight':
        this.nextImage();
        break;
      case 'ArrowLeft':
        this.previousImage();
        break;
    }
  }

  // Close only when the click lands on the backdrop itself, not on the image
  // or the controls layered on top of it.
  public onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  // Fires on both load and error so a failed image can't strand the skeleton.
  public onImageSettled(): void {
    if (this.areImagesLoaded) {
      return;
    }

    this.settledImages += 1;

    const target = Math.min(GalleryComponent.REVEAL_THRESHOLD, this.images.length);
    if (this.settledImages >= target) {
      setTimeout(() => {
        this.areImagesLoaded = true;
      }, 150);
    }
  }

  public openModal(imageSrc: string, imageIndex: number, event?: Event): void {
    if (this.dimensionsService.isMobile) {
      return;
    }

    // Capture the clicked thumbnail explicitly: a mouse click doesn't reliably
    // move focus to a button across browsers, so document.activeElement can't
    // be trusted to point at the trigger for focus-return on close.
    this.modalTrigger = (event?.currentTarget as HTMLElement | null) ?? null;

    this.modalImage = imageSrc;

    this.isModalOpen = true;

    this.currentModalImageIndex = imageIndex;

    this.lockBodyScroll();
    this.preloadNeighbours();

    // Move focus into the dialog so keyboard users land on the controls and
    // tabbing doesn't wander back into the page behind the overlay.
    setTimeout(() => {
      document.getElementById('modal-dialog')?.focus();
    });
  }

  public nextImage(): void {
    if (this.currentModalImageIndex < this.images.length - 1) {
      this.currentModalImageIndex = this.currentModalImageIndex + 1;
    } else {
      this.currentModalImageIndex = 0;
    }

    this.showCurrentImage();
  }

  public previousImage(): void {
    if (this.currentModalImageIndex > 0) {
      this.currentModalImageIndex = this.currentModalImageIndex - 1;
    } else {
      this.currentModalImageIndex = this.images.length - 1;
    }

    this.showCurrentImage();
  }

  public closeModal(): void {
    this.modalImage = '';

    this.isModalOpen = false;

    this.unlockBodyScroll();

    // Return focus to the thumbnail that opened the modal.
    this.modalTrigger?.focus();
    this.modalTrigger = null;
  }

  private showCurrentImage(): void {
    this.modalImage = this.images[this.currentModalImageIndex].src;
    this.preloadNeighbours();
  }

  // Warm the browser cache with the adjacent images so ←/→ navigation swaps in
  // instantly instead of flashing blank while the next photo downloads.
  private preloadNeighbours(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const count = this.images.length;
    if (count < 2) {
      return;
    }

    const next = (this.currentModalImageIndex + 1) % count;
    const previous = (this.currentModalImageIndex - 1 + count) % count;

    // Full size, matching what the modal itself shows — preloading a derivative
    // would warm the wrong cache entry and the swap would still flash.
    new Image().src = this.images[next].src;
    new Image().src = this.images[previous].src;
  }

  private lockBodyScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  private unlockBodyScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  private async loadImages(): Promise<void> {
    // Map Bulgarian URL slugs (svatbi/abiturienti/lichni/...) back to the
    // English prefix (Weddings/Graduates/Personal/...) used as the manifest key.
    const prefix = this.translateSlugToS3Prefix(this.slugPath);

    const manifest = await fetchManifest();
    // cover.webp is the card thumbnail — keep it out of the photo grid.
    const files = (manifest?.galleries[prefix] ?? []).filter((f) => f !== COVER_FILENAME);

    const loaded = galleryImages(manifest, prefix, files);

    // An empty result means the gallery is empty or the manifest fetch failed. Keep
    // whatever setSeedImages() put there rather than replacing eight photographs with
    // none — a failed fetch should degrade to the prerendered page, not below it.
    if (loaded.length) {
      this.images = loaded;
    }

    // Still nothing to show: drop the loading mask so we don't show skeletons
    // forever — onImageSettled would otherwise never fire.
    if (this.images.length === 0) {
      this.areImagesLoaded = true;
      return;
    }

    // Safety net: lazy-loading means we can't be certain how many images the
    // browser fetches up front, so guarantee the mask lifts even if the reveal
    // threshold is never reached.
    setTimeout(() => {
      this.areImagesLoaded = true;
    }, GalleryComponent.REVEAL_FALLBACK_MS);
  }

  // The first row loads eagerly — it is what the visitor is looking at, and the LCP
  // candidate must never be lazy. Everything after it waits until it is scrolled to.
  public loadingFor(index: number): 'eager' | 'lazy' {
    return index < GalleryComponent.EAGER_IMAGES ? 'eager' : 'lazy';
  }

  // Only the single LCP candidate is promoted; marking a whole row "high" would put
  // three photographs ahead of the stylesheet and delay all of them.
  public priorityFor(index: number): string | null {
    return index === 0 ? 'high' : null;
  }

  // Alt text carries the gallery name so each photo is distinguishable to crawlers and
  // screen readers, instead of 154 identical strings on one page.
  public altFor(index: number): string {
    const subject = this.displayName ? `${this.displayName} - ` : '';
    return `${subject}${this.pageHeading || 'Фотосесия'}, кадър ${index + 1} - Виктория Борисова, фотограф София и Видин`;
  }

  private setHeadings(): void {
    const path = this.slugPath;
    const separator = path.indexOf('/');
    if (separator === -1) {
      return;
    }

    const slug = path.slice(0, separator);
    const heading = TYPE_HEADING[slug];
    if (!heading) {
      return;
    }

    this.displayName = path.slice(separator + 1);
    this.pageHeading = heading.noun;
    this.categoryLabel = heading.category;
    this.categorySlug = slug;
    this.categoryLink = `/galerii/${slug}`;
  }

  private setSiblings(): void {
    const type = SLUG_TO_PREFIX[this.categorySlug];
    if (!type) {
      return;
    }

    this.siblings = (GALLERY_SNAPSHOT[type] ?? [])
      .filter((gallery) => gallery.name !== this.displayName)
      .slice(0, GalleryComponent.MAX_SIBLINGS);
  }

  // The photographs compiled into the build-time snapshot, used as the initial value of
  // `images`. Without this a prerendered gallery page carries no <img> at all: the real
  // list arrives from the manifest, which is a second network request a crawler only makes
  // if it renders JS. Google Search Console had all 31 gallery URLs sitting in
  // "Discovered — currently not indexed" against pages of ~60 words and no pictures.
  //
  // On the client this is immediately overwritten by loadImages(). The @for tracks by
  // src, so the seeded tiles keep their DOM nodes and their already-warm cache entries
  // rather than flashing when the full list lands.
  private setSeedImages(): void {
    const type = SLUG_TO_PREFIX[this.categorySlug];
    if (!type) {
      return;
    }

    const gallery = (GALLERY_SNAPSHOT[type] ?? []).find((item) => item.name === this.displayName);
    if (!gallery?.photos.length) {
      return;
    }

    this.images = gallery.photos.map((photo) => ({
      src: photo.src,
      srcset: photo.srcset,
      width: photo.width,
      height: photo.height,
    }));
  }

  // The first photograph is this page's LCP element. Preloading exactly one of them
  // starts that download in the document head instead of waiting for the grid to lay
  // out; preloading more would put the whole first screen in front of the stylesheet
  // and make every one of them arrive later.
  private setHeroPreload(): void {
    const hero = this.images[0];
    if (!hero) {
      return;
    }

    this.clearHeroPreload();

    const link = this.dom.createElement('link');
    link.setAttribute('rel', 'preload');
    link.setAttribute('as', 'image');
    link.setAttribute(GalleryComponent.PRELOAD_MARKER, '');
    link.setAttribute('href', hero.src);
    if (hero.srcset) {
      // Both attributes or neither: with imagesrcset but no imagesizes the browser
      // assumes 100vw and preloads a wider derivative than the grid will ask for,
      // which downloads a second copy of the same photograph.
      link.setAttribute('imagesrcset', hero.srcset);
      link.setAttribute('imagesizes', this.gridSizes);
    }
    this.dom.head.appendChild(link);
  }

  private clearHeroPreload(): void {
    const existing = this.dom.head.querySelectorAll(`link[${GalleryComponent.PRELOAD_MARKER}]`);
    existing.forEach((node) => node.parentNode?.removeChild(node));
  }

  private setStructuredData(): void {
    if (!this.displayName || !this.categorySlug) {
      return;
    }

    const url = `https://phbyviki.com/galeriya/${this.categorySlug}/${encodeURIComponent(this.displayName)}`;

    this.structuredData.set([
      this.structuredData.breadcrumbs([
        { name: 'Начало', url: 'https://phbyviki.com/' },
        { name: 'Галерия', url: 'https://phbyviki.com/galerii' },
        { name: this.categoryLabel, url: `https://phbyviki.com${this.categoryLink}` },
        { name: this.displayName, url },
      ]),
      this.structuredData.imageGallery({
        name: `${this.displayName} - ${this.pageHeading}`,
        description: `${this.pageHeading} „${this.displayName}“ от Виктория Борисова - фотограф в София и Видин.`,
        url,
        // Prerender runs before the manifest fetch, so `images` is empty on the
        // server. The sitemap already carries per-gallery <image:image> entries;
        // this list is a bonus when it happens to be populated.
        images: this.images.slice(0, 8).map((image) => image.src),
      }),
    ]);
  }

  private translateSlugToS3Prefix(galleryName: string): string {
    const [first, ...rest] = galleryName.split('/');
    const mapped = SLUG_TO_PREFIX[first];
    if (!mapped) return galleryName;
    return rest.length ? `${mapped}/${rest.join('/')}` : mapped;
  }

}
