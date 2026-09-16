import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { CtaBandComponent } from './../shared/cta-band/cta-band.component';
import { CategoryNavComponent } from './../shared/category-nav/category-nav.component';
import { GalleryWallComponent, WallItem } from './../shared/gallery-wall/gallery-wall.component';

import { SERVICES, ServiceCopy } from './../../content/services';
import { fetchManifest } from './../../config';
import { GalleryListing, interleave, manifestGalleries, snapshotGalleries } from './../../services/gallery-list';
import { StructuredDataService } from './../../services/structured-data.service';

// The /galerii index: one wall of every published gallery, the categories
// dealt together, with the row of category pages above it.
//
// "Галерия" in the nav used to be href="/" plus a JS scroll handler: no crawlable
// destination, no URL to send anyone, and clicking it from a gallery page threw the
// visitor back to the home page. This is the page it should always have pointed at.
// It was a list of six category names for a while - three of them with no galleries
// behind them - and a list of six words never looked like a photographer's site.
@Component({
  selector: 'app-galleries-index',
  templateUrl: './galleries-index.component.html',
  styleUrls: ['./galleries-index.component.css'],
  standalone: true,
  imports: [
    CtaBandComponent,
    CategoryNavComponent,
    GalleryWallComponent,
  ],
})

export class GalleriesIndexComponent implements OnInit {

  constructor(
    private structuredData: StructuredDataService,
    @Inject(PLATFORM_ID) private platformId: object) { }

  public wall: WallItem[] = [];

  public async ngOnInit(): Promise<void> {
    this.structuredData.set([
      this.structuredData.breadcrumbs([
        { name: 'Начало', url: 'https://phbyviki.com/' },
        { name: 'Галерия', url: 'https://phbyviki.com/galerii' },
      ]),
    ]);

    // The build-time snapshot first, on server and client alike, so the
    // prerendered HTML carries a crawlable <a> and a real <img> per gallery.
    this.wall = this.deal((service) => snapshotGalleries(service.type));

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Then the live manifest, so galleries published since the last deploy
    // show up without a code change. A failed fetch keeps the snapshot.
    const manifest = await fetchManifest();
    if (manifest) {
      this.wall = this.deal((service) => manifestGalleries(manifest, service.type));
    }
  }

  private deal(listFor: (service: ServiceCopy) => GalleryListing[]): WallItem[] {
    return interleave(SERVICES.map((service) => listFor(service).map((gallery) => ({
      name: gallery.name,
      imageSrc: gallery.imageSrc,
      imageSrcset: gallery.imageSrcset,
      link: ['/galeriya', service.slug, gallery.name],
      alt: `${gallery.name} - ${service.label.toLowerCase()}, Виктория Борисова`,
      category: service.label,
    }))));
  }

}
