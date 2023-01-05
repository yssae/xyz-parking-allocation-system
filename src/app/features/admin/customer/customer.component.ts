import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Vehicle } from '../../models/vehicle';
import { VEHICLE_SIZE } from '../../constants/vehicle-size.const';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {
  car = new Object() as Vehicle;
  carSizeOptions = VEHICLE_SIZE;
  vehicleForm: FormGroup;
  entrypoints: number;
  options: number[] = [];
  submitted: boolean = false;

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) private data: any,) {

    this.entrypoints = this.data.entrypoints;
    this.vehicleForm = this.fb.group({
      cluster: ['', Validators.required],
      carSize: ['', Validators.required],
      plateNumber: ['', Validators.required],
      ticket: ['', Validators.required],
      owner: ['', Validators.required],
      duration: ['', Validators.required],
      timeIn: ['', Validators.required],
      timeOut: '',
    });
  }

  ngOnInit(): void {
    this.options = this.createEntryOptions(this.entrypoints)
  }

  save(formData: any) {
    console.log('SAVE')
    this.submitted = true;
    console.log(formData)
  }

  mapFormData() {}

  createEntryOptions(entrypoints: number): number[] {
    let optionsArray = new Array();
    for(let index=0; index<entrypoints; index++) {
      optionsArray.push({
        name: "E" + index,
        value: index
      })
    }
    return optionsArray;
  }

  get f() {
    return this.vehicleForm.controls;
  }

}
