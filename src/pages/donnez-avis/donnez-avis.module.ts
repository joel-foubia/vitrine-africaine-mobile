import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DonnezAvisPage } from './donnez-avis';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { Ionic2RatingModule } from 'ionic2-rating';

@NgModule({
  declarations: [
    DonnezAvisPage,
  ],
  imports: [
    IonicPageModule.forChild(DonnezAvisPage),
    TranslateModule.forChild(),
    ComponentsModule,
    Ionic2RatingModule
  ],
})
export class DonnezAvisPageModule {}
