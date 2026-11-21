import { UserRole } from "../../features/users/models/user.model";


export interface SegmentedOption<T> {
  label: string;
  value: T;
  icon?: string; // Ej: 'pi pi-shield', 'pi pi-user' (Opcional)
  count?: number; // Contador opcional (Ej: 16, 5)
  activeClass?: string; // Color personalizado cuando está seleccionado (Opcional)
}

export const statusOptions: SegmentedOption<boolean | undefined>[] = [
  { label: 'Todos', value: undefined },
  {
    label: 'Activos',
    value: true,
    icon: 'pi pi-circle-fill text-emerald-500',
    activeClass: 'text-emerald-700 border-emerald-200',
  },
  {
    label: 'Inactivos',
    value: false,
    icon: 'pi pi-circle-fill text-rose-500',
    activeClass: 'text-rose-700 border-rose-200',
  },
];

export const roleOptions: SegmentedOption<UserRole | undefined>[] = [
  { label: 'Todos los roles', value: undefined },
  {
    label: 'Admins',
    value: UserRole.ADMIN,
    icon: 'pi pi-shield text-indigo-500',
    activeClass: 'text-indigo-700 border-indigo-200',
  },
  {
    label: 'Cajeros',
    value: UserRole.CAJERO,
    icon: 'pi pi-user text-sky-500',
    activeClass: 'text-sky-700 border-sky-200',
  },
];
