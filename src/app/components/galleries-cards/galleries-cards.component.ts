import { Component, Input } from '@angular/core';

import { RouterLink } from '@angular/router';

interface Gallery {
  name: string;
  imageSrc: string;
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

export class GalleriesCardsComponent {

  @Input() galleryType: string = 'Weddings'

  public weddingGalleries: Gallery[] = [
    {
      name: 'Krysteena & Martin',
      imageSrc: 'assets/img/wedding-galleries/krysteena-martin-cover.webp',
    },
    {
      name: 'Александрина и Борис',
      imageSrc: 'assets/img/wedding-galleries/aleksandrina-boris-cover.webp',
    },
    {
      name: 'Мари и Оги',
      imageSrc: 'assets/img/wedding-galleries/mari-ogi-cover.webp',
    },
    {
      name: 'Вики и Петьо',
      imageSrc: 'assets/img/wedding-galleries/viki-petio-cover.webp',
    },
    {
      name: 'Виктория и Мартин',
      imageSrc: 'assets/img/wedding-galleries/viki-martin-cover.webp',
    },
    {
      name: 'Надя и Боби',
      imageSrc: 'assets/img/wedding-galleries/nadia-bobi-cover.webp',
    },
  ];

  public graduatesGalleries: Gallery[] = [
    {
      name: 'Вивиан',
      imageSrc: 'assets/img/graduates-galleries-covers/vivian.webp',
    },
    {
      name: 'Ванеса',
      imageSrc: 'assets/img/graduates-galleries-covers/vanesa.webp',
    },
    {
      name: 'Мони',
      imageSrc: 'assets/img/graduates-galleries-covers/moni.webp',
    },
    {
      name: 'Други',
      imageSrc: 'assets/img/graduates-galleries-covers/merelin.webp',
    },
  ];

  public personalGalleries: Gallery[] = [
    {
      name: '',
      imageSrc: '',
    },
  ];

}
