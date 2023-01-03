import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../shared/material.module';
import { ReactiveFormsModule } from '@angular/forms';

import { AdminComponent } from './admin/admin.component';
import { ParkingSettingsComponent } from './admin/parking-settings/parking-settings.component';
import { CustomerListComponent } from './admin/customer-list/customer-list.component';

import { CustomerComponent } from './customer/customer.component';
@NgModule({
  declarations: [
    AdminComponent,
    ParkingSettingsComponent,
    CustomerListComponent,
    CustomerComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    MaterialModule
  ],
  exports: [
    AdminComponent,
    ParkingSettingsComponent,
    CustomerListComponent
  ]
})
export class FeaturesModule { }
