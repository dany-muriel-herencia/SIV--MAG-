import { Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Customer } from '../../../../models/customer.model';

@Component({
  selector: 'app-customer-info-card',
  imports: [DecimalPipe],
  templateUrl: './customer-info-card.html',
})
export class CustomerInfoCard {
  readonly customer = input.required<Customer>();
}
