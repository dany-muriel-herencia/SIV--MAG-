import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-table-skeleton',
  imports: [],
  templateUrl: './table-skeleton.html'
})
export class TableSkeleton {
  readonly rows = input<number>(5);

  // Genera el arreglo para iterar según la cantidad solicitada
  readonly rowsArray = computed(() => Array.from({ length: this.rows() }));
}
