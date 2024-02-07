import { Component } from '@angular/core';

import { NavigationComponent } from './navigation/navigation.component';

import { DimensionService } from './../../services/dimension.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  templateUrl: './app-layout.component.html',
  styleUrls: ['./app-layout.component.css'],
  imports: [
    NavigationComponent,
  ],
})
export class LayoutComponent {

    constructor(
        public dimensionService: DimensionService) { }

}
