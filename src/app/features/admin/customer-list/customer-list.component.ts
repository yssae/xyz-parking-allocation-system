import { Component, OnInit, Inject, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { CUSTOMER_LIST_COLUMNS } from '../../constants/customer-list-columns.const';
import { CustomerComponent } from '../customer/customer.component';
import { Vehicle } from '../../models/vehicle';
import { MatTableDataSource } from '@angular/material/table';
import { DialogData } from '../../models/dialog-data';
import { ParkingMapService } from '../../services/parking-map.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormControl } from '@angular/forms';
@Component({
  selector: 'xyz-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | any;
  search = new FormControl('');
  private ngUnsubscribe = new Subject();
  baseTime: Date = new Date();
  dataSource: MatTableDataSource<Vehicle>;
  displayedColumns = CUSTOMER_LIST_COLUMNS;
  entrypoints: number = 3;
  vehicleList: Vehicle[];

  constructor(
    private datePipe: DatePipe,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<CustomerListComponent>,
    private parkingService: ParkingMapService,
    @Inject(MAT_DIALOG_DATA) private data: DialogData) {
      this.vehicleList = this.data.customers;
      this.entrypoints = this.data.entrypoints;
      this.baseTime = this.data.baseTime;
      this.dataSource = new MatTableDataSource(this.vehicleList);
    }

  ngOnInit(): void {
    this.getBaseTime();
    this.searchCustomer();
  }

  formatColumn(key: any) {
    if(typeof key == 'object') {
      return this.datePipe.transform(key, 'short');
    }
    return key;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  viewVehicle(vehicle: any) {
    this.dialog.open(CustomerComponent, {
      data: {
        entrypoints: this.entrypoints,
        slotData : { vehicle : vehicle },
        baseTime: this.data.baseTime
      }
    })

    this.dialogRef.close()
  }

  searchCustomer() {
    this.search.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(value => {
      this.dataSource.filter = value ? value.trim().toLowerCase() : '';
    })
  }

  triggerTimeSkip(time: number) {
    this.parkingService.setTimeIn(time);
  }

  get vehicleColumn() {
    return this.displayedColumns.map(column => column.name)
  }

  getBaseTime() {
    this.parkingService.baseTime.pipe(takeUntil(this.ngUnsubscribe)).subscribe(time => this.baseTime = time)
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.unsubscribe()
  }
}
