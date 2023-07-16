import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PubFormPage } from './pub-form';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    PubFormPage,
  ],
  imports: [
    IonicPageModule.forChild(PubFormPage),
    TranslateModule.forChild()
  ],
})
export class PubFormPageModule {}
