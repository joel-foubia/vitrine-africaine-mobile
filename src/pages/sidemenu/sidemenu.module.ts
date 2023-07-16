import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SidemenuPage } from './sidemenu';
// import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
// import { setTranslateLoader } from '../../app/app.module';
import { CacheImgModule } from '../../global';

import { TranslateLoader } from '@ngx-translate/core';

@NgModule({
	declarations: [ SidemenuPage ],
	imports: [ IonicPageModule.forChild(SidemenuPage), TranslateModule.forChild(), CacheImgModule ]
})
export class SidemenuPageModule {}
