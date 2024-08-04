import { Component } from '@angular/core';

import { DimensionService } from './../../../services/dimension.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
})

export class FooterComponent {

  constructor(public dimensionsService: DimensionService) { }

}
