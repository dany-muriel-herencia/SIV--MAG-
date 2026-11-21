import { Component, input } from '@angular/core';

@Component({
  selector: 'app-metric-cards',
  imports: [],
  templateUrl: './metric-cards.html'
})
export class MetricCards {
  title = input<string>();
  totalCount = input<number>();
  activesCount = input<number>();
  inactivesCount = input<number>();
  debtCount = input<number>();
}
