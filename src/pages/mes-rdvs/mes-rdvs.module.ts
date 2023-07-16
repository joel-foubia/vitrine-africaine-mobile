import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MesRdvsPage } from './mes-rdvs';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';
import { Ionic2RatingModule } from 'ionic2-rating';

@NgModule({
  declarations: [
    MesRdvsPage,
  ],
  imports: [
    IonicPageModule.forChild(MesRdvsPage),
    TranslateModule.forChild(),
    ComponentsModule,
    Ionic2RatingModule
  ],
})
export class MesRdvsPageModule {}
