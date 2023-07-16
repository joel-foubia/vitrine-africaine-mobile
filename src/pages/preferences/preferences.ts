import { TranslateService } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';
import { Storage } from '@ionic/storage';
// import { ConnectionStatusProvider } from '../../providers/connection-status/connection-status';

/**
 * Generated class for the PreferencesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
	name: 'preferences'
})
@Component({
	selector: 'page-preferences',
	templateUrl: 'preferences.html'
})
export class PreferencesPage {
	notifications = 0;
	distance;
	autosync;
	language;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public translate: TranslateService,
		public storage: Storage,
		public ev: Events,
		// public connstatprov: ConnectionStatusProvider
	) {
		this.ev.subscribe('New : Notification', (empty) => {
			this.storage.get('notifsNum').then((num) => {
				if (num) {
					this.notifications = num;
				}
			});
		});
	}

	ionViewDidEnter() {
		this.storage.get('searchRadius').then((rad) => {
			if (rad) {
				this.distance = rad / 1000;
			} else {
				this.distance = 5;
			}
		});
		this.storage.get('preferedLangauge').then((lang) => {
			this.language = lang;
		});
		this.storage.get('autoSync').then((sync) => {
			if (sync != null) {
				this.autosync = sync;
			} else {
				this.autosync = true;
			}
		});
	}
	ionViewDidLoad() {}

	goToNotifications() {
		this.navCtrl.push('notifications');
	}
	autoSyncUpdate() {
		this.storage.set('autoSync', this.autosync).then(() => {
			this.ev.publish('autosync:changed', 'empty');
		});
	}

	setLanguage() {
		this.translate.use(this.language).subscribe((res) => {
			console.log('Result', res);
			this.storage.set('preferedLangauge', this.language);
		});
	}

	setRadius() {
		if (/^\d+$/.test(this.distance)) {
			var dist = parseInt(this.distance) * 1000;
			this.storage.set('searchRadius', dist).then(() => {
				// this.distance = '';
			});
		} else {
			
		}
	}

	savePreferences() {
		this.autoSyncUpdate();
		this.setLanguage();
		this.setRadius();
		
	}
}
