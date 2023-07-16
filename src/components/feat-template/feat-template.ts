import { Component, Input } from '@angular/core';

@Component({
  selector: 'feat-template',
  templateUrl: 'feat-template.html'
})
export class FeatTemplateComponent {
  
  current_image: any;
  @Input() events: any;
	@Input() annonce: any;
  defaultImg: string;

  constructor() {
    // console.log('Hello FeatTemplateComponent Component');
    // this.text = 'Hello World';
    this.defaultImg = 'assets/images/logo.png';
    // if(this.annonce._embedded['wp:featuredmedia'][0]!==undefined)
    //   this.current_image = this.annonce._embedded['wp:featuredmedia'][0].media_details.sizes.medium;
    // else  
    //   this.current_image = this.defaultImg;
    
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
