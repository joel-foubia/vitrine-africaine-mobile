import { Component, Input } from '@angular/core';

/**
 * Component in charge of lazy load images and cache them
 */
@Component({
  selector: 'op-lazy-img',
  template: `
  <div text-center [ngClass]="{ 'placeholder': placeholderActive }">
    <img op-lazy-img [source]="source" [defaultImage]="defaultImage" (loaded)="placeholderActive = false" alt="image" />
  </div>
  `
  // styleUrls: [ './lazy-img.component.scss' ]
})
export class LazyImgComponent {

  @Input()
  public source: string;
  @Input()
  public defaultImage: string;

  public placeholderActive: boolean = true;

}
