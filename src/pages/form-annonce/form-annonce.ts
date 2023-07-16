import { Component, ViewChild } from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	LoadingController,
	ModalController,
	Content,
	AlertController,
	PopoverController
} from 'ionic-angular';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { LoginProvider } from '../../providers/login/login';
import { AfProvider } from '../../providers/af/af';
import { google } from '@google/maps';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Geolocation } from '@ionic-native/geolocation';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { AuthProvider } from '../../providers/auth/auth';
import { MenuController } from 'ionic-angular/components/app/menu-controller';
import { ViewController } from 'ionic-angular/navigation/view-controller';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';

declare var google: any;

/**
 * Generated class for the FormAnnoncePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-form-annonce',
	templateUrl: 'form-annonce.html'
})
export class FormAnnoncePage {
	segment = '0';
	checkboxTagsForm: FormGroup;
	checkboxSubCatsForm;
	checkboxFeaturesForm;
	checkboxConditionsForm;
	checkboxLocationsForm;
	categories = [];
	features = [];
	conditions = [];
	locations = [];
	search_query;
	radioTagsForm: FormGroup;
	location_query = '';
	opening_days = [];
	search_places_predictions = [];
	locations_results = [];
	dumpCats = [];
	dumpFeats = [];
	dumpLocations = [];
	subcat = [];
	coordinates = {
		lat: '',
		lng: ''
	};
	place_found: boolean;
	cat_selected: any;
	imagesList = [];
	imageUrl = '';
	@ViewChild(Content) content: Content;

	annonceObj = {
		title: { rendered: '' },
		status: 'draft',
		description: '',
		excerpt: { rendered: '' },
		content: '',
		id: 0,
		idx: Math.floor(1000 + Math.random() * 9000),
		author: 0,
		featured_media: 0,
		pointfinderltypes: [],
		pointfinderlocations: [],
		pointfinderfeatures: [],
		pointfinderconditions: [],
		tags: [],
		webbupointfinder_item_featuredmarker: '',
		webbupointfinder_item_field_priceforsale: '',
		webbupointfinder_item_images: [],
		webbupointfinder_item_verified: '',
		webbupointfinder_items_address: '',
		webbupointfinder_items_location: '',
		webbupointfinder_items_o_o1: '',
		webbupointfinder_items_o_o2: '',
		webbupointfinder_items_o_o3: '',
		webbupointfinder_items_o_o4: '',
		webbupointfinder_items_o_o5: '',
		webbupointfinder_items_o_o6: '',
		webbupointfinder_items_o_o7: '',
		webbupointfinder_page_itemvisitcount: '1',
		webbupointfinder_review_rating: '',
		Review_Fields: [],
		_embedded: {
			author: [],
			'wp:featuredmedia': [],
			'wp:term': []
		}
	};
	info_form: FormGroup;
	validation_messages;
	radioCategForm: FormGroup;
	radioSubCat: FormGroup;
	radioCondition: FormGroup;
	radioFeature: FormGroup;
	pack = 'free';
	type: string;
	annonceReceived;
	located_user = false;
	txtweek: any;
	txtMsges: any;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public lgServ: LoginProvider,
		public locationAccuracy: LocationAccuracy,
		public loadingCtrl: LoadingController,
		public modalCtrl: ModalController,
		public geolocation: Geolocation,
		public ft: FileTransfer,
		public menuCtrl: MenuController,
		public persistence: WpPersistenceProvider,
		public auth: AuthProvider,
		public af: AfProvider,
		public alertCtrl: AlertController,
		public formBuilder: FormBuilder,
		public view: ViewController,
		public popoverCtrl: PopoverController,
		public storage: Storage,
		public translate: TranslateService
	) {
		// this.checkPacks();

		translate.get(['week', 'form_annonce_msges']).subscribe((res) => {
			this.txtweek = res.week;
			this.txtMsges = res.form_annonce_msges;
		});

		this.validation_messages = {
			title: [ { type: 'required', message: this.txtMsges.req_title } ],
			description: [ { type: 'required', message: this.txtMsges.req_desc } ],
			terms: [ { type: 'pattern', message: 'You must accept terms and conditions.' } ]
		};
		this.opening_days = [
			this.txtweek.mon,
			this.txtweek.tue,
			this.txtweek.wed,
			this.txtweek.thu,
			this.txtweek.fri,
			this.txtweek.sat,
			this.txtweek.sun
		];

		this.lgServ.isTable('_ona_pointfinderlocations').then((locations) => {
			this.dumpLocations = JSON.parse(locations);
		});
		if (navParams.get('slug') == 'edit') {
			this.type = 'edit';
			// console.log('Edit selected');
			// console.log('Annonce to edit =>', navParams.get('annonce'));
			setTimeout(() => {
				this.loadCategories();
				this.loadFeatures();
			}, 500);
			this.annonceReceived = navParams.get('annonce');
			this.info_form = this.formBuilder.group({
				title: new FormControl(this.annonceReceived.title.rendered, Validators.required),
				description: new FormControl(this.annonceReceived.content.rendered, Validators.required)
			});

			this.radioCategForm = new FormGroup({
				selected_catego: new FormControl(this.annonceReceived.pointfinderltypes[0])
			});

			this.location_query = this.annonceReceived.location;
			this.search_query = this.annonceReceived.webbupointfinder_items_address;
		} else {
			this.type = 'create';

			this.info_form = this.formBuilder.group({
				title: new FormControl('', Validators.required),
				description: new FormControl('', Validators.required)
			});
			this.coordinates = {
				lat: '',
				lng: ''
			};

			setTimeout(() => {
				this.loadCategories();
				this.loadFeatures();
			}, 500);

			this.radioTagsForm = new FormGroup({
				selected_option: new FormControl(this.pack)
			});
			this.radioCategForm = new FormGroup({
				selected_catego: new FormControl()
			});

			this.radioSubCat = new FormGroup({
				selected_subcat: new FormControl()
			});
		}
	}

	ionViewDidLoad() {}

	ionViewDidEnter() {}

	ionViewCanEnter() {
		this.checkPacks();
	}

	checkPacks() {
		this.lgServ.isTable('_ona_selected_pack').then((pack) => {
			if (pack) {
				this.pack = JSON.parse(pack);
				this.persistence.showMsgWithButton(this.txtMsges.pack_desc + this.pack, 'top', 'toast-info');
			} else {
				this.persistence.showMsgWithButton(
					this.txtMsges.choose_pack,
					'top',
					'toast-info'
				);

				let popover = this.modalCtrl.create('descpopover', { slug: 'pack' }, { cssClass: 'custom-poppack' });

				popover.present();

				popover.onDidDismiss((selectedpack) => {
					if (selectedpack) {
						this.lgServ.setTable('_ona_selected_pack', selectedpack);
						this.pack = selectedpack;
					} else {
						this.navCtrl.pop();
					}
				});
			}
		});
	}

	loadSubCat(cat) {
		this.subcat = [];
		for (let k = 0; k < this.dumpCats.length; k++) {
			if (this.dumpCats[k].parent == cat.id) {
				this.subcat.push(this.dumpCats[k]);
			}
		}

		this.subcat = this.subcat.slice(0, 8);
		setTimeout(() => {
			this.content.scrollToBottom(500);
		}, 800);

		// console.log('Categories =>', this.subcat);
	}

	loadCategories() {
		// this.categories = [];
		this.lgServ.isTable('_ona_pointfinderltypes').then((categories) => {
			if (categories) {
				this.dumpCats = JSON.parse(categories);
				// console.log('Dump cats =>', JSON.parse(categories));

				for (let k = 0; k < JSON.parse(categories).length; k++) {
					if (JSON.parse(categories)[k].parent == 0) {
						this.categories.push(JSON.parse(categories)[k]);
					}
				}

				this.categories = this.categories.slice(0, 8);

				// console.log('Categories =>', this.categories);
			} else {
				// Load categories online
				// console.log('Categories not available in local storage');
			}
		});
	}

	loadFeatures() {
		this.locations = [];
		this.conditions = [];
		this.lgServ.isTable('_ona_pointfinderfeatures').then((categories) => {
			if (categories) {
				this.dumpFeats = JSON.parse(categories);
				// console.log('Dump cats =>', JSON.parse(categories));

				this.locations = JSON.parse(categories).slice(0, 8);

				/* this.locations.push({
				name: 'View all...',
				id: 0,
				slug: 'all'
			}); */
				// console.log('Features =>', this.locations);

				let result = {};

				for (var i in this.locations) {
					let current = this.locations[i];
					let key = current.id;
					result[key] = new FormControl(false);
				}
				this.checkboxFeaturesForm = new FormGroup(result);
			} else {
				// console.log('Load features online');
			}
		});
		this.lgServ.isTable('_ona_pointfinderconditions').then((categories) => {
			if (categories) {
				this.conditions = JSON.parse(categories).slice(0, 8);

				// console.log('Load conditions offline', this.conditions);
			} else {
				// console.log('Load conditions online');
			}
		});
	}

	segmentChanged() {
		if (this.segment == 'category') {
			// Load categories
			setTimeout(() => {
				// this.loadCategories();
			}, 500);
		} else if (this.segment == 'addresse') {
		} else if (this.segment == 'other') {
			// this.loadFeatures();
		}
	}

	loadSubCats(item) {
		this.cat_selected = item;
		this.loadSubCat(item);
	}

	viewAll(model, ev, item) {
		// console.log('Ev =>', ev);
		// Load it's sub categories
		if (model == 'features') {
			let formAnnonceModal = this.modalCtrl.create('FormAnnonceModalPage', { param: 'features' });
			formAnnonceModal.present();

			formAnnonceModal.onDidDismiss((data) => {
				if (data) {
					this.checkboxFeaturesForm = data;
				}
			});
		} else if (model == 'categories') {
			// Go to modal with all parent categories
			let formAnnonceModal = this.modalCtrl.create('FormAnnonceModalPage', { param: 'categories' });
			formAnnonceModal.present();
			formAnnonceModal.onDidDismiss((data) => {
				if (data) {
					this.radioCategForm.value.selected_catego = data.value.selected_catego;

					console.log('Radio categ=>', this.radioCategForm);
				}
			});
		} else if (model == 'sub-categories') {
			// Go to modal with all sub categories
			let formAnnonceModal = this.modalCtrl.create('FormAnnonceModalPage', {
				param: 'sub-categories',
				cat: this.cat_selected
			});
			formAnnonceModal.present();
			formAnnonceModal.onDidDismiss((data) => {
				if (data) {
					// this.checkboxSubCatsForm = data;
					this.radioSubCat.value.selected_subcat = data.value.selected_subcat;
				}
			});
		}
	}
	searchPlacesPredictions(search_query) {
		if (search_query !== '') {
			this.af.getPlacePredictions(search_query).subscribe(
				(places_predictions) => {
					this.search_places_predictions = places_predictions;
				},
				(e) => {
					// console.log('onError: %s', e);
				},
				() => {
					// console.log('onCompleted');
				}
			);
		} else {
			this.search_places_predictions = [];
		}
	}
	clearSearch() {}
	selectSearchResult(place: google.maps.places.AutocompletePrediction) {
		this.search_query = place.description;
		this.search_places_predictions = [];

		// We need to get the location from this place. Let's geocode this place!
		this.af.geocodePlace(place.place_id).subscribe(
			(place_location) => {
				// env.setOrigin(place_location);
				this.coordinates.lat = place_location.lat();
				this.coordinates.lng = place_location.lng();
			},
			(e) => {
				// console.log('onError: %s', e);
			},
			() => {
				// console.log('onCompleted');
			}
		);
	}
	locateMe() {
		this.storage.get('_ona_flag').then((flag) => {
			if (flag == true) {
				this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(
					() => {
						let loading = this.loadingCtrl.create();

						loading.present();

						this.geolocation
							.getCurrentPosition()
							.then((position) => {
								this.located_user = true;
								this.search_query =
									position.coords.latitude.toFixed(2) + ', ' + position.coords.longitude.toFixed(2);
								this.coordinates.lat = position.coords.latitude.toFixed(2);
								this.coordinates.lng = position.coords.longitude.toFixed(2);
								loading.dismiss();
							})
							.catch((error) => {
								// console.log('Error', error);
								loading.dismiss();
							});
					},
					(err) => {
						// alert('Error Requesting permission=>' + err);
					}
				);
			} else {
				this.persistence.showMsgWithButton(
					this.txtMsges.gps_error,
					'top',
					'toast-error'
				);
			}
		});
	}

	searchLoaction(query, ev) {
		if (this.dumpLocations.length == 0) {
			// console.log('Empty locations in local storage');
		} else {
			if (ev.target.value === undefined) {
				this.locations_results = [];
				// this.max = 10;
				return;
			}

			var val = ev.target.value;

			if (val != '' && val.length > 2) {
				this.locations_results = this.dumpLocations.filter((item) => {
					let txtNom = item.name;
					return txtNom.toLowerCase().indexOf(val.toLowerCase()) > -1;
				});
			} else if (val == '' || val == undefined) {
				this.locations_results = [];
				// this.max = 10;
			}
		}
	}
	selectLocation(place) {
		this.location_query = place.name;
		this.locations_results = [];
		this.place_found = true;

		if (this.type == 'create') {
			this.annonceObj.pointfinderlocations.push(place.id);
		} else {
			this.annonceReceived.pointfinderlocations[0] = place.id;
		}
	}

	addFeatImage() {
		this.af.retrieveURL((objUrl) => {
			this.persistence.takeOnePicture().then((image: any) => {
				this.imageUrl = 'data:image/png;base64,' + image;
				var admin_username = 'filigor2@gmail.com';
				var admin_password = '6190SSRA';
				// let imgloader = this.loadingCtrl.create();
				// imgloader.present();

				this.annonceObj._embedded['wp:featuredmedia'] = [
					{
						media_details: {
							sizes: {
								thumbnail: {
									source_url: this.imageUrl
								}
							}
						}
					}
				];
				this.imagesList.push(this.imageUrl);
				this.annonceObj.webbupointfinder_item_images = this.imagesList;

			});
		});
	}

	addImages() {
		this.af.retrieveURL((ObjUrl) => {
			this.persistence
				.openImagePicker()
				.then((res: any) => {
					var admin_username = 'filigor2@gmail.com';
					var admin_password = '6190SSRA';
					this.imagesList = res;
					for (let k = 0; k < res.length; k++) {
						this.imagesList.push('data:image/png;base64,' + res[k]);
					}
					this.annonceObj._embedded['wp:featuredmedia'] = [ { source_url: this.imagesList[0] } ];
					this.annonceObj.webbupointfinder_item_images = this.imagesList;
					let imgloader = this.loadingCtrl.create();
					imgloader.present();
					this.auth.postLogin(admin_username, admin_password, ObjUrl).subscribe(
						(user: any) => {
							this.persistence
								.uploadImageToWordpress(this.imagesList[0], user.token)
								.then((res: any) => {
									imgloader.dismiss();
									// alert('upload success=> ' + res);
								})
								.catch((imgerr) => {
									imgloader.dismiss();
									// alert('Upload err=> ' + imgerr);
								});
						},
						(err) => {
							// alert('Connection err=> ' + err);
						}
					);
				})
				.catch((err) => {
					// console.log('Error', err);
				});
		});
	}

	buildTaxonomies() {
		this.annonceObj.pointfinderltypes = [];
		// this.annonceObj.pointfinderconditions = [];
		this.annonceObj.pointfinderfeatures = [];

		var category_array = [];
		var features_array = [];
		var subcategories_array = [];
		var conditions_array = [];

		this.annonceObj.title.rendered = this.info_form.get('title').value;
		this.annonceObj.description = this.info_form.get('description').value;
		this.annonceObj.excerpt.rendered = this.info_form.get('description').value;
		this.annonceObj.content = this.info_form.get('description').value;
		this.annonceObj.pointfinderltypes.push(parseInt(this.radioCategForm.value.selected_catego));
		this.annonceObj.pointfinderltypes.push(parseInt(this.radioSubCat.value.selected_subcat));
		// this.annonceObj.pointfinderconditions.push(parseInt(this.radioCondition.value.selected_condition));
		features_array = Object.keys(this.checkboxFeaturesForm.value).map((key) => ({
			id: Number(key),
			value: this.checkboxFeaturesForm.value[key]
		}));
		for (let k = 0; k < features_array.length; k++) {
			if (features_array[k].value == true && parseInt(features_array[k].id) != 0) {
				this.annonceObj.pointfinderfeatures.push(parseInt(features_array[k].id));
			}
		}
	}
	onEdit() {
		let alert = this.alertCtrl.create({
			title: 'Modifier annonce',
			message: 'Appliquer modification?',
			buttons: [
				{
					text: 'Annuler',
					role: 'cancel',
					handler: () => {
						// console.log('Cancel clicked');
					}
				},
				{
					text: 'Modifier',
					handler: () => {
						this.editAnnonce();
					}
				}
			]
		});
		alert.present();
	}

	editAnnonce() {
		this.annonceReceived.pointfinderltypes = [];
		// this.annonceReceived.pointfinderconditions = [];
		this.annonceReceived.pointfinderfeatures = [];

		var category_array = [];
		var features_array = [];
		var subcategories_array = [];
		var conditions_array = [];

		this.annonceReceived.title.rendered = this.info_form.get('title').value;
		this.annonceReceived.description = this.info_form.get('description').value;
		this.annonceReceived.excerpt.rendered = this.info_form.get('description').value;
		this.annonceReceived.content = this.info_form.get('description').value;
		this.annonceReceived.pointfinderltypes.push(parseInt(this.radioCategForm.value.selected_catego));
		this.persistence.copieModifSync('listing', this.annonceObj);
		this.persistence.copieModifSync('historic_annonce', this.annonceObj);
		this.persistence.copieModifSync('listing_fav', this.annonceObj);

		this.persistence.syncCreateObjet('listing', this.annonceReceived);
		this.persistence.showMsgWithButton(this.txtMsges.modif_succes, 'top', 'toast-success');

		this.view.dismiss();
	}

	onAddAnnonce() {
		let alert = this.alertCtrl.create({
			title: 'Create an annoncement',
			message:
				' <p class="legal-stuff">' + this.txtMsges.legal_stuff +'<a class="legal-action " (click)="showTermsModal() ">Terms of use</a></p>',
			buttons: [
				{
					text: 'Cancel',
					role: 'cancel',
					handler: () => {
						// console.log('Cancel clicked');
					}
				},
				{
					text: 'Accept',
					handler: () => {
						this.addAnnonce();
					}
				}
			]
		});
		alert.present();
	}

	addAnnonce() {
		if (this.imageUrl == undefined) {
			//Ask to add atleat one image
			this.persistence.showMsgWithButton(
				this.txtMsges.err_image,
				'top',
				'toast-error'
			);
		} else {
			this.lgServ.isTable('wpIonicToken').then((user) => {
				if (user) {
					var id = JSON.parse(user).user_id;
					this.annonceObj.author = id;
					this.annonceObj.content = this.annonceObj.description;

					this.buildTaxonomies();

					this.persistence.copiedAddSync('listing', this.annonceObj);

					//Uncomment line below to add to distant server

					let objToCreate = {
						title: this.annonceObj.title.rendered,
						description: this.annonceObj.description,
						excerpt: this.annonceObj.excerpt.rendered,
						content: this.annonceObj.content,
						status: 'pending',
						author: this.annonceObj.author,
						featured_media: this.annonceObj.featured_media,
						pointfinderltypes: this.annonceObj.pointfinderltypes,
						pointfinderlocations: this.annonceObj.pointfinderlocations,
						pointfinderfeatures: this.annonceObj.pointfinderfeatures,
						tags: this.annonceObj.tags,
						idx: this.annonceObj.idx,
						webbupointfinder_item_featuredmarker: this.annonceObj.webbupointfinder_item_featuredmarker,
						webbupointfinder_item_field_priceforsale: this.annonceObj
							.webbupointfinder_item_field_priceforsale,
						webbupointfinder_item_images: this.annonceObj.webbupointfinder_item_images,
						webbupointfinder_item_verified: this.annonceObj.webbupointfinder_item_verified,
						webbupointfinder_items_address: this.annonceObj.webbupointfinder_items_address,
						webbupointfinder_items_location: this.annonceObj.webbupointfinder_items_location,
						webbupointfinder_items_o_o1: this.annonceObj.webbupointfinder_items_o_o1,
						webbupointfinder_items_o_o2: this.annonceObj.webbupointfinder_items_o_o2,
						webbupointfinder_items_o_o3: this.annonceObj.webbupointfinder_items_o_o3,
						webbupointfinder_items_o_o4: this.annonceObj.webbupointfinder_items_o_o4,
						webbupointfinder_items_o_o5: this.annonceObj.webbupointfinder_items_o_o5,
						webbupointfinder_items_o_o6: this.annonceObj.webbupointfinder_items_o_o6,
						webbupointfinder_items_o_o7: this.annonceObj.webbupointfinder_items_o_o7,
						webbupointfinder_page_itemvisitcount: this.annonceObj.webbupointfinder_page_itemvisitcount,
						webbupointfinder_review_rating: this.annonceObj.webbupointfinder_review_rating
					};

					this.persistence.addImageToSync(this.annonceObj.idx, this.imageUrl);

					this.persistence.syncCreateObjet('listing', objToCreate);
					this.persistence.showMsgWithButton(
						this.txtMsges.pending_offer,
						'top',
						'toast-success'
					);

					this.view.dismiss();
					// console.log('Annonce obj =>', this.annonceObj);
				} else {
					// console.log('Connect to create announcement');
					this.buildTaxonomies();
					// console.log('Annonce obj =>', this.annonceObj);
				}
			});
		}
	}

	openMenu() {
		this.menuCtrl.open();
	}

	annuler() {
		this.navCtrl.pop();
	}

	prevSegment() {
		var segmentNum = parseInt(this.segment);
		segmentNum--;
		this.segment = segmentNum.toString();
	}
	nextSegment() {
		var segmentNum = parseInt(this.segment);
		segmentNum++;
		this.segment = segmentNum.toString();
	}
}
