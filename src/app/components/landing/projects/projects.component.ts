import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DimensionService } from './../../../services/dimension.service';

interface Project {
  name: string;
  tag: string;
  summary: string;
  btnLink: string;
  imageSrc: string;
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  standalone: true,
  imports: [
    RouterLink,
  ],
})

export class ProjectsComponent {

  constructor(
    public dimensionService: DimensionService) { }

  public projects: Project[] = [
    {
      name: 'Сватбени фотосесии',
      tag: 'Сватби',
      summary: 'Заснемане на сватби — церемония, ресторант, първи танц. Естествени кадри и емоционални моменти от вашия специален ден.',
      btnLink: 'galerii/svatbi',
      imageSrc: 'assets/img/card-covers/weddings.webp',
    },
    {
      name: 'Абитуриентски фотосесии',
      tag: 'Абитуриенти',
      summary: 'Фотограф за абитуриентски бал. Индивидуални и групови фотосесии, които превръщат завършването във вечен спомен.',
      btnLink: 'galerii/abiturienti',
      imageSrc: 'assets/img/card-covers/graduates.webp',
    },
    {
      name: 'Лични и портретни фотосесии',
      tag: 'Лични',
      summary: 'Лични фотосесии — на открито или в студио. Стилни кадри за социални мрежи, портфолио или подарък за близък човек.',
      btnLink: 'galerii/lichni',
      imageSrc: 'assets/img/card-covers/personal.webp',
    },
  ];

}
