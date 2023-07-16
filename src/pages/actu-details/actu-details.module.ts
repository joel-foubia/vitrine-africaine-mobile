import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ActuDetailsPage } from './actu-details';


@NgModule({
  declarations: [
    ActuDetailsPage,
  ],
  imports: [
    IonicPageModule.forChild(ActuDetailsPage),
  ],
})
export class ActuDetailsPageModule {}
