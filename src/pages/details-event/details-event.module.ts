import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetailsEventPage } from './details-event';
import { CacheImgModule } from '../../global';
import { TranslateModule } from '@ngx-translate/core';
import { CounterInput } from '../../components/counter-input/counter-input';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [
    DetailsEventPage, CounterInput
  ],
  imports: [
    IonicPageModule.forChild(DetailsEventPage), CacheImgModule, TranslateModule.forChild(),
    AgmCoreModule,

  ],
})
export class DetailsEventPageModule {}
