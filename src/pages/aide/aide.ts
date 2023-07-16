import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
// import { ConnectionStatusProvider } from '../../providers/connection-status/connection-status';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { Storage } from '@ionic/storage';


@IonicPage({
	name: 'aide'
})
@Component({
	selector: 'page-aide',
	templateUrl: 'aide.html'
})
export class AidePage {
	docs: any;
	txtLangue: any;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public modalCtrl: ModalController,
		// public connstatprov: ConnectionStatusProvider,
		public persistence: WpPersistenceProvider,
		public storage: Storage
	) {
		/* this.persistence.getInfosAbout(res => {
      this.docs = res;
      console.log('Docs', this.docs);
    }); */
		this.storage.get('fireAbout').then((res) => {
			this.docs = res;
		});
		this.txtLangue = {
			email_fail: 'Lenvoi du mail a echoeur',
			title_bugs: 'Bugs',
			assistance: 'Assistance',
			doc_fail: 'Document open Failed',
			objet: 'Report Error / Bugs : 237 GUIDE PROFESSIONEL',
			nom: 'Name',
			company: 'Company',
			tel: 'Telephone',
			message: 'Message'
		};
	}

	ionViewDidLoad() {}

	openReport() {
		let addModal = this.modalCtrl.create('report', {
			type: { label: 'report', title: this.txtLangue.title_bugs }
		});
		addModal.onDidDismiss((data) => {
			if (data) {
				console.log('Bug Report', data);
				console.log('About data : ', this.docs.bugs_email);
				this.persistence.doEmail(
					this.docs.bugs_email,
					this.txtLangue.email_fail,
					this.txtLangue.title_bugs,
					data
				);
			}
		});

		addModal.present();
	}
	openDoc() {
		// this.connstatprov.doWebsite(this.docs.doc_url, this.txtLangue.doc_fail);
	}
	//Cette fonction permet d'ouvrir le formulaire
	//de demande d'assistance
	openAssistance() {
		let addModal = this.modalCtrl.create('report', {
			type: { label: 'assistance', title: this.txtLangue.assistance }
		});
		addModal.onDidDismiss((data) => {
			if (data) {
				console.log(data);
				console.log('About data : ', this.docs.bugs_email);
				// this.connstatprov.doEmail(
				// 	this.docs.bugs_email,
				// 	this.txtLangue.email_fail,
				// 	this.txtLangue.objet,
				// 	this.buildMessage(data)
				// );
			}
		});

		addModal.present();
	}

	//Cette fonction ouvre la page FAQ
	faq() {
		this.navCtrl.push('faq');
	}

	//Construire le message
	private buildMessage(data) {
		let html = '';
		html += this.txtLangue.nom + data.name + '<br>';
		html += this.txtLangue.company + data.company + '<br>';
		html += this.txtLangue.tel + data.phonenumber + '<br><br><br>';
		html += this.txtLangue.message + '<br>' + data.message + '<br>';

		return html;
	}
}
