import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConfirmPayconiqPage } from './confirm-payconiq';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ConfirmPayconiqPage,
  ],
  imports: [
    IonicPageModule.forChild(ConfirmPayconiqPage), TranslateModule.forChild()
  ],
})
export class ConfirmPayconiqPageModule {}
