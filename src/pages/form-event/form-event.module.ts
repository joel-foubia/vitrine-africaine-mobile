import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FormEventPage } from './form-event';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    FormEventPage,
  ],
  imports: [
    IonicPageModule.forChild(FormEventPage), TranslateModule.forChild()
  ],
})
export class FormEventPageModule {}
