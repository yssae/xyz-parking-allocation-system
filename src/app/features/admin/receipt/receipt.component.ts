import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Vehicle } from '../../models/vehicle';
import { RECEIPT_FIELDS } from '../../constants/receipt-fields.const';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss']
})
export class ReceiptComponent implements OnInit {
  properties = RECEIPT_FIELDS;
  vehicle: Vehicle;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any) {
    this.vehicle = this.data.vehicle;
  }

  ngOnInit(): void {
  }

}
