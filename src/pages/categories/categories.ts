import { WpPersistenceProvider } from './../../providers/wp-persistence/wp-persistence';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { LoginProvider } from '../../providers/login/login';
import { TranslateService } from '@ngx-translate/core';
import { AfProvider } from '../../providers/af/af';


@IonicPage()
@Component({
	selector: 'page-categories',
	templateUrl: 'categories.html'
})
export class CategoriesPage {
	allcategories = [];
	model: string;
	public isSearchbarOpened = false;
	checkSync: any;
	txtLangue: any;
	objLoader: boolean;
	catReset: any[];
	errorMessage: string;
	dumpData = [];
	categorie = [];
	maxCat: number = 10;
	children: any;
	popCat: any;
	popCatFirebase = [];
	notif: boolean;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public storage: Storage,
		public menu: MenuController,
		public persistence: WpPersistenceProvider,
		public translate : TranslateService,
		public af: AfProvider,
		public lgServ: LoginProvider
	) {
		this.translate.get('message.errorMessage').subscribe((reponse) => {
    	this.txtLangue = reponse;
    });
		
		this.objLoader = true;
		this.model = 'pointfinderltypes';
		this.syncOffOnline();
		this.newCategorie();
		this.storage.get('notified').then((_val)=>{
			if(_val){
				this.notif = false;
			}else if(!_val){
				this.notif = true;
			}
		});
	}

	activateSyn() {
		this.lgServ.connChange('_ona_' + this.model).then((res) => {
			if (res) {
				this.backgroundSync();
			} else {
				clearInterval(this.checkSync);
			}
		});
	}
	
	openLeftMenu() {
		this.menu.open();
	}

	syncOffOnline() {
		this.lgServ.checkStatus('_ona_' + this.model).then((res) => {
			if (res == 'i') {
				this.objLoader = false;
			} else if (res == 's') {
				this.getCats().then((_val) => {
				});
			}
			if (res == 'w' || res == 'rw') {
				// this.getFromServer();
				this.objLoader = false;
			}
		});
	}

	getFromServer() {
		this.persistence
			.getWpData(this.model, 100, 1)
			.then((res: any) => {
				this.lgServ.setTable('_ona_' + this.model, res);
				this.lgServ.setSync('_ona_' + this.model + '_date');
				this.getCats().then((_val) => {
				});
			})
			.catch((err) => {
			});
	}

	backgroundSync() {
		this.persistence.pageBgSyncOthers(this.model);
	}


	setFilteredItems(ev) {
		if (ev.target.value === undefined) {
			this.categorie = this.dumpData;
			// console.log('Empty =>>>>>')
			return;
		}

		var val = ev.target.value;
		if (val != '' && val.length > 2) {
			this.categorie = this.allcategories.filter(item => {

				var name = item.name;
				let txtNom = name;
				return txtNom.toLowerCase().indexOf(val.toLowerCase()) > -1;
			});

		} else if (val == '' || val == undefined) {
			this.getCats().then((_val : any)=>{
			this.categorie = [];
				for (let h = 0; h < _val.length; h++) {
					var element = _val[h];
					if(element.count > 0){
						this.categorie.push(element);
					}
					
				}
			this.errorMessage = this.txtLangue.errorMessage;
			});
		}
	}


	
	goToAnounce(item) {
		this.navCtrl.push('AnnoncesPage', { category: item });
	}
	goToAnounceParent(item) {
		this.navCtrl.push('AnnoncesPage', { category: item });
	}
	
	newCategorie(){

		this.getCats().then((_data : any )=>{
			var allCat = [];
			allCat= _data;
			
			this.af.popularCat((_val)=>{
				var popCat = _val;
				for(let i = 0; i < allCat.length; i++){
					var compared = allCat[i].id;
					if(popCat.indexOf(compared) > -1){
					this.popCatFirebase.push(allCat[i]);
					}
				}
			});

		});
	}

	getCats() {

		return new Promise((resolve, reject) => {
			this.storage.get('_ona_pointfinderltypes').then((data) => {
				this.objLoader = false;
				var cat = JSON.parse(data);
				this.allcategories = JSON.parse(data);
				this.categorie = [];
				for (let h = 0; h < cat.length; h++) {
					var element = cat[h];
					if(element.count > 0){
						this.categorie.push(element);
					}
				}
				resolve(this.allcategories);
			});
		});
	}

	loadMoreCategories(infiniteScroll) {
		this.maxCat += 10;

		infiniteScroll.complete();
	}
}
