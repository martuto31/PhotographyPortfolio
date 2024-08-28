import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { FooterComponent } from './footer/footer.component';
import { LandingComponent } from './../landing/landing.component';
import { NavigationComponent } from './navigation/navigation.component';

import { DimensionService } from './../../services/dimension.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    LandingComponent,
    NavigationComponent,
  ],
})

export class LayoutComponent {

    constructor(
        public dimensionService: DimensionService) { }

}
