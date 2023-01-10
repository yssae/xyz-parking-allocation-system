import { Injectable } from '@angular/core';
import { COLOR_INDICATOR } from '../constants/color-indicator.const';
import { PARKING_RATES } from '../constants/parking-rates.const';
import { ParkingSlot } from '../models/parking-slot';
import { EntryPoint } from '../models/entry-point';
import { Subject, BehaviorSubject, ReplaySubject } from 'rxjs';
import { Vehicle } from '../models/vehicle';
import * as moment from 'moment-timezone';
@Injectable({
  providedIn: 'root'
})
export class ParkingMapService {
  parkingMap = new Subject<ParkingSlot>();
  ticketList = new BehaviorSubject<number>(0);
  customerList = new Subject<Vehicle>();
  sizePercentage: number[] = [];
  baseTime = new BehaviorSubject(new Date());

  constructor() { }

  setTimeIn(time: number) {
    this.baseTime.next(moment(this.baseTime.getValue()).add(time,'minutes').tz("Asia/Manila").toDate());
  }

  generateTicket() {
    this.ticketList.next(this.ticketList.getValue() + 1);
  }

  computeSizePercent(total: number, sizes: number[]) {
    this.sizePercentage = sizes.map(size => (size / total));
    return sizes.map(size => (size / total))
  }

  createEntryPoints(clusterSlots: number[], sizeAlloc: number[][]): EntryPoint[] {
    return clusterSlots.map((cluster, index) => {
      let prev = 0;
      let counter = cluster;
      if (index > 0) {
        for (let i = 0; i < index; i++) {
          prev += clusterSlots[index - 1];
          counter += clusterSlots[index - 1]; // last number
        }
      }
      return {
        name: 'E' + (index + 1),
        totalSlots: cluster,
        median: (prev + (counter - 1)) / 2,
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

  computeClusterSlots(sizeAllocation: number[][]): number[] {
    return sizeAllocation.map((size) => {
      let total = 0;
      for (let k = 0; k < size.length; k++) {
        total += size[k];
      }
      return total;
    });
  }

  computeSizesPerCluster(sizes: number[], entrypts: number): number[][] {
    let temp = [];
    for (let index = 0; index < entrypts; index++) {
      temp.push(sizes.map((size) => index == (entrypts - 1) ? Math.trunc(size / entrypts) + (size % entrypts) : Math.trunc(size / entrypts)));
    }
    return temp;
  }

  setDuration(duration: number): number {
    return 0 <duration &&duration < 1 ? 1 : Math.round(duration);
  }

  computeParkingFee(vehicle: Vehicle, slot: ParkingSlot): number {
    let fee = 0;
    let exceeding = 0;
    vehicle.duration = this.setDuration(vehicle.duration);
    if (vehicle.duration >= 24) {
      fee = Math.trunc(vehicle.duration / 24) * PARKING_RATES.FULL_24_CHUNK;
      exceeding = (vehicle.duration % 24) * PARKING_RATES.EXCEEDING_RATE[slot.size];
    }
    else {
      fee = vehicle.duration * PARKING_RATES.FLAT_RATE;
      if (vehicle.duration > 3) {
        fee += (vehicle.duration - 3) * PARKING_RATES.EXCEEDING_RATE[slot.size];
      }
    }
    return (fee + exceeding) - vehicle.parkingFee;
  }

  parkVehicle(vehicle: Vehicle) {
    if(vehicle) {
      this.customerList.next(vehicle);
    }
  }

  resetSlot(slot: ParkingSlot) {
    if(slot) {
      slot.availability = true;
      slot.color = COLOR_INDICATOR.available;
      slot.vehicle = undefined;
    }
  }

  get customers() {
    return this.customerList;
  }

}
