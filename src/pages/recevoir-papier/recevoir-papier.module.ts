import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RecevoirPapierPage } from './recevoir-papier';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    RecevoirPapierPage,
  ],
  imports: [
    IonicPageModule.forChild(RecevoirPapierPage),
    TranslateModule.forChild()
  ],
})
export class RecevoirPapierPageModule {}
