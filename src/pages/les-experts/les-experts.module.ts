import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LesExpertsPage } from './les-experts';
import { TranslateModule } from '@ngx-translate/core';
//import {LazyLoadImageModule} from 'ng-lazyload-image';

@NgModule({
  declarations: [
    LesExpertsPage,
  ],
  imports: [
    IonicPageModule.forChild(LesExpertsPage),
    TranslateModule.forChild()
    //LazyLoadImageModule
  ],
})
export class LesExpertsPageModule {}
