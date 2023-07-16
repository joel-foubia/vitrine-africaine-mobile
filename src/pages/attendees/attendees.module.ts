import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AttendeesPage } from './attendees';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AttendeesPage,
  ],
  imports: [
    IonicPageModule.forChild(AttendeesPage), TranslateModule.forChild()
  ],
})
export class AttendeesPageModule {}
