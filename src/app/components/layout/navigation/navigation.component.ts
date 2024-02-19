import { Component } from '@angular/core';

import { NavigationMobileComponent } from './navigation-mobile/navigation-mobile.component';
import { NavigationDesktopComponent } from './navigation-desktop/navigation-desktop.component';

import { DimensionService } from './../../../services/dimension.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css'],
  standalone: true,
  imports: [
    NavigationMobileComponent,
    NavigationDesktopComponent,
  ],
})

export class NavigationComponent {

  constructor(public dimensionsService: DimensionService) { }

}
