import { Component } from '@angular/core';

interface Gallery {
  name: string;
  btnLink: string;
  imageSrc: string;
}

@Component({
  selector: 'app-wedding-galleries',
  templateUrl: './wedding-galleries.component.html',
  styleUrls: ['./wedding-galleries.component.css'],
  standalone: true,
})

export class WeddingGalleriesComponent {

  public galleries: Gallery[] = [
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
