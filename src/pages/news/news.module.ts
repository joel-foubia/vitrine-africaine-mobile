import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
//import LazyLoadImageModule from 'ng-lazyload-image';
import { TranslateModule } from '@ngx-translate/core';
import { NewsPage } from './news';

@NgModule({
  declarations: [
    NewsPage,
  ],
  imports: [
    IonicPageModule.forChild(NewsPage),
    //LazyLoadImageModule
    TranslateModule.forChild()
  ],
})
export class NewsPageModule {}
