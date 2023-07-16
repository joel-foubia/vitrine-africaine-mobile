import { Component, Input } from '@angular/core';

/**
 * Generated class for the AnnonceComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
	selector: 'annonce',
	templateUrl: 'annonce.html'
})
export class AnnonceComponent {
	@Input() events: any;

	@Input() annonce: any;
	text: string;
	annonceList = [];
	defaultImagesList = [];
	defaultImg: string;

	constructor() {
		this.text = 'Hello World';
		this.defaultImg = 'assets/images/logo.png';
		for (let i = 0; i < 2; i++) {
			this.defaultImagesList.push('assets/images/logo.png');
		}
		if (this.annonce) {
			console.log('Annonce', this.annonce);
		}
	}

	onEvent(event: string, annonce) {
		if (this.events !== undefined && this.events[event]) {
			this.events[event]({ annonce });
		}
	}

	listToMatrix(list, elementsPerSubArray) {
		var matrix = [],
			i,
			k;

		for (i = 0, k = -1; i < list.length; i++) {
			if (i % elementsPerSubArray === 0) {
				k++;
				matrix[k] = [];
			}

			matrix[k].push(list[i]);
		}

		return matrix;
	}
}
