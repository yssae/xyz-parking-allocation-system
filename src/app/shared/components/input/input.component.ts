import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'xyz-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {

  @Input() icon = '';
  @Input() inputType = 'text';
  @Input() disabled = false;
  @Input() fieldLabel = '';
  @Input() fieldName = '';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() control = new FormControl();

  constructor() { }

  ngOnInit(): void {
    this.setCtrlStatus();
  }

  setCtrlStatus() {
    this.disabled ? this.control.disable() : this.control.enable();
  }
}
