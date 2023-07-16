import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchPage } from './search';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../components/components.module';

@NgModule({
	declarations: [ SearchPage, /* AnnonceComponent */ ],
	imports: [
		IonicPageModule.forChild(SearchPage),
		ComponentsModule,
		TranslateModule.forChild(),
	]
})
export class SearchPageModule {}
