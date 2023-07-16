import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SignupPage } from './signup';
import { TranslateModule } from '@ngx-translate/core';
// import { LoadingModule } from 'ngx-loading';

@NgModule({
	declarations: [ SignupPage ],
	imports: [ IonicPageModule.forChild(SignupPage), TranslateModule.forChild() ]
})
export class SignupPageModule {}
