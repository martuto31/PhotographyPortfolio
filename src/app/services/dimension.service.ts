import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { Subject } from 'rxjs';

enum ScreenType {
  Desktop = 'desktop',
  Tablet = 'tablet',
  Mobile = 'mobile',
}

@Injectable({
  providedIn: 'root',
})

export class DimensionService {

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.screenType = this.getScreenType();
    this.isMobile = this.screenType === ScreenType.Mobile;
    this.isTablet = this.screenType === ScreenType.Tablet;
    this.isDesktop = this.screenType === ScreenType.Desktop;

    if (isPlatformBrowser(this.platformId)) {
      this.subscribeToWindowResize();
    }
  }

  public windowResize = new Subject<void>();

  public screenType: ScreenType;
  public isMobile: boolean;
  public isTablet: boolean;
  public isDesktop: boolean

  private tabletBreakpoint = 960;
  private mobileBreakpoint = 480;

  // addEventListener rather than `window.onresize =`, which is a single slot:
  // any other code assigning it would silently replace this handler and freeze
  // the layout at whatever breakpoint it was on.
  private subscribeToWindowResize(): void {
    window.addEventListener('resize', () => {
      this.windowResize.next();
      this.screenType = this.getScreenType();

      this.isMobile = this.screenType === ScreenType.Mobile;
      this.isTablet = this.screenType === ScreenType.Tablet;
      this.isDesktop = this.screenType === ScreenType.Desktop;
    });
  }

  private getScreenType(): ScreenType {
    // During SSR / prerender there is no window — default to desktop layout.
    if (!isPlatformBrowser(this.platformId)) {
      return ScreenType.Desktop;
    }

    const innerWidth = window.innerWidth;

    if (innerWidth <= this.tabletBreakpoint) {
        if (innerWidth <= this.mobileBreakpoint) {
            return ScreenType.Mobile;
        } else {
            return ScreenType.Tablet;
        }
    } else {
        return ScreenType.Desktop;
    }
  }

}
