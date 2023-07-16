import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, Events } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { PopoverController } from 'ionic-angular/components/popover/popover-controller';
import { LoginProvider } from '../../providers/login/login';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';

/**
 * Generated class for the MesRdvsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-mes-rdvs',
	templateUrl: 'mes-rdvs.html'
})
export class MesRdvsPage {
	events;
	txtPop;
	model;
	max = 10;
	serachedItems: any;
	rdvList = [];
	dumpData = [];
	objLoader;
	today;
	search_term;
	txtMessage: any;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public translate: TranslateService,
		public popoverCtrl: PopoverController,
		public lgServ: LoginProvider,
		public persistence: WpPersistenceProvider,
		public menuCtrl: MenuController,
		public ev: Events
	) {
		this.today = new Date();
		this.objLoader = true;
		this.model = 'rdvs';
		//On active la traduction
		this.translate.get([ 'pop', 'annonce', 'message' ]).subscribe((res) => {
			this.txtPop = res.pop;
			this.txtMessage = res.message;
		});

		ev.subscribe('user:connected', (user) => {
			this.loadData(this.model);
		});

		this.events = {
			onClick: function(event: any) {},
			onAddToFav: function(event: any) {}
		};
		lgServ.isTable('wpIonicToken').then((user) => {
			if (user) {
				this.loadData(this.model);
			} else {
				navCtrl.push('LoginPage');
				persistence.showMsgWithButton(this.txtMessage.rdv_login, 'top', 'toast-info');
				this.objLoader = false;
			}
		});
	}

	ionViewDidLoad() {}

	loadData(model) {
		this.lgServ.isTable('_ona_' + model).then((rdvs) => {
			if (rdvs) {
				var listRdv = JSON.parse(rdvs);
				this.dumpData = listRdv;
				this.rdvList = listRdv;

				for (let i = 0; i < this.rdvList.length; i++) {
					if (new Date(this.rdvList[i].date) > this.today) {
						this.rdvList[i].state = 'tocome';
					} else if (new Date(this.rdvList[i].date) <= this.today) {
						this.rdvList[i].state = 'passed';
					}
				}
				this.objLoader = false;
				console.log('Rdvs List =>', this.rdvList);
			} else {
				this.objLoader = false;
			}
		});
	}

	doInfinite(infiniteScroll) {
		// console.log('Scrolling');
		this.max += 10;
		infiniteScroll.complete();
	}

	openLeftMenu() {
		this.menuCtrl.open();
	}

	onCancel() {
		this.serachedItems = undefined;
	}
	onClear() {
		this.serachedItems = undefined;
	}

	launchSearch(ev) {
		if (this.dumpData.length > 0) {
			if (ev.target.value == '') {
				this.rdvList = this.dumpData;
			} else {
				this.rdvList = this.dumpData.filter((item) => {
					return item.annonce_data.title.rendered.toLowerCase().indexOf(ev.target.value.toLowerCase()) > -1;
				});
			}
		} else {
			this.persistence.showMsgWithButton(this.txtMessage.fxn_not_ava, 'top', 'toast-info');
		}
	}
}
