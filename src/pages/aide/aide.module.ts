import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {AidePage} from './aide';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
  declarations: [AidePage],
  imports: [IonicPageModule.forChild(AidePage), TranslateModule.forChild()],
})
export class AidePageModule {}
