import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FormAnnonceModalPage } from './form-annonce-modal';

@NgModule({
  declarations: [
    FormAnnonceModalPage,
  ],
  imports: [
    IonicPageModule.forChild(FormAnnonceModalPage),
  ],
})
export class FormAnnonceModalPageModule {}
