import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ParkingSettingsComponent } from './parking-settings/parking-settings.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { SlotModalComponent } from './slot-modal/slot-modal.component';
import { CustomerComponent } from './customer/customer.component';
import { ReceiptComponent } from './receipt/receipt.component';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { COLOR_INDICATOR } from '../constants/color-indicator.const';
import { EntryPoint } from '../models/entry-point';
import { ParkingSetting } from '../models/parking-setting';
import { ParkingSlot } from '../models/parking-slot';
import { Vehicle } from '../models/vehicle';
import { ParkingMapService } from '../services/parking-map.service';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import * as moment from 'moment-timezone';
import { customers } from 'src/app/mock/constants/customers.const';
const vehicle: Vehicle = {
  duration: 5.5,
  plateNumber: "PLATE-4885",
  carSize: 0,
  ticket: "1",
  owner: "Alyssa Kate",
  timeIn: new Date(),
  timeOut: new Date(),
  cluster: 0,
  slot: 25,
  parkingFee: 180
};
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  entrypoints: FormControl = new FormControl(3);
  baseTime: Date = new Date();
  clusterSlots: number[] = [];
  parkingMap: EntryPoint[] = [];
  customerList: Vehicle[] = [];
  sizeAllocation: number[][] = [];
  sizePercentage: number[] = [];
  sizesOfSlots: number[] = [20, 10, 10];
  totalSlots: number = 40;
  ticketList: number[] = [];

  constructor(
    private dialog: MatDialog,
    private parkingService: ParkingMapService,
  ) { }

  ngOnInit(): void {
    this.constructParkingMap();
    this.createCustomerList();
    this.createTickets();
    this.getBaseTime();
  }

  createCustomerList() {
    this.parkingService.customerList.pipe(takeUntil(this.ngUnsubscribe)).subscribe(customer => {
      this.customerList = this.customerList.filter(record => !(moment(this.baseTime).diff(record.timeOut, 'minutes') > 60 && record.slot == undefined));
      if(this.customerList.find(record => record.plateNumber == customer.plateNumber && customer.slot !== undefined)) {
        return;
      }
      this.parkVehicle(customer);
      this.updateCustomerRecords(customer);
      console.log('MASTERLIST', this.customerList)
    });
  }

  updateCustomerRecords(customer: Vehicle) {
    let hasDuplicate = false;
    this.customerList.forEach((record, index) => {
      if(record.ticket == customer.ticket && record.plateNumber == customer.plateNumber) {
        hasDuplicate = true;
        this.customerList.splice(index, 1, customer);
      }
    });

    if(!hasDuplicate && customer.slot !== undefined) {
      this.customerList.push(customer);
    }
    if(customer.slot == undefined) {
      this.dialog.open(DialogComponent, { data: { type: 'error', message: 'There are no available slots available slots at the moment. Try again later.' } })
    }
  }

  constructParkingMap() {
    this.sizePercentage = this.parkingService.computeSizePercent(this.totalSlots,this.sizesOfSlots);
    this.sizeAllocation = this.parkingService.computeSizesPerCluster(this.sizesOfSlots, this.entrypoints.value);
    this.clusterSlots = this.parkingService.computeClusterSlots(this.sizeAllocation);
    this.parkingMap = this.parkingService.createEntryPoints(this.clusterSlots, this.sizeAllocation);
    console.log(this.parkingMap)
  }

  parkVehicle(vehicle: Vehicle) {
    let slot = new Object() as ParkingSlot | any;
    this.clusters.forEach(cluster => {
      if(vehicle.cluster == cluster && this.parkingMap[cluster]) { // straightforward
        slot = this.parkingMap[cluster].slots?.find(slot => (slot.size >= vehicle.carSize) && slot.availability);
      }
      if(!slot || !slot?.availability) {
        slot = this.compareMedian(vehicle)
      }
    });
    if(slot) { // from other entrypoints
      if(this.parkingMap[slot.cluster]) {
        let index = this.parkingMap[slot.cluster].slots.findIndex(record => record.distance == slot.distance);
        if(index !== -1) {
          this.parkingMap[slot.cluster].slots[index].availability = false;
          this.parkingMap[slot.cluster].slots[index].color = COLOR_INDICATOR.occupied;
          this.parkingMap[slot.cluster].slots[index].vehicle = vehicle;
          vehicle.slot = slot.distance;
        }
      }
    }
  }

  unparkVehicle(slot: ParkingSlot) {
    if(slot) {
      let currentSlot = this.parkingMap[slot.cluster].slots.find(record => record.distance == slot.distance);
      if(currentSlot) {
        if(currentSlot.vehicle?.ticket) {
          let currentVehicle = this.customerList.find(record => record.ticket == slot.vehicle?.ticket && record.plateNumber == slot.vehicle?.plateNumber)
          if(currentVehicle) {
            currentVehicle.slot = undefined;
            currentVehicle.timeOut = this.baseTime;
            currentVehicle.parkingFee = this.parkingService.computeParkingFee(currentVehicle, currentSlot);
            this.issueReceipt(currentSlot.vehicle)
          }
        }
        this.parkingService.resetSlot(currentSlot);
      }
    }
  }

  issueReceipt(vehicle: Vehicle) {
    this.dialog.open(ReceiptComponent, { data: { vehicle: vehicle }});
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
    this.dialog.open(CustomerComponent, {
      data: {
        entrypoints: this.entrypoints.value,
        customers: this.customerList,
        baseTime: this.baseTime
      }
    });
  }

  viewCustomerList() {
    this.dialog.open(CustomerListComponent, {
      panelClass: 'xyz-dialog',
      data: {
        entrypoints: this.entrypoints.value,
        customers: this.customerList,
        baseTime: this.baseTime
      },
    });
  }

  viewSlot(slot: ParkingSlot) {
    let dialogRef = this.dialog.open(SlotModalComponent, { data: { slotData: slot } });
    dialogRef.afterClosed().subscribe((response) => response ? this.unparkVehicle(slot) : '');
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

  getBaseTime() {
    this.parkingService.baseTime.subscribe(time => {
      this.baseTime = time;
      this.customerList.forEach(customer => {
        let durationInMins = moment(this.baseTime).diff(moment(customer.timeIn), 'minutes');
        customer.duration = durationInMins / 60;
      });
    })
  }

  get clusters() {
    return this.parkingMap.map((cluster, index) => index);
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.unsubscribe();
  }
}
