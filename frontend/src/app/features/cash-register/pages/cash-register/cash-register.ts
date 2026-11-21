import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import {
  CashRegisterResponse,
  CloseCashRegisterRequest,
  OpenCashRegisterRequest,
} from '../../models/cash-register.model';
import { CashOpenCard } from './components/cash-open-card/cash-open-card';
import { CashActiveShift } from './components/cash-active-shift/cash-active-shift';
import { CashClosedSummary } from './components/cash-closed-summary/cash-closed-summary';
import { CashHistoryTable } from './components/cash-history-table/cash-history-table';
import { extractErrorMessage } from '../../../../shared/utils/error';
import {
  useCurrentCashRegisterQuery,
  useHistoryQuery,
  useOpenCashRegisterMutation,
  useCloseCashRegisterMutation,
} from '../../queries/cash-register.queries';
import { SegmentedOption } from '../../../../shared/models/segmented-control.model';
import { SegmentedControlComponent } from '../../../../shared/components/segmented-control/segmented-control';

type CashRegisterTab = 'current-shift' | 'history';

@Component({
  selector: 'app-cash-register',
  imports: [
    CashOpenCard,
    CashActiveShift,
    CashClosedSummary,
    CashHistoryTable,
    SegmentedControlComponent,
  ],
  templateUrl: './cash-register.html',
})
export class CashRegister implements OnDestroy {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Rol e identidad
  protected readonly currentUser = this.authService.currentUser;
  protected readonly userRole = this.authService.userRole;
  private readonly userId = computed(() => this.currentUser()?.userId ?? '');

  // Navegación
  protected readonly activeTab = signal<CashRegisterTab>('current-shift');
  // Opciones computadas para el SegmentedControl de pestañas
  protected readonly tabOptions = computed<SegmentedOption<CashRegisterTab>[]>(() => [
    {
      label: 'Turno Actual',
      value: 'current-shift',
      icon: 'pi pi-clock',
    },
    {
      label: this.userRole() === 'Admin' ? 'Historial General' : 'Mi Historial',
      value: 'history',
      icon: 'pi pi-history',
    },
  ]);

  private readonly historyFilters = computed(() =>
    this.userRole() === 'Admin' ? {} : { userId: this.userId() },
  );

  // Queries
  private readonly currentSessionQuery = useCurrentCashRegisterQuery();
  private readonly historyQuery = useHistoryQuery(this.historyFilters);

  protected readonly session = computed(() => this.currentSessionQuery.data() ?? null);
  protected readonly historyRecords = computed(() => this.historyQuery.data()?.items ?? []);

  // Control para mostrar el resumen de cierre inmediatamente tras finalizar
  protected readonly lastClosedSession = signal<CashRegisterResponse | null>(null);

  // Turno activo actualmente en curso
  protected readonly activeShift = computed(() => {
    const s = this.session();
    return s?.isOpen ? s : null;
  });

  // Estados de carga
  protected readonly isLoadingSession = computed(() => this.currentSessionQuery.isLoading());
  protected readonly isLoadingHistory = computed(() => this.historyQuery.isLoading());
  protected readonly isFetching = computed(
    () => this.currentSessionQuery.isFetching() || this.historyQuery.isFetching(),
  );

  // Mutaciones
  private readonly openMutation = useOpenCashRegisterMutation();
  private readonly closeMutation = useCloseCashRegisterMutation();

  protected readonly isSubmitting = computed(
    () => this.openMutation.isPending() || this.closeMutation.isPending(),
  );

  protected readonly openError = computed(() =>
    extractErrorMessage(this.openMutation.error(), 'Error al abrir el turno de caja.'),
  );

  protected readonly closeError = computed(() =>
    extractErrorMessage(this.closeMutation.error(), 'Error al cerrar el turno de caja.'),
  );

  // Timer del Turno Activo
  protected readonly elapsedTime = signal('00h 00m');
  private elapsedInterval?: ReturnType<typeof setInterval>;

  constructor() {
    effect((onCleanup) => {
      const s = this.session();
      if (s?.isOpen && s?.openedAt) {
        this.startElapsedTimer(s.openedAt);
      } else {
        this.stopElapsedTimer();
      }
      onCleanup(() => this.stopElapsedTimer());
    });
  }

  // Handlers
  protected onTabChange(tab: CashRegisterTab): void {
    this.activeTab.set(tab);
  }

  protected refresh(): void {
    this.currentSessionQuery.refetch();
    this.historyQuery.refetch();
  }

  protected onOpen(dto: OpenCashRegisterRequest): void {
    this.lastClosedSession.set(null);
    this.openMutation.mutate(dto, {
      onSuccess: () => {
        this.lastClosedSession.set(null);
      },
    });
  }

  protected onClose(dto: CloseCashRegisterRequest): void {
    const current = this.session();
    if (!current) return;

    this.closeMutation.mutate(
      { id: current.id, dto },
      {
        onSuccess: (closedData) => {
          if (closedData) {
            this.lastClosedSession.set(closedData);
          }
        },
      },
    );
  }

  protected goToSales(): void {
    this.router.navigate(['/sales']);
  }

  protected onNewShift(): void {
    this.lastClosedSession.set(null);
    this.refresh();
  }

  // Timer helpers
  private startElapsedTimer(openedAt: string): void {
    this.stopElapsedTimer();

    const update = () => {
      const openedDate = new Date(openedAt);
      if (isNaN(openedDate.getTime())) {
        this.elapsedTime.set('00h 00m');
        return;
      }
      const diff = Math.max(0, Math.floor((Date.now() - openedDate.getTime()) / 1000));
      const hours = Math.floor(diff / 3600);
      const mins = Math.floor((diff % 3600) / 60);
      const hStr = hours < 10 ? `0${hours}` : `${hours}`;
      const mStr = mins < 10 ? `0${mins}` : `${mins}`;
      this.elapsedTime.set(`${hStr}h ${mStr}m`);
    };

    update();
    this.elapsedInterval = setInterval(update, 30_000);
  }

  private stopElapsedTimer(): void {
    if (this.elapsedInterval) {
      clearInterval(this.elapsedInterval);
      this.elapsedInterval = undefined;
    }
    this.elapsedTime.set('00h 00m');
  }

  ngOnDestroy(): void {
    this.stopElapsedTimer();
  }
}
