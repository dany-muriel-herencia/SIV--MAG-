import {
  Component,
  output,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

import { injectQuery } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { AlertsService } from '../../../features/alerts/services/alerts.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alertsService = inject(AlertsService);

  // Output con la nueva API
  toggleSidebar = output<void>();

  unreadCount = signal(0);
  showUserMenu = signal(false);

  readonly alertsQuery = injectQuery(() => ({
    queryKey: ['alerts', 'unread'],
    queryFn: () => firstValueFrom(this.alertsService.getUnread()),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 5, 
    refetchOnMount: true,
  }));  
  

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  navigateTo(route: string): void {
    this.showUserMenu.set(false);
    this.router.navigate([route]);
  }

  onLogout(): void {
    this.auth.logout().subscribe();
  }
}