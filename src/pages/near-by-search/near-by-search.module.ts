import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NearBySearchPage } from './near-by-search';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { AgmCoreModule } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction';

@NgModule({
  declarations: [
    NearBySearchPage,
  ],
  imports: [
    IonicPageModule.forChild(NearBySearchPage),
    TranslateModule.forChild(),
    ComponentsModule,
    AgmCoreModule,
    AgmDirectionModule
  ],
})
export class NearBySearchPageModule {}
