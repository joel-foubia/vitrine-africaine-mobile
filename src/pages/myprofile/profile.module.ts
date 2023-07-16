import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfilePage } from './profile';
import { TranslateModule } from '@ngx-translate/core';
import { CacheImgModule } from '../../global';
import { ParallaxHeaderDirectiveModule } from '../../directives/parallax-header/parallax-header.module';
import { SwipeUpDirectiveModule } from '../../directives/swipe-up/swipe-up.module';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    ProfilePage,
  ],
  imports: [
    IonicPageModule.forChild(ProfilePage),
    TranslateModule.forChild(),
    ParallaxHeaderDirectiveModule,
    SwipeUpDirectiveModule,
    ComponentsModule,
    CacheImgModule
  ],
})
export class ProfilePageModule {}
