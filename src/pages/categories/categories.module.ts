// import { LoadingModule } from 'ngx-loading';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CategoriesPage } from './categories';
import { TranslateModule } from '@ngx-translate/core';
// import { ParallaxHeaderDirectiveModule } from '../../directives/parallax-header/parallax-header.module';
// import { SwipeUpDirectiveModule } from '../../directives/swipe-up/swipe-up.module';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    CategoriesPage,
  ],
  imports: [
    IonicPageModule.forChild(CategoriesPage),
    TranslateModule.forChild(),
    // ParallaxHeaderDirectiveModule,
    // SwipeUpDirectiveModule,
    ComponentsModule
    // LoadingModule
  ],
})
export class CategoriesPageModule {}
