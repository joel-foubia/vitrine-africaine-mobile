import { Component, ViewChild } from '@angular/core';
import { WpPersistenceProvider } from './../../providers/wp-persistence/wp-persistence';
import { AuthProvider } from './../../providers/auth/auth';
import { IonicPage, NavController, NavParams, Nav, AlertController, App, Events } from 'ionic-angular';
// import { Storage } from '@ionic/storage';
// import { ConnectionStatusProvider } from '../../providers/connection-status/connection-status';
// import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { LoginProvider } from '../../providers/login/login';
import { TabsPage } from '../tabs/tabs';

@IonicPage({
	name: 'sidemenu'
})
@Component({
	selector: 'page-sidemenu',
	templateUrl: 'sidemenu.html'
})
export class SidemenuPage {
	current_lang: string = 'fr';
	@ViewChild(Nav) nav: Nav;
	last_update: Date;
	isSync: boolean;
	offers = [];
	sections = [];
	pages = [];
	user;
	rootPage: any = TabsPage;
	// srcImg: string;
	defaultImage: string;
	profile_image = 'assets/images/help.jpg';

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public app: App,
		public lgServ: LoginProvider,
		public ev: Events,
		public persistence: WpPersistenceProvider,
		public translate: TranslateService,
		public auth: AuthProvider,
		public alertCtrl: AlertController
	) {
		this.current_lang = this.translate.getDefaultLang();
		this.ev.subscribe('user:connected', (userData) => {
			this.user = userData;
			// console.log('USer ', this.user);
			this.defaultImage = 'assets/images/help.jpg';

			this.lgServ.isTable('_ona_userDetails').then((details) => {
				if (details) {
					//console.log('User Details =>', JSON.parse(details));
					if (JSON.parse(details).userData.Profil_image != '') {
						this.profile_image = JSON.parse(details).userData.Profil_image;
					} else {
						this.profile_image = this.defaultImage;
					}
				} else {
					this.profile_image = this.defaultImage;
				}
			});
	


			this.initializeMenu();

			//Changement de la langue par l'utilisateur
			this.ev.subscribe('lang:done', (lang) => {
				this.translate.use(lang);
				this.getSideMenus();
			});
		});

		this.ev.subscribe('user:disconnected', (userData) => {
			this.user = undefined;
		});

		this.lgServ.isTable('wpIonicToken').then((data) => {
			if (data) {
				this.user = JSON.parse(data);
			}

			this.defaultImage = 'assets/images/africa.png';
			this.initializeMenu();

			//Changement de la langue par l'utilisateur
			this.ev.subscribe('lang:done', (lang) => {
				// console.log(lang);
				this.translate.use(lang);
				this.translate.setDefaultLang(lang);
				this.getSideMenus();
			});
		});
	}

	//On initialise les menus
	initializeMenu() {
		this.lgServ.isTable('preferedLangauge').then((lang) => {
			let langue = 'en';
			if (lang) {
				this.translate.use(lang);
				langue = lang;
			} else {
				this.translate.use('fr');
			}

			this.translate.setDefaultLang(langue);
			this.getSideMenus();
		});

		//On fixe la date
		this.lgServ.isTable('_last_synchro').then((res) => {
			if (res) this.last_update = res;
		});
	}

	//On définit le menu gauche de l'application
	getSideMenus() {
		this.translate.get('menu').subscribe((res) => {
			// console.log(res);
			this.pages = this.setModulesOfUser(res);
			this.offers = this.setMenuOffers(res);
			this.sections = this.customMenu(res);
		});
	}

	//Cette fonction permet de construire le menu en fonction des droits d'utilisateur
	private customMenu(res) {
		var second_menu: any;

		//Sous Menu Utilisateur
		var results = [];

		//Sous menu A Propos et Aide
		var about = [
			{ title: res.setting, icon: 'ios-settings-outline', name: 'SettingPage' },
			{ title: res.support, icon: 'ios-help-circle-outline', name: 'AideEtAssistancePage' },
			{ title: res.about, icon: 'ios-information-circle-outline', name: 'AboutPage' }
		];

		// console.log('before good', localStorage.getItem('manager'));
		if (localStorage.getItem('va_manager') == 'admin') {
			// first_menu = managers.concat(about);
			// second_menu = results.concat(first_menu);
		} else {
			second_menu = results.concat(about);
		}

		return second_menu;
	}

	/**
	 * Cette fonction permet de définir les menus qui devront
	 * figurer sur le menu gauche de l'application
	 * @param leMenu any, les traductions
	 */
	private setModulesOfUser(leMenu) {
		
		let allMenus = [
			{ title: leMenu.home, name: TabsPage, index: 0, image: 'assets/images/search.png' },
			{ title: leMenu.guideafricain, name: 'DonnezAvisPage', image: 'assets/images/africa.png', action: 'guide' },
			{ title: leMenu.events, name: TabsPage, index: 3, image: 'assets/images/events.png' },
			{ title: leMenu.avis, name: 'DonnezAvisPage', image: 'assets/images/rating.png', action: 'avis' },
			{ title: leMenu.location, name: 'TaxonomiesListPage', image: 'assets/images/map-location.png', type: { name: 'location' }},
			{ title: leMenu.tag, name: 'TaxonomiesListPage', image: 'assets/images/price-tag.png', type: { name: 'tag' }},
			{ title: leMenu.nearme, name: 'NearbyListPage', image: 'assets/images/nearme.png' },
			{ title: leMenu.meetings, name: 'MesRdvsPage', image: 'assets/images/timer.png' },
			{ title: leMenu.infos, name: '', image: '', slug: 'divider' },
			{ title: leMenu.news, name: 'ActualitePage', image: 'assets/images/news.png' },
			{ title: leMenu.expert, name: 'LesExpertsPage', image: 'assets/images/expert.png' },
			{ title: leMenu.last_news, name: 'NewsPage', image: 'assets/images/newspaper.png' },
			{ title: leMenu.tv, name: 'WebtvPage', image: 'assets/images/tv.png' },
			{ title: leMenu.company, name: 'CompanyPage',  image: 'assets/images/company.png' }
		];
 
		// let current_lang = this.translate.getDefaultLang();
		return allMenus;
	}

	/**
	 * Cette fonction permet de définir les menus
	 * relatives à l'annonce et/catégories
	 * @param leMenu any
	 */
	private setMenuOffers(leMenu) {
		let allMenus = [
			// { title: leMenu.category, name: 'CategoriesPage', image: 'assets/images/menu.png' },
			// { title: leMenu.annonces, name: 'AnnoncesPage', image: 'assets/images/announcement.png' },
			{
				title: leMenu.favorites,
				name: TabsPage,
				index: 2,
				image: 'assets/images/favorite-heart-button.png'
			},
			{ title: leMenu.recents, name: TabsPage, index: 1, image: 'assets/images/last.png' }
		];

		// let current_lang = this.translate.getDefaultLang();
		return allMenus;
	}

	ionViewDidEnter() {}

	//On ouvre la page lors de l'action clic
	//sur un élément du menu gauche
	openPage(page) {
		let params = {};

		if (page.index) {
			params = { tabIndex: page.index, page: page.name, action: page.action, type: page.type };
		}else{
			params = { action: page.action, type: page.type };
		}

		if (page.index === undefined) this.nav.setRoot(page.name, params);
		else if (page.slug !== undefined && page.slug == 'divider') {
		} else if (this.nav.getActiveChildNav() && page.index != undefined) {
			// this.nav.getActiveChildNav().select(page.index);

			this.nav.setRoot(TabsPage, params);
		} else {
			this.nav.setRoot(page.name, params);
		}
		// else if (page.index !== undefined) this.navCtrl.parent.select(page.index);
		// else if (page.component === undefined ) this.nav.setRoot(page.name);
	}

	//Cette fonction permet de se déconnecter
	logOff() {
		const confirm = this.alertCtrl.create({
			title: 'Deconnexion',
			message: 'Voulez vous vous deconnecter?',
			buttons: [
				{
					text: 'Non',
					handler: () => {}
				},
				{
					text: 'Oui',
					handler: () => {
						this.auth.logOut();
						this.ev.publish('user:disconnected');
					}
				}
			]
		});
		confirm.present();
	}

	//Cette fonction va ouvrir la page Profile de
	//l'utilisateur
	//@param objUser JSONObject, les informations relatives au user
	showProfile(objUser) {
		this.nav.push('ProfilePage', { objet: objUser });
	}

	/**
   * Cette fonction permet de synchroniser les
   * données en locale depuis le serveur
   */
	refreshData() {
		this.isSync = true;
		this.persistence.launchManualSync();

		this.ev.subscribe('sync:done', (is_sync) => {
			//console.log("choueete");
			if (is_sync) {
				this.isSync = !is_sync;
				this.last_update = new Date();

				this.ev.unsubscribe('sync:done');
			}
		});
	}

	//Login
	logIn() {
		this.navCtrl.push('LoginPage');
	}
}
