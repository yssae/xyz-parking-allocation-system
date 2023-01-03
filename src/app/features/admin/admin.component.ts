import { Component, OnInit, Input, Inject, OnDestroy } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ParkingSettingsComponent } from './parking-settings/parking-settings.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { FormControl } from '@angular/forms';

import { ParkingSetting } from '../models/parking-setting';

import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  defaultEntryPts: number = 3;
  sizePercentage = [0.5, .1, .1];

  tiles: Tile[] = [
    {text: 'One', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'Two', cols: 1, rows: 2, color: 'lightgreen'},
    {text: 'Three', cols: 1, rows: 1, color: 'lightpink'},
    {text: 'Four', cols: 2, rows: 1, color: '#DDBDF1'},
  ];

  constructor(private dialog: MatDialog,) { }

  ngOnInit(): void {
    console.log('admin ngOnInIt()');
  }

  viewCustomerList() {
    this.dialog.open(CustomerListComponent, { panelClass: 'xyz-dialog' });
  }

  setControls() {
    let dialogRef = this.dialog.open(ParkingSettingsComponent, {
      data: { entryPoints: this.defaultEntryPts },
      panelClass: 'xyz-dialog',
      disableClose: true
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe), map(response => response.data))
      .subscribe((response: ParkingSetting) => response ? this.defaultEntryPts = response.entries : '');
  }

  computeClusterSlots(entryPoints: number, slots: number) {
    let clusters = new Array();
    let slotsPerCluster = Math.trunc(slots / entryPoints);
    let remainder = slots % entryPoints;

    for (let index = 0; index < entryPoints; index++) {
      if (index == (entryPoints - 1)) {
        clusters.splice(index, 0, slotsPerCluster + remainder)
      }
      else
        clusters.splice(index, 0, slotsPerCluster)
    }

    return clusters;
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.unsubscribe();
  }
}
