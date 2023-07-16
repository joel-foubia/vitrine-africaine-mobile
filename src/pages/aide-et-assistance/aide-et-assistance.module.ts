import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AideEtAssistancePage } from './aide-et-assistance';
import { TranslateModule } from '@ngx-translate/core';
@NgModule({
  declarations: [
    AideEtAssistancePage,
  ],
  imports: [
    IonicPageModule.forChild(AideEtAssistancePage),
    TranslateModule.forChild()
  ],
})
export class AideEtAssistancePageModule {}
