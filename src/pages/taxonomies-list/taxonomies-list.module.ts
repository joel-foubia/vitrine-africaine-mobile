import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TaxonomiesListPage } from './taxonomies-list';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    TaxonomiesListPage,
  ],
  imports: [
    IonicPageModule.forChild(TaxonomiesListPage),
    TranslateModule.forChild()
  ],
})
export class TaxonomiesListPageModule {}
