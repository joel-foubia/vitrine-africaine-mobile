import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NearbyListPage } from './nearby-list';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    NearbyListPage,
  ],
  imports: [
    IonicPageModule.forChild(NearbyListPage),
    TranslateModule.forChild(),
    ComponentsModule,
  ],
})
export class NearbyListPageModule {}
