import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RaportPage } from './raport';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    RaportPage,
  ],
  imports: [
    IonicPageModule.forChild(RaportPage),
    TranslateModule.forChild()
  ],
})
export class RaportPageModule {}
