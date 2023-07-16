import { Ionic2RatingModule } from 'ionic2-rating';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FavoritesPage } from './favorites';
import { TranslateModule } from '@ngx-translate/core';
// import { LazyLoadImageModule } from 'ng-lazyload-image';
import { CacheImgModule } from '../../global';
import {LazyLoadImageModule} from 'ng-lazyload-image';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    FavoritesPage,
  ],
  imports: [
    IonicPageModule.forChild(FavoritesPage),
    TranslateModule.forChild(),
    ComponentsModule,
    // CacheImgModule,
    LazyLoadImageModule,
    // Ionic2RatingModule
  ],
})
export class FavoritesPageModule {}
