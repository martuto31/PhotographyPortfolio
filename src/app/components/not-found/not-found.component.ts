import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css'],
  standalone: true,
  imports: [
    RouterLink,
  ],
})

// Catch-all for URLs that reach the SPA but match no route (e.g. /galerii/nesushtestvuvasht).
// SEOService already emits noindex + a prerender-status-code for unknown route keys, so this
// component only has to render something useful and route the visitor back into the site.
export class NotFoundComponent { }
