// src/app/layout/sidebar/sidebar.component.ts
import {
  Component,
  input,
  inject,
  computed,
  signal
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: ('Admin' | 'Cajero')[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  readonly auth = inject(AuthService);

  // Input con la nueva API de Angular 22
  collapsed = input(false);

  readonly navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi-home',
      route: '/dashboard',
      roles: ['Admin', 'Cajero']
    },
    {
      label: 'Ventas',
      icon: 'pi-shopping-cart',
      route: '/sales',
      roles: ['Admin', 'Cajero']
    },
    {
      label: 'Clientes',
      icon: 'pi-users',
      route: '/customers',
      roles: ['Admin', 'Cajero']
    },
    {
      label: 'Mi Turno',
      icon: 'pi-clock',
      route: '/cash-register',
      roles: ['Admin', 'Cajero']
    },
    {
      label: 'Productos',
      icon: 'pi-box',
      route: '/products',
      roles: ['Admin', 'Cajero']
    },
    {
      label: 'Categorias',
      icon: 'pi-list',
      route: '/categories',
      roles: ['Admin', 'Cajero']
    },
    {
      label: 'Compras',
      icon: 'pi-truck',
      route: '/purchases',
      roles: ['Admin']
    },
    {
      label: 'Proveedores',
      icon: 'pi-briefcase', 
      route: '/suppliers',
      roles: ['Admin']
    },
    {
      label: 'Stock',
      icon: 'pi-chart-bar',
      route: '/stock',
      roles: ['Admin']
    },
    {
      label: 'Usuarios',
      icon: 'pi-user-edit',
      route: '/users',
      roles: ['Admin']
    },
    {
      label: 'Reportes',
      icon: 'pi-chart-pie',
      route: '/reports',
      roles: ['Admin']
    },
    {
      label: 'Alertas',
      icon: 'pi-bell',
      route: '/alerts',
      roles: ['Admin']
    }
  ];

  // Solo muestra los items del rol actual
  visibleItems = computed(() => {
    const role = this.auth.userRole();
    if (!role) return [];
    return this.navItems.filter(item => item.roles.includes(role));
  });
}