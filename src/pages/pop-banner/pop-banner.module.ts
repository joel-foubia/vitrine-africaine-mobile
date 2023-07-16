import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PopBannerPage } from './pop-banner';

@NgModule({
  declarations: [
    PopBannerPage,
  ],
  imports: [
    IonicPageModule.forChild(PopBannerPage),
  ],
})
export class PopBannerPageModule {}
