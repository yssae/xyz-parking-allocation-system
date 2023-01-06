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

import { ParkingMapService } from '../services/parking-map.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  entrypoints: FormControl = new FormControl(3);
  totalSlots: number = 40;
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

  constructor(
    private mapService: ParkingMapService,
    private dialog: MatDialog,) { }

  ngOnInit(): void {
    this.entrypoints.valueChanges
      .pipe(startWith(3), takeUntil(this.ngUnsubscribe))
      .subscribe(entrance => {
        this.clusterSlots = this.mapService.computeClusterSlots(entrance, this.totalSlots);
        this.sizeAllocation = this.mapService.computeClusterSizes(this.clusterSlots);
        this.parkingMap = this.mapService.createEntryPoints(this.clusterSlots, this.sizeAllocation);
        console.log(this.parkingMap);
      });
  }

  addCustomer() {
    this.dialog.open(CustomerComponent, { data: { entrypoints: this.entrypoints.value } })
  }

  viewCustomerList() {
    this.dialog.open(CustomerListComponent, { data: { entrypoints: this.entrypoints.value }, panelClass: 'xyz-dialog' });
  }

  viewSlot(slot: ParkingSlot) {
    this.dialog.open(SlotModalComponent, { data: { slotData: slot } })
  }

  setControls() {
    let dialogRef = this.dialog.open(ParkingSettingsComponent, { data: { entryPoints: this.entrypoints.value }, panelClass: 'xyz-dialog', disableClose: true });
    dialogRef.afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe), map(response => response.data))
      .subscribe((response: ParkingSetting) => response ? this.entrypoints.setValue(response.entries) : '');
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.unsubscribe();
  }
}
