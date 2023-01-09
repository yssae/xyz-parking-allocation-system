import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ParkingSettingsComponent } from './parking-settings/parking-settings.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { SlotModalComponent } from './slot-modal/slot-modal.component';
import { CustomerComponent } from './customer/customer.component';
import { COLOR_INDICATOR } from '../constants/color-indicator.const';
import { PARKING_RATES } from '../constants/parking-rates.const';
import { VEHICLE_SIZE } from '../constants/vehicle-size.const';
import { EntryPoint } from '../models/entry-point';
import { ParkingSetting } from '../models/parking-setting';
import { ParkingSlot } from '../models/parking-slot';
import { Vehicle } from '../models/vehicle';
import { customers } from 'src/app/mock/constants/customers.const';
import { ParkingMapService } from '../services/parking-map.service';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  entrypoints: FormControl = new FormControl(3);
  clusterSlots: number[] = [];
  parkingMap: EntryPoint[] = [];
  customerList: Vehicle[] = [];
  sizeAllocation: number[][] = [];
  sizePercentage: number[] = [];
  sizesOfSlots: number[] = [20, 10, 10];
  totalSlots: number = 40;
  ticketList: number[] = [];
  baseTime: Date = new Date();

  constructor(
    private parkingService: ParkingMapService,
    private dialog: MatDialog,) { }

  ngOnInit(): void {
    this.constructParkingMap();
    this.createCustomerList();
    this.createTickets();
    this.getBaseTime();
  }

  getBaseTime() {
    this.parkingService.baseTime.subscribe(time => {
      this.baseTime = time;
      console.log('TEST', this.baseTime)
    })
  }

  constructParkingMap() {
    this.sizePercentage = this.parkingService.computeSizePercent(this.totalSlots,this.sizesOfSlots);
    this.sizeAllocation = this.parkingService.computeSizesPerCluster(this.sizesOfSlots, this.entrypoints.value);
    this.clusterSlots = this.parkingService.computeClusterSlots(this.sizeAllocation);
    this.parkingMap = this.parkingService.createEntryPoints(this.clusterSlots, this.sizeAllocation);
    console.log(this.parkingMap)
  }

  createCustomerList() {
    this.parkingService.customerList.pipe(takeUntil(this.ngUnsubscribe)).subscribe(customer => {
      console.log(customer)
      this.updateCustomerRecords(customer);
      console.log('MASTERLIST', this.customerList)
    });
  }

  updateCustomerRecords(customer: Vehicle) {
    let hasDuplicate = false;
    this.customerList.forEach((record, index) => {
      if(record.ticket == customer.ticket && record.plateNumber == customer.plateNumber) {
        hasDuplicate = true;
        index = index;
        this.customerList.splice(index, 0, customer);
      }
    });
    !hasDuplicate ? this.customerList.push(customer) : '';
    this.assignVehicleSlot(customer);
  }

  assignVehicleSlot(vehicle: Vehicle) {
    let slot = new Object() as ParkingSlot | any;
    this.clusters.forEach(cluster => {
      if(vehicle.cluster == cluster) {
        slot = this.parkingMap[cluster].slots?.find(slot => (slot.size >= vehicle.carSize) && slot.availability);
      }
      if(!slot && !slot?.availability) {
        slot = this.compareMedian(vehicle)
      }
    });
    if(slot) {
      let index = this.parkingMap[slot.cluster].slots.findIndex(record => record.distance == slot.distance);
      this.parkingMap[slot.cluster].slots[index].availability = false;
      this.parkingMap[slot.cluster].slots[index].color = COLOR_INDICATOR.occupied;
      this.parkingMap[slot.cluster].slots[index].vehicle = vehicle;
    }
    else {
      // snackbar or dialog
    }
  }

  compareMedian(vehicle: Vehicle): ParkingSlot {
    let clusterMedian = this.parkingMap.find((cluster, index) => index == vehicle.cluster ? cluster.median : 0);
    let smallestValue = this.totalSlots;
    let nearestSlot = new Object() as ParkingSlot;
    this.parkingMap.forEach((cluster) => {
      let slots = cluster.slots.filter(slot => (slot.size >= vehicle.carSize) && slot.availability)
      slots.forEach(slot => {
        if(slot && clusterMedian) {
          let value = Math.abs(clusterMedian.median - slot?.distance);
          if(value < smallestValue) {
            smallestValue = value;
            nearestSlot = slot;
          }
        }
      })
    })
    return nearestSlot;
  }

  createTickets() {
    this.parkingService.ticketList.pipe(takeUntil(this.ngUnsubscribe)).subscribe(ticket => this.ticketList.push(ticket))
  }

  addCustomer() {
    let dialogRef = this.dialog.open(CustomerComponent, {
      data: {
        entrypoints: this.entrypoints.value,
        customers: this.customerList,
        baseTime: this.baseTime
      }
    });

    dialogRef.afterClosed().subscribe((customer: Vehicle) => {
      this.parkingService.parkVehicle(customer);
    });
  }

  viewCustomerList() {
    this.dialog.open(CustomerListComponent, {
      panelClass: 'xyz-dialog',
      data: {
        entrypoints: this.entrypoints.value,
        customers: this.customerList
      },
    });
  }

  viewSlot(slot: ParkingSlot) {
    this.dialog.open(SlotModalComponent, { data: { slotData: slot } })
  }

  setControls() {
    let dialogRef = this.dialog.open(ParkingSettingsComponent, {
      panelClass: 'xyz-dialog', disableClose: true,
      data: {
        entryPoints: this.entrypoints.value,
        totalSlots: this.totalSlots,
        sizesOfSlots: this.sizesOfSlots
      }
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe), map(response => response.data))
      .subscribe((data: ParkingSetting) => {
        if(!data){
          return
        }
        this.totalSlots = data.totalSlots;
        let tempSize = [data.smallSlots, data.mediumSlots, data.largeSlots]
        this.updateSizesOfSlots(tempSize);
        this.entrypoints.setValue(data.entries);
        this.constructParkingMap();
      });
  }

  updateSizesOfSlots(value: number[]) {
    value ? this.sizesOfSlots.map((size, index) => this.sizesOfSlots.splice(index, 1, (+value[index]))) : [];
  }

  get clusters() {
    return this.parkingMap.map((cluster, index) => index);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.unsubscribe();
  }
}
