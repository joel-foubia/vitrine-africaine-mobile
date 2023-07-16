import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Content } from 'ionic-angular';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Geolocation } from '@ionic-native/geolocation';
import { LoginProvider } from '../../providers/login/login';
import { Storage } from '@ionic/storage';
import { AfProvider } from '../../providers/af/af';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { PopoverController } from 'ionic-angular/components/popover/popover-controller';

/**
 * Generated class for the NearBySearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-near-by-search',
	templateUrl: 'near-by-search.html'
})
export class NearBySearchPage {
	display_search: boolean;
	radius;
	max_distance;
	serachedItems;

	dumpData = [];
	events;
	annoncesList = [];
	start = 0;
	end = 10;
	dumpFilter = [];
	currentPosition;
	objLoader: boolean;
	showHeader = true;
	openedWindow: number = 0; // alternative: array of numbers
	dir = undefined;
	options: { suppressMarkers: boolean };
	anime = null;

	mapStyles = [
		{
			featureType: 'poi',
			elementType: 'labels',
			stylers: [
				{
					visibility: 'off'
				}
			]
		},
		{
			featureType: 'transit',
			elementType: 'labels.icon',
			stylers: [ { visibility: 'off' } ]
		}
	];

	@ViewChild(Content) content: Content;
	describeMe: any;
	noLocationCoords;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public locationAccuracy: LocationAccuracy,
		public lgServ: LoginProvider,
		public storage: Storage,
		public geolocation: Geolocation,
		public loadingCtrl: LoadingController,
		public af: AfProvider,
		public persistence: WpPersistenceProvider,
		public popoverCtrl: PopoverController
	) {
		this.storage.get('_ona_lastPosition').then((coords) => {
			if (coords) {
				this.currentPosition = JSON.parse(coords);
			} else {
				this.checkGps();
			}
		});

		this.dumpData = navParams.get('annonces');

		this.annoncesList = this.buildLatLng(this.dumpData);

		// console.log('Annonces', this.annoncesList)

		if (this.annoncesList[0]) {
			this.noLocationCoords = {
				latitude: this.annoncesList[0].lat,
				longitude: this.annoncesList[0].lng
			};
		}

		// this.loadAnnonces();
		this.storage.get('_ona_distance').then((dist) => {
			this.max_distance = dist;
		});

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
			}
		};

		this.options = {
			suppressMarkers: true
		};
	}

	loadAnnonces() {
		this.lgServ.isTable('_ona_listing').then((data) => {
			if (data) {
				var listings = JSON.parse(data);
				this.dumpData = JSON.parse(data);
				// this.loadTenitems();
				this.annoncesList = listings;
				// this.annoncesList = this.formaterData(this.annoncesList);

				this.annoncesList = this.buildLatLng(this.dumpData);

				// console.log('Built =>', this.annoncesList);
			} else {
				this.objLoader = true;
				let loading = this.loadingCtrl.create();

				// loading.present();
				this.persistence.getDataAndSaveinLocal('listing').then((ans) => {
					if (ans == true) {
						this.objLoader = false;
						this.loadAnnonces();
					} else {
						this.objLoader = false;
					}
				});
			}
		});
	}

	loadTenitems() {
		this.annoncesList = [];
		for (let k = 0; k < 10; k++) {
			if (this.dumpData[k]) {
				this.annoncesList.push(this.dumpData[k]);
			}
		}
		this.annoncesList = this.formaterData(this.annoncesList);
	}

	buildLatLng(annonceList) {
		for (let k = 0; k < annonceList.length; k++) {
			var coordsArray = annonceList[k].webbupointfinder_items_location.split(',');
			annonceList[k].lat = parseFloat(coordsArray[0]);
			annonceList[k].lng = parseFloat(coordsArray[1]);
		}
		return annonceList;
	}

	doInfinite(infiniteScroll) {
		// console.log('Scrolling horizontal');
		this.start = this.start + 10;
		this.end = this.end + this.start;
		var all = [];

		all = this.dumpData;
		if (this.annoncesList.length >= all.length) {
			infiniteScroll.complete();
			return;
		}
		for (let i = this.start; i < this.end; i++) {
			if (all[i]) {
				this.annoncesList.push(all[i]);
			} else {
				infiniteScroll.complete();
				return;
			}
		}
		infiniteScroll.complete();
	}
	ionViewDidLoad() {}

	displaySearch() {
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

	launchSearch(ev) {
		// this.annoncesList = [];
		if (ev.target.value == '') {
			// this.loadData(this.model);
			if (this.dumpFilter.length > 0) {
				this.annoncesList = this.dumpFilter;
			} else {
				this.annoncesList = this.dumpData;
			}
		} else {
			if (ev.target.value.length > 2) {
				if (this.dumpFilter.length > 0) {
					this.annoncesList = this.dumpFilter.filter((item) => {
						return item.title.rendered.toLowerCase().indexOf(ev.target.value.toLowerCase()) > -1;
					});
				} else {
					this.annoncesList = this.dumpData.filter((item) => {
						return item.title.rendered.toLowerCase().indexOf(ev.target.value.toLowerCase()) > -1;
					});
				}
			}
		}
		// this.loadTenitems();
	}

	getPlacesAround() {
		this.storage.get('_ona_lastPosition').then((coords) => {
			if (coords) {
				var mycoords = JSON.parse(coords);
				this.anime = 'BOUNCE';

				setTimeout(() => {
					this.anime = null;
				}, 300);
				this.annoncesList = [];
				this.dumpFilter = [];
				for (let i = 0; i < this.dumpData.length; i++) {
					var annonceCoords = this.dumpData[i].webbupointfinder_items_location.split(',');
					var distFromYou = this.calcDistance(
						mycoords.latitude,
						mycoords.longitude,
						annonceCoords[0],
						annonceCoords[1],
						'K'
					);
					this.dumpData[i].distFrom = distFromYou;
					if (distFromYou <= this.radius) {
						this.annoncesList.push(this.dumpData[i]);
						this.dumpFilter.push(this.dumpData);
					}
				}
				// console.log('filtered', this.annoncesList);

				if (this.annoncesList.length == 0) {
					this.persistence.showMsgWithButton(
						'Aucune annonces trouvé à cette distance: (' + this.radius + 'Km)',
						'top',
						'toast-info'
					);
				}
			} else {
				this.persistence.showMsgWithButton(
					'Your current location is not available activate GPS and try again',
					'top',
					'toast-error'
				);
				this.checkGps();
			}
		});
	}

	calcDistance(lat1, lon1, lat2, lon2, unit) {

		var radlat1 = Math.PI * lat1 / 180;
		var radlat2 = Math.PI * lat2 / 180;
		var theta = lon1 - lon2;
		var radtheta = Math.PI * theta / 180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		
		dist = Math.acos(dist);
		dist = dist * 180 / Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit == 'K') {
			dist = dist * 1.609344;
		}
		if (unit == 'N') {
			dist = dist * 0.8684;
		}
		// console.log('Calculated Distance', dist);
		return dist;
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

	// Map events
	onMapClick() {
		this.showHeader = !this.showHeader;
		this.content.resize();
	}

	onMarkerClick(annonce) {
		// console.log('Marker clicked');
	}

	openWindow(id, annonce) {
		this.openedWindow = id; // alternative: push to array of numbers
		this.describeMe = false;
		if (this.currentPosition != undefined) {
			this.dir = {
				origin: { lat: this.currentPosition.latitude, lng: this.currentPosition.longitude },
				destination: { lat: annonce.lat, lng: annonce.lng }
			};
		} else {
			this.dir = {
				origin: { lat: this.annoncesList[0].lat, lng: this.annoncesList[0].lng },
				destination: { lat: annonce.lat, lng: annonce.lng }
			};
		}
	}

	isInfoWindowOpen(id) {
		return this.openedWindow == id; // alternative: check if id is in array
	}
	showMe() {
		this.describeMe = !this.describeMe;
	}
}
