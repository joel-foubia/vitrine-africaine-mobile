import { Component } from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	Events,
	ModalController,
	ActionSheetController,
	AlertController
} from 'ionic-angular';
import { MenuController } from 'ionic-angular/components/app/menu-controller';
import { LoginProvider } from '../../providers/login/login';
import { TranslateService } from '@ngx-translate/core';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SMS } from '@ionic-native/sms';
import { EmailComposer } from '@ionic-native/email-composer';
import * as moment from 'moment';

@IonicPage()
@Component({
	selector: 'page-annonce-detail',
	templateUrl: 'annonce-detail.html'
})
export class AnnonceDetailPage {

	available: string = 'closed';
	txtPop: any;
	lang: string;
	icon;
	direction = 'up';
	imgMore;
	annonce;

	// Announcement features list
	features = [];
	mediumDesc;
	likeIcon = 'ios-heart-outline';
	totalDesc;
	defaultImage: string;
	maxComments: number = 5;
	hostedDefaultImage: string;

	authorDetails;

	commentObj = {
		comment: '',
		author: '',
		date: ''
	};
	syncReviews: number;
	conn_user: any;
	txtdescpop: any;
	avis_txt: string = '';

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public ev: Events,
		public menuCtrler: MenuController,
		public modalCtrl: ModalController,
		public actionCtrl: ActionSheetController,
		private translate: TranslateService,
		private lgServ: LoginProvider,
		public persistence: WpPersistenceProvider,
		public inapp: InAppBrowser,
		public sms: SMS,
		public emailComposer: EmailComposer,
		public alertCtrl: AlertController
	) {
		// console.log('Annonce rec => ', this.navParams.get('annonce'));

		// default image hosted online at use.com
		this.hostedDefaultImage = 'https://www.use.com/images/s_4/a461e64516e6a99093bd.jpg';
		this.defaultImage = 'assets/images/logo.png';
		this.lang = this.translate.getDefaultLang();
		this.annonce = this.navParams.get('annonce');
		this.icon = 'assets/images/icons/up.svg';
		this.imgMore = 'assets/images/more.png';
		this.available = this.lgServ.isAvailable(this.annonce.annonce);
		// console.log('annonce', this.annonce.annonce);

		// Now we retrieve part of the string and display on view
		var string = '';
		string = this.stripHtml(this.annonce.annonce.content.rendered);
		// this.shortDesc = string.substring(0, 115);
		if (string.length > 250) this.mediumDesc = string.substring(0, 250) + ' ...';
		else this.mediumDesc = string;

		this.totalDesc = string;

		this.features = this.getAnnouncementFeatures(this.annonce.annonce);
		this.translate.get([ 'pop' ]).subscribe((res) => {
			this.txtPop = res.pop;
		});

		this.translate.get('descpop').subscribe((txt) => {
			this.txtdescpop = txt;
		});

		if (this.annonce.annonce._embedded['wp:featuredmedia'] == undefined) {
			this.annonce.annonce._embedded['wp:featuredmedia'] = [
				{
					source_url: this.hostedDefaultImage
				}
			];
		} else {
		}

		this.syncReviews = setInterval(() => this.persistence.retrieveReviews(), 120000);

		this.authorDetails = this.annonce.annonce._embedded.author[0];

		this.ev.subscribe('user:connected', (userData) => {
			this.lgServ.isTable('wpIonicToken').then((user) => {
				if (user) {
					this.conn_user = JSON.parse(user);
				}
			});
			this.retrieveComments();
		});
		
		this.lgServ.isTable('wpIonicToken').then((user) => {
			if (user) {
				this.conn_user = JSON.parse(user);
				console.log('Connected user=>', this.conn_user);
			}
		});
		this.retrieveComments();
	}

	/**
   * Method used to remove html tags from a string
   * @param htmlString String to strip html from
   */
	stripHtml(htmlString) {
		return htmlString.replace(/<[^>]+>/g, '');
	}

	/**Method to get an announcement features
	 * @author Landry Fongang (mr_madcoder_fil)
	 * @param announcement The announcement in question
	 */
	getAnnouncementFeatures(announcement) {
		if (announcement._embedded['wp:term']) {
			return announcement._embedded['wp:term'][3];
		}
	}

	openMenu() {
		this.menuCtrler.open();
	}

	ionViewDidLoad() {}

	/**Function to add an item in favourites
	 * @author landry Fongang (mr_madcoder_fil)
	 * @param item The item to add in favs
	 */
	addToFav(item) {
		if (item.like) {
			if (item.like == true) {
				item.like = false;
				this.likeIcon = 'ios-heart-outline';
				this.lgServ.disLikeItem(item, 'listing');
			} else {
				item.like = true;
				this.likeIcon = 'ios-heart';
				this.lgServ.likeItem(item, 'listing');
			}
		} else {
			item.like = true;
			this.likeIcon = 'ios-heart';
			this.lgServ.likeItem(item, 'listing');
		}
	}

	viewAllDesc() {
		let popover = this.modalCtrl.create('descpopover', { params: this.annonce, slug: 'desc' });

		popover.present();
	}

	//Affichage de la liste des commentaires
	viewAllComments() {
		if (!this.annonce.annonce._embedded.replies) {
			this.persistence.showMsgWithButton('Pas de commentaires pour cette annonce', 'top', 'toast-info');
		} else {
			if (this.annonce.annonce._embedded.replies[0].length <= 0) {
				this.persistence.showMsgWithButton('Pas de commentaires pour cette annonce', 'top', 'toast-info');
			} else {
				let popover = this.modalCtrl.create('descpopover', { params: this.annonce, slug: 'comms' });

				popover.present();
			}
		}
	}
	viewAllReviews() {
		if (!this.annonce.annonce.reviews) {
			this.persistence.showMsgWithButton("Pas d'avis pour cette annonce", 'top', 'toast-info');
		} else {
			if (this.annonce.annonce.reviews.length <= 0) {
				this.persistence.showMsgWithButton("Pas d'avis pour cette annonce", 'top', 'toast-info');
			} else {
				let popover = this.modalCtrl.create('descpopover', { params: this.annonce, slug: 'reviews' });

				popover.present();
			}
		}
	}
	addComment() {
		let popover = this.modalCtrl.create('descpopover', { params: this.annonce, slug: 'comms' });

		popover.present();
	}

	//On affiche les images dans un Slider
	viewAllImgs() {
		let popover = this.modalCtrl.create('descpopover', { params: this.annonce, slug: 'imgs' });

		popover.present();
	}

	//On affiche les heures d'ouvertures
	seeHours() {
		let popover = this.modalCtrl.create('descpopover', { params: this.annonce, slug: 'hours' });

		popover.present();
	}

	/**
	 * @author Landry Fongang (mr_madcoder_fil)
	 * Function to launch naivagation app and view articles location and direction
	 */
	goToArticle() {
		let coords = [];
		if (this.annonce.annonce.webbupointfinder_items_location != '') {
			let strCoords = this.annonce.annonce.webbupointfinder_items_location.split(',');
			coords.push(parseFloat(strCoords[0]));
			coords.push(parseFloat(strCoords[1]));

			// console.log(coords);
			this.lgServ.navigateToArticle(coords);
		}
	}

	//Partage de l'annonce
	goToShare() {
		this.lgServ.doShare(
			this.totalDesc,
			this.annonce.annonce.title.rendered,
			this.annonce.annonce.img,
			this.annonce.annonce.link
		);
	}

	//Cette méthode permet à un utilisateur d'effectuer
	//une réservation
	reserver() {
		this.persistence.reserver(this.annonce.annonce, this.txtPop);
	}

	sendMail() {
		let email = {
			to: this.authorDetails.userData.user_email,
			subject: 'Mr / Mme ' + this.authorDetails.name + ' est interessée pas votre annonce'
		};

		// Send a text message using default options
		this.emailComposer.open(email);
	}
	call() {
		this.persistence.doCall(
			this.authorDetails.userData.user_phone,
			"Numero de téléphone de l'annonceur pas disponible"
		);
	}
	whatsapp() {
		this.inapp.create('https://wa.me/' + this.authorDetails.userData.user_phone);
	}
	sendSms() {
		this.sms.send(
			this.authorDetails.userData.user_phone,
			'Je suis interessée par votre annonce ' + this.annonce.annonce.title.rendered
		);
	}

	submitAvis() {
		if (this.conn_user != undefined) {
			if (this.avis_txt != '') {
				var createdCommsArray = [];
				let review = {
					Post_Id: [ this.annonce.annonce.id.toString() ],
					Review_User_Id: [ this.conn_user.user_id.toString() ],
					Post_Date: moment().format('YYYY-MM-DD HH:mm:ss'),
					Review_Comment: this.commentObj.comment,
					object_Id: Math.floor(1000 + Math.random() * 9000).toString(),
					post_modified: moment().format('YYYY-MM-DD HH:mm:ss'),
					Comments: [],
					user_data: {
						display_name: this.conn_user.user_display_name,
						Email: this.conn_user.user_email
					}
				};
				let comment = {
					content: { rendered: review.Review_Comment },
					id: parseInt(review.object_Id),
					author_name: review.user_data.display_name,
					date: review.Post_Date,
					type: 'review',
					author: parseInt(review.Review_User_Id[0]),
					_embedded: {
						author: [
							{
								userData: {
									Profil_image: ''
								}
							}
						]
					}
				};
				createdCommsArray.push(comment);
				if (this.annonce.annonce.reviews) {
					this.annonce.annonce.reviews = this.annonce.annonce.reviews.concat(createdCommsArray);
				} else {
					this.annonce.annonce.reviews = createdCommsArray;
				}
				this.persistence.copiedAddSync('reviews', review);
				this.persistence.syncCreateObjet('pointfinderreviews', {
					id: 0,
					title: this.conn_user.user_display_name,
					content: this.avis_txt
				});
				this.persistence.showMsgWithButton(this.txtdescpop.success_comm, 'top', 'toast-success');
				this.avis_txt = '';
			} else {
				this.persistence.showMsgWithButton(
					'Veuillez ecrire un commentaire dans la zone de texte',
					'top',
					'toast-infos'
				);
			}
		} else {
			this.navCtrl.push('LoginPage');
			this.persistence.showMsgWithButton(
				'Veuillez vous connecter pour ajouter un commentaire',
				'top',
				'toast-info'
			);
		}
	}

	submitComment() {
		
		if (this.conn_user != undefined) {
			if (this.commentObj.comment != '') {
				this.commentObj.author = this.authorDetails.id;
				var review;
				var com;
				review = {
					Post_Id: [ this.annonce.annonce.id.toString() ],
					Review_User_Id: [ this.conn_user.user_id.toString() ],
					Post_Date: moment().format('YYYY-MM-DD HH:mm:ss'),
					Review_Comment: this.commentObj.comment,
					object_Id: Math.floor(1000 + Math.random() * 9000).toString(),
					post_modified: moment().format('YYYY-MM-DD HH:mm:ss'),
					Comments: [],
					user_data: {
						display_name: this.conn_user.user_display_name,
						Email: this.conn_user.user_email
					}
				};
				let comment = {
					content: { rendered: review.Review_Comment },
					id: parseInt(review.object_Id),
					author_name: review.user_data.display_name,
					date: review.Post_Date,
					type: 'review',
					author: parseInt(review.Review_User_Id[0]),
					_embedded: {
						author: [
							{
								userData: {
									Profil_image: ''
								}
							}
						]
					}
				};

				var commentToSend = {
					author: this.conn_user.user_id,
					id: 0,
					author_name: this.conn_user.user_display_name,
					post: this.annonce.annonce.id,
					content: this.commentObj.comment
				};
				this.annonce.annonce.comments.unshift(comment);
				this.persistence.syncCreateObjet('comments', commentToSend);
				this.commentObj.comment = '';
			} else {
				this.persistence.showMsgWithButton(
					'Veuillez ecrire un commentaire dans la zone de texte',
					'top',
					'toast-infos'
				);
			}
		} else {
			this.navCtrl.push('LoginPage');
			this.persistence.showMsgWithButton(
				'Veuillez vous connecter pour ajouter un commentaire',
				'top',
				'toast-info'
			);
		}
	}

	retrieveComments() {
		this.lgServ.isTable('_ona_comments').then((comments) => {
			this.lgServ.isTable('_ona_reviews').then((data) => {
				var commentsList = [];
				var reviewsList = [];
				if (comments) {
					var allcomms = [];
					allcomms = JSON.parse(comments);
					for (let k = 0; k < allcomms.length; k++) {
						if (allcomms[k].post == this.annonce.annonce.id) {
							if (
								allcomms[k]._embedded.author[0].userData.Profil_image == undefined ||
								allcomms[k]._embedded.author[0].userData.Profil_image != ''
							) {
								allcomms[k]._embedded.author[0].userData.Profil_image = 'assets/images/icons/boy.svg';
							}
							commentsList.push(allcomms[k]);
						}
					}
					this.annonce.annonce.comments = commentsList;
				}
				if (data) {
					var revs = [];
					var userImage = 'assets/images/icons/boy.svg';
					revs = JSON.parse(data);

					for (let j = 0; j < revs.length; j++) {
						if (parseInt(revs[j].Post_Id[0]) == this.annonce.annonce.id) {
							if (revs[j].user_data.Profil_image != undefined) {
								if (revs[j].user_data.Profil_image != '') {
									userImage = revs[j].user_data.Profil_image;
								}
							}
							let comment = {
								content: { rendered: revs[j].Review_Comment },
								id: parseInt(revs[j].object_Id),
								author_name: revs[j].user_data.display_name,
								date: revs[j].Post_Date,
								type: 'review',
								author: parseInt(revs[j].Review_User_Id[0]),
								_embedded: {
									author: [
										{
											userData: {
												Profil_image: userImage
											}
										}
									]
								}
							};
							reviewsList.push(comment);
						}
					}
					this.annonce.annonce.reviews = reviewsList;
				}
			});
		});
	}

	/**
	 * Cette méthode permet de supprimer
	 * une offre ou une annonce
	 * @author landry_igor
	 * 
	 * @param item any, l'objet à supprimer
	 */
	deleteAvis(item) {
		if (item.type == 'comment') {
			console.log('It is a comment');
			for (let k = 0; k < this.annonce.annonce.comments.length; k++) {
				if (item.id == this.annonce.annonce.comments[k].id) {
					this.annonce.annonce.comments.splice(k, 1);
					this.annonce.annonce._embedded.replies.splice(k, 1);
					this.persistence.showMsgWithButton(this.txtdescpop.success_comm_del, 'top', 'toast-success');
				}
			}
			this.persistence.applyDelete('comments', item);
			this.persistence.localUpdate('listing', this.annonce.annonce);
			this.persistence.localUpdate('historic_annonce', this.annonce.annonce);
			this.persistence.localUpdate('listing_fav', this.annonce.annonce);
		} else {
			console.log('It is a review');
			for (let k = 0; k < this.annonce.annonce.reviews.length; k++) {
				if (item.id == this.annonce.annonce.reviews[k].id) {
					this.annonce.annonce.reviews.splice(k, 1);
					this.annonce.annonce.webbupointfinder_review_rating = '';
					this.persistence.showMsgWithButton(this.txtdescpop.success_comm_del, 'top', 'toast-success');
				}
			}
			this.persistence.applyDelete('pointfinderreviews', item);
			this.persistence.deleteReview('reviews', item);
			this.persistence.localUpdate('listing', this.annonce.annonce);
			this.persistence.localUpdate('historic_annonce', this.annonce.annonce);
			this.persistence.localUpdate('listing_fav', this.annonce.annonce);
		}
	}

	/**
	 * Cette méthode est utilisé pour 
	 * afficher une boite dialogue pour confirmer
	 * la suppression
	 * @param item any, objet à supprimer
	 */
	showDeleteConfirm(item) {
		const confirm = this.alertCtrl.create({
			message: this.txtdescpop.delet_msge,
			buttons: [
				{
					text: this.txtdescpop.cancel,
					handler: () => {}
				},
				{
					text: this.txtdescpop.accept,
					handler: () => {
						this.deleteAvis(item);
					}
				}
			]
		});
		confirm.present();
	}
}
