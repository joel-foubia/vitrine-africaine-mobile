import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, MenuController, Platform, Events } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { LoginProvider } from '../../providers/login/login';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { SyncOptions } from '../../config';
import { PopoverController } from 'ionic-angular/components/popover/popover-controller';

/**
 * Generated class for the DonnezAvisPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-donnez-avis',
	templateUrl: 'donnez-avis.html'
})
export class DonnezAvisPage {
	checkSync: number;
	objLoader = true;
	txtPop: any;
	events;
	model: string;

	annoncesList = [];
	dumpData = [];
	max = 10;
	maxFeatured = 10;
	serachedItems: any;
	search_term = '';
	params;
	txtFiltre = [];
	filterResults: any[];
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
		private persistence: WpPersistenceProvider,
		public popoverCtrl: PopoverController,
		public ev: Events
	) {
		this.model = 'listing';

		this.ev.subscribe('annonce:deleted', (annonce) => {
			// console.log('Annonce Deleted at last=>', annonce)
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
			// console.log('Annonce Deleted at last=>', annonce)
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

		this.params = navParams.data;
		// console.log('params => ', this.params);

		//On active la traduction
		this.translate.get([ 'pop', 'annonce' ]).subscribe((res) => {
			this.txtPop = res.pop;
		});

		if (this.params != undefined) {
			if (this.params.action == 'avis') {
				this.events = {
					onClick: function(event: any) {
						// console.log('Present popover to add advice');

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
								if(data.slug == 'view'){
									navCtrl.push('AnnonceDetailPage', { annonce: event });
								}
								else if(data.slug == 'delete'){
									// Delete annonce
									persistence.copiedDelSync('listing', event.annonce);
								}
								else{
									// update annonce
									navCtrl.push('FormAnnoncePage', { slug: 'edit', annonce: event.annonce });

								}
							}
						});
					}
				};
			} else {
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
								if(data.slug == 'view'){
									navCtrl.push('AnnonceDetailPage', { annonce: event });
								}
								else if(data.slug == 'delete'){
									// Delete annonce
									persistence.copiedDelSync('listing', event.annonce);

								}
								else{
									// update annonce
									navCtrl.push('FormAnnoncePage', { slug: 'edit', annonce: event.annonce });

								}
							}
						});
					}
				};
			}
		} else {
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
				}
			};
		}

		setTimeout(() => {
			this.loadData(this.model);
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

	syncOffOnline() {
		this.lgServ.checkStatus('_ona_' + this.model).then((res) => {
			if (res == 'i') {
				//Première utilisation sans connexion
				this.objLoader = false;
			} else if (res == 's') {
				this.loadData(this.model);
			}
			//SYnc de la liste depuis le serveur
			if (res == 'w' || res == 'rw') {
				this.objLoader = false;
			}
		});
	}

	activateSyn() {
		this.lgServ.connChange('_ona_' + this.model).then((res) => {
			if (res) {
				// this.backgroundSync();
			} else {
				// console.log('Clearing interval');
				clearInterval(this.checkSync);
			}
		});
	}

	backgroundSync() {
		// this.persistence.pageBgSyncOthers(this.model);
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

	ionViewDidLeave() {
		clearInterval(this.checkSync);
	}

	loadData(model) {
		this.lgServ.isTable('_ona_' + model).then((data) => {
			var list = JSON.parse(data);

			this.objLoader = false;
			this.annoncesList = list;
			this.dumpData = list;
			console.log('List',this.annoncesList);
			this.formatData();

			this.loadFeatures();

			// this.loadFirstTen(this.dumpData);
		});
	}

	loadFeatures() {
		for (let j = 0; j < this.annoncesList.length; j++) {
			if (this.annoncesList[j].webbupointfinder_item_featuredmarker == '1') {
				this.featured.push(this.annoncesList[j]);
				// this.annoncesList.unshift(this.annoncesList[j]);
			}
		}
		// console.log('Featured=>', this.featured)
	}

	formatData() {
		for (let k = 0; k < this.annoncesList.length; k++) {
			var categories = [];
			categories = this.annoncesList[k].pointfinderltypes;
			if (categories.indexOf(204) > -1 || categories.indexOf(124) > -1 || categories.indexOf(125) > -1) {
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
		// console.log('Annonces =>', this.annoncesList);
	}

	loadFirstTen(dumpData) {
		for (let i = 0; i < 10; i++) {
			this.annoncesList.push(dumpData[i]);
		}
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

			if (ev.target.value === undefined || ev == '') {
				this.annoncesList = this.dumpData;
				this.max = 10;
				return;
			}
			
			if (ev.target.value == '' || ev.target.value == undefined) {
				// this.loadData(this.model);
				this.annoncesList = this.dumpData;
				this.max = 10;
			} else {
				this.annoncesList = this.dumpData.filter((item) => {
					return item.title.rendered.toLowerCase().indexOf(ev.target.value.toLowerCase()) > -1;
				});
				this.max = 10;
			}

		} else {
			this.persistence.showMsgWithButton(
				'Functionality not available. App synchronizing with server please wait',
				'top',
				'toast-info'
			);
		}
	}

	showOnMap() {
		if (this.annoncesList.length > 0) {
			this.navCtrl.push('AnnoncesOnMapPage', { type: { name: 'Guide Africain' }, annonces: this.annoncesList });
		} else {
			this.persistence.showMsgWithButton("Pas d'annonce a voir sur la carte", 'top', 'toast-info');
		}
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
		modal.present()
	}

	clearFilters(){
		this.loadData(this.model);
		this.txtFiltre.length = 0
	}

	filterListAnnonces(result) {
		this.max = 10;
		// this.filterResults = [];
		let resultats = [];
		// let dumpresults = [];

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
	showMoreFeatures() {}
}
