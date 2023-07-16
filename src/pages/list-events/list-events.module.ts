import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ListEventsPage } from './list-events';
import { CacheImgModule } from '../../global';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    ListEventsPage,
  ],
  imports: [
    IonicPageModule.forChild(ListEventsPage), CacheImgModule, TranslateModule.forChild(), ComponentsModule,
  ],
})
export class ListEventsPageModule {}
