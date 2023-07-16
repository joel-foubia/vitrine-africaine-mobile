import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { MenuController } from 'ionic-angular/components/app/menu-controller';

/**
 * Generated class for the CompanyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-company',
	templateUrl: 'company.html'
})
export class CompanyPage {
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public menuCtrler: MenuController,
		public modalCtrl: ModalController
	) {}

	ionViewDidLoad() {}

	openMenu() {
		this.menuCtrler.open();
	}

	addAnnonce() {
		let modal = this.modalCtrl.create('RecevoirPapierPage');
	
		modal.present();
	}
	
	openPaper() {
		// present modal
		let modal = this.modalCtrl.create('report', { type: { label: 'assistance' } });

		modal.present();

		modal.onDidDismiss((data) => {
			if (data) {
			} else {
			}
		});
	}

	openServices(){
		let modal = this.modalCtrl.create('NosServicesPage');

		modal.present();
	}

	openEvent() {
		this.navCtrl.push('PubFormPage');
	}
}
