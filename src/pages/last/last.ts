import { Component } from '@angular/core';
import { WpPersistenceProvider } from './../../providers/wp-persistence/wp-persistence';
import {
	IonicPage,
	NavController,
	NavParams,
	ModalController,
	Events,
	PopoverController,
	LoadingController,
	MenuController,
	Platform
	// Searchbar
} from 'ionic-angular';

// import { Keyboard } from '@ionic-native/keyboard';
import { TranslateService } from '@ngx-translate/core';
import { LoginProvider } from '../../providers/login/login';

@IonicPage()
@Component({
	selector: 'page-last',
	templateUrl: 'last.html'
})
export class LastPage {
	isCategory: boolean;
	// wordToSearch = '';
	tags = [];
	maxTag: number = 10;
	events: any;
	txtSearch: any;
	objLoader: boolean;
	roleType: string;
	maxLieu: number = 10;
	maxCat: number = 10;
	locations = [];
	categories = [];
	isSearch: boolean = false;
	max: number = 10;
	maxFeatured: number = 10;
	txtLangue: any;
	txtPop: any;
	current_lang: string;
	posts = [];
	featured = [];
	vuesToDisplay: number = 1;
	// display: boolean;

	// @ViewChild(Searchbar) searchBar: Searchbar;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public popCtrl: PopoverController,
		public menuCtrl: MenuController,
		// public geolocation: Geolocation,
		public modalCtrl: ModalController,
		// public keyboard: Keyboard,
		public ev: Events,
		public loadCtrl: LoadingController,
		public translate: TranslateService,
		private wpServ: WpPersistenceProvider,
		private lgServ: LoginProvider,
		public popoverCtrl: PopoverController,
		public platform: Platform
	) {
		this.ev.subscribe('annonce:deleted', (annonce) => {
			// console.log('Annonce Deleted at last=>', annonce)
			for (let k = 0; k < this.posts.length; k++) {
				if (this.posts[k].id == annonce.id) {
					this.posts.splice(k, 1);
				}
			}
		});
		this.ev.subscribe('annonce:modified', (annonce) => {
			// console.log('Annonce Deleted at last=>', annonce)
			for (let k = 0; k < this.posts.length; k++) {
				if (this.posts[k].id == annonce.id) {
					this.posts[k] = annonce
				}
			}
		});

		this.current_lang = this.translate.getDefaultLang();
		// this.wordToSearch = this.navParams.get('search');
		this.roleType = 'annonces';
		this.translate.get([ 'pop', 'message' ]).subscribe((res) => {
			this.txtPop = res.pop;
			this.txtLangue = res.message;
		});

		this.objLoader = true;

		//On définit les évènements sur l'aonnonce
		this.events = {
			onClick: function(event: any) {
				//Add item to historic table
				// wpServ.copiedAddObjet('historic_annonce', event.annonce);
				navCtrl.push('AnnonceDetailPage', { annonce: event });
			},

			onAddToFav: function(event: any) {
				if (event.annonce.like) {
					if (event.annonce.like == true) {
						event.annonce.like = false;
						lgServ.disLikeItem(event.annonce, 'listing');
					} else {
						event.annonce.like = true;
						lgServ.likeItem(event.annonce, 'listing');
					}
				} else {
					event.annonce.like = true;
					lgServ.likeItem(event.annonce, 'listing');
				}
			},

			onReserve: function(event: any) {
				translate.get([ 'pop', 'annonce' ]).subscribe((res) => {
					wpServ.reserver(event.annonce, res.pop);
				});
			},
			onAddAvis: function(event: any) {
				let popover = popoverCtrl.create(
					'descpopover',
					{ params: event, slug: 'avis' },
					{ cssClass: 'custom-popavis' }
				);

				popover.present();

				popover.onDidDismiss((data) => {
					if (data) {
						// Upload to server data(annonce)
					}
				});
			},
			onPress: function(event: any) {
				let popover = popoverCtrl.create(
					'descpopover',
					{ params: event, slug: 'press' },
					{ cssClass: 'custom-options' }
				);

				popover.present();

				popover.onDidDismiss((data) => {
					if (data) {
						// console.log('Data on dismiss =>', data);
						if (data.slug == 'view') {
							navCtrl.push('AnnonceDetailPage', { annonce: event });
						} else if (data.slug == 'delete') {
							// Delete annonce
							wpServ.copiedDelSync('listing', event.annonce);
						} else {
							// update annonce
							navCtrl.push('FormAnnoncePage', { slug: 'edit', annonce: event.annonce });

						}
					}
				});
			}
		};
	}

	//Ouvre le menu gauche de l'application
	openLeftMenu() {
		this.menuCtrl.open();
	}

	loadFeatures() {
		for (let j = 0; j < this.posts.length; j++) {
			if (this.posts[j].webbupointfinder_item_featuredmarker == '1') {
				this.featured.push(this.posts[j]);
			}
		}
		// console.log('Featured=>', this.featured);
	}

	//On définit nos éléments de recherche
	private tabSearch() {
		let tabs = [
			{ slug: 'annonces', nom: 'Annonces', icon: '', tabs: [] },
			{ slug: 'category', nom: 'Catégories', icon: '', tabs: [] },
			{ slug: 'location', nom: 'Lieux', icon: '', tabs: [] }
		];
	}

	//Ouvre la vue filtre pour les critères de recherche
	onFilter() {
		let modal = this.modalCtrl.create('FilterPage', { lang: this.txtPop });
		// popover.present({ ev: theEvent });
		modal.onDidDismiss((result) => {
			if (result) {
				// console.log(result);
			}
		});
		modal.present();
	}

	/**
	 * Cette fonction permet de
	 * recherche une annonce
	 *
	 **/
	// setFilteredItems(ev) {
	// 	this.objLoader = false;
	// 	this.isCategory = false;
	// 	this.isSearch = false;

	// 	if (ev.target.value === undefined || ev == '') {
	// 		// this.posts = this.dumpData;
	// 		this.objLoader = true;
	// 		this.setMaxValue();

	// 		return;
	// 	}

	// 	var val;
	// 	if (ev.target === undefined) val = ev;
	// 	else val = ev.target.value;

	// 	if (val != '' && val.length > 1) {
	// 		this.objLoader = true;
	// 		this.txtSearch = val;
	// 		this.filterSearchByModel('listing', val);
	// 		this.filterSearchByModel('pointfinderltypes', val);
	// 		this.filterSearchByModel('pointfinderlocations', val);
	// 		this.filterSearchByModel('tags', val);

	// 		this.setMaxValue();
	// 	} else if (val == '' || val == undefined) {
	// 		// this.clients = this.dumpData;
	// 		this.objLoader = true;
	// 		this.setMaxValue();
	// 	}
	// }

	//Cette fonction permet de fixer la
	//valeur max d'éléments à afficher à 10
	private setMaxValue() {
		this.max = 10;
		this.maxCat = 10;
		this.maxLieu = 10;
		this.maxTag = 10;
	}

	/**
	 * Cette fonction permet de filtrer la recherche
	 * en fonction de la table enregistré
	 * @param model string le nom de la table
	 * @param txtSearch string le nom de la recherche
	 */
	filterSearchByModel(model, txtSearch) {
		this.getResults(model).then((results: any) => {
			// console.log(results);
			if (model == 'listing') {
				let list_annonces = this.formaterData(results);
				this.posts = list_annonces.filter((item) => {
					let txtNom = item.title.rendered;
					return txtNom.toLowerCase().indexOf(txtSearch.toLowerCase()) > -1;
				});
				// console.log('Annonces => ', this.posts);
			} else if (model == 'pointfinderltypes') {
				// else if (model == 'pointfinderlocations') {
				// 	this.locations = results.filter(item => {
				// 		// let txtNom = item.name;
				// 		if (item.name != undefined)
				// 			return item.name.toLowerCase().indexOf(txtSearch.toLowerCase()) > -1;
				// 	});
				// 	console.log("locations => ", this.locations);

				// }
				// console.log(results);
				this.categories = results.filter((item) => {
					// let txtNom = item.name;
					if (item.name != undefined) return item.name.toLowerCase().indexOf(txtSearch.toLowerCase()) > -1;
				});
				// console.log('Categories => ', this.categories);
			}
			// } else if (model == 'tags') {
			// 	// console.log(results);
			// 	this.tags = results.filter(item => {
			// 		// let txtNom = item.name;
			// 		if (item.name != undefined)
			// 			return item.name.toLowerCase().indexOf(txtSearch.toLowerCase()) > -1;
			// 	});
			// 	console.log("Tags => ", this.tags);
			// }
		});
	}

	/**
	 * Cette fonction permet de recupérer
	 * la liste des annonces
	 */
	getResults(model) {
		return new Promise((resolve, reject) => {
			this.lgServ.isTable('_ona_' + model).then((res) => {
				if (res) {
					resolve(JSON.parse(res));
				} else {
					this.wpServ
						.getWpData(model, 100, 1)
						.then((data) => {
							// console.log(data);

							this.lgServ.setTable('_ona_' + model, data);
							this.lgServ.setSync('_ona_' + model + '_date');
							resolve(data);
						})
						.catch((error) => {
							// console.log(error);
						});
				}
			});
		});
	}

	//Load 10 announces supplémentaires
	loadMoreOffs(infiniteScroll) {
		this.max += 10;

		infiniteScroll.complete();
	}

	//On charge 10 catégories supplémentaires
	loadMoreCategories(infiniteScroll) {
		this.maxCat += 10;

		infiniteScroll.complete();
	}

	//On charge 10 locations supplémentaires
	loadMoreLocations(infiniteScroll) {
		this.maxLieu += 10;
		infiniteScroll.complete();
	}

	//On charge 10 locations supplémentaires
	loadMoreTags(infiniteScroll) {
		this.maxTag += 10;
		infiniteScroll.complete();
	}

	//Cette fonction va ouvrir la vue Annonces ou détails
	//d'une annonce en fonction du type de modèle
	showAnnonces(item, type) {
		//Add item to historic table
		// this.wpServ.copiedAddObjet('historic_' + type, item);

		if (type == 'annonce') {
			this.navCtrl.push('AnnonceDetailPage', { annonce: item });
		} else if (type == 'category') {
			this.navCtrl.push('AnnoncesPage', { category: item });
		} else {
			this.navCtrl.push('AnnoncesPage', { location: item, type: type });
		}
	}

	/**
	 * Cette fonction permet de formater les annonces
	 * @param annonces Array<any>, liste des annonces
	 * @returns Array<any>
	 * 
	 * @author davart
	 */
	private formaterData(annonces) {
		let resultat = [];

		for (let k = 0; k < annonces.length; k++) {
			var categories = [];
			categories = annonces[k].pointfinderltypes;
			if (categories.indexOf(204) > -1 || categories.indexOf(124) > -1 || categories.indexOf(125) > -1) {
				annonces[k].bookable = true;
			} else {
				annonces[k].bookable = false;
			}
			if (categories.indexOf(148) > -1 || categories.indexOf(147) > -1) {
				annonces[k].reserv = true;
			} else {
				annonces[k].reserv = false;
			}
			if (annonces[k]._embedded['wp:featuredmedia'] == undefined) {
				annonces[k]['img'] = 'assets/imgs/logo.png';
			} else {
				if (annonces[k]._embedded['wp:featuredmedia'][0] == undefined) {
					annonces[k]['img'] = 'assets/imgs/logo.png';
				} else {
					annonces[k]['img'] = annonces[k]._embedded['wp:featuredmedia'][0].source_url;
				}
			}
			if (annonces[k]._embedded['wp:term'] == undefined) {
				annonces[k]['location'] = '';
			} else {
				if (annonces[k]._embedded['wp:term'][2] == undefined) {
					annonces[k]['location'] = '';
				} else {
					if (annonces[k]._embedded['wp:term'][2][0] == undefined) {
						annonces[k]['location'] = '';
					} else {
						annonces[k]['location'] = annonces[k]._embedded['wp:term'][2][0].name;
					}
				}
			}
			resultat.push(annonces[k]);
		}

		return resultat;
	}

	/**
	 * Cette méthode permet de lister
	 * le résultat des recherchers précédentes
	 */
	listLastsSearch() {
		this.posts = [];
		this.categories = [];

		this.lgServ.isTable('_ona_historic_annonce').then((res) => {
			if (res) {
				this.isSearch = true;
				let posts = JSON.parse(res);
				this.posts = posts.reverse().slice(0, 10);

				// this.loadFeatures();
				// console.log(this.posts);
			}
		});

		//Last search of categories
		this.lgServ.isTable('_ona_historic_category').then((data) => {
			if (data) {
				this.isCategory = true;
				let categories = JSON.parse(data);
				this.categories = categories.reverse().slice(0, 10);
				// console.log(this.categories);
			}
		});
	}

	ionViewDidLoad() {
		this.listLastsSearch();

		// console.log(this.platform.width());

		// if (this.platform.width() > 1200) {
		// 	this.vuesToDisplay = 3;
		// } else if (this.platform.width() >= 768) {
		// 	// On a desktop, and is wider than 768px
		// 	this.vuesToDisplay = 2;
		// } else if (this.platform.width() > 400) {
		// 	// On a desktop, and is wider than 400px
		// 	this.vuesToDisplay = 1;
		// } else if (this.platform.width() > 319) {
		// 	// On a desktop, and is wider than 319px
		// 	this.vuesToDisplay = 1;
		// }
	}
}
