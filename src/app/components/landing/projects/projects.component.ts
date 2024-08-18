import { Component } from '@angular/core';

import { DimensionService } from './../../../services/dimension.service';

interface Project {
  name: string;
  summary: string;
  btnLink: string;
  imageSrc: string;
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css'],
  standalone: true,
})

export class ProjectsComponent {

  constructor(
    public dimensionService: DimensionService) { }

  public projects: Project[] = [
    {
      name: 'Сватбени фотосесии',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
      btnLink: '',
      imageSrc: 'assets/img/card-covers/weddings.png',
    },
    {
      name: 'Абитуриентски фотосесии',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
      btnLink: '',
      imageSrc: 'assets/img/card-covers/graduates.webp',
    },
    {
      name: 'Персонални фотосесии',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
      btnLink: '',
      imageSrc: 'assets/img/card-covers/personal.webp',
    },
  ];

}
