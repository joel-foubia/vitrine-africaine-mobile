import { Component, Input } from '@angular/core';


@Component({
  selector: 'feat-event',
  templateUrl: 'feat-event.html'
})
export class FeatEventComponent {

  @Input() events: any;
  @Input() item: any;
  defaultImg : string;

  constructor() {
    //console.log('Hello EventTemplateComponent Component');
	this.defaultImg = 'assets/images/logo.png';
  }
  
  onEvent(event: string, current) {
		if (this.events !== undefined && this.events[event]) {
			this.events[event]({ current });
		}
  }

}
