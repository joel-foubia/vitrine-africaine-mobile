import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HelperPage } from './helper';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    HelperPage,
  ],
  imports: [
    IonicPageModule.forChild(HelperPage), TranslateModule.forChild()
  ],
})
export class HelperPageModule {}
