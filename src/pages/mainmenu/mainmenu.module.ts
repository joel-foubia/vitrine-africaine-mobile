// import { LoadingModule } from 'ngx-loading';
import { Ionic2RatingModule } from 'ionic2-rating';
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MainmenuPage } from './mainmenu';
// import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
// import { setTranslateLoader } from '../../app/app.module';
// import { ImgCacheModule } from 'ng-imgcache';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SwipeUpDirective } from '../../directives/swipe-up/swipe-up';
import { SwipeUpDirectiveModule } from '../../directives/swipe-up/swipe-up.module';
// import { ImageCacheDirective } from '../../imagecache/imagecache';

@NgModule({
	declarations: [ MainmenuPage ],
	imports: [
		IonicPageModule.forChild(MainmenuPage),
		Ionic2RatingModule,
		// LoadingModule,
		LazyLoadImageModule,
		SwipeUpDirectiveModule,
		// ImgCacheModule,
		TranslateModule.forChild()
	]
})
export class MainmenuPageModule {}
