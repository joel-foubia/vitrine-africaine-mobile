import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AnnonceDetailPage } from './annonce-detail';
import { ParallaxHeaderDirective } from '../../directives/parallax-header/parallax-header';
import { ParallaxHeaderDirectiveModule } from '../../directives/parallax-header/parallax-header.module';
import { SwipeUpDirectiveModule } from '../../directives/swipe-up/swipe-up.module';
import { CacheImgModule } from '../../global';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    AnnonceDetailPage
  ],
  imports: [
    IonicPageModule.forChild(AnnonceDetailPage),
    TranslateModule.forChild(),
    ParallaxHeaderDirectiveModule,
    SwipeUpDirectiveModule,
    CacheImgModule
  ],
})
export class AnnonceDetailPageModule {}
