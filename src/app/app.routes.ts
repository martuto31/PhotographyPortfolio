import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/landing/landing.component').then(c => c.LandingComponent),
        // Kept under 60 characters — the previous 72-character title was being
        // truncated mid-phrase in search results.
        title: 'Сватбен фотограф София и Видин | Виктория Борисова',
    },

    // Bulgarian (canonical) gallery routes.
    // The bare 'galerii' index must be declared before 'galerii/:galleryType',
    // otherwise the parameterised route would never see it — the router takes the
    // first match in declaration order.
    {
        path: 'galerii',
        loadComponent: () => import('./components/galleries-index/galleries-index.component').then(c => c.GalleriesIndexComponent),
        title: 'Галерия - сватби, абитуриенти, събития | phbyviki',
    },
    {
        path: 'galerii/:galleryType',
        loadComponent: () => import('./components/galleries-cards/galleries-cards.component').then(c => c.GalleriesCardsComponent),
        // No static title: GalleriesCardsComponent builds it per category from
        // SERVICE_TITLES. Angular's TitleStrategy only overrides when a route
        // declares one, so leaving it off hands ownership to the component.
    },
    {
        path: 'kontakti',
        loadComponent: () => import('./components/contact-page/contact-page.component').then(c => c.ContactPageComponent),
        title: 'Контакти - фотограф София и Видин | phbyviki',
    },
    // Canonical gallery URL: /galeriya/<slug>/<gallery name>. Two real segments, so the
    // path contains a proper slash instead of an encoded %2F.
    // No static `title` on the single-gallery routes: the title depends on the URL (the
    // couple's name), so SEOService builds it. Angular's TitleStrategy only overrides when a
    // route declares a title, so leaving it off hands ownership to the service.
    {
        path: 'galeriya/:galleryType/:galleryName',
        loadComponent: () => import('./components/gallery/gallery.component').then(c => c.GalleryComponent),
    },
    // Legacy single-segment form (".../galeriya/svatbi%2FНатали и Валентин") — the
    // component splits the slug out of galleryName itself.
    {
        path: 'galeriya/:galleryName',
        loadComponent: () => import('./components/gallery/gallery.component').then(c => c.GalleryComponent),
    },

    // Legacy English routes — kept and redirected for backwards compatibility / SEO continuity
    { path: 'galleries/Weddings', redirectTo: 'galerii/svatbi', pathMatch: 'full' },
    { path: 'galleries/Graduates', redirectTo: 'galerii/abiturienti', pathMatch: 'full' },
    { path: 'galleries/Personal', redirectTo: 'galerii/lichni', pathMatch: 'full' },
    { path: 'gallery/Personal', redirectTo: 'galerii/lichni', pathMatch: 'full' },
    {
        path: 'galleries/:galleryType',
        loadComponent: () => import('./components/galleries-cards/galleries-cards.component').then(c => c.GalleriesCardsComponent),
        title: 'Галерия | Виктория Борисова',
    },
    {
        path: 'gallery/:galleryName',
        loadComponent: () => import('./components/gallery/gallery.component').then(c => c.GalleryComponent),
    },

    {
        path: 'about-me',
        loadComponent: () => import('./components/about-me/about-me.component').then(c => c.AboutMeComponent),
        title: 'За мен | Виктория Борисова - Фотограф София и Видин',
    },

    // Legal. Both are the same component; `data.doc` picks the document, so the two
    // keep clean Bulgarian URLs instead of sharing a /legal/* prefix.
    {
        path: 'poveritelnost',
        loadComponent: () => import('./components/legal-page/legal-page.component').then(c => c.LegalPageComponent),
        data: { doc: 'poveritelnost' },
        title: 'Политика за поверителност | phbyviki',
    },
    {
        path: 'usloviya',
        loadComponent: () => import('./components/legal-page/legal-page.component').then(c => c.LegalPageComponent),
        data: { doc: 'usloviya' },
        title: 'Общи условия за ползване | phbyviki',
    },

    // Catch-all. Without it, unmatched URLs rendered an empty body under a 200 — a soft 404.
    // Unknown top-level paths get a real 404 status from Firebase (see the scoped rewrites in
    // firebase.json); this handles the ones that fall inside a valid prefix.
    {
        path: '**',
        loadComponent: () => import('./components/not-found/not-found.component').then(c => c.NotFoundComponent),
        title: 'Страницата не е намерена | Виктория Борисова',
    },
];
