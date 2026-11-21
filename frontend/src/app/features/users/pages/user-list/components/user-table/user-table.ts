import { Component, input, output } from '@angular/core';
import { User, UserRole } from '../../../../models/user.model';
import { BadgeComponent } from '../../../../../../shared/components/badge/badge';

const USER_ROLE_BADGE = {
  [UserRole.ADMIN]: {
    label: 'Administrador',
    class: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  [UserRole.CAJERO]: {
    label: 'Cajero',
    class: 'bg-sky-100 text-sky-800 border-sky-200',
  },
};

@Component({
  selector: 'app-user-table',
  imports: [BadgeComponent],
  templateUrl: './user-table.html',
})
export class UserTable {
  readonly users = input.required<User[]>();
  readonly isRefetching = input<boolean>();
  readonly isAdmin = input<boolean>(false);

  readonly openUser = output<string>();
  readonly editUser = output<string>();
  readonly toggleActive = output<string>();

  readonly UserRole = UserRole;

  onToggleActive(id: string, event: Event): void {
    event.stopPropagation();
    this.toggleActive.emit(id);
  }

  openUserDetail(id: string) {
    this.openUser.emit(id);
  }

  onEditUser(id: string, event: Event) {
    event.stopPropagation();
    this.editUser.emit(id);
  }

  getUserRoleBadgeConfig(role: UserRole) {
    return (
      USER_ROLE_BADGE[role] ?? {
        label: 'Desconocido',
        class: 'bg-slate-100 text-slate-600',
      }
    );
  }
}
