import { Component, HostListener, Inject, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

import { DimensionService } from './../../services/dimension.service';

import { COVER_FILENAME, MANIFEST_URL, imageUrl } from './../../config';

interface GalleryManifest {
  generated: string;
  galleries: Record<string, string[]>;
}

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

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
  standalone: true,
  imports: [
    RouterLink,
  ],
})

export class GalleryComponent implements OnInit, OnDestroy {

  constructor(
    public dimensionsService: DimensionService,
    @Inject(PLATFORM_ID) private platformId: object) { }

  @Input() galleryName: string = 'Други';

  // Set only by the canonical two-segment route (/galeriya/:galleryType/:galleryName).
  // The legacy one-segment route leaves it empty and carries the slug inside galleryName.
  @Input() galleryType: string = '';

  // The "<slug>/<gallery>" path used to look the gallery up, from either route shape.
  private get slugPath(): string {
    return this.galleryType ? `${this.galleryType}/${this.galleryName}` : this.galleryName;
  }

  public imageUrls: string[] = [];

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
  public displayName = '';

  async ngOnInit(): Promise<void> {
    this.setHeadings();

    // Image fetching happens on the client; gallery routes are SPA-rendered.
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    await this.loadImages();
  }

  ngOnDestroy(): void {
    // Guard against leaving the page scroll-locked if the component is torn
    // down (e.g. route change) while the modal is open.
    this.unlockBodyScroll();
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

    const target = Math.min(GalleryComponent.REVEAL_THRESHOLD, this.imageUrls.length);
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
    if (this.currentModalImageIndex < this.imageUrls.length - 1) {
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
      this.currentModalImageIndex = this.imageUrls.length - 1;
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
    this.modalImage = this.imageUrls[this.currentModalImageIndex];
    this.preloadNeighbours();
  }

  // Warm the browser cache with the adjacent images so ←/→ navigation swaps in
  // instantly instead of flashing blank while the next photo downloads.
  private preloadNeighbours(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const count = this.imageUrls.length;
    if (count < 2) {
      return;
    }

    const next = (this.currentModalImageIndex + 1) % count;
    const previous = (this.currentModalImageIndex - 1 + count) % count;

    new Image().src = this.imageUrls[next];
    new Image().src = this.imageUrls[previous];
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

    let files: string[] = [];
    try {
      // Cross-origin fetch to the R2 domain — a CORS/network failure throws a
      // TypeError (not a non-ok response), so catch it and fail gracefully.
      const response = await fetch(MANIFEST_URL, { cache: 'no-cache' });
      if (response.ok) {
        const manifest: GalleryManifest = await response.json();
        // cover.webp is the card thumbnail — keep it out of the photo grid.
        files = (manifest.galleries[prefix] ?? []).filter((f) => f !== COVER_FILENAME);
      }
    } catch {
      files = [];
    }

    this.imageUrls = files.map((file) => imageUrl(prefix, file));

    // No images (empty gallery or failed manifest): drop the loading mask so we
    // don't show skeletons forever — onImageSettled would otherwise never fire.
    if (this.imageUrls.length === 0) {
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

  // Alt text carries the gallery name so each photo is distinguishable to crawlers and
  // screen readers, instead of 154 identical strings on one page.
  public altFor(index: number): string {
    const subject = this.displayName ? `${this.displayName} — ` : '';
    return `${subject}${this.pageHeading || 'Фотосесия'}, кадър ${index + 1} — Виктория Борисова, фотограф София и Видин`;
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
    this.categoryLink = `/galerii/${slug}`;
  }

  private translateSlugToS3Prefix(galleryName: string): string {
    const SLUG_TO_PREFIX: Record<string, string> = {
      'svatbi': 'Weddings',
      'abiturienti': 'Graduates',
      'lichni': 'Personal',
      'krushteneta': 'Baptisms',
      'korporativni': 'Corporate',
      'rojdeni-dni': 'Birthdays',
      'semeyni': 'Family',
    };

    const [first, ...rest] = galleryName.split('/');
    const mapped = SLUG_TO_PREFIX[first];
    if (!mapped) return galleryName;
    return rest.length ? `${mapped}/${rest.join('/')}` : mapped;
  }

}
