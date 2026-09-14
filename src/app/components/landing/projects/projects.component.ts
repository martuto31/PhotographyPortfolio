import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DimensionService } from './../../../services/dimension.service';

interface Project {
  name: string;
  tag: string;
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
      btnLink: 'galerii/svatbi',
      imageSrc: 'assets/img/card-covers/weddings.webp',
    },
    {
      name: 'Абитуриентски фотосесии',
      tag: 'Абитуриенти',
      btnLink: 'galerii/abiturienti',
      imageSrc: 'assets/img/card-covers/graduates.webp',
    },
    {
      name: 'Други събития',
      tag: 'Други',
      btnLink: 'galerii/lichni',
      imageSrc: 'assets/img/card-covers/personal.webp',
    },
  ];

}
