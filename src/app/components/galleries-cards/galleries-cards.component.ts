import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { DimensionService } from './../../services/dimension.service';

interface Gallery {
  name: string;
  imageSrc: string;
  isImgLoaded: boolean;
}

@Component({
  selector: 'app-galleries-cards',
  templateUrl: './galleries-cards.component.html',
  styleUrls: ['./galleries-cards.component.css'],
  standalone: true,
  imports: [
    RouterLink,
  ],
})

export class GalleriesCardsComponent implements OnInit {

  constructor(
    public dimensionsService: DimensionService,
    private title: Title) { }
  
  @Input() galleryType: string = 'Weddings'

  public ngOnInit(): void {
    this.setTitle();
  }

  public weddingGalleries: Gallery[] = [
    {
      name: 'Krysteena & Martin',
      imageSrc: 'assets/img/wedding-galleries/krysteena-martin-cover.webp',
      isImgLoaded: false,
    },
    {
      name: 'Александрина и Борис',
      imageSrc: 'assets/img/wedding-galleries/aleksandrina-boris-cover.webp',
      isImgLoaded: false,
    },
    {
      name: 'Мари и Оги',
      imageSrc: 'assets/img/wedding-galleries/mari-ogi-cover.webp',
      isImgLoaded: false,
    },
    {
      name: 'Вики и Петьо',
      imageSrc: 'assets/img/wedding-galleries/viki-petio-cover.webp',
      isImgLoaded: false,
    },
    {
      name: 'Виктория и Мартин',
      imageSrc: 'assets/img/wedding-galleries/viki-martin-cover.webp',
      isImgLoaded: false,
    },
    {
      name: 'Надя и Боби',
      imageSrc: 'assets/img/wedding-galleries/nadia-bobi-cover.webp',
      isImgLoaded: false,
    },
  ];

  public graduatesGalleries: Gallery[] = [
    {
      name: 'Вивиан',
      imageSrc: 'assets/img/graduates-galleries-covers/vivian.webp',
      isImgLoaded: false,
    },
    {
      name: 'Ванеса',
      imageSrc: 'assets/img/graduates-galleries-covers/vanesa.webp',
      isImgLoaded: false,
    },
    {
      name: 'Мони',
      imageSrc: 'assets/img/graduates-galleries-covers/moni.webp',
      isImgLoaded: false,
    },
    {
      name: 'Други',
      imageSrc: 'assets/img/graduates-galleries-covers/merelin.webp',
      isImgLoaded: false,
    },
  ];

  public personalGalleries: Gallery[] = [
    {
      name: '',
      imageSrc: '',
      isImgLoaded: false,
    },
  ];

  public onImageLoad(gallery: Gallery): void {
    gallery.isImgLoaded = true;
  }

  private setTitle(): void {
    let translatedGalleryType: string = '';

    switch (this.galleryType) {
      case 'Weddings':
        translatedGalleryType = 'Сватбени';

        break;
      case 'Graduates':
        translatedGalleryType = 'Абитуриентски';

        break;
      case 'Personal':
        translatedGalleryType = 'Лични';
    }

    if (translatedGalleryType) {
      this.title.setTitle(`${translatedGalleryType} Фотосесии | Галерия от Виктория Борисова`);
    }
  }

}
