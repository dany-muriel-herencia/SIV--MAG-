import {
  Component,
  ElementRef,
  HostListener,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-autocomplete-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="relative flex flex-col gap-1 w-full">
      @if (label()) {
        <label class="text-xs font-semibold text-slate-600">{{ label() }}</label>
      }

      <div class="relative">
        <i
          class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"
          [class]="icon()"
        ></i>

        <input
          type="text"
          [ngModel]="inputText()"
          (ngModelChange)="onInputChange($event)"
          (focus)="onFocus()"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          class="w-full pl-8 pr-8 h-9 text-xs font-medium bg-slate-50 border border-slate-200/80
                 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10
                 focus:border-slate-400 text-slate-700 transition-all disabled:opacity-50"
        />

        <div class="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
          @if (isSearching()) {
            <i class="pi pi-spin pi-spinner text-slate-400 text-xs"></i>
          } @else if (selectedValue() || inputText()) {
            <button
              type="button"
              (click)="clear($event)"
              class="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <i class="pi pi-times text-[10px]"></i>
            </button>
          } @else {
            <i class="pi pi-chevron-down text-slate-400 text-[10px] pointer-events-none"></i>
          }
        </div>

        <!-- Lista Desplegable Compacta -->
        @if (isOpen()) {
          <div
            class="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200/80 rounded-xl
                   shadow-lg overflow-hidden max-h-52 overflow-y-auto z-50 divide-y divide-slate-50"
          >
            @if (results().length > 0) {
              @for (item of results(); track trackByFn(item)) {
                <button
                  type="button"
                  (click)="select(item)"
                  class="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-50
                         transition-colors text-left text-xs cursor-pointer"
                >
                  <span class="font-medium text-slate-700 truncate">{{ getLabel(item) }}</span>
                  @if (isSelected(item)) {
                    <i class="pi pi-check text-primary text-[10px]"></i>
                  }
                </button>
              }
            } @else if (!isSearching()) {
              <div class="px-3 py-2 text-xs text-slate-400 italic">Sin resultados</div>
            }
          </div>
        }
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteInputComponent),
      multi: true,
    },
  ],
})
export class AutocompleteInputComponent<T extends object> implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly placeholder = input<string>('Buscar...');
  readonly icon = input<string>('pi pi-search');
  readonly labelKey = input.required<keyof T>();
  readonly trackByKey = input<keyof T>('id' as keyof T);
  readonly results = input<T[]>([]);
  readonly isSearching = input<boolean>(false);

  readonly queryChange = output<string>();

  protected readonly selectedValue = signal<T | null>(null);
  protected readonly inputText = signal<string>('');
  protected readonly isOpen = signal<boolean>(false);
  protected readonly isDisabled = signal<boolean>(false);

  private onChange: (value: T | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private readonly elementRef: ElementRef) {}

  protected onInputChange(text: string): void {
    this.inputText.set(text);
    this.queryChange.emit(text);
    this.isOpen.set(text.trim().length >= 1);
    if (!text.trim()) {
      this.selectedValue.set(null);
      this.onChange(null);
    }
  }

  protected onFocus(): void {
    if (this.inputText().trim().length >= 1) this.isOpen.set(true);
  }

  protected select(item: T): void {
    this.selectedValue.set(item);
    this.inputText.set(this.getLabel(item));
    this.isOpen.set(false);
    this.onChange(item);
    this.onTouched();
  }

  protected clear(event: MouseEvent): void {
    event.stopPropagation();
    this.selectedValue.set(null);
    this.inputText.set('');
    this.queryChange.emit('');
    this.isOpen.set(false);
    this.onChange(null);
    this.onTouched();
  }

  protected getLabel(item: T): string {
    return String(item[this.labelKey()]);
  }

  protected trackByFn(item: T): unknown {
    return item[this.trackByKey()];
  }

  protected isSelected(item: T): boolean {
    const sel = this.selectedValue();
    return sel ? this.trackByFn(sel) === this.trackByFn(item) : false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  writeValue(obj: T | null): void {
    this.selectedValue.set(obj);
    this.inputText.set(obj ? this.getLabel(obj) : '');
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }
}