import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'xyz-parking-settings',
  templateUrl: './parking-settings.component.html',
  styleUrls: ['./parking-settings.component.scss']
})
export class ParkingSettingsComponent implements OnInit {
  settingsForm: FormGroup;
  sizesOfSlots: number[] = new Array();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ParkingSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.settingsForm = this.fb.group({
      entries: [data.entryPoints, [Validators.required, Validators.min(3)]],
      totalSlots: [data.totalSlots, Validators.required],
      smallSlots: [data.sizesOfSlots[0], Validators.required],
      mediumSlots: [data.sizesOfSlots[1], Validators.required],
      largeSlots: [data.sizesOfSlots[2], Validators.required],
    });
  }

  ngOnInit(): void {
    this.mapInitialData();
  }

  mapInitialData() {
    this.sizesOfSlots = this.data.sizesOfSlots;
  }

  save(formdata: FormGroup): void {
    this.totalSlots?.setValue(this.computeTotalSlots());
    if(formdata.valid) {
      this.dialogRef.close({ data: formdata.value })
    }
  }

  computeTotalSlots(): number {
    return (+this.getCtrlVal('smallSlots')) + (+this.getCtrlVal('mediumSlots')) + (+this.getCtrlVal('largeSlots'));
  }

  get f() {
    return this.settingsForm.controls;
  }

  get totalSlots() {
    return this.settingsForm.get('totalSlots');
  }

  getCtrlVal(ctrl: string) {
    return this.settingsForm.get(ctrl)?.value;
  }

}
