import { Component, ViewChild } from '@angular/core';
import {
	MenuController,
	App,
	NavParams,
	LoadingController,
	IonicPage,
	NavController,
	AlertController,
	ModalController,
	Events,
	SegmentButton,
	Content,
	FabButton,
	PopoverController
} from 'ionic-angular';
// import { ProfileService } from './profile.service';
import { SocialSharing } from '@ionic-native/social-sharing';

import 'rxjs/Rx';
import { AuthProvider } from '../../providers/auth/auth';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { LoginProvider } from '../../providers/login/login';

@IonicPage()
@Component({
	selector: 'profile-page',
	templateUrl: 'profile.html'
})
export class ProfilePage {
	defaultImage: string;
	segment: string;
	icon: string;
	direction: string;
	lazyAnnonce = [];
	lazyFav = [];
	lazyEvent = [];
	lazyAvis = [];
	events;

	currentUSer;

	@ViewChild(Content) content: Content;
	@ViewChild(FabButton) fabButton: FabButton;
	model: string;
	dumpData = [];
	objLoader: boolean;
	maxAnnonce: number = 10;
	maxFav: number = 10;
	maxEvent: number = 10;
	maxAvis: number = 10;
	EVentsevents;
	profile_image: string;
	constructor(
		public loadingCtrl: LoadingController,
		public socialSharing: SocialSharing,
		public auth: AuthProvider,
		public navCtrl: NavController,
		public navParams: NavParams,
		public alertCtrler: AlertController,
		public app: App,
		public modalCtrler: ModalController,
		public storage: Storage,
		public ev: Events,
		public persistence: WpPersistenceProvider,
		public menuCtrler: MenuController,
		public lgServ: LoginProvider,
		public translate: TranslateService,
		public event: Events,
		public alertCtrl: AlertController,
		public popoverCtrl: PopoverController
	) {
		this.currentUSer = this.navParams.get('objet');
		this.defaultImage = 'assets/images/help.jpg';
		// console.log('User connected =>', this.currentUSer);

		this.event.subscribe('annonce:deleted', (annonce) => {
			for (let k = 0; k < this.lazyAnnonce.length; k++) {
				if (this.lazyAnnonce[k].id == annonce.id) {
					this.lazyAnnonce.splice(k, 1);
				}
			}
			for (let k = 0; k < this.lazyFav.length; k++) {
				if (this.lazyFav[k].id == annonce.id) {
					this.lazyFav.splice(k, 1);
				}
			}
		});
		this.event.subscribe('annonce:modified', (annonce) => {
			for (let k = 0; k < this.lazyAnnonce.length; k++) {
				if (this.lazyAnnonce[k].id == annonce.id) {
					this.lazyAnnonce[k] = annonce;
				}
			}
			for (let k = 0; k < this.lazyFav.length; k++) {
				if (this.lazyFav[k].id == annonce.id) {
					this.lazyFav[k] = annonce;
				}
			}
		});

		this.lgServ.isTable('_ona_userDetails').then((details) => {
			if (details) {
				// console.log('User Details =>', JSON.parse(details));
				if (JSON.parse(details).userData.Profil_image != '') {
					this.profile_image = JSON.parse(details).userData.Profil_image;
				} else {
					this.profile_image = this.defaultImage;
				}
			} else {
				this.profile_image = this.defaultImage;
			}
		});

		this.model = 'listing';

		/* // this.defaultImage = 'assets/man.svg';
		if (!this.currentUSer.sub_result) {
			this.defaultImage = 'assets/images/help.jpg';
		} else {
			this.defaultImage = this.currentUSer.sub_result.avatar_urls[96];
		} */
		this.segment = 'annonce';

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
		this.ev.subscribe('scrollingUp', (empty) => {
			this.icon = 'assets/images/icons/down.svg';
			this.direction = 'down';
			// console.log('Scrolling up, direction => ', this.direction);
		});
		this.ev.subscribe('reachedDown', (empty) => {
			this.icon = 'assets/images/icons/up.svg';
			this.direction = 'up';
			// console.log('Scrolling down, direction => ', this.direction);
		});
		this.loadData();
	}

	loadData() {
		this.lgServ.isTable('_ona_listing_fav').then((data) => {
			if (data) {
				this.lazyFav = JSON.parse(data);
			}
		});
		this.lgServ.isTable('_ona_events').then((data) => {
			if (data) {
				var eventList = [];
				eventList = JSON.parse(data);
				// console.log('Events =>', JSON.parse(data));

				for (let k = 0; k < eventList.length; k++) {
					if (parseInt(eventList[k].author) == this.currentUSer.user_id) {
						this.lazyEvent.push(eventList[k]);
					}
				}
			}
		});

		this.lgServ.isTable('_ona_' + this.model).then((data) => {
			var list = JSON.parse(data);

			this.objLoader = false;
			this.dumpData = list;

			for (let j = 0; j < this.dumpData.length; j++) {
				if (this.dumpData[j].author == this.currentUSer.user_id) {
					this.lazyAnnonce.push(this.dumpData[j]);
				}
			}

			this.formatData();
		});
	}
	formatData() {
		for (let k = 0; k < this.lazyAnnonce.length; k++) {
			var categories = [];
			categories = this.lazyAnnonce[k].pointfinderltypes;
			if (categories.indexOf(204) > -1 || categories.indexOf(124) > -1 || categories.indexOf(125) > -1) {
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
		}
		// console.log('Annonces =>', this.lazyAnnonce);
	}

	onSegmentChanged(segmentButton: SegmentButton) {
		// console.log('Segment changed to', segmentButton.value);
	}

	onSegmentSelected(segmentButton: SegmentButton) {
		// console.log('Segment selected', segmentButton.value);
	}

	ionViewDidLoad() {
		this.content.ionScroll.subscribe((d) => {
			this.fabButton.setElementClass('animated', d.directionY == 'down');
			this.fabButton.setElementClass('fadeOutDown', d.directionY == 'down');
		});
	}

	goToUserOffers() {}
	goToUserEvents() {
		this.navCtrl.push('myevents');
	}
	goToNotifications() {
		this.navCtrl.push('notifications');
	}
	openMenu() {
		this.menuCtrler.open();
	}

	setAsAdmin() {}

	segmentChanged() {}
	logOut() {
		// LogOut here
		const confirm = this.alertCtrl.create({
			title: 'Deconnexion',
			message: 'Voulez-vous vous déconnecter ? ',
			buttons: [
				{
					text: 'Non',
					handler: () => {}
				},
				{
					text: 'Oui',
					handler: () => {
						this.auth.logOut();
						this.event.publish('user:disconnected');
						this.navCtrl.setRoot('sidemenu');
					}
				}
			]
		});
		confirm.present();
	}
	goToLogin() {
		this.navCtrl.push('login');
	}

	goToSettings() {
		this.navCtrl.push('SettingPage');
	}

	onAdd() {
		if (this.segment == 'annonce') {
			this.navCtrl.push('FormAnnoncePage');
		} else if (this.segment == 'favoris') {
			this.navCtrl.push('DonnezAvisPage');
			this.persistence.showMsgWithButton(
				'Appuyez sur le button like pour ajouter a vos favoris',
				'top',
				'toast-info'
			);
		} else if (this.segment == 'event') {
			this.navCtrl.push('FormEventPage');
		} else {
			this.navCtrl.push('DonnezAvisPage', { action: 'avis' });
			this.persistence.showMsgWithButton('Appuyez sur une annonce pour ajouter un avis', 'top', 'toast-info');
		}
	}
	doInfinite(infiniteScroll) {
		if (this.segment == 'annonce') {
			// console.log('Scrolling');
			this.maxAnnonce += 10;
			infiniteScroll.complete();
		} else if (this.segment == 'favoris') {
			// console.log('Scrolling');
			this.maxFav += 10;
			infiniteScroll.complete();
		} else if (this.segment == 'event') {
			// console.log('Scrolling');
			this.maxEvent += 10;
			infiniteScroll.complete();
		} else {
			// console.log('Scrolling');
			this.maxAvis += 10;
			infiniteScroll.complete();
		}
	}
}
