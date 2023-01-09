import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { InputComponent } from './components/input/input.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { TimeSkipComponent } from './components/time-skip/time-skip.component';
@NgModule({
  declarations: [
    InputComponent,
    DropdownComponent,
    DialogComponent,
    TimeSkipComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  exports: [
    InputComponent,
    DropdownComponent,
    DialogComponent,
    TimeSkipComponent
  ]
})
export class SharedModule { }
