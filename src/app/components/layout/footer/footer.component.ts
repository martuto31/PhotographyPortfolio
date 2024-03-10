import { Component } from '@angular/core';

import { FooterDesktopComponent } from './footer-desktop/footer-desktop.component';

import { DimensionService } from './../../../services/dimension.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  standalone: true,
  imports: [
    FooterDesktopComponent,
  ],
})

export class FooterComponent {

  constructor(public dimensionsService: DimensionService) { }

}
