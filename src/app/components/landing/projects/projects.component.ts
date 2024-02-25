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
      name: 'Сватби',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
      btnLink: '',
      imageSrc: 'assets/img/Project.png',
    },
    {
      name: 'Кръщенета',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
      btnLink: '',
      imageSrc: 'assets/img/Project.png',
    },
    {
      name: 'Детски партита',
      summary: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
      btnLink: '',
      imageSrc: 'assets/img/Project.png',
    },
  ];

}
