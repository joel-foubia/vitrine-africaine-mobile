import { Component, Input } from '@angular/core';

/**
 * Generated class for the RdvComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'rdv',
  templateUrl: 'rdv.html'
})
export class RdvComponent {

  text: string;

  @Input() events: any;

	@Input() rdv: any;
  defaultImg: string;

  constructor() {
    this.text = 'Hello World';
    this.defaultImg = 'assets/images/logo.png';
  }

  onEvent(event: string, rdv) {
		if (this.events !== undefined && this.events[event]) {
			this.events[event]({ rdv });
		}
	}

}
