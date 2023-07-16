import { Component, Input } from '@angular/core';

/**
 * Generated class for the MapannonceComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
	selector: 'mapannonce',
	templateUrl: 'mapannonce.html'
})
export class MapannonceComponent {
	@Input() events: any;

	@Input() annonce: any;
	text: string;
	defaultImg: string;
	defaultImagesList = [];

	constructor() {
		this.text = 'Hello World';
		this.defaultImg = 'assets/images/logo.png';

		for (let i = 0; i < 2; i++) {
			this.defaultImagesList.push('assets/images/logo.png');
		}
	}
	onEvent(event: string, annonce) {
		if (this.events !== undefined && this.events[event]) {
			this.events[event]({ annonce });
		}
	}
}
