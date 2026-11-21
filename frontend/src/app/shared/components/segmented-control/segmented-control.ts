import { Component, computed, input, output } from '@angular/core';
import { SegmentedOption } from '../../models/segmented-control.model';

@Component({
  selector: 'app-segmented-control',
  templateUrl: './segmented-control.html',
})

export class SegmentedControlComponent<T> {
  // Valor seleccionado actualmente
  value = input<T>();

  // Arreglo de opciones que dibujará el control
  options = input.required<SegmentedOption<T>[]>();

  // Evento al cambiar de opción
  readonly valueChange = output<T>();

  protected selectOption(val: T): void {
    if (this.value() !== val) {
      this.valueChange.emit(val);
    }
  }

  // Genera las clases dinámicas según la opción activa
  protected getItemClasses(option: SegmentedOption<T>): string {
    const isActive = this.value() === option.value;
    
    if (isActive) {
      // Si la opción trae un color personalizado (ej: emerald, indigo, rose), lo usa.
      // Si no, usa el color por defecto (slate).
      const customColor = option.activeClass ?? 'text-slate-900 border-slate-200/80';
      return `bg-white shadow-sm font-semibold border ${customColor}`;
    }

    return 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 border border-transparent font-medium';
  }
}