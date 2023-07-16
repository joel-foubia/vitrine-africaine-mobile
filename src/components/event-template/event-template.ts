import { Component, Input } from '@angular/core';

/**
 * Generated class for the EventTemplateComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'event-template',
  templateUrl: 'event-template.html'
})
export class EventTemplateComponent {
	
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
