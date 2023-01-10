import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DEFAULT_MSG } from '../../constants/default-msg.const';
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  title: string = 'Success';
  message: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any) {
      this.title = this.data.type;
    }

  ngOnInit(): void {
    this.setDialogTitle();
    this.setMessage();
  }

  setMessage() {
    if(this.data.message) {
      this.message = this.data.message;
    }
    else
      this.checkDialogType() ? this.message = DEFAULT_MSG.SUCCESS : this.message = DEFAULT_MSG.ERROR;
  }

  setDialogTitle() {
    this.data?.title ? this.title = this.data.title : this.title = this.data.type;;
  }

  checkDialogType(): boolean {
    return this.data.type.toLowerCase() == 'success';
  }



}
