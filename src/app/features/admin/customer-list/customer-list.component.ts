import { Component, OnInit, Input, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { customers } from 'src/app/mock/constants/customers.const';
import { CUSTOMER_LIST_COLUMNS } from '../../constants/customer-list-columns.const';
import { CustomerComponent } from '../customer/customer.component';
import { Vehicle } from '../../models/vehicle';

@Component({
  selector: 'xyz-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  vehicleList: Vehicle[] = new Array() as Vehicle[];
  displayedColumns = CUSTOMER_LIST_COLUMNS;
  entrypoints: number = 3;

  constructor(
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) { }

  ngOnInit(): void {
    this.vehicleList = customers;
    console.log(this.vehicleList);
    this.entrypoints = this.data.entrypoints;
  }

  setColumnNames(list: Vehicle[]) {

  }

  viewVehicle(vehicle: any) {
    console.log(vehicle);
    this.dialog.open(CustomerComponent, {
      data: {
        entrypoints: this.entrypoints,
        slotData : { vehicle : vehicle }
      }
     })

  }

  get vehicleColumn() {
    return this.displayedColumns.map(column => column.name)
  }


}
