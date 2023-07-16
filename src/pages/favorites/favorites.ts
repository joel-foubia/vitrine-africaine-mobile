import { Storage } from '@ionic/storage';
import { Component } from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	PopoverController,
	ActionSheetController,
	ModalController,
	MenuController,
	Platform
} from 'ionic-angular';
import { ImgCacheService } from '../../global';
import { TranslateService } from '@ngx-translate/core';
import { LoginProvider } from '../../providers/login/login';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { Events } from 'ionic-angular/util/events';

/**
 * Generated class for the FavoritesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-favorites',
	templateUrl: 'favorites.html'
})
export class FavoritesPage {
	serachedItems: any[];
	display_search: boolean;
	defaultImage: string;
	favorites = [];
	allAnnonce = [];
	allArticle = [];
	allActu = [];
	allEvents = [];
	segment = 'annonce';
	search_term;
	model;
	lazyAnnonce = [];
	lazyActu = [];
	lazyEvents = [];
	events;
	start = 0;
	end = 10;
	dumpData = [];
	txtFiltre = [];
	filterResults = [];
	max = 10;
	maxEvents = 10;
	maxArticles = 10;
	maxAnnonce = 10;
	maxFeatured = 10;
	txtPop;
	featured = [];
	vuesToDisplay: number = 1;
	EVentsevents;
	dumpDataActu = [];
	dumpDataEvents = [];
	dumpDataAnnonce = [];
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public pop: PopoverController,
		public actionSheetCtrl: ActionSheetController,
		public translate: TranslateService,
		public imgCacheServ: ImgCacheService,
		public lgServ: LoginProvider,
		public ev: Events,
		public menuCtrler: MenuController,
		public modalCtrl: ModalController,
		public persistence: WpPersistenceProvider,
		public popoverCtrl: PopoverController,
		public platform: Platform
	) {
		//On active la traduction
		this.translate.get([ 'pop', 'annonce' ]).subscribe((res) => {
			this.txtPop = res.pop;
		});
		this.defaultImage = 'assets/gpplaceholder.gif';
		setTimeout(() => {
			this.loadData();
		}, 500);

		this.ev.subscribe('annonce:deleted', (annonce) => {
			// console.log('Annonce Deleted at last=>', annonce)
			for (let k = 0; k < this.allAnnonce.length; k++) {
				if (this.allAnnonce[k].id == annonce.id) {
					this.allAnnonce.splice(k, 1);
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
			for (let k = 0; k < this.allAnnonce.length; k++) {
				if (this.allAnnonce[k].id == annonce.id) {
					this.allAnnonce[k] = annonce
				}
			}
			for (let k = 0; k < this.featured.length; k++) {
				if (this.featured[k].id == annonce.id) {
					this.featured[k] = annonce
				}
			}
		});

		this.EVentsevents = {
			onTapItem: function(event: any) {
				// console.log(event);
				let objEvent, startTime, endTime;

				if (event.current.all_day) {
					//all day
					startTime = new Date(event.current.start_date);
					endTime = new Date(event.current.end_date);
				} else {
					startTime = new Date(event.current.start_date);
					endTime = new Date(event.current.end_date);
				}

				objEvent = {
					title: event.current.title,
					startTime: startTime,
					endTime: endTime,
					agenda: event.current,
					allDay: event.current.all_day
				};

				navCtrl.push('DetailsEventPage', { objet: objEvent });
			},
			onAddToFav: function(event: any) {
				// console.log(event);
				if (event.current.like) {
					if (event.current.like == true) {
						event.current.like = false;
						lgServ.disLikeItem(event.current, 'events');
					} else {
						event.current.like = true;
						lgServ.likeItem(event.current, 'events');
					}
				} else {
					event.current.like = true;
					lgServ.likeItem(event.current, 'events');
				}
			},
			showMap: function(event: any) {
				let coords = [];
				// console.log(event);
				coords.push(event.current.geo_lat);
				coords.push(event.current.geo_lng);

				lgServ.navigateToArticle(coords);
			}
		};

		this.events = {
			onClick: function(event: any) {
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

	ionViewDidLoad() {
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

	loadData() {
		this.loadAnnonce();
		this.loadArticle();
		this.loadEvents();
	}

	ionViewDidEnter() {}

	loadAnnonce() {
		this.model = 'listing';
		this.lgServ.isTable('_ona_' + this.model + '_fav').then((data) => {
			if (data) {
				this.allAnnonce = JSON.parse(data);
				this.dumpDataAnnonce = JSON.parse(data);
				this.loadTenitems();
				this.loadFeatures();
			}
		});
	}

	details(data) {
		this.navCtrl.push('ActuDetailsPage', { details: data });
		// console.log('Data =>', data);
	}

	loadArticle() {
		this.model = 'article';
		this.lgServ.isTable('_ona_' + this.model + '_fav').then((data) => {
			if (data) {
				this.allArticle = JSON.parse(data);
				// console.log('articles =>', this.allArticle);
				this.dumpDataActu = JSON.parse(data);
			}
		});
	}

	loadEvents() {
		this.model = 'events';
		this.lgServ.isTable('_ona_' + this.model + '_fav').then((data) => {
			if (data) {
				this.allEvents = JSON.parse(data);
				// console.log('events =>', this.allEvents);
				this.dumpDataEvents = JSON.parse(data);
			}
		});
	}

	loadTenitems() {
		this.lazyAnnonce = [];
		for (let k = 0; k < 10; k++) {
			if (this.allAnnonce[k]) {
				this.lazyAnnonce.push(this.allAnnonce[k]);
			}
		}
	}

	loadFeatures() {
		for (let j = 0; j < this.allAnnonce.length; j++) {
			if (this.allAnnonce[j].webbupointfinder_item_featuredmarker == '1') {
				this.featured.push(this.allAnnonce[j]);
			}
		}
		// console.log('Featured=>', this.featured);
	}
	doInfinite(infiniteScroll) {
		// console.log('Scrolling');

		if (this.segment == 'annonce') {
			this.maxAnnonce += 10;
			infiniteScroll.complete();
		} else if (this.segment == 'actu') {
			this.maxArticles += 10;
			infiniteScroll.complete();
		} else {
			this.maxEvents += 10;
			infiniteScroll.complete();
		}
	}

	segmentChanged(ev) {
		// console.log('Segment', this.segment);
	}

	launchSearch(ev) {
		if (ev.target.value == '') {
			this.loadData();
		}
		if (this.segment == 'annonce') {
			this.allAnnonce = this.dumpDataAnnonce.filter((item) => {
				return item.title.rendered.toLowerCase().indexOf(ev.target.value.toLowerCase()) > -1;
			});
		} else if (this.segment == 'actu') {
			this.allArticle = this.dumpDataActu.filter((item) => {
				return item.title.rendered.toLowerCase().indexOf(ev.target.value.toLowerCase()) > -1;
			});
		} else {
			this.allEvents = this.dumpDataEvents.filter((item) => {
				return item.title.toLowerCase().indexOf(ev.target.value.toLowerCase()) > -1;
			});
		}
	}

	searchItems() {
		this.display_search = true;
	}
	onCancel() {
		this.serachedItems = undefined;
		this.display_search = false;
	}
	onClear() {
		this.display_search = false;
		this.serachedItems = undefined;
	}
	clearSearch() {
		this.serachedItems = undefined;
		this.display_search = false;
		this.loadData();
	}
	goToPage(page, type) {
		this.navCtrl.push(page);
	}
	openMenu() {
		this.menuCtrler.open();
	}

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
	showOnMap() {
		if (this.lazyAnnonce.length > 0) {
			this.navCtrl.push('AnnoncesOnMapPage', { type: { name: 'Vos Favoris' }, annonces: this.lazyAnnonce });
		} else {
			this.persistence.showMsgWithButton("Pas d'annonce a voir sur la carte", 'top', 'toast-info');
		}
	}
}
