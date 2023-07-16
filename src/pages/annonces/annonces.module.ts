import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AnnoncesPage } from './annonces';
import { AnnonceComponent } from '../../components/annonce/annonce';

import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@ngx-translate/core';
import { Ionic2RatingModule } from 'ionic2-rating';


@NgModule({
  declarations: [
    AnnoncesPage, /* AnnonceComponent */
  ],
  imports: [
    IonicPageModule.forChild(AnnoncesPage),
    TranslateModule.forChild(),
    ComponentsModule,
    Ionic2RatingModule
  ],
  entryComponents: [
    /* AnnonceComponent */
  ]
})
export class AnnoncesPageModule {}
