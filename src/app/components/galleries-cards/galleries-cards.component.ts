import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, RouterLink } from '@angular/router';

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

export class GalleriesCardsComponent implements OnInit {

  constructor(
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.galleryType = this.route.snapshot.data['galleryType'];

    console.log(this.galleryType);
  }

  public galleryType = 'Weddings';

  public weddingGalleries: Gallery[] = [
    {
      name: 'Krysteena & Martin',
      imageSrc: 'assets/img/wedding-galleries/krysteena-martin/krysteena-martin-cover.jpg',
    },
    {
      name: 'Александрина и Борис',
      imageSrc: 'assets/img/wedding-galleries/aleksandrina-boris/aleksandrina-boris-cover.jpg',
    },
    // {
    //   name: 'Мари и Оги',
    //   imageSrc: 'assets/img/wedding-galleries/mari-ogi/mari-ogi-cover.jpg',
    // },
    {
      name: 'Вики и Петьо',
      imageSrc: 'assets/img/wedding-galleries/viki-petio/viki-petio-cover.jpg',
    },
    {
      name: 'Виктория и Мартин',
      imageSrc: 'assets/img/wedding-galleries/viki-martin/viki-martin-cover.jpg',
    },
    {
      name: 'Илияна и Деян',
      imageSrc: 'assets/img/wedding-galleries/iliqna-deqn/iliqna-deqn-cover.jpg',
    },
  ];

  public graduatesGalleries: Gallery[] = [
    {
      name: 'Вивиан',
      imageSrc: '',
    },
    {
      name: 'Кати и Калин',
      imageSrc: '',
    },
    {
      name: 'Ванеса',
      imageSrc: '',
    },
    {
      name: 'Мерелин',
      imageSrc: '',
    },
    {
      name: 'Мони',
      imageSrc: '',
    },
    {
      name: 'Меги и Здравко',
      imageSrc: '',
    },
  ];

  public personalGalleries: Gallery[] = [
    {
      name: '',
      imageSrc: '',
    },
  ];

}
