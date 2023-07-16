import { ToastController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireOfflineDatabase } from 'angularfire2-offline/database';
// import { LoginProvider } from '../login/login';
import { HttpClient } from '@angular/common/http';

import { Injectable, NgZone } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { google } from '@google/maps';
import { MapsAPILoader } from '@agm/core';
import { Storage } from '@ionic/storage';

declare var google: any;

@Injectable()
export class AfProvider {
	_AutocompleteService: google.maps.places.AutocompleteService;
	_Geocoder: google.maps.Geocoder;

	// private items: any;
	// private userInfos: any;

	constructor(
		private afDB: AngularFireDatabase,
		public toastCtrl: ToastController,
		// private lgServ: LoginProvider,
		private offServ: AngularFireOfflineDatabase,
		public zone: NgZone,
		public mapsAPILoader: MapsAPILoader,
		public http: HttpClient,
		public storage: Storage
	) {
		this.mapsAPILoader.load().then(() => {
			this._AutocompleteService = new google.maps.places.AutocompleteService();
			this._Geocoder = new google.maps.Geocoder();
		});
		this.retrievePack();
		this.retrieveChannels();
		//console.log('Hello AfProvider Provider');
	}

	/**
   * Cette fonction va vérifier que
   * cette utilisateur est bien enregistré
   * dans la BD
   *
   * @return callback
   *
   **/
	retrieveURL(callback) {
		return this.offServ.list('/vitrine_africaine/server').subscribe((_data) => {
			for (var i in _data) {
				let current = _data[i];

				if (current.$key == 'url') {
					callback({ url: current.$value });
					break;
				}
			}
		});
	}
	/**
   * Cette fonction va vérifier que
   * cette utilisateur est bien enregistré
   * dans la BD
   *
   * @return callback
   *
   **/
	retrievePack() {
		this.offServ.list('/vitrine_africaine/packs').subscribe((_data) => {
			this.storage.set('fb_packs', _data[0]);
		});
	}
	/**
   * Cette fonction va vérifier que
   * cette utilisateur est bien enregistré
   * dans la BD
   *
   * @return callback
   *
   **/
	retrieveChannels() {
		this.offServ.list('/vitrine_africaine/africawebtv').subscribe((_data) => {
			this.storage.set('webtv', _data);
		});
	}

	/**
   * Cette fonction va vérifier que
   * cette utilisateur est bien enregistré
   * dans la BD
   *
   * @return callback
   *
   **/
	retrievepaypalCredits(callback) {
		// console.log('retrieving payPal');

		return this.afDB.list('/vitrine_africaine/config').subscribe((_data) => {
			let result = {};
			// console.log(_data);
			for (var i in _data) {
				let current = _data[i];
				let key = current.$key;
				if (key != 'payconiq') result[key] = current.$value;
				else result[key] = current;
			}

			callback(result);
		});
	}

	retrieveEmail(callback) {
		return this.offServ.list('/vitrine_africaine/server').subscribe((_data) => {
			for (var i in _data) {
				let current = _data[i];

				if (current.$key == 'email') {
					callback({ email: current.$value });
					break;
				}
			}
		});
	}

	retrieveCategories(callback) {
		return this.offServ.list('/vitrine_africaine/server').subscribe((_data) => {
			for (var i in _data) {
				let current = _data[i];

				if (current.$key == 'url_categories') {
					callback({ url: current.$value });
					break;
				}
			}
		});
	}

	retrieveArticles(callback) {
		return this.offServ.list('/vitrine_africaine/server').subscribe((_data) => {
			for (var i in _data) {
				let current = _data[i];

				if (current.$key == 'url_articles') {
					callback({ url: current.$value });
					break;
				}
			}
		});
	}

	/**
   * Function pour recuperer tout les donnees de l'app sur firebase
   */
	retrieveFireBaseData(callback) {
		return this.afDB.list('/vitrine_africaine').subscribe((_data) => {
			// console.log('Da => ', _data);
			// let result = {};
			let array = [];
			array = _data;

			for (let j = 0; j < _data.length; j++) {
				if (_data[j].$key == 'functions') {
					// console.log(_data[j].$value);
					array[j] = _data[j].$value;
				}
			}

			callback(array);
		});
	}

	/***
   * Cette fonction permet d'afficher
   * les informations A Propos de l'entreprise
   *
   **/
	getInfosAbout(callback) {
		return this.offServ.list('/vitrine_africaine/about').subscribe((_data) => {
			let result = {};

			for (var i in _data) {
				let current = _data[i];
				let key = current.$key;

				if (key == 'map') {
					result['map'] = current;
				} else {
					result[key] = current.$value;
				}
			}
			callback(result);
		});
	}

	/**
   * Cette fonction permet de récupérer
   * le message de Bienvenue
   *
   **/
	getWelcomeMessage(callback) {
		return this.offServ.list('/vitrine_africaine/welcome_message').subscribe((_data) => {
			callback(_data);
		});
	}

	/***
   * Cette fonction permet de récupérer
   * l'objet Image in background
   *
   **/
	getImgSplashScreen(callback) {
		return this.offServ.list('/vitrine_africaine/start').subscribe((_data) => {
			callback(_data[0]);
		});
	}


	/**
	 * Cette méthode permet de retourner 
	 * le pattern de la catégorie
	 * @param callback 
	 */
	retrievePost(callback) {
		return this.offServ.list('/vitrine_africaine/server').subscribe((_data) => {
			for (var i in _data) {
				let current = _data[i];

				if (current.$key == 'postCategories') {
					callback({ post: current.$value });
					break;
				}
			}
		});
	}

	/***
   * Cette fonction permet de récupérer
   * la liste des catégories populaires
   *
   **/
	popularCat(callback) {
		return this.offServ.list('/vitrine_africaine/popularCategories').subscribe((_data) => {
			var id = [];
			for (const i in _data) {
				if (_data.hasOwnProperty(i)) {
					var current = _data[i].$value;
					id.push(current);
				}
			}

			// console.log(id);
			callback(id);
		});
	}

	/**
   * Cette fonction permet de récupérer
   * la liste des Questions et Réponses
   *
   **/
	getFAQ() {
		return this.offServ.list('/vitrine_africaine/Faq');
	}

	//Cette fonction permet d'obtenir le menu principal (les catégories populaire)
	getMainMenu() {
		return this.offServ.list('/vitrine_africaine/mainmenu');
	}

	/***
   * Cette fonction permet de récupérer
   * les configurations Woocommerce de Vitrine Africaine
   *
   **/
	getConfigWC(callback) {
		return this.offServ.list('/vitrine_africaine/woocommerce').subscribe((_data) => {
			let result = {};

			for (var i in _data) {
				let current = _data[i];
				let key = current.$key;

				result[key] = current.$value;
			}
			// console.log(result);
			callback(result);
		});
	}

	//Cette fonction permet d'afficher un message
	// en cas d'erreur ou de success
	showMessage(msg) {
		let toast = this.toastCtrl.create({
			message: msg,
			duration: 3000,
			cssClass: 'toastErr',
			position: 'top'
		});

		toast.present();
	}

	showMessageWithBtn(msg) {
		let toast = this.toastCtrl.create({
			message: msg,
			showCloseButton: true,
			cssClass: 'toastErr',
			closeButtonText: 'OK',
			position: 'top'
		});

		toast.present();
	}

	getPlacePredictions(query: string): Observable<Array<google.maps.places.AutocompletePrediction>> {
		return Observable.create((observer) => {
			this._AutocompleteService.getPlacePredictions({ input: query }, (places_predictions, status) => {
				if (status != google.maps.places.PlacesServiceStatus.OK) {
					this.zone.run(() => {
						observer.next([]);
						observer.complete();
					});
				} else {
					this.zone.run(() => {
						observer.next(places_predictions);
						observer.complete();
					});
				}
			});
		});
	}

	geocodePlace(placeId: string): Observable<google.maps.LatLng> {
		return Observable.create((observer) => {
			this._Geocoder.geocode({ placeId: placeId }, (results, status) => {
				if (status.toString() === 'OK') {
					if (results[0]) {
						this.zone.run(() => {
							observer.next(results[0].geometry.location);
							observer.complete();
						});
					} else {
						this.zone.run(() => {
							observer.error(new Error('no results'));
						});
					}
				} else {
					this.zone.run(() => {
						observer.error(new Error('error'));
					});
				}
			});
		});
	}

	secteurActivite(callback) {
		return this.offServ.list('/vitrine_africaine/secteurActivite').subscribe((_data) => {
			var id = [];
			for (const i in _data) {
				if (_data.hasOwnProperty(i)) {
					var current = _data[i].$value;
					id.push(current);
				}
			}

			// console.log(id);
			callback(id);
		});
	}

	/**
	 * Cette méthode permet de récupérer la liste
	 * des bannières
	 * 
	 * @param callback Callback
	 */
	banner(callback) {
		return this.offServ.list('/vitrine_africaine/bannieres').subscribe((_data) => {
			var id = [];
			for (const i in _data) {
				if (_data.hasOwnProperty(i)) {
					var current = _data[i].$value;
					id.push(current);
				}
			}

			// console.log(id);
			callback(id);
		});
	}

	/**
	 * Cette méthode permet de récupérer les formats
	 * des publicités
	 * @param callback 
	 */
	tailleAnnonce(callback) {
		return this.offServ.list('/vitrine_africaine/tailleAnnonce').subscribe((_data) => {
			var id = [];
			for (const i in _data) {
				if (_data.hasOwnProperty(i)) {
					var current = _data[i].$value;
					id.push(current);
				}
			}

			// console.log(id);
			callback(id);
		});
	}

	/**
	 * Cette méthode permet de récupérer la
	 * table nos Services
	 * @param callback 
	 */
	nos_services(callback) {
		return this.offServ.list('/vitrine_africaine/nos_service').subscribe((_data) => {
			var id = [];
			for (const i in _data) {
				if (_data.hasOwnProperty(i)) {
					var current = _data[i].$value;
					id.push(current);
				}
			}

			// console.log(id);
			callback(id);
		});
	}

	readFaq() {
		return this.offServ.list('/faq');
	}
}
