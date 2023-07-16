import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InfosPage } from './infos';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    InfosPage,
  ],
  imports: [
    IonicPageModule.forChild(InfosPage), TranslateModule.forChild()
  ],
})
export class InfosPageModule {}
