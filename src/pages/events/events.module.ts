import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventsPage } from './events';
import { TranslateModule } from '@ngx-translate/core';
import { NgCalendarModule } from 'ionic2-calendar';
import { CacheImgModule } from '../../global';

@NgModule({
  declarations: [
    EventsPage,
  ],
  imports: [
    IonicPageModule.forChild(EventsPage), TranslateModule.forChild(),
    NgCalendarModule, CacheImgModule
  ],
})
export class EventsPageModule {}
