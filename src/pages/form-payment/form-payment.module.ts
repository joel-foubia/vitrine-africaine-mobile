import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FormPaymentPage } from './form-payment';

@NgModule({
  declarations: [
    FormPaymentPage,
  ],
  imports: [
    IonicPageModule.forChild(FormPaymentPage),
  ],
})
export class FormPaymentPageModule {}
