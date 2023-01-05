import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ParkingSlot } from '../../models/parking-slot';
import { Vehicle } from '../../models/vehicle';

@Component({
  selector: 'xyz-slot-modal',
  templateUrl: './slot-modal.component.html',
  styleUrls: ['./slot-modal.component.scss']
})
export class SlotModalComponent implements OnInit {
  slot = new Object() as ParkingSlot;
  car = new Object() as Vehicle;
  parkingSlot: FormGroup;
  vehicle: FormGroup = this.fb.group({
    carSize: '',
    duration: '',
    plateNumber: '',
    ticket: '',
    owner: ''
  });

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) private data: any,) {

    this.slot = this.data.slotData;
    this.car = this.data.slotData.vehicle;

    this.parkingSlot = this.fb.group({
      availability: this.slot.availability,
      cluster: this.slot.cluster,
      distance: this.slot.distance,
      size: this.slot.size,
      vehicle: this.vehicle
    })
  }

  ngOnInit(): void {
    this.mapVehicleData(this.car);
    console.log(this.parkingSlot)
  }

  mapVehicleData(vehicle: Vehicle) {
    if(vehicle) {
      this.vehicle.patchValue({
        carSize: vehicle.carSize,
        duration: vehicle.duration,
        plateNumber: vehicle.plateNumber,
        ticket: vehicle.ticket,
        owner: vehicle.owner,
      })
    }
  }

  unpark() {}
}
