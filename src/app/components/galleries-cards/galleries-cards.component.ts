import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface Gallery {
  name: string;
  btnLink: string;
  imageSrc: string;
}

@Component({
  selector: 'app-galleries-cards',
  templateUrl: './galleries-cards.component.html',
  styleUrls: ['./galleries-cards.component.css'],
  standalone: true,
})

export class GalleriesCardsComponent implements OnInit {

  constructor(
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.galleryType = this.route.snapshot.data['galleryType'];
  }

  public galleryType = 'wedding';

  public weddingGalleries: Gallery[] = [
    {
      name: 'Krysteena & Martin',
      btnLink: '',
      imageSrc: 'assets/img/wedding-galleries/krysteena-martin/krysteena-martin-cover.jpg',
    },
    {
      name: 'Александрина и Борис',
      btnLink: '',
      imageSrc: 'assets/img/wedding-galleries/aleksandrina-boris/aleksandrina-boris-cover.jpg',
    },
    {
      name: 'Мари и Оги',
      btnLink: '',
      imageSrc: 'assets/img/wedding-galleries/mari-ogi/mari-ogi-cover.jpg',
    },
    {
      name: 'Вики и Петьо',
      btnLink: '',
      imageSrc: 'assets/img/wedding-galleries/viki-petio/viki-petio-cover.jpg',
    },
    {
      name: 'Виктория и Мартин',
      btnLink: '',
      imageSrc: 'assets/img/wedding-galleries/viki-martin/viki-martin-cover.jpg',
    },
    {
      name: 'Илияна и Деян',
      btnLink: '',
      imageSrc: 'assets/img/wedding-galleries/iliqna-deqn/iliqna-deqn-cover.jpg',
    },
  ];

}
