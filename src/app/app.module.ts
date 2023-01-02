import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { MaterialModule } from './shared/material.module';
import { SharedModule } from './shared/shared.module';

import { AdminComponent } from './features/admin/admin.component';
import { CustomerComponent } from './features/customer/customer.component';
@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    CustomerComponent,
  ],
  imports: [
    BrowserModule,
    MaterialModule,
    SharedModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
