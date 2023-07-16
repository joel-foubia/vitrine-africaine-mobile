import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CompanyPage } from './company';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	declarations: [ CompanyPage ],
	imports: [ IonicPageModule.forChild(CompanyPage), TranslateModule.forChild() ]
})
export class CompanyPageModule {}
