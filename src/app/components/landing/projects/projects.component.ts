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
      summary: 'Заснемане на сватби — подготовка на булка и младоженец, церемония по граждански и църковен брак, фотосесия, ресторант. Създавам естествени кадри и емоционални моменти от вашия специален ден.',
      btnLink: 'galerii/svatbi',
      imageSrc: 'assets/img/card-covers/weddings.webp',
    },
    {
      name: 'Абитуриентски фотосесии',
      tag: 'Абитуриенти',
      summary: 'Заснемам индивидуални и групови фотосесии, които превръщат завършването във вечен спомен.',
      btnLink: 'galerii/abiturienti',
      imageSrc: 'assets/img/card-covers/graduates.webp',
    },
    {
      name: 'Други събития',
      tag: 'Други',
      summary: 'Обичам да улавям емоцията на вашите събития и да я превръщам в красив спомен. Независимо дали планирате кръщене, рожден ден, лична портретна сесия или имате съвсем различна идея — ще се радвам да я осъществим заедно.',
      btnLink: 'galerii/lichni',
      imageSrc: 'assets/img/card-covers/personal.webp',
    },
  ];

}
