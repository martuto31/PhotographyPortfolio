import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
      summary: 'Моята мисия е да уловя красиви и вълшебни моменти на влюбените хора и да допринеса за тяхното незабравимо изживяване.',
      btnLink: 'galleries/wedding',
      imageSrc: 'assets/img/card-covers/weddings.webp',
    },
    {
      name: 'Абитуриентски фотосесии',
      summary: 'Заснемането на изображение и замразяването на момента разкрива колко богата е действителността',
      btnLink: 'galleries/graduates',
      imageSrc: 'assets/img/card-covers/graduates.webp',
    },
    {
      name: 'Персонални фотосесии',
      summary: 'Фотографията няма правила, тя не е спорт. Важен е резултатът, независимо как е постигнат затова се старая да покрия и надмина вашите очаквания.',
      // btnLink: 'galleries/personal',
      btnLink: 'gallery/Personal',
      imageSrc: 'assets/img/card-covers/personal.webp',
    },
  ];

}
