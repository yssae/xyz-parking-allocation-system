import { Injectable } from '@angular/core';
import { COLOR_INDICATOR } from '../constants/color-indicator.const';
import { ParkingSlot } from '../models/parking-slot';
import { EntryPoint } from '../models/entry-point';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParkingMapService {
  parkingMap = new Subject();
  sizePercentage: number[] = [0.5, 0.25, 0.25];

  constructor() { }

  createEntryPoints(clusterSlots: number[], sizeAlloc: number[][]): EntryPoint[] {
    return clusterSlots.map((cluster, index) => {
      let prev = 0;
      if (index > 0) {
        for (let i = 0; i < index; i++) {
          prev += clusterSlots[index - 1]
        }
      }

      return {
        name: 'E' + (index + 1),
        totalSlots: cluster,
        slotSizeAllocation: sizeAlloc[index],
        slots: this.assignSlots(cluster, index, prev, sizeAlloc[index]),
      }
    });
  }

  assignSlots(cluster: number, index: number, prev: number, sizeAlloc: number[]): ParkingSlot[] {
    let clusterSlots = new Array() as ParkingSlot[];
    let counter = 0;

    sizeAlloc.forEach((csize: number, k: number) => {
      let slot = new Object() as ParkingSlot;
      for (let i = 0; i < cluster; i++) {
        if (csize > 0) {
          slot = {
            availability: true,
            cluster: index,
            color: COLOR_INDICATOR.available,
            distance: counter + prev,
            size: k,
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

  computeClusterSizes(clusters: number[]): number[][] {
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
}
