// import { UserAgent } from '@ionic-native/user-agent';
import { Http, Response } from '@angular/http';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/catch';
// import geocoder from 'geocoder-geojson';
import { SocialSharing } from '@ionic-native/social-sharing';
import {
	AlertController,
	Platform,
	ToastController,
	LoadingController,
	ModalController,
	ActionSheetController
} from 'ionic-angular';
import { FileUploadOptions, FileTransfer } from '@ionic-native/file-transfer';
// import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';
import { Events } from 'ionic-angular/util/events';
import * as moment from 'moment';
import { CallNumber } from '@ionic-native/call-number';
import { EmailComposer } from '@ionic-native/email-composer';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SMS } from '@ionic-native/sms';
import { LoginProvider } from '../login/login';
import { Network } from '@ionic-native/network';
import { AppRate } from '@ionic-native/app-rate';

import { TranslateService } from '@ngx-translate/core';
import { AfProvider } from '../af/af';

import { ConfigModels } from '../../config';
import { Camera } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';
import { AuthProvider } from '../auth/auth';
import { catchError, map } from 'rxjs/operators';
import { Configuration } from './configuration';
import { CustomHttpUrlEncodingCodec } from './encoder';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Geolocation } from '@ionic-native/geolocation';

// import { AngularFireOfflineDatabase } from 'angularfire2-offline/database';
// declare var cordova: any;

@Injectable()
export class WpPersistenceProvider {
	urlServ: any;
	model: string;
	autoSync: number;
	bgSyncTimer: number;
	total: number;
	pagenum: number;

	lastImage: any;
	alloffers: any[];
	serverUrl;
	data: any;
	offers = [];
	txtObjet: any;
	err_network: any;
	presentHour: moment.Moment;
	presentDayNumber: number;
	modelUsers = 'users';
	syncPackInt: number;
	syncReviews: number;

	constructor(
		public http: HttpClient,
		public storage: Storage,
		public hp: Http,
		public alertCtrler: AlertController,
		// public ua: UserAgent,
		public share: SocialSharing,
		public filetransfer: FileTransfer,
		public platform: Platform,
		// public filePath: FilePath,
		// public connstatprov: ConnectionStatusProvider,
		public events: Events,
		public alertCtrl: AlertController,
		public toastCtrl: ToastController,
		private callNumber: CallNumber,
		private emailComposer: EmailComposer,
		private browser: InAppBrowser,
		public loading: LoadingController,
		private sms: SMS,
		public auth: AuthProvider,
		private modalCtrl: ModalController,
		private lgServ: LoginProvider,
		public network: Network,
		public socialSharing: SocialSharing,
		public translate: TranslateService,
		private appRate: AppRate,
		public camera: Camera,
		public imagePicker: ImagePicker,
		private afServ: AfProvider,
		public file: File,
		public actionCtrl: ActionSheetController,
		public locationAccuracy: LocationAccuracy,
		public geolocation: Geolocation,
		public inapp: InAppBrowser
	) {
		this.afServ.retrieveURL((url) => {
			this.urlServ = url;
			this.syncListObjets(false);
			this.autoSyncDatabase();
			let connected = this.network.onConnect().subscribe(() => {
				setTimeout(() => {
					this.autoSyncDatabase();
				}, 3000);
			});
			// this.lgServ.isTable('_ona_listing').then((res) => {
			// 	console.log('Listings => ', JSON.parse(res));
			// });
		});
		this.presentHour = moment();
		this.presentDayNumber = new Date().getDay();

		this.retrievePacks();
		this.retrieveReviews();

		this.syncPackInt = setInterval(() => this.retrievePacks(), 60000);

		// console.log('Day =>', this.presentDayNumber);
	}

	/**
   * Cette fonction permet de synchroniser à la fois
   * les ajouts et les mises à jours des tables dès lors de la connexion
   * Internet
   * 
   * Interval set to 4 minutes
   **/
	autoSyncDatabase() {
		this.autoSync = setInterval(() => this.syncInOutDatabase(), 240000);
	}

	syncOffOnline(index) {
		//uncomment below line code
		// this.bgSyncTimer = setInterval(() => this.bgSync(index), SyncOptions.syncTimer);
	}

	/**
   * Cette fonction permet de synchroniser à la fois
   * les ajouts et les mises à jours des tables dès lors de la connexion
   * Internet
   *
   **/
	syncInOutDatabase() {
		this.lgServ.getCurrentValSync().then((sync) => {
			this.lgServ.isTable('_ona_flag').then((res) => {
				if (res || (sync == false && localStorage.getItem('is_update') == 'true')) {
					let tab = ConfigModels.tab_models;
					var namespace;
					for (let i = 0; i < tab.length; i++) {
						//On attend 2 secondes avant de déclancher l'insert
						if (tab[i] == 'events') {
							namespace = 'tribe/events/v1';
						} else if (tab[i] == 'tickets') {
							namespace = 'tribe/tickets/v1';
						} else {
							namespace = 'wp/v2';
						}

						setTimeout(() => {
							this.createObjetSync(tab[i], namespace);
						}, 5000);

						//On attend 1s avant de déclancher le update
						setTimeout(() => {
							this.updateObjetSync(tab[i], namespace);
						}, 2500);
						//On attend 1s avant de déclancher le delete
						setTimeout(() => {
							this.deleteObjetSync(tab[i], namespace);
						}, 2500);

						setTimeout(() => {
							//All Data background sync
						}, 10000);
					}
				} else {
					clearInterval(this.autoSync);
				}
			});
		});
	}

	/**
	 * Method to manually launch synchronisation of list of tables
	 */

	launchManualSync() {
		let tab = ConfigModels.tab_models;
		this.updateListObjetSync(tab.length - 1);
	}

	syncListObjets(isSynch: boolean, options?: any) {
		this.lgServ.isTable('_ona_date').then((res) => {
			if (res == null) {
				let tab = ConfigModels.tab_models;
				this.updateListObjetSync(tab.length - 1);
				// this.syncOffOnline(tab.length - 1);
			} else {
				this.syncOffOnline(ConfigModels.sync_tab_models.length - 1);
			}
		});
	}

	/**
	 * @author Landry Fongang (mr_madcoder_fil)
	 * @param index Model of data to be sunced index's
	 */
	bgSync(index) {
		if (index == -1) {
			this.lgServ.setLastUpdate();
			// console.log('is update');
			this.translate.get('message').subscribe((res) => {
				this.showMsgWithButton(res.sync_finished, 'top', 'toast-info');
			});
			this.events.publish('sync:done', true);
			this.lgServ.setSync('_ona_date');
			this.syncOffOnline(ConfigModels.sync_tab_models.length - 1);
			return;
		} else {
			clearInterval(this.bgSyncTimer);
			let alias = ConfigModels.sync_tab_models[index];
			this.lgServ.isTable('_ona_' + alias + '_date').then((lastSyncDate) => {
				this.getSyncHeaderInfo(alias, 'X-WP-Total', lastSyncDate).then((totalCount) => {
					this.getSyncHeaderInfo(alias, 'X-WP-TotalPages', lastSyncDate).then(
						(pages) => {
							// var totalNulberOfListings = 0;
							var pageNum = 0;
							var page;
							var num;
							page = pages;
							num = totalCount;
							// totalNulberOfListings = num;
							pageNum = page;

							if (pageNum > 0) {
								for (let i = 1; i <= pageNum; i++) {
									this.getLastMod(alias, 100, i, lastSyncDate).then(
										(data) => {
											var tempArray = [];
											var resultIds = [];
											var tempres;
											tempres = data;
											tempArray = tempres;
											if (tempArray.length > 0) {
												for (let j = 0; j < tempArray.length; j++) {
													resultIds.push(tempArray[j].id);
												}
												this.checkAndreplaceInLocal(tempArray, resultIds, alias);
												if (i == pageNum) {
													this.lgServ.setSync('_ona_' + alias + '_date');
													index--;
													this.bgSync(index);
												}
											} else {
												index--;
												this.bgSync(index);
											}
										},
										(error) => {
											// this.updateListObjetSync(index);
										}
									);
								}
							} else {
								/* let results;
								results = [];
								this.lgServ.setTable('_ona_' + alias, results);
								this.lgServ.setSync('_ona_' + alias + '_date'); */
								index--;
								this.bgSync(index);
							}
						},
						(err) => {
							// this.updateListObjetSync(index);
							// console.log('Error heder', err);
						}
					);
				});
			});
		}
	}

	/**
	 * @author Landry Fongang (mr_madcoder_fil)
	 * @param array Data list from server to be used to browse internal BD and replace old occurencies
	 * @param alias Internal DB in question
	 */
	checkAndreplaceInLocal(dataArray, array, alias) {
		this.lgServ.isTable('_ona_' + alias).then((result) => {
			if (result) {
				var results = [];
				var dumpArray = [];
				results = JSON.parse(result);
				dumpArray = array;
				for (let k = 0; k < results.length; k++) {
					if (dumpArray.indexOf(results[k].id) > -1) {
						results[k] = dataArray[dumpArray.indexOf(results[k].id)];
						this.lgServ.setTable('_ona_' + alias, results);
					} else {
						this.lgServ.setTable('_ona_' + alias, results.concat(dataArray));
						// results.push(dataArray[dumpArray.indexOf(results[k].id)]);
					}
				}
			}
		});
	}

	retrieveCategories() {
		return new Promise((resolve, reject) => {
			this.afServ.retrieveURL((_url) => {
				let apiUrl = _url.url;
				this.http.get(apiUrl + '/wp-json/wp/v2/categories').subscribe((result) => {
					resolve(result);
				});
			}),
				(err) => {
					reject(err);
				};
		});
	}

	/**
	 * Cette méthode permet de récupérer
	 * la liste des articles liées à la catégorie
	 * Paroles aux Experts
	 */
	retrievePost() {
		return new Promise((resolve, reject) => {
			this.afServ.retrieveURL((_url) => {
				this.afServ.retrievePost((_post) => {
					let apiUrl = _url.url;
					let apiPost = _post.post;
					// console.log('URL =>', apiUrl);
					this.http.get(apiUrl + apiPost).subscribe((result) => {
						resolve(result);
					});
				}),
					(err) => {
						reject(err);
					};
			});
		});
	}

	retrieveArticles() {
		return new Promise((resolve, reject) => {
			this.afServ.retrieveURL((_url) => {
				let apiUrl = _url.url;
				this.http.get(apiUrl + '/wp-json/wp/v2/posts').subscribe((result) => {
					resolve(result);
				}),
					(err) => {
						reject(err);
					};
			});
		});
	}

	setCategory() {
		return new Promise((resolve, reject) => {
			this.afServ.retrieveCategories((val) => {
				var apiCategories = val.url;
				this.http.get(apiCategories).map((array) => array).subscribe((cont) => {
					resolve(cont);
				});
			});
		});
	}

	setArticle() {
		return new Promise((resolve, reject) => {
			this.afServ.retrieveArticles((_data) => {
				var urlArticle = _data.url;
				this.http.get(urlArticle).map((array) => array).subscribe((cont) => {
					resolve(cont);
				});
			});
		});
	}

	getDataAndSaveinLocal(alias) {
		return new Promise((resolve, reject) => {
			this.getHeaderInfo(alias, 'X-WP-Total').then((totalCount) => {
				this.getHeaderInfo(alias, 'X-WP-TotalPages').then(
					(pages) => {
						// var totalNulberOfListings = 0;
						var pageNum = 0;
						var page;
						var num;
						page = pages;
						num = totalCount;
						// totalNulberOfListings = num;

						pageNum = page;
						if (pageNum > 0) {
							for (let i = 1; i <= pageNum; i++) {
								this.getWpData(alias, 100, i).then(
									(data) => {
										this.lgServ.isTable('_ona_' + alias).then((response) => {
											if (response) {
												var results = [];
												var total;
												results = JSON.parse(response);
												total = results.concat(data);
												this.lgServ.setTable('_ona_' + alias, total);
												if (i == pageNum) {
													this.lgServ.setSync('_ona_' + alias + '_date');
													resolve(true);
												}
											} else {
												this.lgServ.setTable('_ona_' + alias, data);
												if (i == pageNum) {
													this.lgServ.setSync('_ona_' + alias + '_date');
													resolve(true);
												}
											}
										});
									},
									(error) => {
										// this.updateListObjetSync(index);
										// console.log('Error data', error);
									}
								);
							}
						} else {
							let results;
							results = [];
							this.lgServ.setTable('_ona_' + alias, results);
							this.lgServ.setSync('_ona_' + alias + '_date');
							resolve(true);
						}
					},
					(err) => {
						// this.updateListObjetSync(index);
						// console.log('Error heder', err);
					}
				);
			});
		});
	}

	/**
    * Cette fonction permet de mettre à jour la liste
    * des modèles à jour dans la bd
    *
    **/
	updateListObjetSync(index) {
		if (index == -1) {
			this.lgServ.setLastUpdate();
			console.log('is update');
			this.translate.get('message').subscribe((res) => {
				this.showMsgWithButton(res.sync_finished, 'top', 'toast-info');
			});
			this.events.publish('sync:done', true);
			this.lgServ.setSync('_ona_date');
			this.syncOffOnline(ConfigModels.sync_tab_models.length - 1);
			return;
		} else {
			let alias = ConfigModels.tab_models[index];

			if (
				alias == 'events' ||
				alias == 'venues' ||
				alias == 'organizers' ||
				alias == 'categories' ||
				alias == 'ev_tags' ||
				// alias == 'attendees' ||
				alias == 'tickets'
			) {
				this.getWpData(alias, 100, 1).then(
					(res) => {
						var eventRes;
						eventRes = res;

						if (eventRes.total_pages > 0) {
							for (let k = 1; k <= eventRes.total_pages; k++) {
								this.getWpData(alias, 100, k).then(
									(events) => {
										let responseEv;
										responseEv = events;
										this.lgServ.isTable('_ona_' + alias).then((localEvents) => {
											if (localEvents) {
												let results = [];
												let total;
												results = JSON.parse(localEvents);
												if (alias == 'ev_tags') {
													total = results.concat(responseEv['tags']);
												} else {
													total = results.concat(responseEv[alias]);
												}
												this.lgServ.setTable('_ona_' + alias, total);
												if (k == eventRes.total_pages) {
													this.lgServ.setSync('_ona_' + alias + '_date');
													index--;
													this.updateListObjetSync(index);
												}
											} else {
												let all;
												if (alias == 'ev_tags') {
													all = responseEv.tags;
												} else {
													all = responseEv[alias];
												}
												this.lgServ.setTable('_ona_' + alias, all);
												if (k == eventRes.total_pages) {
													this.lgServ.setSync('_ona_' + alias + '_date');
													index--;
													this.updateListObjetSync(index);
												}
											}
										});
									},
									(error) => {
										// console.log('Error data', error);
									}
								);
							}
						} else {
							let results;
							results = [];
							this.lgServ.setTable('_ona_' + alias, results);
							this.lgServ.setSync('_ona_' + alias + '_date');
							index--;
							this.updateListObjetSync(index);
						}

						/* 	index--;
					this.updateListObjetSync(index); */
					},
					(error) => {
						// console.log('Error data', error);
					}
				);
			} else {
				this.getHeaderInfo(alias, 'X-WP-Total').then((totalCount) => {
					this.getHeaderInfo(alias, 'X-WP-TotalPages').then(
						(pages) => {
							// var totalNulberOfListings = 0;
							var pageNum = 0;
							var page;
							var num;
							page = pages;
							num = totalCount;
							// totalNulberOfListings = num;

							pageNum = page;
							if (pageNum > 0) {
								for (let i = 1; i <= pageNum; i++) {
									this.getWpData(alias, 100, i).then(
										(data) => {
											this.lgServ.isTable('_ona_' + alias).then((response) => {
												if (response) {
													var results = [];
													var total;
													results = JSON.parse(response);
													total = results.concat(data);
													this.lgServ.setTable('_ona_' + alias, total);
													if (i == pageNum) {
														this.lgServ.setSync('_ona_' + alias + '_date');
														index--;
														this.updateListObjetSync(index);
													}
												} else {
													this.lgServ.setTable('_ona_' + alias, data);
													if (i == pageNum) {
														this.lgServ.setSync('_ona_' + alias + '_date');
														index--;
														this.updateListObjetSync(index);
													}
												}
											});
										},
										(error) => {
											// console.log('Error data', error);
										}
									);
								}
							} else {
								let results;
								results = [];
								this.lgServ.setTable('_ona_' + alias, results);
								this.lgServ.setSync('_ona_' + alias + '_date');
								index--;
								this.updateListObjetSync(index);
							}
						},
						(err) => {
							// console.log('Error heder', err);
						}
					);
				});
			}
		}
	}

	getAllArticles() {
		return new Promise((resolve, reject) => {
			this.getHeaderInfo('listing').then(
				(num) => {
					this.getWpData('listing', num).then(
						(data) => {
							resolve(data);
						},
						(err) => {
							reject(err);
						}
					);
				},
				(error) => {
					// console.log('Error retrieving header info ', error);
				}
			);
		});
	}

	getUserData(user, url) {
		const api_url = url.url + '/wp-json/wp/v2/users/';
		return this.http.get(api_url + user.user_id);
	}

	/** Function to retrieve all data about a certain model(listing: articles, pointfinderltypes: Categories)
	 * @author Landry Fongang (mr_madcoder_fil)
	 * @param model The type of data to retrieve from wordpress (type: string). See config.ts
	 * @param count The number of elements to retrieve (type : number)
	 * @param embed Decide whether to send embedded variable or nor in JSON response
	 * @param start_date Date from when to retrieve events (format EX. 2018-11-07 00:00:00). Default 2018-01-01 00:00:00
	 */
	getWpData(model, count?: any, page?: any, embed?: any) {
		return new Promise((resolve, reject) => {
			this.afServ.retrieveURL((objurl) => {
				if (model == 'listing' || model == 'comments') {
					this.http
						.get(
							objurl.url + '/wp-json/wp/v2/' + model + '?per_page=' + count + '&page=' + page + '&_embed'
						)
						.subscribe(
							(result) => {
								resolve(result);
							},
							(err) => {
								reject(err);
							}
						);
				} else if (model == 'categorie_actu') {
					// view categories
					this.http
						.get(
							objurl.url +
								'/wp-json/wp/v2/categories' +
								'?per_page=' +
								count +
								'&page=' +
								page +
								'&_embed'
						)
						.subscribe(
							(result) => {
								resolve(result);
							},
							(err) => {
								reject(err);
							}
						);
				} else if (model == 'actualite') {
					// view actualite
					this.http
						.get(objurl.url + '/wp-json/wp/v2/posts' + '?per_page=' + count + '&page=' + page + '&_embed')
						.subscribe(
							(result) => {
								resolve(result);
							},
							(err) => {
								reject(err);
							}
						);
				} else if (
					model == 'events' ||
					model == 'venues' ||
					model == 'organizers' ||
					model == 'ev_categories' ||
					model == 'ev_tags'
				) {
					// retrieve events list
					if (model == 'ev_tags') {
						this.http
							.get(objurl.url + '/wp-json/tribe/events/v1/tags' + '?per_page=' + count + '&page=' + page)
							.subscribe(
								(result) => {
									resolve(result);
								},
								(err) => {
									reject(err);
								}
							);
					} else if (model == 'ev_categories') {
						this.http
							.get(
								objurl.url +
									'/wp-json/tribe/events/v1/categories' +
									'?per_page=' +
									count +
									'&page=' +
									page
							)
							.subscribe(
								(result) => {
									resolve(result);
								},
								(err) => {
									reject(err);
								}
							);
					} else if (model == 'events') {
						this.http
							.get(
								objurl.url +
									'/wp-json/tribe/events/v1/' +
									model +
									'?per_page=' +
									count +
									'&page=' +
									page +
									'&start_date=2018-01-01 00:00:00'
							)
							.subscribe(
								(result) => {
									resolve(result);
								},
								(err) => {
									reject(err);
								}
							);
					} else {
						this.http
							.get(
								objurl.url +
									'/wp-json/tribe/events/v1/' +
									model +
									'?per_page=' +
									count +
									'&page=' +
									page
							)
							.subscribe(
								(result) => {
									resolve(result);
								},
								(err) => {
									reject(err);
								}
							);
					}
				} else if (model == 'tickets' || model == 'attendees') {
					this.http
						.get(objurl.url + '/wp-json/tribe/tickets/v1/' + model + '?per_page=' + count + '&page=' + page)
						.subscribe(
							(result) => {
								resolve(result);
							},
							(err) => {
								reject(err);
							}
						);
				} else {
					this.http
						.get(objurl.url + '/wp-json/wp/v2/' + model + '?per_page=' + count + '&page=' + page)
						.subscribe(
							(result) => {
								resolve(result);
							},
							(err) => {
								reject(err);
							}
						);
				}
			});
		});
	}
	/** Function to retrieve all data about a certain model(listing: articles, pointfinderltypes: Categories)
	 * @author Landry Fongang (mr_madcoder_fil)
	 * @param model The type of data to retrieve from wordpress (type: string). See config.ts
	 * @param count The number of elements to retrieve (type : number)
	 * @param date The date after which to retrieve post
	 * @param embed The date after which to retrieve post
	 */
	getLastMod(model, count?: any, page?: any, date?: any, embed?: any) {
		return new Promise((resolve, reject) => {
			this.afServ.retrieveURL((objurl) => {
				if (model == 'listing') {
					this.http
						.get(
							objurl.url +
								'/wp-json/wp/v2/' +
								model +
								'?after=' +
								date +
								'&date_query_column=post_modified' +
								'&per_page=' +
								count +
								'&page=' +
								page +
								'&_embed'
						)
						.subscribe(
							(result) => {
								resolve(result);
							},
							(err) => {
								reject(err);
							}
						);
				} else {
					this.http
						.get(
							objurl.url +
								'/wp-json/wp/v2/' +
								model +
								'?after=' +
								date +
								'&date_query_column=post_modified' +
								'&per_page=' +
								count +
								'&page=' +
								page
						)
						.subscribe(
							(result) => {
								resolve(result);
							},
							(err) => {
								reject(err);
							}
						);
				}
			});
		});
	}

	getInfosAbout(callback) {
		return this.storage.get('fireAbout').then((_data) => {
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

			// this.lgServ.setTable('_ona_about', result);
			callback(result);
		});
	}

	getAllUsers(num) {
		return new Promise((resolve) => {
			this.storage.get('fireUrl').then((url) => {
				this.http.get(url + '/wp-json/wp/v2/users/?per_page=' + num).do((res) => {}).subscribe((result) => {
					resolve(result);
				});
			});
		});
	}

	/** @author Landry Fongang
	 * Method to sync data in BG of models of namespace different
	 * from TRIBE
	 * @param model Data model to sync in background
	 */
	pageBgSyncOthers(model) {
		// console.log('Syncing others');
		var tempTable = [];
		this.getHeaderInfo(model, 'X-WP-Total').then((totalCount) => {
			this.getHeaderInfo(model, 'X-WP-TotalPages').then((pages) => {
				for (let k = 1; k <= pages; k++) {
					this.getWpData(model, 100, k).then((posts: any) => {
						if (posts.length == totalCount) {
							// console.log('Length equal to 100 so OK');
							this.lgServ.setTable('_ona_' + model, posts);
						} else {
							tempTable = tempTable.concat(posts);

							if (k == pages) {
								this.lgServ.setTable('_ona_' + model, tempTable);
								this.lgServ.setSync('_ona_' + model + '_date');
							}
						}
					});
				}
			});
		});
	}

	/** @author Landry Fongang
	 * Method to sync data in BG of models of the name space TRIBE
	 * @param model Data model to sync in background
	 */
	pageBgSyncTribe(model) {
		var tempTable = [];
		this.total = 0;
		this.pagenum = 0;
		this.getWpData(model, 100, 1)
			.then((res: any) => {
				this.pagenum = res.total_pages;
				this.total = res.total;

				for (let k = 1; k <= this.pagenum; k++) {
					this.getWpData(model, 100, k).then((result: any) => {
						if (result[model].length == this.total) {
							// console.log('Length equal to 100 so OK');
							this.lgServ.setTable('_ona_' + model, result[model]);
						} else {
							tempTable = tempTable.concat(result[model]);

							if (k == this.pagenum) {
								// console.log('Concatenated to =>', tempTable);
								this.lgServ.setTable('_ona_' + model, tempTable);
								this.lgServ.setSync('_ona_' + model + '_date');
							}
						}
					});
				}
			})
			.catch((err) => {
				// console.log(err);
			});
	}

	verifyOffer(form) {
		return new Promise((resolve) => {
			this.storage.get('fireUrl').then((url) => {
				this.http
					.get(url + '/wp-content/API/verifyPost.php?Verify_value=1' + '&Post_ID=' + form.id)
					.do((res) => {})
					.subscribe(
						(result) => {
							// alert('Attach Image Result ' + result);
							resolve(result);
						},
						(error) => {
							// alert('Error ' + JSON.stringify(error));
						}
					);
			});
		});
	}

	/**
	 * @author Landry Fongang (mr_madcoder_fil)
	 * Method to get informations about a header on a particular model of data
	 * @param type info header to retrieve ex: 'X-WP-TotalPages', 'X-WP-Total'
	 */
	getHeaderInfo(model, type?: any) {
		return new Promise((resolve) => {
			this.afServ.retrieveURL((objUrl) => {
				var xhr = new XMLHttpRequest();
				xhr.addEventListener('readystatechange', function() {
					if (this.readyState === 4) {
						resolve(xhr.getResponseHeader(type));
						// console.log('xhr.getResponseHeader()', xhr.getResponseHeader(type));
					} /* else {
						reject('Error');
					} */
				});

				if (model == 'event') {
					// console.log('Event loading...');
					xhr.open('HEAD', objUrl.url + '/wp-json/tribe/events/v1/events?per_page=100');
				} else {
					xhr.open('HEAD', objUrl.url + '/wp-json/wp/v2/' + model + '?per_page=100');
				}
				xhr.send(null);
			});
		});
	}
	/**
	 * @author Landry Fongang (mr_madcoder_fil)
	 * Method to get informations about a header on a particular model of data during bgSync method
	 * @param type info header to retrieve ex: 'X-WP-TotalPages', 'X-WP-Total'
	 */
	getSyncHeaderInfo(model, type?: any, date?: any) {
		return new Promise((resolve) => {
			this.afServ.retrieveURL((objUrl) => {
				var xhr = new XMLHttpRequest();
				xhr.addEventListener('readystatechange', function() {
					if (this.readyState === 4) {
						resolve(xhr.getResponseHeader(type));
					}
				});

				xhr.open(
					'HEAD',
					objUrl.url +
						'/wp-json/wp/v2/' +
						model +
						'?per_page=100&after=' +
						date +
						'&date_query_column=post_modified'
				);
				xhr.send(null);
			});
		});
	}

	geocode(address) {
		return new Promise((resolve) => {
			this.http
				.get(
					'https://maps.googleapis.com/maps/api/geocode/json?address=' +
						address +
						'&key=AIzaSyB6xaISf7UKYbFgJUfxCH8MRbMaJw-mxvY'
				)
				.do((res) => {})
				.subscribe((result) => {
					resolve(result);
				});
		});
	}

	geolocate() {
		return new Promise((resolve) => {
			this.http
				.get('https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyB6xaISf7UKYbFgJUfxCH8MRbMaJw-mxvY')
				.do((res) => {})
				.subscribe((result) => {
					resolve(result);
				});
		});
	}

	reverseGeocoding(lat, lng) {
		return new Promise((resolve) => {
			this.http
				.get(
					'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
						lat +
						',' +
						lng +
						'&key=AIzaSyB6xaISf7UKYbFgJUfxCH8MRbMaJw-mxvY'
				)
				.do((res) => {})
				.subscribe((result) => {
					resolve(result);
				});
		});
	}

	presentAlert(title, msg) {
		let alert = this.alertCtrler.create({
			title: title,
			subTitle: msg,
			buttons: [ 'Dismiss' ]
		});
		alert.present();
	}

	getCities(name) {
		return new Promise((resolve) => {
			this.http
				.get(
					'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' +
						name +
						'&types=(cities)&language=en&key=AIzaSyB6xaISf7UKYbFgJUfxCH8MRbMaJw-mxvY'
				)
				.do((res) => {})
				.subscribe((result) => {
					resolve(result);
				});
		});
	}

	/**
	 * Method to set total number of post pages in local storage
	 * @author Landry Fongang (mr_madcoder_fil)
	 * @param url Url to retrieve post number
	 */
	getPostPages(url) {
		this.http.get(url).do((res) => {}).subscribe(
			(result) => {
				var response;
				response = result;
				this.storage.set('post_pages_count', response.pages);
			},
			(error) => {
				// console.log('Error => ', error);
			}
		);
	}
	/**
	 * Method to set total post count
	 * in local storage
	 * @author Landry Fongang (mr_madcoder_fil)
	 * @param url Url to retrieve post number
	 */
	getPostCount(url) {
		this.http.get(url).do((res) => {}).subscribe(
			(result) => {
				var response;
				response = result;
				this.storage.set('post_count', response.count_total).then(() => {
					this.events.publish('alloffsnumLoaded');
				});
			},
			(error) => {
				// console.log('Error => ', error);
			}
		);
	}

	/**
	 * @author Landry Fongang (mr_madcoder_fil)
	 * Method to locally load posts 10 by 10 and save in local storage 
	 * @param url Address to retrieve data
	 * @param pages total number of post pages
	 * @param local_post_count Number of post locally loaded already
	 * @param total_count Total Post Count
	 */
	lazyLoadPosts(url, total_count, page) {
		this.storage.set('syncStarted', true);

		return new Promise((resolve, reject) => {
			this.http.get(url + '&page=' + page).do((res) => {}).subscribe(
				(result) => {
					var response;
					response = result;

					this.storage.get('temp_posts').then((temp_post) => {
						this.storage.get('post_pages_count').then((pages_count) => {
							if (temp_post) {
								var array = [];
								array = temp_post;

								if (page && pages_count) {
									if (page > pages_count) {
										this.storage.set('all_offers', array).then(() => {
											this.storage
												.set('LastSyncDate', moment().format('MMM Do YY, h:mm:ss a'))
												.then(() => {
													this.events.publish('syncDate:Available');
												});
											// this.connstatprov.startSyncTimer();
											this.storage.set('syncStarted', false);
											this.events.publish('autosync:changed', 'empty');
										});
										var local_count = 1;
										this.storage.remove('temp_posts');
										this.storage.set('local_page_count', local_count);
									} else {
										this.storage.set('temp_posts', array.concat(response.posts));
									}
								}
							} else {
								this.storage.set('temp_posts', response.posts);
							}
						});
					});
					resolve(true);
				},
				(error) => {
					// console.log('Error => ', error);
					reject(false);
				}
			);
		});
	}

	/**==========================================================================
	 *	LOAD IMAGE AND UPLOAD TO SERVER
	 * ========================================================================== 
	 */

	/**
	 * Cette fonction permet à un utilisateur 
	 * de prendre une photo à partir de la caméra de l'appareil
	 *
	 **/
	takeOnePicture() {
		return new Promise((resolve, reject) => {
			let options = {
				destinationType: this.camera.DestinationType.DATA_URL,
				targetWidth: 1000,
				targetHeight: 1000,
				correctOrientation: true
			};

			this.camera.getPicture(options).then(
				(data) => {
					resolve(data);
				},
				(error) => {
					// console.log(error);
					reject(error);
				}
			);
		});
	}
	//FIn take only one picture

	/**
	 * This function is used to select more than one pictures
	 * on Device
	 * @author davart
	 * @returns Promise (Array<string> la liste des URIs)
	 */
	openImagePicker() {
		return new Promise((resolve, reject) => {
			this.imagePicker.hasReadPermission().then((result) => {
				if (result == false) {
					// no callbacks required as this opens a popup which returns async
					this.imagePicker.requestReadPermission();
				} else if (result == true) {
					let options = {
						maximumImagesCount: 10,
						quality: 75,
						outputType: 1
					};

					this.imagePicker.getPictures(options).then(
						(results) => {
							resolve(results);
						},
						(err) => {
							reject(err);
						}
					);
				}
			});
		});
	}

	/**
	 * Method to upload an image to wordpress
	 * @author Landry Fongang
	 */
	uploadImageToWordpress(imageString, token) {
		return new Promise((resolve, reject) => {
			this.afServ.retrieveURL((url) => {
				let randomName = 'image_'+Math.random().toString(36).substring(7);
				let t = this.filetransfer.create();

				t
					.upload(imageString, url.url + '/wp-json/wp/v2/media', {
						headers: {
							Authorization: 'Bearer ' + token,
							'content-disposition': "attachement; filename="+randomName+".png"
						}
					})
					.then((res) => {
						// alert(JSON.stringify(res));
						resolve(res);
					})
					.catch((err) => {
						// alert(JSON.stringify(err));
						reject(err);
					});
			});
		});
	}

	/**===========================================================================
	 * Usefull methods
	 * ===========================================================================
	 */

	/**
	 * @author Foubs
	 * @description Cette methode renvoie la liste de toute les pays du monde
	 */
	getCountries(): Observable<string[]> {
		let url = 'assets/countries.json';
		return this.http.get(url).pipe(map(this.extractData), catchError(this.handleError));
	}

	private extractData(res: Response) {
		let body = res;
		return body || {};
	}

	private handleError(error: Response | any) {
		let errMsg: string;
		if (error instanceof Response) {
			const err = error || '';
			errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
		} else {
			errMsg = error.message ? error.message : error.toString();
		}

		console.error(errMsg);
		return Observable.throw(errMsg);
	}

	/**
   * Cette fonction permet d'effectuer un appel
   * @param phonenumber int
   * (A Executer sur un Smartphone)
   **/
	doCall(phonenumber, txtMessage) {
		if (phonenumber != '') {
			this.callNumber.callNumber(phonenumber, true).then(() => {}).catch(() => {});
		} else {
			this.showMsgWithButton(txtMessage, 'top', 'toast-error');
		}
	}

	/**
 * Cette fonction permet d'envoyer un mail
 * @param adrEmail string
 * @param txtMessage string
 * (A Executer sur un Smartphone)
 **/
	doEmail(adrEmail, txtMessage, sujet?: string, body?: string) {
		if (adrEmail) {
			// add alias
			this.emailComposer.addAlias('gmail', 'com.google.android.gm');

			//Now we know we can send
			let email = {
				app: 'gmail',
				to: adrEmail,
				subject: sujet,
				body: body,
				isHtml: true
			};

			this.emailComposer.open(email).then(() => {
				this.showMsgWithButton(txtMessage, 'top', 'toast-success');
			});
		} else {
			this.showMsgWithButton(txtMessage, 'top', 'toast-error');
		}
	}

	/**
 * Cette fonction permet d'ouvrir un site web
 * @param adrWeb string
 * @param txtMessage string
 * (A Executer sur un Smartphone)
 **/
	doWebsite(adrWeb, txtMessage) {
		if (adrWeb) {
			this.browser.create(adrWeb);
		} else {
			this.showMsgWithButton(txtMessage, 'top', 'toast-error');
		}
	}

	/**
	 * Cette fonction permet d'envoyer
	 * des SMS
	 * @param phonenumber int, le numéro de téléphone du destinataire
	 * @param options any
	 **/
	doSMS(phonenumber, options?: any) {
		return new Promise((resolve, reject) => {
			if (!phonenumber) {
			}

			let addModal = this.modalCtrl.create('SmsPage');
			// let msgLoading = this.loading.create({ content: options.sms_sending });

			//callback when modal is dismissed (recieve data from View)
			addModal.onDidDismiss((data) => {
				if (data) {
					let confirm = this.alertCtrl.create({
						title: 'VITRINE AFRICAINE',
						message: options.cost_sms,
						buttons: [
							{
								text: options.no,
								handler: () => {
									//console.log('Disagree clicked');
									reject(false);
								}
							},
							{
								text: options.yes,
								handler: () => {
									let message = options.sms_sent;
									this.sms
										.send(phonenumber, data)
										.then((res) => {
											//msgLoading.dismiss();
											this.showMsgWithButton(message, 'top', 'toast-success');
											resolve(true);
										})
										.catch((err) => {
											reject(false);
										});
								}
							}
						]
					});

					confirm.present();
				}
			});

			addModal.present();
		});
	}

	/**
 * Cette fonction permet de partarger une note
 * ou autres document
 *
 **/
	doShare(message, subject, fichier, url, type) {
		this.socialSharing
			.share(message, subject, fichier, url)
			.then(() => {
				// Sharing via email is possible
			})
			.catch(() => {
				if (type == 'notes') this.showMsgWithButton(this.txtObjet.native.share_note, 'bottom', 'toast-info');
			});
	}

	/**
	 * Method to delete an entry from an internal table
	 * @param model Table to delete from
	 * @param objet Objet to delete
	 */
	delFromInternal(type, objet) {
		this.lgServ.isTable('_ona_' + type).then((res) => {
			let reqs = [];
			if (res) {
				reqs = JSON.parse(res);

				for (let k = 0; k < reqs.length; k++) {
					if (reqs[k].id == objet.id) {
						reqs.splice(k, 1);
					}
				}
			}
			this.lgServ.setTable('_ona_' + type, reqs);
		});
	}

	/**
 * Cette fonction permet de partarger les informations
 * d'un client via the social Networkd
 *
 **/
	doSharePartner(item, type) {
		let message = '',
			subject = type + ': ' + item.name,
			url = '';

		for (var index in item) {
			message += index + ': ' + item[index] + '/n';
		}

		this.socialSharing
			.share(message, subject, null, url)
			.then(() => {
				// Sharing via email is possible
			})
			.catch(() => {
				this.showMsgWithButton(this.txtObjet.native.share_partner, 'bottom');
			});
	}

	/**
 * Cette fonction ouvre la boite de dialogue
 * afin que l'utilisateur puisse évaluer l'application
 * @param android string, le lien vers le Play Store
 * @param ios string, le lien vers l'App Store
 * @param objEvaluate any, l'objet JSON
 */
	doEvaluate(android, objEvaluate, ios?: any) {
		this.appRate.preferences = {
			usesUntilPrompt: 3,
			useLanguage: this.translate.getDefaultLang(),
			displayAppName: 'VITRINE AFRICAINE',
			storeAppURL: {
				ios: '<app_id>',
				android: 'market://details?id=' + android
			}
		};

		this.appRate.promptForRating(true);
	}

	/***
 * Cette fonction permet d'afficher une alerte
 * en cas de succès d'une action
 * @return AlertController
 *
 **/
	alertSuccess(txtMessage) {
		let msgBox = this.alertCtrl.create({
			title: 'VITRINE AFRICAINE',
			subTitle: txtMessage,
			cssClass: 'boxAlert-success',
			buttons: [ 'OK' ]
		});

		return msgBox;
	}

	/***
 * Cette fonction permet d'afficher une alerte
 * en cas d'erreur d'une action
 * @return AlertController
 *
 **/
	alertError() {
		let msgBox = this.alertCtrl.create({
			title: 'ONA SMART SALES',
			subTitle: this.txtObjet.native.err_update,
			cssClass: 'boxAlert-danger',
			buttons: [ 'OK' ]
		});

		return msgBox;
	}

	/**
 * Cette fonction permet d'afficher une alerte
 * en personnaliser le texte
 *
 **/
	alertCustomError(message) {
		let msgBox = this.alertCtrl.create({
			title: 'VITRINE AFRICAINE',
			subTitle: message,
			cssClass: 'boxAlert-danger',
			buttons: [ 'COMPRIS' ]
		});

		return msgBox;
	}

	/***
 * Cette fonction permet d'afficher une alerte
 * en cas d'erreur Internet
 * @return AlertController
 *
 **/
	alertNoInternet() {
		let msgBox = this.alertCtrl.create({
			title: 'VITRINE AFRICAINE',
			subTitle: this.err_network,
			buttons: [ 'OK' ]
		});

		return msgBox;
	}

	/**
  * Cette fonction permet de 
  * vérifier de faire patienter
  * l'utilisateur lorsqu'il accède à un contenu distant
  **/
	makeUserPatient() {
		let loadBox = this.loading.create({ content: this.txtObjet.login.checking });

		return loadBox;
	}

	/**
  * Cette fonction affiche un message
  * d'erreur d'authentification
  *
  **/
	displayErrorAuth() {
		this.showMsgWithButton(this.txtObjet.login.credentials, 'top', 'toast-error');
	}

	/**
  * Cette fonction affiche un message
  * personnalisé
  *
  **/
	displayCustomMessage(txtMessage) {
		let toast = this.toastCtrl.create({
			message: txtMessage,
			duration: 3000,
			position: 'top'
		});

		toast.present();
	}

	/**
  * Cette fonction affiche un message
  * personnalisé avec button ok
  *
  **/
	showMsgWithButton(txtMessage, position, options?: any) {
		let toast = this.toastCtrl.create({
			message: txtMessage,
			showCloseButton: true,
			closeButtonText: 'OK',
			cssClass: options !== undefined ? options : '',
			duration: 4000,
			position: position
		});
		toast.present();
	}

	//Cette fonction permet de formatter la
	//date au format UTC
	formatUTF(toConvert) {
		var objDate,
			strDate = '',
			mois,
			minutes,
			jour;
		if (toConvert == '') objDate = new Date();
		else objDate = new Date(toConvert);

		if (objDate.getMonth() < 9) mois = '0' + (objDate.getMonth() + 1);
		else mois = objDate.getMonth() + 1;

		if (objDate.getMinutes() < 10) minutes = '0' + objDate.getMinutes();
		else minutes = objDate.getMinutes();

		if (objDate.getDate() < 10) jour = '0' + objDate.getDate();
		else jour = objDate.getDate();

		strDate = objDate.getFullYear() + '-' + mois + '-' + jour + ' ' + objDate.getHours() + ':' + minutes + ':00';

		return strDate;
	}

	/**================================================================================
	 * CREATION / MODIFICATION D UN OBJET WORDPRESS
	 * 
	 * ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
	 */
	//////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////////////

	/**
	 * Cette fonction permet d'insérer les objets 
	 * dans la bd
	 * @param objet JSONObject, objet à insérer
	 * @param list_objets Array<any>, le tableau d'objet
	 * @param type string
	 */
	insertOfflineData(list_objets, type, namespace) {
		if (list_objets.length == 0) {
			console.log('Sync done');
			this.lgServ.removeTo('_ona_add_' + type).then((reponse) => {
				console.log('sync Good');
			});
			return;
		} else {
			let index = list_objets.length - 1;
			this.createDataToServer(type, list_objets[index], namespace)
				.then((_data) => {
					if (_data) {
						list_objets.splice(index, 1);
					}

					console.log('after add : ' + list_objets.length);
					this.lgServ.setTableTo('_ona_add_' + type, list_objets).then((_reponse) => {});
				})
				.catch((error) => {
					// this.updateOfflineData(list_objets, type);
				});
		}
	}
	deleteOfflineData(list_objets, type, namespace) {
		if (list_objets.length == 0) {
			console.log('Sync done');
			this.lgServ.removeTo('_ona_delete_' + type).then((reponse) => {
				console.log('sync Good');
			});
			return;
		} else {
			let index = list_objets.length - 1;
			this.deleteDataFromServer(type, list_objets[index], namespace)
				.then((_data: any) => {
					if (_data) {
						list_objets.splice(index, 1);
					}

					console.log('after delete : ' + list_objets.length);

					this.lgServ.setTableTo('_ona_delete_' + type, list_objets).then((_reponse) => {});
				})
				.catch((error) => {});
		}
	}

	/**
	 * Cette fonction permet de mettre à jour les objets 
	 * dans la bd (Serveur)
	 * @param list_objets Array<any>, le tableau d'objet
	 * @param type string
	 */
	updateOfflineData(list_objets, type, namespace) {
		if (list_objets.length == 0) {
			console.log('Sync done');
			this.lgServ.removeTo('_ona_update_' + type).then((reponse) => {
				console.log('sync Good');
			});
			return;
		} else {
			let index = list_objets.length - 1,
				idObj;
			idObj = list_objets[index].id;

			// console.log(idObj);
			if (idObj != 0) {
				//On effectue la synchronisation de la mise à jour
				this.updateDataToServer(type, idObj, list_objets[index], namespace)
					.then((_data) => {
						if (_data) {
							list_objets.splice(index, 1);
						}

						this.lgServ.setTableTo('_ona_update_' + type, list_objets).then((_reponse) => {
							// this.updateOfflineData(list_objets, type);
						});

						console.log('after update : ' + list_objets.length);
					})
					.catch((error) => {
						// this.updateOfflineData(list_objets, type);
					});
			}
		}
	}

	/**
	 * Cette fonction permet de synchroniser l'ajout d'un 
	 * enregistrement à la bd sur Server
	 * @param type string, le nom de l'objet (modèle)
	 *
	 **/
	createObjetSync(type, namespace) {
		//On récupère les les objets tampons à sync avec la bd
		this.lgServ.isTable('_ona_add_' + type).then((data) => {
			if (data) {
				let list_objets = JSON.parse(data);
				console.log('before add : ' + list_objets.length);

				this.insertOfflineData(list_objets, type, namespace);
			}
		});
	}
	/**
	 * Cette fonction permet de synchroniser la suppression d'un 
	 * enregistrement à la bd sur Server
	 * @param type string, le nom de l'objet (modèle)
	 *
	 **/
	deleteObjetSync(type, namespace) {
		//On récupère les les objets tampons à sync avec la bd
		this.lgServ.isTable('_ona_delete_' + type).then((data) => {
			if (data) {
				let list_objets = JSON.parse(data);
				console.log('before delete : ' + list_objets.length);

				this.deleteOfflineData(list_objets, type, namespace);
			}
		});
	}

	/**
	 * Cette fonction permet de synchroniser la mise à jour d'un 
	 * enregistrement à la bd sur Server
	 * @param type string, le nom de l'objet (modèle)
	 *
	 **/
	updateObjetSync(type, namespace) {
		//On récupère les les objets tampons à sync avec la bd
		this.lgServ.isTable('_ona_update_' + type).then((data) => {
			if (data) {
				let list_objets = JSON.parse(data);
				console.log('before update ' + list_objets.length);

				this.updateOfflineData(list_objets, type, namespace);
			}
		});
	}

	/**
	 * Cette fonction permet de vérifier qu'un objet n'est pas
	 * encore synchroniser et il a été modifié, alors on le met
	 * à jour dans la bd
	 *
	 **/
	updateNoSyncObjet(type, data, objet) {
		this.lgServ.isTable('_ona_add_' + type).then((res) => {
			if (res) {
				let liste = JSON.parse(res);
				for (let i = 0; i < liste.length; i++) {
					if (liste[i].idx == objet.idx) {
						liste[i] = data;
						break;
					}
				}
				//On met à jour la table des ajouts
				this.lgServ.setTable('_ona_add_' + type, liste);
			}
		});
	}

	/**
	 * Cette fonction permet de mettre à jour les données
	 * sur le serveur distant
	 * @param type string, nom de la table
	 * @param idObj Number, numéro d'identifiant de l'objet à mettre à jour
	 * @param objet any, l'objet à mettre à jour
	 * @param namespcae any, le namespace
	 */
	updateDataToServer(type, idObj, objet, namespace) {
		return new Promise((resolve, reject) => {
			//On effectue la synchronisation de la mise à jour

			this.lgServ.isTable('wpIonicToken').then((user) => {
				if (user) {
					let token = JSON.parse(user).token;

					this.auth
						.validateAuthToken(token)
						.then((success: any) => {
							if (JSON.parse(success).data.status == 200) {
								let headers = new HttpHeaders({
									'Content-Type': 'application/json',
									Authorization: `Bearer ${token}`
								});
								this.http
									.post(this.urlServ + namespace + type + '/' + idObj, objet, { headers: headers })
									.subscribe(
										(res) => {
											resolve(res);
										},
										(err) => {
											reject(err);
										}
									);
							} else {
								// Inform user that token is no more valid and he must login again
							}
						})
						.catch((error) => {
							// alert('error' + error);
							// Inform user that token is no more valid and he must login again
						});
				} else {
					// Request user to login and then add to server
				}
			});

			//End of Update request
		});
	}

	uploadOfflineImageToServer(annonce, token) {
		return new Promise((resolve, reject) => {
			this.lgServ.isTable('_ona_images_to_add').then((data) => {
				if (data) {
					var tab = JSON.parse(data);

					for (let k = 0; k < tab.length; k++) {
						if (tab[k].idx == annonce.idx) {
							this.uploadImageToWordpress(tab[k].imgUrl, token)
								.then(
									(res: any) => {
										// imgloader.dismiss();
										// alert('upload success=> ' + JSON.stringify(res));
										resolve(res);
									},
									(er) => {
										// imgloader.dismiss();

										// alert('Upload er=> ' + JSON.stringify(er));
										reject(er);
									}
								)
								.catch((imgerr) => {
									// imgloader.dismiss();
									// alert('Upload err=> ' + JSON.stringify(imgerr));
									reject(imgerr);
								});
						}
					}
				}
			});
		});
	}

	/**
	 * Cette fonction permet de créer un objet et le sauvegarder
	 * sur le serveur distant
	 * @param type string, nom de la table
	 * @param objet any, l'objet à mettre à jour
	 */
	deleteDataFromServer(type, objet, namespace) {
		return new Promise((resolve, reject) => {
			var admin_username = 'filigor2@gmail.com';
			var admin_password = '6190SSRA';
			this.auth.postLogin(admin_username, admin_password, this.urlServ).subscribe((res: any) => {
				let token = res.token;

				this.auth
					.validateAuthToken(token)
					.then((success: any) => {
						if (JSON.parse(success).data.status == 200) {
							// console.log('token ok');
							// console.log('Objet', objet);

							var xhr = new XMLHttpRequest();

							xhr.addEventListener('readystatechange', function() {
								if (this.readyState === 4) {
									// console.log('Response =>', JSON.parse(this.responseText));
									resolve(JSON.parse(this.responseText));
								}
							});

							xhr.open(
								'DELETE',
								this.urlServ.url + '/wp-json/' + namespace + '/' + type + '/' + objet.id
							);
							xhr.setRequestHeader('Content-Type', 'application/json');
							xhr.setRequestHeader('Authorization', 'Bearer ' + token);
							xhr.send();
						} else {
							// Inform user that token is no more valid and he must login again
							reject({ error: 3, msg: 'token' });
						}
					})
					.catch((error) => {
						// alert('error' + error);
					});
			});
		});
	}

	/**
	 * Cette fonction permet de créer un objet et le sauvegarder
	 * sur le serveur distant
	 * @param type string, nom de la table
	 * @param objet any, l'objet à mettre à jour
	 */
	createDataToServer(type, objet, namespace) {
		return new Promise((resolve, reject) => {
			//On effectue la synchronisation pour la sauvegarde des data serveur
			var admin_username = 'filigor2@gmail.com';
			var admin_password = '6190SSRA';

			this.auth.postLogin(admin_username, admin_password, this.urlServ).subscribe(
				(res: any) => {
					let token = res.token;

					if (type == 'listing' && objet.id == 0) {
						this.uploadOfflineImageToServer(objet, token).then((res: any) => {
							if (type == 'listing') objet.featured_media = res.id;

							this.sendToServer(token, objet, type, namespace).then(
								(result: any) => {
									resolve(result);
								},
								(err) => {
									reject(err);
								}
							);
						});
					} else {
						this.sendToServer(token, objet, type, namespace).then(
							(result: any) => {
								// if(type=="events"){
								// 	this.setTicketsToServer(result.id, objet.ticket);
								// }

								resolve(result);
							},
							(err) => {
								reject(err);
							}
						);
					}
				},
				(err) => {
					// console.log('Connection error', err);
				}
			);
		});
		//End of Create request
	}

	/**
	 * Cette méthode permet à l'utilisateur d'insérer un ticket(produit)
	 * dans woocommerce
	 * 
	 * @param event_id number, identifiant d'un évènément
	 * @param objet any, l'objet ticket à insérer dans woocommerce
	 */
	setTicketsToServer(event_id, objet) {
		return new Promise((resolve, reject) => {});
	}

	/**
	 * This method is used to create/update a data
	 * to a WP Website
	 * 
	 * @param token string, token of authorized user
	 * @param objet any, data to save/update to server
	 * @param type string, the name of model
	 * @param namespace string, pattern used by the model
	 * 
	 */
	sendToServer(token, objet, type, namespace) {
		return new Promise((resolve, reject) => {
			this.auth
				.validateAuthToken(token)
				.then((success: any) => {
					if (JSON.parse(success).data.status == 200) {
						// console.log('token ok');

						var data = JSON.stringify(objet);
						var xhr = new XMLHttpRequest();

						xhr.addEventListener('readystatechange', function() {
							if (this.readyState === 4) {
								// console.log('Response =>', JSON.parse(this.responseText));
								resolve(JSON.parse(this.responseText));
							}
						});

						let suffix = '';
						if (objet.id != 0) suffix = '/' + objet.id;

						xhr.open('POST', this.urlServ.url + '/wp-json/' + namespace + '/' + type + suffix);
						xhr.setRequestHeader('Content-Type', 'application/json');
						xhr.setRequestHeader('Authorization', 'Bearer ' + token);
						xhr.send(data);
					} else {
						// Inform user that token is no more valid and he must login again
						reject({ error: 3, msg: 'token' });
					}
				})
				.catch((error) => {
					// alert('error' + error);
				});
		});
	}

	/** Cette fonction permet d'enregistrer les requetes d'insertion
	 *  pour chaque objet (modèles)
	 * @param type string, le nom de l'objet
	 *
	 **/
	syncCreateObjet(type, data) {
		this.lgServ.isTable('_ona_add_' + type).then((res) => {
			let reqs = [];
			if (res) {
				reqs = JSON.parse(res);
			}

			reqs.push(data);
			this.lgServ.setTable('_ona_add_' + type, reqs);
		});
	}

	/**
	 * Cette function permmet de mettre a jour un element dans la BD interne
	 * 
	 * @param model Model de donnees a mettre a jour
	 * @param data Le nouvelle objet mise ajour a inserer dans le model de donnee
	 */
	localUpdate(model, data) {
		this.lgServ.isTable('_ona_' + model).then((res) => {
			let reqs = [];
			if(res){
				reqs = JSON.parse(res);
			}

			for (let j = 0; j < reqs.length; j++) {
				if (reqs[j].id == data.id) {
					reqs[j] = data;
				}
			}
			this.lgServ.setTable('_ona_' + model, reqs);
		});
	}

	updateReview(model, data) {
		this.lgServ.isTable('_ona_' + model).then((res) => {
			let reqs = [];
			reqs = JSON.parse(res);

			for (let j = 0; j < reqs.length; j++) {
				if (reqs[j].object_Id == data.object_Id) {
					reqs[j] = data;
				}
			}
			this.lgServ.setTable('_ona_' + model, reqs);
		});
	}
	deleteReview(model, data) {
		this.lgServ.isTable('_ona_' + model).then((res) => {
			let reqs = [];
			reqs = JSON.parse(res);

			for (let j = 0; j < reqs.length; j++) {
				if (reqs[j].object_Id == data.object_Id) {
					reqs.splice(j, 1);
				}
			}
			if (reqs.length <= 0) {
				this.storage.remove('_ona_' + model);
			} else {
				this.lgServ.setTable('_ona_' + model, reqs);
			}
		});
	}

	/**
	 * Cette fonction permet de synchroniser des requêtes spécifique
	 * sur un modèle 
	 * @param type string, le nom de l'objet
	 * @param params any, l'objet à modifier dans la bd interne
	 **/
	updateSyncRequest(type, params) {
		this.lgServ.isTable('_ona_update_' + type).then((res) => {
			let reqs = [];
			if (res) {
				reqs = JSON.parse(res);
			}

			reqs.push(params);
			this.lgServ.setTable('_ona_update_' + type, reqs);
		});
	}

	/**
	 * Cette fonction permet d'insérer les éléments
	 * dans la bd historique
	 * @param type string, le nom du modèle
	 * @param objet JSon, l'objet à insérer
	 *
	 **/
	copiedAddObjet(type, objet) {
		this.lgServ.isTable('_ona_' + type).then((res) => {
			let reqs = [],
				trouve = true;
			if (res) reqs = JSON.parse(res);

			if (reqs.length == 0) reqs.push(objet);
			else {
				for (let i = 0; i < reqs.length; i++) {
					if (reqs[i].id == objet.id) {
						trouve = false;
						break;
					}
				}

				if (trouve) reqs.push(objet);
			}

			this.lgServ.setTable('_ona_' + type, reqs);
		});
	}

	/**
	 * Cette fonction permet d'ajouter un élément
	 * dans la bd interne
	 * @param type string, le nom du modèle
	 * @param objet JSon, l'objet à insérer
	 *
	 **/
	copiedAddSync(type, objet) {
		this.lgServ.isTable('_ona_' + type).then((res) => {
			let reqs = [];
			if (res) {
				reqs = JSON.parse(res);
			}

			reqs.unshift(objet);
			this.lgServ.setTable('_ona_' + type, reqs);
		});
	}
	/**
	 * Cette fonction permet de modifier un élément
	 * dans la bd interne
	 * @param type string, le nom du modèle
	 * @param objet JSon, l'objet à insérer
	 *
	 **/
	copieModifSync(type, objet) {
		this.lgServ.isTable('_ona_' + type).then((res) => {
			let reqs = [];
			if (res) {
				reqs = JSON.parse(res);
			}

			for (let k = 0; k < reqs.length; k++) {
				if (reqs[k].id == objet.id) {
					reqs[k] == objet;
				}
			}
			this.lgServ.setTable('_ona_' + type, reqs);
			this.events.publish('annonce:modified', objet);
		});
	}
	/**
	 * Cette fonction permet d'ajouter un élément a supprimer
	 * dans la bd interne
	 * @param type string, le nom du modèle
	 * @param objet JSon, l'objet à insérer
	 *
	 **/
	copiedDelSync(type, objet) {
		let alert = this.alertCtrl.create({
			title: 'Supprimer ' + objet.title.rendered + ' ?',
			message: 'En supprimant cette annonce vous la supprimer aussi sur la plateforme web',
			buttons: [
				{
					text: 'Annuler',
					role: 'cancel',
					handler: () => {
						// console.log('Cancel clicked');
					}
				},
				{
					text: 'Supprimer',
					handler: () => {
						this.applyDelete(type, objet);
					}
				}
			]
		});
		alert.present();
	}

	applyDelete(type, objet) {
		this.lgServ.isTable('_ona_delete_' + type).then((res) => {
			let reqs = [];
			if (res) {
				reqs = JSON.parse(res);
			}

			reqs.unshift(objet);
			this.lgServ.setTable('_ona_delete_' + type, reqs);

			if (type == 'listing') {
				this.events.publish('annonce:deleted', objet);
				this.delFromInternal('listing', objet);
				this.delFromInternal('historic_annonce', objet);
				this.delFromInternal('listing_fav', objet);
			}
		});
	}

	/**
	 * Cette fonction permet de retirer un élément
	 * dans la bd interne
	 * @param type string, le nom du modèle
	 * @param objet JSon, l'objet à supprimer
	 *
	 **/
	removeObjetSync(type, objet) {
		this.lgServ.isTable('_ona_' + type).then((res) => {
			let reqs = [];

			if (res) {
				reqs = JSON.parse(res);
				for (let j = 0; j < reqs.length; j++) {
					if (reqs[j].id == objet.id) {
						reqs.splice(j, 1);
						break;
					}
				}

				this.lgServ.setTable('_ona_' + type, reqs);
			}
		});
	}

	/**
	 * Cette méthode permet de créer/Editer
	 * un lieu d'événement ou un organisateur
	 * @param objet any, il s'agit de l'objet à insérer ou modifier (Venue ou Organizer)
	 * @param namespace string, le modèle sur lequel appliquer la requete
	 * @author davart
	 * 
	 * @returns Observable
	 */
	public modelsIdPost(
		objet: any,
		namespace: string,
		pattern: string,
		token: string,
		observe: any = 'body',
		reportProgress: boolean = false
	): Observable<any> {
		if (objet.id === null || objet.id === undefined) {
			throw new Error('Required parameter id was null or undefined when calling venuesIdPost.');
		}

		let basePath = this.urlServ.url + '/wp-json/' + pattern;
		let defaultHeaders = new HttpHeaders({
			// 'Authorization': 'Auth_Token',
			// 'RequestToken': token
			Authorization: token
		});
		let configuration = new Configuration();

		let headers = defaultHeaders;

		// to determine the Accept header
		let httpHeaderAccepts: string[] = [ 'application/json' ];
		let httpHeaderAcceptSelected: string | undefined = configuration.selectHeaderAccept(httpHeaderAccepts);
		if (httpHeaderAcceptSelected != undefined) {
			headers = headers.set('Accept', httpHeaderAcceptSelected);
		}

		let strAuth = configuration.selectHeaderAccept(httpHeaderAccepts);
		// headers.set("Authorization", 'Auth_Token');
		// headers.set("RequestToken", token);

		// to determine the Content-Type header
		let consumes: string[] = [ 'application/x-www-form-urlencoded' ];

		// const canConsumeForm = this.canConsumeForm(consumes);

		let formParams: { append(param: string, value: any): void };
		let useForm = false;
		let convertFormParamsToString = false;
		if (useForm) {
			formParams = new FormData();
		} else {
			formParams = new HttpParams({ encoder: new CustomHttpUrlEncodingCodec() });
		}

		for (var key in objet) {
			if (objet[key] !== undefined && !Array.isArray(objet[key])) {
				formParams = formParams.append(key, <any>objet[key]) || formParams;
			} else if (objet[key] !== undefined && Array.isArray(objet[key])) {
				objet[key].forEach((element) => {
					formParams = formParams.append(key, <any>element) || formParams;
				});
			}
		}

		if (objet.id == 0) formParams = formParams.append('status', <any>'draft') || formParams;

		let suffix = '';
		if (objet.id != 0) suffix = encodeURIComponent(String(objet.id));

		return this.http.post(
			`${basePath}/${namespace}/${suffix}`,
			convertFormParamsToString ? formParams.toString() : formParams,
			{
				withCredentials: configuration.withCredentials,
				headers: headers,
				observe: observe,
				reportProgress: reportProgress
			}
		);
	}

	/**
     * @param consumes string[] mime-types
     * @return true: consumes contains 'multipart/form-data', false: otherwise
     */
	private canConsumeForm(consumes: string[]): boolean {
		const form = 'multipart/form-data';
		for (let consume of consumes) {
			if (form === consume) {
				return true;
			}
		}
		return false;
	}

	/***
	 * ===================================================================================
	 * 	END OF CREATION UPDATE OF WP OBJECT
	 * ===================================================================================
	 */

	/**=======================================================================
	 * APPEL DU SERVICE PAYCONIQ
	 * 
	 * ======================================================================
	 **/

	/**
	 * Cette méthode permet de faire appel à l'api Payconiq
	 * 
	 * @param objets any, l'objet à envoyer
	 * @param cred string, credentials
	 * @param basePath string, l'url api payconiq
	 * 
	 * @returns Observable
	 */
	callPayConiq(
		objets: any,
		cred: string,
		basePath: string,
		observe: any = 'body',
		reportProgress: boolean = false
	): Observable<any> {
		let defaultHeaders = new HttpHeaders({
			Authorization: cred
		});

		let configuration = new Configuration();
		let headers = defaultHeaders;

		// to determine the Accept header
		let httpHeaderAccepts: string[] = [ 'application/json' ];

		let httpHeaderAcceptSelected: string | undefined = configuration.selectHeaderAccept(httpHeaderAccepts);
		if (httpHeaderAcceptSelected != undefined) {
			headers = headers.set('Accept', httpHeaderAcceptSelected);
		}

		// to determine the Content-Type header
		let consumes: string[] = [ 'application/x-www-form-urlencoded' ];

		// const canConsumeForm = this.canConsumeForm(consumes);

		let formParams: { append(param: string, value: any): void };
		let useForm = false;
		let convertFormParamsToString = false;
		if (useForm) {
			formParams = new FormData();
		} else {
			formParams = new HttpParams({ encoder: new CustomHttpUrlEncodingCodec() });
		}

		if (objets.price !== undefined) {
			formParams = formParams.append('amount', <any>objets.price) || formParams;
		}
		if (objets.currency !== undefined) {
			formParams = formParams.append('currency', <any>objets.currency) || formParams;
		}
		if (objets.description !== undefined) {
			formParams = formParams.append('description', <any>objets.description) || formParams;
		}

		return this.http.post(basePath, convertFormParamsToString ? formParams.toString() : formParams, {
			withCredentials: configuration.withCredentials,
			headers: headers,
			observe: observe,
			reportProgress: reportProgress
		});
	}

	/**
	 * Cette méthode permet de récupérer une 
	 * le statut d'une transaction
	 * 
	 * @param transactionId string, l'identifiant de la transaction
	 * @param cred string, credentials
	 * @param basePath string, l'url api payconiq
	 * 
	 * @returns Observable
	 */
	getPayConiq(transactionId: string, cred: string, basePath: string): Observable<any> {
		let defaultHeaders = new HttpHeaders({
			Authorization: cred,
			'Cache-Control': 'no-cache'
		});

		let headers = defaultHeaders;

		return this.http.get(basePath + '/' + transactionId, { headers: headers });
	}

	/**
	 * *****************************************************************
	 *           METHOD TO RESERVE OR BOOK AN ANNOUNCEMENT
	 * ****************************************************************
	 * @param annonce Objet de type annonce
	 */
	reserver(annonce, txtPop) {
		this.modelUsers = 'users';
		this.lgServ.isTable('_ona_' + this.modelUsers).then((data) => {
			var users = [];
			var usersIdsArray = [];
			users = JSON.parse(data);

			for (let j = 0; j < users.length; j++) {
				usersIdsArray.push(users[j].id);
			}

			let user = annonce._embedded.author[0];

			let menu_actionSheet = this.actionCtrl.create({
				title: txtPop.rdv + ' ' + annonce.title.rendered,
				// cssClass: 'custom-action-sheetEvent',
				buttons: this.getListButtons(annonce, user)
			});

			menu_actionSheet.present();

			/* if (usersIdsArray.indexOf(annonce.author) > -1) {
				console.log('User offer detail=>', users[usersIdsArray.indexOf(annonce.author)]);
				let user = users[usersIdsArray.indexOf(annonce.author)];
				if (user.userData !== undefined) {
					let menu_actionSheet = this.actionCtrl.create({
						title: txtPop.rdv + ' ' + annonce.title.rendered,
						buttons: this.getListButtons(annonce, users[usersIdsArray.indexOf(annonce.author)])
					});

					menu_actionSheet.present();
				} else {
					this.showMsgWithButton("Les informations de contact ne sont pas d'isponible", 'top', 'toast-error');
				}
			} else {
				this.showMsgWithButton("Les informations de contact ne sont pas d'isponible", 'top', 'toast-error');
			} */
		});
	}

	/**
   * Cette fonction permet de définir la liste
   * des actions sur la vue
   */
	private getListButtons(annonce, user) {
		let tab = [];

		// console.log('User rec =>', user);

		if (user.userData.user_phone != '') {
			tab.push({
				text: 'Appeler',
				icon: 'ios-call',
				handler: () => {
					this.callNumber
						.callNumber(user.userData.user_phone, true)
						.then(() => {
							var rdv = {
								date: new Date().toDateString(),
								description: 'Rendez-vous demander via appel telephonique',
								user: user,
								annonce_data: annonce
							};
							this.saveRdvInLocal(rdv);
						})
						.catch(() => {});
				} /* else {
					this.showMsgWithButton("Numero de téléphone de l'annonceur pas disponible", 'top', 'toast-error');
				} */
			});
		}

		if (user.userData.user_phone != '') {
			tab.push({
				text: 'Whatsapp',
				icon: 'logo-whatsapp',
				handler: () => {
					this.inapp.create('https://wa.me/' + user.userData.user_phone);
				} /* else {
					this.showMsgWithButton("Numero whatsapp de l'annonceur pas disponible", 'top', 'toast-error');
				} */
			});
		}

		if (user.userData.user_phone != '') {
			tab.push({
				text: 'Envoyer un SMS',
				icon: 'md-chatbubbles',
				handler: () => {
					this.sms
						.send(
							user.userData.user_phone,
							'Je suis interessée par votre annonce ' + annonce.title.rendered
						)
						.then(() => {
							var rdv = {
								date: new Date().toDateString(),
								description: 'Rendez-vous demander via Sms',
								user: user,
								annonce_data: annonce
							};
							this.saveRdvInLocal(rdv);
						})
						.catch((err) => {});
				} /* else {
					this.showMsgWithButton("Numero de l'annonceur pas disponible", 'top', 'toast-error');
				} */
			});
		}

		tab.push({
			text: 'Envoyer un Mail',
			icon: 'md-mail',
			handler: () => {
				/* let email = {
					to: user.userData.user_email,
					subject: 'Mr / Mme ' + user.name + ' est interessée pas votre annonce'
				}; */

				// this.emailComposer.open(email);

				let popover = this.modalCtrl.create('descpopover', { params: annonce, slug: 'rdv' });

				popover.present();

				popover.onDidDismiss((rdv) => {
					if (rdv) {
						/* this.doEmail(
							user.userData.user_email,
							'Rdv succefully taken for ' + annonce.title,
							'Demande de rendez-vous',
							this.buildMessage(rdv)
						); */
					}
				});
			}
		});

		return tab;
	}

	/**
	 * 
	 * @param user User requesting rdv
	 * @param date Rdv Date
	 * @param description Rdv Description
	 * @param annonce Annonce object
	 */
	saveRdvInLocal(rdv) {
		let alert = this.alertCtrl.create({
			title: 'Enregistrer Rendez-Vous',
			message: 'voulez vous enreigtrez le rendez-vous pris chez ' + rdv.annonce_data.title.rendered + ' ?',
			buttons: [
				{
					text: 'Annuler',
					role: 'cancel',
					handler: () => {}
				},
				{
					text: 'Enregistrez',
					handler: () => {
						this.lgServ.isTable('_ona_rdvs').then((rdvs) => {
							if (rdvs) {
								let rdvsList = [];
								rdvsList = JSON.parse(rdvs);
								rdvsList.push(rdv);
								this.lgServ.setTable('_ona_rdvs', rdvsList);
							} else {
								let rdvsList = [];
								rdvsList.push(rdv);
								this.lgServ.setTable('_ona_rdvs', rdvsList);
							}
						});
					}
				}
			]
		});
		alert.present();
	}

	//Construire le message
	private buildMessage(data) {
		let html = '';
		html += 'Mr / Mme' + data.user.nice_name + '<br>';
		/* html += this.txtLangue.company + data.company + '<br>';
		html += this.txtLangue.tel + data.phonenumber + '<br><br><br>';
		html += this.txtLangue.message + '<br>' + data.message + '<br>'; */

		return html;
	}

	/**
	 * ***********************************************
	 * METHOD TO CHECK GPS ACTIVATE ON DEVICE
	 * ***********************************************
	 * 
	 */
	checkGps(errorMessage) {
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
					})
					.catch((error) => {
						// console.log('Error', error);
					});
			},
			(err) => {
				// this.lgServ.showErrorAlert('Activate GPS for better experience');
				this.showMsgWithButton(errorMessage, 'top', 'toast-error');
				// console.log('Error Requesting permission=>' + err);
			}
		);
	}

	/**
	 * ***************************************************************************
	 * METHOD TO CALCULATE DISTANCE FROM AN OFFER TO THE CURRENT USER LOCATION
	 * ***************************************************************************
	 */
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

	applyFilterAnnonce(searchs, objet) {
		var searchList = [];

		for (let j = 0; j < searchs.length; j++) {
			if (searchs[j].slug != 'popular' && searchs[j].slug != 'views' && searchs[j].slug != 'comments') {
				searchList.push(searchs[j]);
			}
		}

		let cpt = 0;

		for (let j = 0; j < searchList.length; j++) {
			switch (searchList[j].slug) {
				case 'tags': {
					//tag

					var tags = [];
					tags = objet.tags;
					for (let k = 0; k < searchList[j].val.length; k++) {
						if (tags.indexOf(searchList[j].val[k]) > -1) {
							cpt++;
						}
					}

					break;
				}
				case 'amount': {
					//Prix
					if (
						parseInt(objet.webbupointfinder_item_field_priceforsale) >= searchList[j].val.lower * 10000 &&
						parseInt(objet.webbupointfinder_item_field_priceforsale) <= searchList[j].val.upper * 10000
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
						this.calcDistance(
							searchList[j].coords.latitude,
							searchList[j].coords.longitude,
							annonceCoords[0],
							annonceCoords[1],
							'K'
						) * 1000;

					if (distance <= searchList[j].val) {
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
				case 'location': {
					//Location

					var locations = [];
					locations = objet.pointfinderlocations;

					if (locations.indexOf(searchList[j].val) > -1) {
						cpt++;
					}
					break;
				}
				case 'category': {
					//Location

					var categories = [];
					categories = objet.pointfinderltypes;

					if (categories.indexOf(searchList[j].val) > -1) {
						cpt++;
					}
					break;
				}
				case 'dispo': {
					//Available

					for (let i = 1; i < 7; i++) {
						var time = objet['webbupointfinder_items_o_o' + i].split('-');

						if (this.checkIfOpen(this.presentHour, time[0], time[1])) {
							if (this.presentDayNumber == 0 && i == 7) {
								cpt++;
							}
							if (this.presentDayNumber == i) {
								cpt++;
							}
						}
					}

					break;
				}
				case 'date': {
					cpt++;
					break;
				}
			}
		} //Fin tab searchList

		if (cpt == searchList.length) return true;
		else return false;
	}

	// Function that compares if a time is between a time interval
	checkIfOpen(time, beforeTime, afterTime) {
		var format = 'hh:mm';

		// var time = moment() gives you current time. no format required.
		var hour = moment(time, format),
			before = moment(beforeTime, format),
			after = moment(afterTime, format);

		if (hour.isBetween(before, after)) {
			// console.log('is between');
			return true;
		} else {
			// console.log('is not between');
			return false;
		}
	}

	sortByFilters(filters, list: Array<any>) {
		var tab = [];
		for (let k = 0; k < filters.length; k++) {
			tab.push(filters[k].slug);
		}
		if (tab.indexOf('popular') > -1 && tab.indexOf('views') == -1 && tab.indexOf('comments') == -1) {
			// console.log('Sorting by popular');
			list.sort(function(a, b) {
				return parseFloat(b.webbupointfinder_review_rating) - parseFloat(a.webbupointfinder_review_rating);
			});
		}
		if (tab.indexOf('popular') == -1 && tab.indexOf('views') > -1 && tab.indexOf('comments') == -1) {
			// console.log('Sorting by views');
			list.sort(function(a, b) {
				return (
					parseInt(b.webbupointfinder_page_itemvisitcount) - parseInt(a.webbupointfinder_page_itemvisitcount)
				);
			});
		}
		if (tab.indexOf('popular') == -1 && tab.indexOf('views') == -1 && tab.indexOf('comments') > -1) {
			// console.log('Sorting by comments');
			list.sort(function(a, b) {
				if (a._embedded.replies && b._embedded.replies) {
					return parseInt(b._embedded.replies.length) - parseInt(a._embedded.replies.length);
				}
			});
		}
		if (tab.indexOf('popular') > -1 && tab.indexOf('views') == -1 && tab.indexOf('comments') > -1) {
			list.sort(function(a, b) {
				return parseFloat(b.webbupointfinder_review_rating) - parseFloat(a.webbupointfinder_review_rating);
			});
			list.sort(function(a, b) {
				if (a._embedded.replies && b._embedded.replies) {
					return parseInt(b._embedded.replies.length) - parseInt(a._embedded.replies.length);
				}
			});
		}
		if (tab.indexOf('popular') > -1 && tab.indexOf('views') > -1 && tab.indexOf('comments') == -1) {
			list.sort(function(a, b) {
				return parseFloat(b.webbupointfinder_review_rating) - parseFloat(a.webbupointfinder_review_rating);
			});
			list.sort(function(a, b) {
				return (
					parseInt(b.webbupointfinder_page_itemvisitcount) - parseInt(a.webbupointfinder_page_itemvisitcount)
				);
			});
		}
		if (tab.indexOf('popular') == -1 && tab.indexOf('views') > -1 && tab.indexOf('comments') > -1) {
			list.sort(function(a, b) {
				return (
					parseInt(b.webbupointfinder_page_itemvisitcount) - parseInt(a.webbupointfinder_page_itemvisitcount)
				);
			});
			list.sort(function(a, b) {
				if (a._embedded.replies && b._embedded.replies) {
					return parseInt(b._embedded.replies.length) - parseInt(a._embedded.replies.length);
				}
			});
		}
		if (tab.indexOf('popular') > -1 && tab.indexOf('views') > -1 && tab.indexOf('comments') > -1) {
			list.sort(function(a, b) {
				return (
					parseInt(b.webbupointfinder_page_itemvisitcount) - parseInt(a.webbupointfinder_page_itemvisitcount)
				);
			});
			list.sort(function(a, b) {
				if (a._embedded.replies && b._embedded.replies) {
					return parseInt(b._embedded.replies.length) - parseInt(a._embedded.replies.length);
				}
			});
			list.sort(function(a, b) {
				return parseFloat(b.webbupointfinder_review_rating) - parseFloat(a.webbupointfinder_review_rating);
			});
		}
		return list;
	}

	getAuthorInfo(annonce) {
		return new Promise((resolve) => {
			this.lgServ.isTable('_ona_' + this.modelUsers).then((data) => {
				var users = [];
				var usersIdsArray = [];
				users = JSON.parse(data);

				// console.log('Users =>', users);

				for (let j = 0; j < users.length; j++) {
					usersIdsArray.push(users[j].id);
				}

				if (usersIdsArray.indexOf(annonce.author) > -1) {
					resolve(users[usersIdsArray.indexOf(annonce.author)]);
				}
			});
		});
	}

	retrievePacks() {
		this.afServ.retrieveURL((objUrl) => {
			this.http.get(objUrl.url + '/wp-json/pflistingpacks/v1/ListingPacks/').subscribe((res: any) => {
				this.lgServ.setTable('_ona_packs', res);
			});
		});
	}
	retrieveReviews() {
		this.afServ.retrieveURL((objUrl) => {
			this.http.get(objUrl.url + '/wp-json/pflistingReview/ReviewByusers').subscribe((res: any) => {
				this.lgServ.isTable('_ona_reviews').then((data) => {
					if (!data) {
						var comms = [];
						if (res.length > 0) {
							for (let k = 0; k < res.length; k++) {
								comms = comms.concat(res[k].Comments);
							}
							this.lgServ.setTable('_ona_comms', comms);
						}
						this.lgServ.setTable('_ona_reviews', res);
					}
				});
			});
		});
	}

	/**
	 * Function to offline set images to add on server and the post to associate to them
	 * @param idx Id of offline post created
	 * @param imgUrl Url of image to create and associate to POST in base64
	 */
	addImageToSync(idx, imgUrl) {
		this.lgServ.isTable('_ona_images_to_add').then((data) => {
			var table = [];

			if (data) {
				table = JSON.parse(data);

				let obj = {
					post_id: idx,
					imgUrl: imgUrl
				};

				table.push(obj);

				this.lgServ.setTable('_ona_images_to_add', table);
			} else {
				let obj = {
					post_id: idx,
					imgUrl: imgUrl
				};

				table.push(obj);

				this.lgServ.setTable('_ona_images_to_add', table);
			}
		});
	}
}
