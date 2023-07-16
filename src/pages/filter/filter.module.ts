import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FilterPage } from './filter';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    FilterPage,
  ],
  imports: [
    IonicPageModule.forChild(FilterPage), TranslateModule.forChild()
  ],
})
export class FilterPageModule {}
