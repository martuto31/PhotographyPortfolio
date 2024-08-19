import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/landing/landing.component').then(c => c.LandingComponent),
        title: '',
    },
    {
        path: 'gallery/wedding',
        loadComponent: () => import('./components/wedding-galleries/wedding-galleries.component').then(c => c.WeddingGalleriesComponent),
        title: '',
    },
];
