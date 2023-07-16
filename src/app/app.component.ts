import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

import { Storage } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Globalization } from '@ionic-native/globalization';

import { ImgCacheService } from '../global';
import { Events } from 'ionic-angular/util/events';
import { LoginProvider } from '../providers/login/login';
import { AfProvider } from '../providers/af/af';
import { Geolocation } from '@ionic-native/geolocation';

@Component({
	templateUrl: 'app.html'
})
export class MyApp {
	counter: number;
	language: string;
	syncedLast = [];
	interval: number;
	fireAbout;
	rootPage = 'sidemenu';

	constructor(
		public platform: Platform,
		statusBar: StatusBar,
		splashScreen: SplashScreen,
		public storage: Storage,
		public events: Events,
		public global: Globalization,
		private translate: TranslateService,
		private imgCache: ImgCacheService,
		private lgServ: LoginProvider,
		public geolocation: Geolocation,
		private afServ: AfProvider
	) {
		
		
		this.platform.ready().then(() => {
			
			this.storeUserPosition();
			this.storage.get('_ona_distance').then((dist) => {
				if (dist) {
				} else {
					this.storage.set('_ona_distance', 20);
				}
			});

			//On initialise la configuration des images en locales
			this.imgCache.initImgCache().subscribe((v) => {}, (err) => {});
			
			splashScreen.hide();
			statusBar.styleDefault();
	
			//On check le statut internet
			this.lgServ.checkstatus();

			// Here you can do any higher level native things you might need.
			this.afServ.retrieveFireBaseData((data) => {
				this.lgServ.setTable('_ona_fireData', data);
			});
		});

		this.initTranslate();
	}

	//On initie la traduction
	initTranslate() {
        // Set the default language for translation strings, and the current language.
        this.translate.setDefaultLang('en');
		
		this.storage.get('preferedLangauge').then((lang) => {
			if(lang){
				this.translate.use(lang);
				//this.translate.setDefaultLang(lang);
			}
			else{
				
				if (this.translate.getBrowserLang() !== undefined) {
					this.translate.use(this.translate.getBrowserLang());
					//this.translate.setDefaultLang(this.translate.getBrowserLang());
				} else {
					this.translate.use('fr'); // Set your language here
					//this.translate.setDefaultLang('fr');
				}
			}
		});

	}
	
	/**
	 * Cette fonctio permet de capturer la 
	 * position de l'utilisateur connecté
	 */
	storeUserPosition(){

		const subscription = this.geolocation
				.watchPosition()
				.filter((p) => p.coords !== undefined) //Filter Out Errors
				.subscribe((position) => {
					var coords = {
						latitude: position.coords.latitude,
						longitude: position.coords.longitude
					};
					this.lgServ.setTable('_ona_lastPosition', coords);
				});
	}
}
