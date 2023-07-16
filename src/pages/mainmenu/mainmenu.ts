import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import {
	IonicPage,
	NavController,
	NavParams,
	AlertController,
	PopoverController,
	Events
} from 'ionic-angular';

// import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { AfProvider } from '../../providers/af/af';
import { AuthProvider } from '../../providers/auth/auth';
import { LoginProvider } from '../../providers/login/login';
// import { SpeechRecognition } from '@ionic-native/speech-recognition';

@IonicPage({
	name: 'mainmenu'
})
@Component({
	selector: 'page-mainmenu',
	templateUrl: 'mainmenu.html'
})
export class MainmenuPage {
	
	txtPop: any;
	user: any;
	menu_actionSheet: any;
	displayMenu: boolean;
	// allMenus = [];
	sub_menus = [];
	current_lang: string;
	search_word;
	animate: boolean;
	txtWelcome = "";
	notifications = 0;
	text;
	show;
	main_categories = [];
	display = true;
	location = '';

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		
		public popCtrler: PopoverController,
		public translate: TranslateService,
		public event: Events,
		public alertCtrl: AlertController,
		public auth: AuthProvider,
		private lgServ: LoginProvider,
		private afServ: AfProvider
	) {

		this.afServ.getMainMenu().subscribe((res) => {
			
			this.lgServ.isTable('preferedLangauge').then((lang) => {
				if(lang) this.current_lang = lang;
				else this.current_lang = "fr";
			});

			this.event.subscribe('lang:done', (lang) => {
				// console.log(lang);
				this.current_lang = lang;
			});

			this.main_categories = res;
			this.display = false;
		},(err)=>{
			this.display = false;
		});

		this.translate.get("pop").subscribe(res=>{
			this.txtPop = res;
		});

		this.event.subscribe('user:disconnected', (userData) => {
			this.user = undefined;
		});
		this.event.subscribe('user:connected', (userData) => {
			this.user = userData;
		});

	}

	/**
	 * Cette fonction permet d'ouvrir la vue correspondant
	 * à la catégorie (ou menu) choisit par l'utilisateur
	 * @param obj any, objet permettant d'ouvrir les annonces
	 */
	onTapCategory(obj){

		if (obj.id != 0)
			this.navCtrl.push('AnnoncesPage', {
				category: { id: obj.id, name: obj.title[this.current_lang] }
			});
		else {
			if (obj.slug == 'category') 
				this.navCtrl.push('CategoriesPage');
			
		}
	}

	/**
	 * Cette fonction permet de se déconnecter
	 */
	logOut() {
		const confirm = this.alertCtrl.create({
			title: this.txtPop.lblLogOff,
			message: this.txtPop.txtLogOff,
			buttons: [
				{
					text: this.txtPop.no,
					handler: () => {}
				},
				{
					text: this.txtPop.yes,
					handler: () => {
						this.auth.logOut();
						this.event.publish('user:disconnected');
					}
				}
			]
		});
		confirm.present();
	}

	//Ouvre la vue Profile utilisateur
	goToParams(){
		this.navCtrl.push('ProfilePage', {objet: this.user});
	}

	//Permet à l'utilisateur de se déconnecter
	deconnexion() {
		this.lgServ.isTable('wpIonicToken').then((user) => {
			if (user) {
				this.logOut();
			} else {
				this.navCtrl.push('LoginPage');
			}
		});
	}


	ionViewDidLoad() {
		this.lgServ.isTable('wpIonicToken').then((user) => {
			if (user) {
				this.user = JSON.parse(user);
			} 
		});
	}

	ionViewWillEnter() {}

	recherche() {
		if (this.search_word === undefined || this.search_word == '') {
			this.navCtrl.push('SearchPage');
		} else {
			this.navCtrl.push('SearchPage', { search: this.search_word });
		}
	}

	//Cette fonction permet à l'utilisateur d'éffectuer
	//la recherche via la voix
	searchText(){

		let ev = { target : { getBoundingClientRect : () => { return { top: '100' }; } }};
		let popover = this.popCtrler.create('SpeechToTextPage', {'lang': this.txtPop}, {cssClass: 'custom-popaudio'});
		
		popover.present({ev});
		popover.onDidDismiss((result)=>{
		  
			if(result){
				this.navCtrl.push('SearchPage', { search: result });
			}
		});    
	}
	
}
