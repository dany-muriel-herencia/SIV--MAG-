import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  // Contador de requests activos
  private _activeRequests = signal(0);

  // Derivado — true si hay al menos un request activo
  readonly isLoading = computed(() => this._activeRequests() > 0);

  // Método para mostrar el loading
  show(): void {
    this._activeRequests.update(count => count + 1);
  }

  // Método para ocultar el loading
  hide(): void {
    this._activeRequests.update(count => Math.max(0, count - 1));
  }
}