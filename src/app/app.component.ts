import { Component } from '@angular/core';

import { LayoutComponent } from './components/layout/layout.component';

import { SEOService } from './services/seo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [
    LayoutComponent,
  ],
})

export class AppComponent {

  constructor(private seoService: SEOService) { }

}
