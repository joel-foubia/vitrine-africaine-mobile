import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DescpopoverPage } from './descpopover';
import { CacheImgModule } from '../../global';
import { TranslateModule } from '@ngx-translate/core';
import { Ionic2RatingModule } from 'ionic2-rating';

@NgModule({
  declarations: [
    DescpopoverPage,
  ],
  imports: [
    IonicPageModule.forChild(DescpopoverPage), TranslateModule.forChild(),
    CacheImgModule,
    Ionic2RatingModule
  ],
})
export class DescpopoverPageModule {}
