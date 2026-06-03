import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DimensionService } from './../../../services/dimension.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [
    RouterLink,
  ],
})

export class FooterComponent {

  constructor(public dimensionsService: DimensionService) { }

}
