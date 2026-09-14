import { Component, HostBinding, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';

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

export class NavigationComponent implements OnInit, OnDestroy {

  constructor(
    public dimensionsService: DimensionService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object) { }

  // Transparent over the hero photograph, solid once the page scrolls past it or
  // when the route has no hero at all. Resolved to a single class here rather than
  // combining two :host-context() selectors in CSS, which cannot express "and".
  @HostBinding('class.transparent') public isTransparent = true;

  private isHome = true;
  private routerSubscription?: Subscription;
  private scrollHandler?: () => void;

  // Roughly the point where the hero's dark lower gradient ends. Past it the bar
  // would be sitting on unpredictable photography, so it commits to solid.
  private static readonly SOLID_AFTER_PX = 120;

  public ngOnInit(): void {
    // In the browser the router's url is still "/" until the initial navigation
    // completes, which on a lazy route can be a second or more after hydration.
    // Reading the address bar instead keeps an inner page's bar solid from the
    // first paint - on paper, a transparent bar with white text is invisible.
    this.isHome = this.isHomeUrl(isPlatformBrowser(this.platformId) ? window.location.pathname : this.router.url);

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isHome = this.isHomeUrl(event.urlAfterRedirects);
        this.updateTransparency();
      }
    });

    if (!isPlatformBrowser(this.platformId)) {
      // Prerender: no scroll position, so render the state the visitor sees first.
      this.isTransparent = this.isHome;
      return;
    }

    this.scrollHandler = () => this.updateTransparency();
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    this.updateTransparency();
  }

  public ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();

    if (this.scrollHandler && isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }

  private updateTransparency(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.isTransparent = this.isHome;
      return;
    }

    this.isTransparent = this.isHome && window.scrollY < NavigationComponent.SOLID_AFTER_PX;
  }

  private isHomeUrl(url: string): boolean {
    return url.split(/[?#]/)[0] === '/';
  }

}
