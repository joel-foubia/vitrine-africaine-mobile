import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Scroll, ModalController, MenuController, Platform } from 'ionic-angular';
import { LoginProvider } from '../../providers/login/login';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { SyncOptions } from '../../config';
import { TranslateService } from '@ngx-translate/core';
import { PopoverController } from 'ionic-angular/components/popover/popover-controller';
import { Events } from 'ionic-angular/util/events';

@IonicPage()
@Component({
	selector: 'page-annonces',
	templateUrl: 'annonces.html'
})
export class AnnoncesPage {
	current_lang: string;
	txtPop: any;
	// @ViewChild('scrollWeb') scrollWeb: Scroll;
	articleList = [];
	events;
	annonceList = [];
	model = '';
	objLoader: boolean;
	checkSync: number;
	search_term;
	start = 0;
	end = 10;
	maxFeatured = 10;
	max = 10;
	vuesToDisplay: number = 1;
	lazyAnnonce = [];
	all;
	category;
	location;
	type;
	selectionName: any;
	serachedItems: any;
	display_search: boolean;
	dumpData = [];
	txtFiltre = [];
	filterResults: any[];
	featured = [];

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public modalCtrl: ModalController,
		public translate: TranslateService,
		public menuCtrl: MenuController,
		public platform: Platform,
		private lgServ: LoginProvider,
		private persistence: WpPersistenceProvider,
		public popoverCtrl: PopoverController,
		public ev: Events
	) {
		this.ev.subscribe('annonce:deleted', (annonce) => {
			for (let k = 0; k < this.lazyAnnonce.length; k++) {
				if (this.lazyAnnonce[k].id == annonce.id) {
					this.lazyAnnonce.splice(k, 1);
				}
			}

			for (let l = 0; l < this.featured.length; l++) {
				if (this.featured[l].id == annonce.id) {
					this.featured.splice(l, 1);
				}
			}
		});
		this.ev.subscribe('annonce:modified', (annonce) => {
			for (let k = 0; k < this.lazyAnnonce.length; k++) {
				if (this.lazyAnnonce[k].id == annonce.id) {
					this.lazyAnnonce[k] = annonce;
				}
			}

			for (let l = 0; l < this.featured.length; l++) {
				if (this.featured[l].id == annonce.id) {
					this.featured[l] = annonce;
				}
			}
		});

		this.current_lang = this.translate.getDefaultLang();
		this.all = this.navParams.get('all');
		this.category = this.navParams.get('category');
		this.location = this.navParams.get('location');

		this.type = this.navParams.get('type');
		this.objLoader = true;
		this.model = 'listing';

		//On active la traduction
		this.translate.get([ 'pop', 'annonce' ]).subscribe((res) => {
			this.txtPop = res.pop;
		});

		this.lgServ.isTable('_ona_listing').then((data) => {
			this.annonceList = JSON.parse(data);
		});

		// console.log('Category => ', this.category);

		this.events = {
			onClick: function(event: any) {
				// console.log('Detail view');
				navCtrl.push('AnnonceDetailPage', { annonce: event });
			},
			onAddToFav: function(event: any) {
				// console.log('Liking');
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
					persistence.reserver(event.annonce, res.pop);
				});
			},
			onAddAvis: function(event: any) {
				// console.log('Giving advice');

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
							persistence.copiedDelSync('listing', event.annonce);
						} else {
							// update annonce
							navCtrl.push('FormAnnoncePage', { slug: 'edit', annonce: event.annonce });
						}
					}
				});
			}
		};

		setTimeout(() => {
			this.syncOffOnline();
			// this.loadData(this.model);
		}, 500);
		this.checkSync = setInterval(() => this.activateSyn(), SyncOptions.modelSyncTimer);
	}

	activateSyn() {
		this.lgServ.connChange('_ona_' + this.model).then((res) => {
			if (res) {
				this.backgroundSync();
			} else {
				// console.log('Clearing interval');
				clearInterval(this.checkSync);
			}
		});
	}

	backgroundSync() {
		// this.persistence.pageBgSyncOthers(this.model);
	}

	syncOffOnline() {
		this.lgServ.checkStatus('_ona_' + this.model).then((res) => {
			if (res == 'i') {
				//Première utilisation sans connexion
				this.objLoader = false;
			} else if (res == 's') {
				// console.log('Reading from Storage');
				this.loadData(this.model);
			}
			//SYnc de la liste depuis le serveur
			if (res == 'w' || res == 'rw') {
				// console.log('Reading from server listing');
				// this.getFromServer();
				this.objLoader = false;
			}
		});
	}

	ionViewDidLeave() {
		clearInterval(this.checkSync);
	}
	/**
	 * Method to get current models data, save in storage and display in current view
	 */
	getFromServer() {
		// this.objLoader = true;
		this.persistence.getDataAndSaveinLocal(this.model).then((ans) => {
			// console.log('Ans => ', ans);
			if (ans == true) {
				this.objLoader = false;
				this.loadData(this.model);
			}
		});
	}

	onAdd() {
		this.lgServ.isLoggedIn().then((res) => {
			if (res) {
				if (this.category != undefined) {
					this.navCtrl.push('FormAnnoncePage', { data: this.category });
				} else if (this.location != undefined) {
					this.navCtrl.push('FormAnnoncePage', { data: this.location });
				} else {
					this.navCtrl.push('FormAnnoncePage');
				}
			} else {
				this.persistence.showMsgWithButton(
					'Connectez vous pour ajouter un enregistrement',
					'top',
					'toast-info'
				);
				this.navCtrl.push('LoginPage');
			}
		});
	}

	loadFeatures() {
		for (let j = 0; j < this.lazyAnnonce.length; j++) {
			if (this.lazyAnnonce[j].webbupointfinder_item_featuredmarker == '1') {
				this.featured.push(this.lazyAnnonce[j]);
			}
		}
		// console.log('Featured=>', this.featured);
	}

	/**
	 * Cette fonction permet de charger la liste
	 * des annonces en fonction du modèle de données
	 * @param model string, modèle de données
	 */
	loadData(model) {
		let currentObjet;
		// this.objLoader = true;
		if (this.category != undefined) {
			this.selectionName = this.category;
			currentObjet = { objet: this.category, type: 'category' };
			// console.log('Loading categories data');
		} else if (this.location != undefined) {
			this.selectionName = this.location;
			currentObjet = { objet: this.location, type: this.type };
			// console.log('Loading locations data');
		} else if (this.all != undefined) {
			this.selectionName = { name: 'Tout' };
			currentObjet = { objet: { id: null }, type: 'all' };
			// console.log('Loading all data');
		}

		//On appele la fonction pour charger les annonces

		this.dumpData = this.lgServ.loadAnnouncements(currentObjet.objet.id, currentObjet.type, this.annonceList);
		this.articleList = this.dumpData;
		this.objLoader = false;
		this.loadFirsttenAnnouncements();
		this.loadFeatures();
		/* this.lgServ.loadAnnouncements(currentObjet.objet.id, currentObjet.type, this.annonceList).then((res: any) => {
			console.log('Result =>', res);
			this.articleList = res;
			this.dumpData = res;
			
			this.loadFeatures();
		}); */
	}

	/**
	 * Cette fonction permet de formater la 
	 * liste des annonces pour y ajouter les images et d'autres
	 * champs
	 */
	loadFirsttenAnnouncements() {
		this.lazyAnnonce = [];
		for (let k = 0; k < this.articleList.length; k++) {
			if (this.articleList[k]) {
				this.lazyAnnonce.push(this.articleList[k]);

				var categories = [];
				categories = this.lazyAnnonce[k].pointfinderltypes;
				if (
					categories.indexOf(204) > -1 ||
					categories.indexOf(124) > -1 ||
					categories.indexOf(125) > -1 ||
					// for dev purpose remove line below after
					categories.indexOf(50) > -1
				) {
					this.lazyAnnonce[k].bookable = true;
				} else {
					this.lazyAnnonce[k].bookable = false;
				}
				if (categories.indexOf(148) > -1 || categories.indexOf(147) > -1) {
					this.lazyAnnonce[k].reserv = true;
				} else {
					this.lazyAnnonce[k].reserv = false;
				}

				if (this.lazyAnnonce[k]._embedded['wp:featuredmedia'] == undefined) {
					this.lazyAnnonce[k]['img'] = 'assets/imgs/logo.png';
				} else {
					if (this.lazyAnnonce[k]._embedded['wp:featuredmedia'][0] == undefined) {
						this.lazyAnnonce[k]['img'] = 'assets/imgs/logo.png';
					} else {
						this.lazyAnnonce[k]['img'] = this.lazyAnnonce[k]._embedded['wp:featuredmedia'][0].source_url;
					}
				}
				if (this.lazyAnnonce[k]._embedded['wp:term'] == undefined) {
					this.lazyAnnonce[k]['location'] = '';
				} else {
					if (this.lazyAnnonce[k]._embedded['wp:term'][2] == undefined) {
						this.lazyAnnonce[k]['location'] = '';
					} else {
						if (this.lazyAnnonce[k]._embedded['wp:term'][2][0] == undefined) {
							this.lazyAnnonce[k]['location'] = '';
						} else {
							this.lazyAnnonce[k]['location'] = this.lazyAnnonce[k]._embedded['wp:term'][2][0].name;
						}
					}
				}

				// this.lazyAnnonce[k].img = this.lazyAnnonce[k]._embedded['wp:featuredmedia'][0].source_url;
				// this.lazyAnnonce[k].location = this.lazyAnnonce[k]._embedded['wp:term'][2][0].name;
			}
		}
	}

	/**
	 * Cette fonction permet d'ajouter
	 * une annonce dans les favoris
	 * @param item Object
	 */
	addToFav(item) {
		if (item.like) {
			if (item.like == true) {
				item.like = false;
				// this.likeIcon = 'ios-heart-outline';
				this.lgServ.disLikeItem(item, 'listing');
			} else {
				item.like = true;
				// this.likeIcon = 'ios-heart';
				this.lgServ.likeItem(item, 'listing');
			}
		} else {
			item.like = true;
			// this.likeIcon = 'ios-heart';
			this.lgServ.likeItem(item, 'listing');
		}
	}

	//AJout des éléments lorsque l'on scroll vers le
	//bas
	doInfinite(infiniteScroll) {
		// console.log('Scrolling');
		this.max += 10;
		infiniteScroll.complete();
	}

	ionViewDidLoad() {
		// On a desktop, and is wider than 1200px
		// console.log(this.platform.width());

		if (this.platform.width() > 1200) {
			this.vuesToDisplay = 3;
		} else if (this.platform.width() >= 768) {
			// On a desktop, and is wider than 768px
			this.vuesToDisplay = 2;
		} else if (this.platform.width() > 400) {
			// On a desktop, and is wider than 400px
			this.vuesToDisplay = 1;
		} else if (this.platform.width() > 319) {
			// On a desktop, and is wider than 319px
			this.vuesToDisplay = 1;
		}
	}

	//Ouvre la vue filtre pour les critères de recherche
	onFilter() {
		let modal = this.modalCtrl.create('FilterPage', { lang: this.txtPop });
		modal.onDidDismiss((result) => {
			if (result) {
				this.txtFiltre = result;

				/* for (let l = 0; l < this.txtFiltre.length; l++) {
					if (this.txtFiltre[l].slug == 'views') {
						this.dumpData.sort(function(a, b) {
							return (
								parseInt(b.webbupointfinder_page_itemvisitcount) -
								parseInt(a.webbupointfinder_page_itemvisitcount)
							);
						});
						this.txtFiltre.splice(l, 1);
						this.lazyAnnonce = this.dumpData;
					}
					if (this.txtFiltre[l].slug == 'popular') {
						this.dumpData.sort(function(a, b) {
							return (
								parseFloat(b.webbupointfinder_review_rating) -
								parseFloat(a.webbupointfinder_review_rating)
							);
						});
						this.txtFiltre.splice(l, 1);
						this.lazyAnnonce = this.dumpData;
					}
					if (this.txtFiltre[l].slug == 'comments') {
						this.dumpData.sort(function(a, b) {
							if (a._embedded.replies && b._embedded.replies) {
								return parseInt(b._embedded.replies.length) - parseInt(a._embedded.replies.length);
							}
						});
						this.txtFiltre.splice(l, 1);
						this.lazyAnnonce = this.dumpData;
					}
				} */

				if (this.txtFiltre.length > 0) {
					// console.log('Filter results=>', this.txtFiltre);
					this.filterListAnnonces(result);
				}
			}
		});
		modal.present();
	}

	//Ouvre le menu gauche de l'application
	openLeftMenu() {
		this.menuCtrl.open();
	}

	//On ouvre la vue qui va afficher la liste des featued
	showMoreFeatures() {
		this.persistence.showMsgWithButton('Cette page est en cours de développement', 'top', 'toast-info');
	}

	showOnMap() {
		if (this.lazyAnnonce.length > 0) {
			if (this.category != undefined) {
				this.navCtrl.push('AnnoncesOnMapPage', { type: this.category, annonces: this.lazyAnnonce });
			}
			if (this.location != undefined) {
				this.navCtrl.push('AnnoncesOnMapPage', { type: this.location, annonces: this.lazyAnnonce });
			}
		} else {
			this.persistence.showMsgWithButton("Pas d'annonce a voir sur la carte", 'top', 'toast-info');
		}
	}
	onCancel() {
		this.serachedItems = undefined;
		this.display_search = false;
	}
	onClear() {
		this.display_search = false;
		this.serachedItems = undefined;
	}

	launchSearch(ev) {
		if (ev.target.value == '') {
			this.loadData(this.model);
		} else {
			this.lazyAnnonce = this.dumpData.filter((item) => {
				return item.title.rendered.toLowerCase().indexOf(ev.target.value.toLowerCase()) > -1;
			});
		}
		// this.loadTenitems();
	}
	clearSearch() {
		this.serachedItems = undefined;
		this.display_search = false;
		// this.loadData();
	}

	filterListAnnonces(result) {
		this.max = 10;
		this.filterResults = [];
		let resultats = [];
		let dumpresults = [];

		for (let i = 0; i < this.dumpData.length; i++) {
			if (this.persistence.applyFilterAnnonce(result, this.dumpData[i])) {
				resultats.push(this.dumpData[i]);
				// this.filterResults.push(this.dumpData[i]);
			}
		}
		this.lazyAnnonce = resultats;

		this.lazyAnnonce = this.persistence.sortByFilters(this.txtFiltre, this.lazyAnnonce);

		this.loadFeatures();
	}

	applyFilterAnnonce(searchs, objet) {
		let cpt = 0;

		for (let j = 0; j < searchs.length; j++) {
			switch (searchs[j].slug) {
				case 'tags': {
					//tag

					var tags = [];
					tags = objet.tags;
					for (let k = 0; k < searchs[j].val.length; k++) {
						if (tags.indexOf(searchs[j].val[k]) > -1) {
							cpt++;
						}
					}

					break;
				}
				case 'amount': {
					//Prix
					if (
						parseInt(objet.webbupointfinder_item_field_priceforsale) >= searchs[j].val.lower * 10000 &&
						parseInt(objet.webbupointfinder_item_field_priceforsale) <= searchs[j].val.upper * 10000
					) {
						// console.log('Annonce=>', objet);
						cpt++;
					}
					break;
				}
				case 'distance': {
					//Distance near you
					var annonceCoords = objet.webbupointfinder_items_location.split(',');
					var distance =
						this.persistence.calcDistance(
							searchs[j].coords.latitude,
							searchs[j].coords.longitude,
							annonceCoords[0],
							annonceCoords[1],
							'K'
						) * 1000;

					if (distance <= searchs[j].val) {
						objet.distFrom = distance;
						cpt++;
					}
					break;
				}
				case 'feat': {
					//Near me
					if (objet.webbupointfinder_item_featuredmarker == '1') {
						cpt++;
					}
					break;
				}
				case 'verif': {
					//Views
					if (objet.webbupointfinder_item_verified != '') {
						cpt++;
					}
					break;
				}
				/* case 'available': {
					//Available
					break;
				} */
			}
		} //Fin tab searchs
		// console.log('Compteur=>', cpt);
		// console.log('Search length=>', searchs.length);

		if (cpt == searchs.length) return true;
		else return false;
	}
}
