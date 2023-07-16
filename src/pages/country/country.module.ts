import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CountryPage } from './country';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    CountryPage,
  ],
  imports: [
    IonicPageModule.forChild(CountryPage), TranslateModule.forChild()
  ],
})
export class CountryPageModule {}
