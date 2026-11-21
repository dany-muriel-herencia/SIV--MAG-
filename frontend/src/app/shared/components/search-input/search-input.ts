import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-search-input',
  imports: [],
  templateUrl: './search-input.html',
})
export class SearchInput {
  readonly value = input<string>(''); // 👈 Permite recibir el valor inicial o limpiarlo desde fuera
  readonly placeholder = input<string>('Buscar...');
  readonly search = output<string>(); // 👈 Emite de inmediato al padre

  protected readonly searchTerm = signal<string>('');

  onInputChange(value: string): void {
    this.searchTerm.set(value);
    this.search.emit(value); // Emite de inmediato al padre
  }

  clear(): void {
    this.searchTerm.set('');
    this.search.emit('');
  }
}
