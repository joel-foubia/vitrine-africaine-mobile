import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FormLocationPage } from './form-location';
import { TextMaskModule } from 'angular2-text-mask';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    FormLocationPage,
  ],
  imports: [
    IonicPageModule.forChild(FormLocationPage), TextMaskModule, TranslateModule.forChild()
  ],
})
export class FormLocationPageModule {}
