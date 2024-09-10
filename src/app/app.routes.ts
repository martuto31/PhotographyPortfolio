import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/landing/landing.component').then(c => c.LandingComponent),
        title: '',
    },
    // TODO: Make galleries/:type instead
    {
        path: 'galleries/wedding',
        loadComponent: () => import('./components/galleries-cards/galleries-cards.component').then(c => c.GalleriesCardsComponent),
        title: '',
        data: { galleryType: 'Weddings' },
    },
    {
        path: 'galleries/graduates',
        loadComponent: () => import('./components/galleries-cards/galleries-cards.component').then(c => c.GalleriesCardsComponent),
        title: '',
        data: { galleryType: 'Graduates' },
    },
    {
        path: 'galleries/personal',
        loadComponent: () => import('./components/galleries-cards/galleries-cards.component').then(c => c.GalleriesCardsComponent),
        title: '',
        data: { galleryType: 'Personal' },
    },
    {
        path: 'gallery/:galleryName',
        loadComponent: () => import('./components/gallery/gallery.component').then(c => c.GalleryComponent),
        title: '',
    },
];
