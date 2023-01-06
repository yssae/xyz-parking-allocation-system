import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ParkingSettingsComponent } from './parking-settings/parking-settings.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { SlotModalComponent } from './slot-modal/slot-modal.component';
import { CustomerComponent } from './customer/customer.component';
import { COLOR_INDICATOR } from '../constants/color-indicator.const';
import { EntryPoint } from '../models/entry-point';
import { ParkingSetting } from '../models/parking-setting';
import { ParkingSlot } from '../models/parking-slot';
import { Vehicle } from '../models/vehicle';
import { map, takeUntil, startWith } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  entrypoints: FormControl = new FormControl(3);
  totalSlots: number = 40;
  sizePercentage: number[] = [0.5, 0.25, 0.25];
  clusterSlots: number[] = [];
  sizeAllocation: number[][] = [];
  parkingMap: EntryPoint[] = [];
  vehicle = {
    duration: 4,
    plateNumber: 'YSA4885',
    carSize: 0,
    ticket: "XYZ001",
    owner: "Hunter Small Four"
  }

  constructor(private dialog: MatDialog,) { }

  ngOnInit(): void {
    this.entrypoints.valueChanges
      .pipe(startWith(3), takeUntil(this.ngUnsubscribe))
      .subscribe(entrance => {
        this.clusterSlots = this.computeClusterSlots(entrance, this.totalSlots);
        this.sizeAllocation = this.computeClusterSizes(this.clusterSlots);
        this.parkingMap = this.createEntryPoints();
        console.log(this.parkingMap);
      });
  }

  addCustomer() {
    this.dialog.open(CustomerComponent, { data: { entrypoints: this.entrypoints.value } })
  }

  viewCustomerList() {
    this.dialog.open(CustomerListComponent, {
      panelClass: 'xyz-dialog',
      data: { entrypoints: this.entrypoints.value }
    });
  }

  viewSlot(slot: ParkingSlot) {
    this.dialog.open(SlotModalComponent, { data: { slotData: slot } })
  }

  setControls() {
    let dialogRef = this.dialog.open(ParkingSettingsComponent, {
      data: { entryPoints: this.entrypoints.value },
      panelClass: 'xyz-dialog',
      disableClose: true
    });
    dialogRef.afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe), map(response => response.data))
      .subscribe((response: ParkingSetting) => response ? this.entrypoints.setValue(response.entries) : '');
  }

  createEntryPoints(): EntryPoint[] {
    return this.clusterSlots.map((cluster, index) => {
      let prev = 0;
      if (index > 0) {
        for (let i = 0; i < index; i++) {
          prev += this.clusterSlots[index - 1]
        }
      }

      return {
        name: 'E' + (index + 1),
        totalSlots: cluster,
        slotSizeAllocation: this.sizeAllocation[index],
        slots: this.assignSlots(cluster, index, prev),
      }
    });
  }

  assignSlots(cluster: number, index: number, prev: number): ParkingSlot[] {
    let clusterSlots = new Array() as ParkingSlot[];
    let counter = 0;

    this.sizeAllocation[index].forEach((csize, k) => {
      let slot = new Object() as ParkingSlot;
      for (let i = 0; i < cluster; i++) {
        if (csize > 0) {
          slot = {
            availability: true,
            cluster: index,
            color: COLOR_INDICATOR.available,
            distance: counter + prev,
            size: k,
            vehicle: this.vehicle
          }
          csize -= 1;
          counter += 1;
          clusterSlots.push(slot);
        }
      }
    })
    return clusterSlots;
  }

  computeClusterSlots(entryPoints: number, slots: number): number[] {
    let clusters = new Array();
    let slotsPerCluster = Math.trunc(slots / entryPoints);
    let remainder = slots % entryPoints;
    for (let index = 0; index < entryPoints; index++) {
      clusters.push((index === (entryPoints - 1)) ? slotsPerCluster + remainder : slotsPerCluster);
    }
    return clusters;
  }

  computeClusterSizes(clusters: number[]) {
    return clusters.map((cluster) => {
      let arr = [];
      let temp = 0;
      for (let k = 0; k < this.sizePercentage.length; k++) {
        let val = 0;
        if (k == (this.sizePercentage.length - 1)) {
          val = Math.round(cluster * this.sizePercentage[k]);
          temp += val;
          temp < cluster ? (val += (cluster - temp)) : null; //add the difference bet cluster and temp to number of large vehicles
        }
        else {
          val = Math.trunc(cluster * this.sizePercentage[k]);
          temp += val;
        }
        arr.push(val)
      }
      return arr;
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.unsubscribe();
  }
}
