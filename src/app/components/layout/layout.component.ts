import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavigationComponent } from './navigation/navigation.component';

import { DimensionService } from './../../services/dimension.service';
import { LandingComponent } from '../landing/landing.component';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  standalone: true,
  imports: [
    RouterOutlet,
    NavigationComponent,
    LandingComponent,
  ],
})

export class LayoutComponent {

    constructor(
        public dimensionService: DimensionService) { }

}
