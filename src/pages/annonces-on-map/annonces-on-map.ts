import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { LoginProvider } from '../../providers/login/login';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';

/**
 * Generated class for the AnnoncesOnMapPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-annonces-on-map',
	templateUrl: 'annonces-on-map.html'
})
export class AnnoncesOnMapPage {
	annoncesList = [];
	type;
	currentPosition;
	dir: { origin: { lat: any; lng: any; }; destination: { lat: any; lng: any; }; };
	openedWindow: number = 0; // alternative: array of numbers

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


	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public geolocation: Geolocation,
		public locationAccuracy: LocationAccuracy,
		public lgServ: LoginProvider,
		public persistence: WpPersistenceProvider
	) {
		this.annoncesList = navParams.get('annonces');
		this.type = navParams.get('type');

		// console.log('Type =>', this.type);
		this.buildLatLng();
		// console.log('List =>', this.annoncesList);

		this.checkGps();
	}

	buildLatLng() {
		for (let k = 0; k < this.annoncesList.length; k++) {
			var coordsArray = this.annoncesList[k].webbupointfinder_items_location.split(',');
			this.annoncesList[k].lat = parseFloat(coordsArray[0]);
			this.annoncesList[k].lng = parseFloat(coordsArray[1]);
		}
	}

	ionViewDidLoad() {}

	checkGps() {
		this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
			() => {
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
					})
					.catch((error) => {
						// console.log('Error', error);
					});
			},
			(err) => {
				// this.lgServ.showErrorAlert('Activate GPS for better experience');
				this.persistence.showMsgWithButton('Activate GPS for better experience', 'bottom', 'toast-info');
				// console.log('Error Requesting permission=>' + err);
			}
		);
	}
	openWindow(id, annonce) {
		this.openedWindow = id; // alternative: push to array of numbers
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
}
