import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AboutPage } from './about';
import { TranslateModule } from '@ngx-translate/core';
// import { ImageCacheDirective } from '../../imagecache/imagecache';
import { CacheImgModule } from '../../global';
import { ParallaxHeaderDirectiveModule } from '../../directives/parallax-header/parallax-header.module';

@NgModule({
	declarations: [ AboutPage ],
	imports: [ IonicPageModule.forChild(AboutPage), TranslateModule.forChild(), 
		ParallaxHeaderDirectiveModule,
		CacheImgModule
	],

	entryComponents: []
})
export class AboutPageModule {}
