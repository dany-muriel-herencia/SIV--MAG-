import { Component, input, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-selector',
  standalone: true,
  imports: [], // 💡 Eliminado FormsModule ya que no usamos ngModel en este componente
  template: `
    <div class="relative flex flex-col gap-1.5 min-w-[200px]">
      @if (title()) {
        <label class="text-xs font-semibold text-slate-500">{{ title() }}</label>
      }

      <div class="relative">
        <div class="relative">
          <i
            class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
            [class]="icon()"
          ></i>

          <!-- Input estático que actúa como botón de apertura -->
          <input
            type="text"
            readonly
            [value]="value() ? getDisplayLabel(value()!) : ''"
            (click)="isOpen.set(!isOpen())"
            [placeholder]="placeholder()"
            class="w-full pl-8 pr-8 py-2 text-xs font-medium bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 text-slate-700 cursor-pointer select-none transition-all"
          />

          <i class="pi pi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none"></i>
        </div>

        <!-- Menú Desplegable -->
        @if (isOpen() && options().length > 0) {
          <!-- Fondo invisible para cerrar el menú al hacer clic fuera -->
          <div class="fixed inset-0 z-40" (click)="isOpen.set(false)"></div>

          <div class="absolute left-0 right-0 mt-1 bg-white border border-slate-200/80 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-1 duration-100">
            <!-- Opción para limpiar la selección -->
            <button
              type="button"
              (click)="clearSelection()"
              class="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 transition-colors text-left text-xs font-medium text-slate-400 border-b border-slate-100"
            >
              {{ placeholder() }}
            </button>

            <!-- Opciones Dinámicas -->
            @for (item of options(); track trackByFn(item)) {
              @let isSelected = value() && trackByFn(value()!) === trackByFn(item);
              
              <button
                type="button"
                (click)="selectItem(item)"
                class="w-full flex items-center justify-between gap-2 px-3 py-2 hover:bg-slate-50 transition-colors text-left text-xs"
                [class.bg-slate-50]="isSelected"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <i class="text-slate-400 text-[10px]" [class]="icon()"></i>
                  <span class="font-medium text-slate-600 truncate" [class.font-semibold]="isSelected">
                    {{ getDisplayLabel(item) }}
                  </span>
                </div>

                @if (isSelected) {
                  <i class="pi pi-check text-blue-500 text-[10px]"></i>
                }
              </button>
            }
          </div>
        }
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectorComponent),
      multi: true,
    },
  ],
})
export class SelectorComponent<T> implements ControlValueAccessor {
  // --- Configuración Visual ---
  readonly title = input<string>('');
  readonly placeholder = input<string>('Seleccionar...');
  readonly icon = input<string>('pi pi-filter');
  readonly disabled = input<boolean>(false);

  // --- Propiedades de Acceso ---
  readonly labelKey = input.required<keyof T>(); // que se muestra en el select, por ejemplo: 'name', 'description', etc
  readonly trackByKey = input<keyof T>('id' as keyof T); // lo mismo que el anterior pero para el track by function, por defecto es 'id'

  // --- Datos de entrada ---
  readonly options = input<T[]>([]); // 💡 Renombrado de 'results' a 'options' (más semántico)

  // --- Estado Interno ---
  protected readonly value = signal<T | null>(null);
  protected readonly isOpen = signal<boolean>(false);

  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  // --- Métodos de Ayuda ---
  protected getDisplayLabel(item: T): string {
    return String(item[this.labelKey()]);
  }

  protected trackByFn(item: T): any {
    return item[this.trackByKey()];
  }

  // --- Acciones de Selección ---
  protected selectItem(item: T): void {
    this.value.set(item);
    this.onChange(item);
    this.onTouched();
    this.isOpen.set(false);
  }

  protected clearSelection(): void {
    this.value.set(null);
    this.onChange(null);
    this.onTouched();
    this.isOpen.set(false);
  }

  // --- ControlValueAccessor ---
  writeValue(obj: T | null): void { this.value.set(obj); }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
}
