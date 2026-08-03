import { Component, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { CONTACT } from './../../../../content/contact';

@Component({
  selector: 'app-navigation-mobile',
  templateUrl: './navigation-mobile.component.html',
  styleUrls: ['./navigation-mobile.component.css'],
  standalone: true,
  imports: [
    RouterLink,
  ],
  animations: [
    trigger('slideInOut', [
      state('void', style({ transform: 'translateX(100%)' })),
      state('*', style({ transform: 'translateX(0)' })),
      transition(':enter', [
        animate('300ms ease-in-out'),
      ]),
      transition(':leave', [
        animate('300ms ease-in-out', style({ transform: 'translateX(100%)' })),
      ]),
    ]),
  ],
})

export class NavigationMobileComponent implements OnDestroy {

  constructor(
    @Inject(DOCUMENT) private dom: Document,
    @Inject(PLATFORM_ID) private platformId: object) { }

  public readonly contact = CONTACT;

  public isExpanderOpen = false;

  // Scroll offset captured when the menu opened, restored when it closes.
  private lockedScrollY = 0;

  public ngOnDestroy(): void {
    // A route change can tear this down mid-open; without this the page would be
    // left position:fixed and unscrollable.
    if (this.isExpanderOpen) {
      this.unlockScroll();
    }
  }

  public toggleMenu(): void {
    this.isExpanderOpen = !this.isExpanderOpen;

    if (this.isExpanderOpen) {
      this.lockScroll();
    } else {
      this.unlockScroll();
    }
  }

  // Called by every link inside the panel: navigate and close in one tap.
  public closeMenu(): void {
    if (this.isExpanderOpen) {
      this.toggleMenu();
    }
  }

  // position:fixed on <body> is the only lock that reliably holds on iOS Safari.
  // It collapses the page to the top, so the offset is stashed and re-applied.
  private lockScroll(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.lockedScrollY = window.scrollY;

    const body = this.dom.body;
    body.style.position = 'fixed';
    body.style.top = `-${this.lockedScrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
  }

  private unlockScroll(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const body = this.dom.body;
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';

    window.scrollTo(0, this.lockedScrollY);
  }

}
