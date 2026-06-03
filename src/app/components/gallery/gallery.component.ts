import { Component, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
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

export class GalleryComponent implements OnInit {

  constructor(
    public dimensionsService: DimensionService,
    private title: Title,
    @Inject(PLATFORM_ID) private platformId: object) { }

  @Input() galleryName: string = 'Други';

  public initialImageUrls: string[] = [];
  public imageUrls: string[] = [];
  
  public areImagesLoaded = false;
  
  public isModalOpen = false;
  public modalImage = '';
  public currentModalImageIndex!: number;

  async ngOnInit(): Promise<void> {
    this.setTitle();

    // Image fetching happens on the client; gallery routes are SPA-rendered.
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    await this.loadImages();
  }

  public onImageLoad(index: number): void {
    if (index === this.imageUrls.length - 1) {
      setTimeout(() => {
        this.areImagesLoaded = true;
      }, 150);
    }
  }

  public openModal(imageSrc: string, imageIndex: number): void {
    if (this.dimensionsService.isMobile) {
      return;
    }
    
    this.modalImage = imageSrc;

    this.isModalOpen = true;

    this.currentModalImageIndex = imageIndex;

    console.log(this.currentModalImageIndex);
    
    setTimeout(() => {
      this.setImageOrientation();
    });
  }

  public nextImage(): void {
    if (this.currentModalImageIndex < this.imageUrls.length - 1) {
      this.modalImage = this.imageUrls[this.currentModalImageIndex + 1];

      this.currentModalImageIndex = this.currentModalImageIndex + 1;
    } else {
      this.modalImage = this.imageUrls[0];

      this.currentModalImageIndex = 0;
    }
  }

  public previousImage(): void {
    if (this.currentModalImageIndex > 0) {
      this.modalImage = this.imageUrls[this.currentModalImageIndex - 1];

      this.currentModalImageIndex = this.currentModalImageIndex - 1;
    } else {
      this.modalImage = this.imageUrls[this.imageUrls.length - 1];

      this.currentModalImageIndex = this.imageUrls.length - 1;
    }
  }

  public closeModal(): void {
    this.modalImage = '';

    this.isModalOpen = false;
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
    // don't show skeletons forever — onImageLoad would otherwise never fire.
    if (this.imageUrls.length === 0) {
      this.areImagesLoaded = true;
    }
  }

  private setImageOrientation(): void {
    const imageElement = document.getElementById('modal') as HTMLImageElement;

    imageElement.onload = () => {
      if (imageElement.naturalWidth > imageElement.naturalHeight) {
        imageElement.classList.add('landscape');
      } else {
        imageElement.classList.add('portrait');
      }
    };
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
