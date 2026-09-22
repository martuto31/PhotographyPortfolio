import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_IMAGE_BASE_URL } from './../../../config';
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
      imageSrc: `${SITE_IMAGE_BASE_URL}/card-covers/weddings.webp`,
    },
    {
      name: 'Абитуриентски фотосесии',
      tag: 'Абитуриенти',
      btnLink: 'galerii/abiturienti',
      imageSrc: `${SITE_IMAGE_BASE_URL}/card-covers/graduates.webp`,
    },
    {
      name: 'Други събития',
      tag: 'Други',
      btnLink: 'galerii/lichni',
      imageSrc: `${SITE_IMAGE_BASE_URL}/card-covers/personal.webp`,
    },
  ];

}
