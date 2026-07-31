import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/landing/landing.component').then(c => c.LandingComponent),
        title: 'Сватбен и Събитиен Фотограф София и Видин | Виктория Борисова — phbyviki',
    },

    // Bulgarian (canonical) gallery routes
    {
        path: 'galerii/:galleryType',
        loadComponent: () => import('./components/galleries-cards/galleries-cards.component').then(c => c.GalleriesCardsComponent),
        title: 'Галерия | Сватби, Абитуриенти, Кръщенета | Виктория Борисова',
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
        title: 'За мен | Виктория Борисова — Фотограф София и Видин',
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
