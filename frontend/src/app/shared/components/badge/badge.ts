import { Component, input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full font-semibold border transition-colors"
      [class]="class()"
    >
      {{ label() }}
    </span>
  `
})
export class BadgeComponent {
  readonly label = input.required<string>();
  readonly class = input<string>('bg-slate-50 text-slate-600 border-slate-200'); // Valor por defecto
}
