import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PopEventPage } from './pop-event';
import { TranslateModule } from '@ngx-translate/core';
import { CacheImgModule } from '../../global';

@NgModule({
  declarations: [
    PopEventPage,
  ],
  imports: [
    IonicPageModule.forChild(PopEventPage),
    TranslateModule.forChild(),
    CacheImgModule
  ],
})
export class PopEventPageModule {}
