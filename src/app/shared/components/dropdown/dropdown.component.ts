import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Option } from '../../models/option';
@Component({
  selector: 'xyz-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {

  @Input() icon = '';
  @Input() disabled = false;
  @Input() fieldLabel = '';
  @Input() fieldName = '';
  @Input() placeholder = '';
  @Input() value = '';
  @Input() control = new FormControl();
  @Input() options: Option[] = [];


  constructor() {}

  ngOnInit(): void {
    this.control.patchValue(this.options[0].value);
  }
}
