import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TESTIMONIALS } from './../../../content/testimonials';

// Client testimonials.
//
// Renders nothing while the list is empty, so it is safe to ship before Viktoria
// has collected any — see src/app/content/testimonials.ts for how to add them and
// why nothing is pre-filled here.
//
// Deliberately carries no Review or AggregateRating markup. Google stopped showing
// review rich results for a business's own site in 2019 (self-serving reviews), so
// the schema would buy no stars while making fabricated entries a policy problem.
// Stars in search come from the Google Business Profile; this block is for the
// person already reading the page.
@Component({
  selector: 'app-testimonials',
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css'],
  standalone: true,
  imports: [
    RouterLink,
  ],
})

export class TestimonialsComponent {

  public readonly testimonials = TESTIMONIALS;

  // '<slug>/<gallery name>' -> the router link segments for that gallery.
  public galleryLink(gallery: string): string[] {
    const separator = gallery.indexOf('/');
    if (separator === -1) {
      return ['/galerii'];
    }

    return ['/galeriya', gallery.slice(0, separator), gallery.slice(separator + 1)];
  }

}
