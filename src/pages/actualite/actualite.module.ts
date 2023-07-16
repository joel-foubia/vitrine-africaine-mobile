import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import {LazyLoadImageModule} from 'ng-lazyload-image';
import { TranslateModule } from '@ngx-translate/core';
import { ActualitePage } from './actualite';
import { CacheImgModule } from '../../global';

@NgModule({
  declarations: [
    ActualitePage,
  ],
  imports: [
    IonicPageModule.forChild(ActualitePage),
    CacheImgModule,
    TranslateModule.forChild(),
    LazyLoadImageModule
  ],
})
export class ActualitePageModule {}
