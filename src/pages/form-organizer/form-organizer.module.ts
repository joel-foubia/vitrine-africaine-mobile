import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FormOrganizerPage } from './form-organizer';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    FormOrganizerPage,
  ],
  imports: [
    IonicPageModule.forChild(FormOrganizerPage), TranslateModule.forChild()
  ],
})
export class FormOrganizerPageModule {}
