import { Directive, ElementRef, Renderer, NgModule } from '@angular/core';
import { Events } from 'ionic-angular/util/events';

@Directive({
	selector: '[parallax-header]',
	host: {
		'(ionScroll)': 'onContentScroll($event)',
		'(window:resize)': 'onWindowResize($event)'
	}
})
export class ParallaxHeaderDirective {
	header: any;
	headerHeight: any;
	translateAmt: any;
	scaleAmt: any;

	constructor(public element: ElementRef, public renderer: Renderer, public ev: Events) {}

	ngOnInit() {
		let content = this.element.nativeElement.getElementsByClassName('scroll-content')[0];
		this.header = content.getElementsByClassName('header-image')[0];
		let mainContent = content.getElementsByClassName('main-content')[0];

		this.headerHeight = this.header.clientHeight;

		this.renderer.setElementStyle(this.header, 'webkitTransformOrigin', 'center bottom');
		this.renderer.setElementStyle(this.header, 'background-size', 'cover');
		this.renderer.setElementStyle(mainContent, 'position', 'absolute');
	}

	onWindowResize(ev) {
    this.headerHeight = this.header.clientHeight;
	}
  
	onContentScroll(ev) {
    ev.domWrite(() => {
      this.updateParallaxHeader(ev);
		});
	}
  
	updateParallaxHeader(ev) {
    if(ev.directionY == 'up'){
    //   this.renderer.setElementStyle(this.header, 'filter', 'brightness(50%)');
    //   this.ev.publish('reachedDown', 'empty');
    }
    else{
    //   this.renderer.setElementStyle(this.header, 'filter', 'blur(5px)');
    //   this.ev.publish('scrollingUp', 'empty');
    }
    if (ev.scrollTop > 0) {
			this.translateAmt = ev.scrollTop / 2;
			this.scaleAmt = 1;
		} else {
			this.translateAmt = 0;
			this.scaleAmt = -ev.scrollTop / this.headerHeight + 1;
		}

		this.renderer.setElementStyle(
			this.header,
			'webkitTransform',
			'translate3d(0,' + this.translateAmt + 'px,0) scale(' + this.scaleAmt + ',' + this.scaleAmt + ')'
		);
	}
}
