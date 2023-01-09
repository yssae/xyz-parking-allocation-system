import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'xyz-time-skip',
  templateUrl: './time-skip.component.html',
  styleUrls: ['./time-skip.component.scss']
})
export class TimeSkipComponent implements OnInit {
  @Output() timeSkip = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  skipTime(time: number) {
    this.timeSkip.emit(time)
  }

}
