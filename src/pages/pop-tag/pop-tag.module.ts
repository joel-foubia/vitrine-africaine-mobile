import { NgModule } from '@angular/core';
import { PopTagPage } from './pop-tag';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [PopTagPage],
  imports: [IonicPageModule.forChild(PopTagPage), TranslateModule.forChild()],
})
export class PopTagPageModule {}
