import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NosServicesPage } from './nos-services';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [
    NosServicesPage,
  ],
  imports: [
    IonicPageModule.forChild(NosServicesPage),
    TranslateModule.forChild()
  ],
})
export class NosServicesPageModule {}
