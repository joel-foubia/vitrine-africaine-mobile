import { Component } from '@angular/core';
import { IonicPage, AlertController, ViewController, MenuController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AfProvider } from '../../providers/af/af';



@IonicPage()
@Component({
	selector: 'page-faq',
	templateUrl: 'faq.html'
})
export class FaqPage {
	faqs: any;
	constructor(
		public afServ: AfProvider,
		private translate: TranslateService,
		public alertCtrl: AlertController,
		public view: ViewController,
		public menuCtrl: MenuController
	) {
		this.afServ.getFAQ().subscribe(res=>{
			// console.log(res);
			for (let i = 0; i < res.length; i++) {
			  if(res[i].title==this.translate.getDefaultLang()){
				this.faqs = res[i].tab;
				break;
			  }
			}
		});
	}

	showMenu() {
		this.menuCtrl.open();
	}

	showAnswer(obj) {
		let alert = this.alertCtrl.create({
			title: obj.q,
			message: obj.r,
			buttons: [ 'OK' ],
			cssClass: 'dialog_answer'
		});

		alert.present();
	}
	ionViewDidLoad() {}

	close() {
		this.view.dismiss();
	}
}
