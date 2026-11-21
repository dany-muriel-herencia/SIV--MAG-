import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const REPORTS_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/reports').then((m) => m.ReportsComponent),
        canActivate: [roleGuard],
        data: { roles: ['Admin'] },
    },
];