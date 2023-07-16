import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FormAnnoncePage } from './form-annonce';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    FormAnnoncePage,
  ],
  imports: [
    IonicPageModule.forChild(FormAnnoncePage),
    TranslateModule.forChild()
  ],
})
export class FormAnnoncePageModule {}
