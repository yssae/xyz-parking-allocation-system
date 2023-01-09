import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VEHICLE_SIZE } from '../../constants/vehicle-size.const';
import { ParkingMapService } from '../../services/parking-map.service';
import { COLOR_INDICATOR } from '../../constants/color-indicator.const';
import { Vehicle } from '../../models/vehicle';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';
@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  customerList: Vehicle[] = new Array();
  car = new Object() as Vehicle;
  carSizeOptions = VEHICLE_SIZE;
  vehicleForm: FormGroup;
  entrypoints: number = 3;
  entryOptions: number[] = [];
  submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    private parkingService: ParkingMapService,
    public dialogRef: MatDialogRef<CustomerComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any,) {
    this.vehicleForm = this.fb.group({
      cluster: ['', Validators.required],
      carSize: ['', Validators.required],
      plateNumber: ['', Validators.required],
      owner: ['', Validators.required],
      timeIn: ['', Validators.required],
      timeOut: '',
      ticket: 0,
      duration: '',
    });
  }

  ngOnInit(): void {
    this.car = this.data.slotData?.vehicle;
    this.entrypoints = this.data.entrypoints;
    this.customerList = this.data.customers;
    this.entryOptions = this.createEntryOptions(this.entrypoints);
    this.mapVehicleData(this.car);
  }

  save() {
    this.submitted = true;
    this.setTime('timeIn');
    if (this.vehicleForm.invalid) {
      return;
    }
    if (!this.hasPrevRecord()) {
      this.assignTicket();
      this.parkingService.generateTicket();
    }
    this.dialogRef.close(this.vehicleForm.value);
  }

  assignTicket() {
    this.parkingService.ticketList
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(ticket => { this.ticket?.setValue(ticket) })
  }

  createEntryOptions(entrypoints: number): number[] {
    let optionsArray = new Array();
    for(let index=0; index<entrypoints; index++) {
      optionsArray.push({
        name: "E" + (index+1),
        value: index
      })
    }
    return optionsArray;
  }

  hasPrevRecord() {
    return (this.car?.ticket && this.ticket?.value !== 0) ? true : false;
  }

  mapVehicleData(vehicle: Vehicle) {
    vehicle ? this.vehicleForm.patchValue(vehicle) : null;
  }

  setTime(ctrl: string) {
    if(!this.car) {
      this.parkingService.baseTime
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(time => {
          this.vehicleForm.get(ctrl)?.setValue(time)
        });
    }
  }

  get ticket() {
    return this.vehicleForm.get('ticket');
  }

  get f() {
    return this.vehicleForm.controls;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.unsubscribe();
  }
}
