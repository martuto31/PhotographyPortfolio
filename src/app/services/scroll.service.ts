import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

// Smooth-scrolls to a section that lives on the home page (e.g. 'projects',
// 'contact-me'). Used by the hero buttons, nav and footer.
//
// We scroll directly instead of going through the router with a `scrollTo`
// navigation state: a same-URL navigation fights `scrollPositionRestoration`
// (which jumps back to the top) and races the route subscription on cross-page
// clicks. Driving the scroll ourselves sidesteps both.
@Injectable({ providedIn: 'root' })
export class ScrollService {

  // Offset for the fixed header so the section isn't hidden underneath it.
  private static readonly HEADER_OFFSET = 90;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object) { }

  public scrollToSection(id: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const onHome = this.router.url.split(/[?#]/)[0] === '/';
    if (onHome) {
      this.tryScroll(id);
    } else {
      // Navigate home first; the target sections only exist there.
      this.router.navigateByUrl('/').then(() => this.tryScroll(id));
    }
  }

  // Home-page sections are lazily rendered via @defer, so retry briefly until
  // the element is in the DOM, then smooth-scroll to it.
  private tryScroll(id: string, attempts = 0): void {
    const element = document.getElementById(id);

    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - ScrollService.HEADER_OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
    } else if (attempts < 30) {
      setTimeout(() => this.tryScroll(id, attempts + 1), 50);
    }
  }

}
