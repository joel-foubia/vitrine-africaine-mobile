import { Component } from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	ModalController,
	MenuController,
	Platform,
	LoadingController
} from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { LoginProvider } from '../../providers/login/login';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Storage } from '@ionic/storage';
import { PopoverController } from 'ionic-angular/components/popover/popover-controller';
import { Events } from 'ionic-angular/util/events';

@IonicPage()
@Component({
	selector: 'page-nearby-list',
	templateUrl: 'nearby-list.html'
})
export class NearbyListPage {
	selectionName: any;
	events;
	txtPop: any;
	model = '';
	max = 10;
	maxFeatured = 10;
	objLoader: boolean;
	annoncesList = [];
	dumpData = [];
	display_search: boolean;
	filterResults = [];
	txtFiltre = [];
	currentPosition;
	featured = [];
	vuesToDisplay: number = 1;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public modalCtrl: ModalController,
		public translate: TranslateService,
		public menuCtrl: MenuController,
		public platform: Platform,
		private lgServ: LoginProvider,
		public geolocation: Geolocation,
		public loadingCtrl: LoadingController,
		public locationAccuracy: LocationAccuracy,
		private persistence: WpPersistenceProvider,
		public storage: Storage,
		public popoverCtrl: PopoverController,
		public ev: Events
	) {
		this.model = 'listing';

		this.ev.subscribe('annonce:deleted', (annonce) => {
			// console.log('Annonce Deleted at last=>', annonce);
			for (let k = 0; k < this.annoncesList.length; k++) {
				if (this.annoncesList[k].id == annonce.id) {
					this.annoncesList.splice(k, 1);
				}
			}
			for (let k = 0; k < this.featured.length; k++) {
				if (this.featured[k].id == annonce.id) {
					this.featured.splice(k, 1);
				}
			}
		});
		this.ev.subscribe('annonce:modified', (annonce) => {
			// console.log('Annonce Deleted at last=>', annonce);
			for (let k = 0; k < this.annoncesList.length; k++) {
				if (this.annoncesList[k].id == annonce.id) {
					this.annoncesList[k] = annonce
				}
			}
			for (let k = 0; k < this.featured.length; k++) {
				if (this.featured[k].id == annonce.id) {
					this.featured[k] = annonce
				}
			}
		});

		/* this.storage.get('_ona_lastPosition').then((coords) => {
			if (coords) {
				this.currentPosition = JSON.parse(coords);
			} else {
				this.checkGps();
			}
		}); */
		//On active la traduction
		this.translate.get([ 'pop', 'annonce' ]).subscribe((res) => {
			this.txtPop = res.pop;
		});

		this.events = {
			onClick: function(event: any) {
				navCtrl.push('AnnonceDetailPage', { annonce: event });
			},
			onAddToFav: function(event: any) {
				// console.log('Annonce =>', event);
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
				this.getFromServer();
				this.objLoader = false;
			}
		});
	}

	ionViewDidLeave() {}
	/**
	 * Method to get current models data, save in storage and display in current view
	 */
	getFromServer() {
		// this.objLoader = true;
		this.persistence.getDataAndSaveinLocal(this.model).then((ans) => {
			// console.log('Ans => ', ans);
			if (ans == true) {
				this.objLoader = false;
				this.checkGps();
				this.loadData(this.model);
			}
		});
	}

	loadFeatures() {
		for (let j = 0; j < this.annoncesList.length; j++) {
			if (this.annoncesList[j].webbupointfinder_item_featuredmarker == '1') {
				this.featured.push(this.annoncesList[j]);
			}
		}
		// console.log('Featured=>', this.featured);
	}

	loadData(model) {
		this.lgServ.isTable('_ona_' + model).then((annonces) => {
			if (annonces) {
				this.storage.get('_ona_lastPosition').then((coords) => {
					if (coords) {
						// console.log('Last position available');
						this.currentPosition = JSON.parse(coords);

						var list = [];
						list = JSON.parse(annonces);
						this.annoncesList = list;
						this.dumpData = list;
						this.formatData();

						this.loadFeatures();

						if (this.currentPosition != undefined) {
							for (let k = 0; k < this.dumpData.length; k++) {
								if (this.dumpData[k].webbupointfinder_items_location != undefined) {
									var annonceCoords = this.dumpData[k].webbupointfinder_items_location.split(',');
									var distFromYou = this.persistence.calcDistance(
										this.currentPosition.latitude,
										this.currentPosition.longitude,
										annonceCoords[0],
										annonceCoords[1],
										'K'
									);
									this.annoncesList[k].distFrom = distFromYou.toFixed(2);
								}
							}

							/* for (let k = 0; k < this.dumpData.length; k++) {
								if(this.dumpData[k].distFrom != 'Nan'){
									this.annoncesList.push(this.dumpData[k])
								}
							} */
							/* this.annoncesList.sort(function(a, b) {
								if (a.distFrom != 'Nan' && b.distFrom != 'Nan')
									return parseFloat(a.distFrom) - parseFloat(b.distFrom);
							}); */

							// console.log('Annonces List =>', this.annoncesList);
						} else {
							this.persistence.showMsgWithButton(
								'Your current location is not available activate GPS and try again',
								'top',
								'toast-error'
							);
						}
					} else {
						// console.log('Last position not available');
						this.checkGps();
					}
				});

				// console.log('list', this.annoncesList)
			} else {
			}
		});
	}
	formatData() {
		for (let k = 0; k < this.dumpData.length; k++) {
			if (this.dumpData[k]) {
				var categories = [];
				categories = this.annoncesList[k].pointfinderltypes;
				if (
					categories.indexOf(204) > -1 ||
					categories.indexOf(124) > -1 ||
					categories.indexOf(125) > -1 ||
					// for dev purpose remove line below after
					categories.indexOf(50) > -1
				) {
					this.annoncesList[k].bookable = true;
				} else {
					this.annoncesList[k].bookable = false;
				}
				if (categories.indexOf(148) > -1 || categories.indexOf(147) > -1) {
					this.annoncesList[k].reserv = true;
				} else {
					this.annoncesList[k].reserv = false;
				}

				if (this.annoncesList[k]._embedded['wp:featuredmedia'] == undefined) {
					this.annoncesList[k]['img'] = 'assets/imgs/logo.png';
				} else {
					if (this.annoncesList[k]._embedded['wp:featuredmedia'][0] == undefined) {
						this.annoncesList[k]['img'] = 'assets/imgs/logo.png';
					} else {
						this.annoncesList[k]['img'] = this.annoncesList[k]._embedded['wp:featuredmedia'][0].source_url;
					}
				}
				if (this.annoncesList[k]._embedded['wp:term'] == undefined) {
					this.annoncesList[k]['location'] = '';
				} else {
					if (this.annoncesList[k]._embedded['wp:term'][2] == undefined) {
						this.annoncesList[k]['location'] = '';
					} else {
						if (this.annoncesList[k]._embedded['wp:term'][2][0] == undefined) {
							this.annoncesList[k]['location'] = '';
						} else {
							this.annoncesList[k]['location'] = this.annoncesList[k]._embedded['wp:term'][2][0].name;
						}
					}
				}
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

	//Ouvre la vue filtre pour les critères de recherche
	onFilter() {
		let modal = this.modalCtrl.create('FilterPage', { lang: this.txtPop });
		modal.onDidDismiss((result) => {
			if (result) {
				this.txtFiltre = result;

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

	onCancel() {
		this.display_search = false;
	}
	onClear() {
		this.display_search = false;
	}

	launchSearch(ev) {
		this.selectionName = { name: ev.target.value };

		if (ev.target.value == '') {
			this.annoncesList = this.dumpData;
		} else {
			this.annoncesList = this.dumpData.filter((item) => {
				return item.title.rendered.toLowerCase().indexOf(ev.target.value.toLowerCase()) > -1;
			});
		}
		// this.loadTenitems();
	}

	clearSearch() {
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
		this.annoncesList = resultats;

		this.annoncesList = this.persistence.sortByFilters(this.txtFiltre, this.annoncesList);

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

	showOnMap() {
		this.navCtrl.push('NearBySearchPage', { annonces: this.annoncesList });
	}

	checkGps() {
		this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
			() => {
				let loading = this.loadingCtrl.create();

				// loading.present();

				this.geolocation
					.getCurrentPosition()
					.then((position) => {
						// console.log('Actual Position =>', position);
						var coords = {
							latitude: position.coords.latitude,
							longitude: position.coords.longitude
						};
						this.lgServ.setTable('_ona_lastPosition', coords);

						this.currentPosition = coords;

						this.loadData(this.model);
						loading.dismiss();
					})
					.catch((error) => {
						// console.log('Error', error);
						loading.dismiss();
					});
			},
			(err) => {
				// this.lgServ.showErrorAlert('Activate GPS for better experience');
				this.persistence.showMsgWithButton('Activate GPS for better experience', 'bottom', 'toast-info');
				// console.log('Error Requesting permission=>' + err);
			}
		);
	}

	onAdd() {
		this.lgServ.isLoggedIn().then((res) => {
			if (res) {
				this.navCtrl.push('FormAnnoncePage');
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
}
