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

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ParkingSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

    this.settingsForm = this.fb.group({
      entries: [data.entryPoints, [Validators.required, Validators.min(3)]],
      totalSlots: [40, Validators.required],
    });
  }

  ngOnInit(): void {
  }

  save(formdata: FormGroup): void {
    if(formdata.valid) {
      this.dialogRef.close({ data: formdata.value })
    }
  }

  get f() {
    return this.settingsForm.controls;
  }
}
