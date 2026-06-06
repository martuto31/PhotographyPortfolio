import { Component, HostListener, Inject, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';

import { DimensionService } from './../../services/dimension.service';

import { COVER_FILENAME, MANIFEST_URL, imageUrl } from './../../config';

interface GalleryManifest {
  generated: string;
  galleries: Record<string, string[]>;
}

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
  standalone: true,
})

export class GalleryComponent implements OnInit, OnDestroy {

  constructor(
    public dimensionsService: DimensionService,
    private title: Title,
    @Inject(PLATFORM_ID) private platformId: object) { }

  @Input() galleryName: string = 'Други';

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

  async ngOnInit(): Promise<void> {
    this.setTitle();

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
    const prefix = this.translateSlugToS3Prefix(this.galleryName);

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

  private setTitle(): void {
    let translatedGalleryName: string = '';

    const rawType = this.translateSlugToS3Prefix(this.galleryName).split('/')[0];

    switch (rawType) {
      case 'Weddings':
        translatedGalleryName = 'Сватбена';
        break;
      case 'Graduates':
        translatedGalleryName = 'Абитуриентска';
        break;
      case 'Personal':
        translatedGalleryName = 'Лична';
        break;
      case 'Baptisms':
        translatedGalleryName = 'Кръщене';
        break;
      case 'Corporate':
        translatedGalleryName = 'Корпоративна';
        break;
      case 'Birthdays':
        translatedGalleryName = 'Рожден ден';
        break;
      case 'Family':
        translatedGalleryName = 'Семейна';
        break;
    }

    if (translatedGalleryName) {
      this.title.setTitle(`${translatedGalleryName} Фотосесия — София и Видин | Виктория Борисова`);
    }
  }
}
