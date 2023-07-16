import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AnnoncesOnMapPage } from './annonces-on-map';
import { AgmCoreModule } from '@agm/core';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    AnnoncesOnMapPage,
  ],
  imports: [
    IonicPageModule.forChild(AnnoncesOnMapPage),
    AgmCoreModule,
    TranslateModule.forChild()
  ],
})
export class AnnoncesOnMapPageModule {}
