import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { LoginProvider } from '../../providers/login/login';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl } from '@angular/forms';
import * as moment from 'moment';
import { Actions } from '../../config';
import { EmailComposer } from '@ionic-native/email-composer';

@IonicPage({
	name: 'descpopover'
})
@Component({
	selector: 'page-descpopover',
	templateUrl: 'descpopover.html'
})
export class DescpopoverPage {
	hours: any;
	annonce: any;
	type;
	images: Array<any>;
	defaultImage: string;
	comment_text = '';
	rdv_description = '';
	rdv_date = '';
	radioTagsForm: FormGroup;
	packs = [];
	txtpop: any;
	conn_user;
	myreview: any;
	txtdescpop: any;
	actions = [];
	comment_txt = '';
	avis_txt = '';
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public view: ViewController,
		public lgServ: LoginProvider,
		public translate: TranslateService,
		public persistence: WpPersistenceProvider,
		public alertCtrl: AlertController,
		public emailComposer: EmailComposer
	) {
		this.lgServ.isTable('wpIonicToken').then((user) => {
			if (user) {
				this.conn_user = JSON.parse(user);
				// console.log('user=>', this.conn_user);
			}
		});

		this.defaultImage = 'assets/images/icon.png';
		this.annonce = this.navParams.get('params');

		this.translate.get('descpop').subscribe((txt) => {
			this.txtpop = txt;
		});

		this.translate.get('descpop').subscribe((txt) => {
			this.txtdescpop = txt;
		});

		// console.log('Annonce =>', this.annonce);
		if (this.navParams.get('slug') == 'desc') {
			this.type = 'desc';
			// on recuper la description
		} else if (this.navParams.get('slug') == 'imgs') {
			// on recuper les images
			this.type = 'imgs';
			this.images = this.annonce.imgs;
		} else if (this.navParams.get('slug') == 'comms') {
			this.type = 'comms';
			// on recuper les commentaires
		} else if (this.navParams.get('slug') == 'hours') {
			this.type = 'hours';
			this.buildHours();
			// on recuper les commentaires
		} else if (this.navParams.get('slug') == 'avis') {
			this.type = 'avis';
			this.getAvis();
		} else if (navParams.get('slug') == 'reviews') {
			this.type = 'reviews';
		} else if (this.navParams.get('slug') == 'rdv') {
			this.type = 'rdv';
		} else if (this.navParams.get('slug') == 'pack') {
			this.type = 'pack';
			this.getBasicPack();
			this.loadPacks();
		} else if (this.navParams.get('slug') == 'press') {
			this.type = 'press';

			this.lgServ.isTable('wpIonicToken').then((user) => {
				if (user) {
					this.conn_user = JSON.parse(user);

					if (this.conn_user != undefined) {
						if (this.conn_user.user_id == this.annonce.annonce.author) {
							this.actions = Actions.loadActions();
						} else {
							this.actions.push({
								id: 2,
								titre: 'Voir',
								img: 'assets/icon/actions/view.svg',
								slug: 'view'
							});
						}
					} else {
						this.actions.push({ id: 2, titre: 'Voir', img: 'assets/icon/actions/view.svg', slug: 'view' });
					}

					// console.log('user=>', this.conn_user);
					// console.log('Annonce=>', this.annonce.annonce);
				}
			});
		}

		// this.loadComments();
	}

	getBasicPack() {}

	getAvis() {
		this.lgServ.isTable('_ona_reviews').then((data) => {
			if (data) {
				var rev = JSON.parse(data);

				for (let k = 0; k < rev.length; k++) {
					if (parseInt(rev[k].Post_Id[0]) == this.annonce.annonce.id) {
						this.myreview = rev[k];
					}
				}

				if (this.myreview != undefined) {
					this.comment_text = this.myreview.Review_Comment;
				}
				// console.log('My review =>', this.myreview);
			}
		});
	}

	loadPacks() {
		this.lgServ.isTable('_ona_packs').then((packs) => {
			this.lgServ.isTable('fb_packs').then((data) => {
				this.packs = JSON.parse(packs);
				this.packs.unshift(data);
				// console.log('Packs=>', this.packs);
			});
		});
		this.radioTagsForm = new FormGroup({
			selected_option: new FormControl()
		});
	}

	submitAvis() {
		if (this.conn_user != undefined) {
			if (this.comment_text != '') {
				var review;
				if (this.myreview != undefined) {
					this.myreview.post_modified = moment().format('YYYY-MM-DD HH:mm:ss');
					review = this.myreview;
					this.myreview.Review_Comment = this.comment_text;
					this.persistence.updateReview('reviews', review);
					this.persistence.showMsgWithButton(this.txtpop.success_comm_update, 'top', 'toast-success');
				} else {
					review = {
						Post_Id: [ this.annonce.annonce.id.toString() ],
						Review_User_Id: [ this.conn_user.user_id.toString() ],
						Post_Date: moment().format('YYYY-MM-DD HH:mm:ss'),
						Review_Comment: this.comment_text,
						object_Id: Math.floor(1000 + Math.random() * 9000).toString(),
						post_modified: moment().format('YYYY-MM-DD HH:mm:ss'),
						Comments: [],
						user_data: {
							comment_author: this.conn_user.user_display_name,
							comment_author_email: this.conn_user.user_email
						}
					};
					this.persistence.copiedAddSync('reviews', review);
					this.persistence.showMsgWithButton(this.txtpop.success_comm, 'top', 'toast-success');
				}

				/* var comment = {
					comment_post_ID: this.annonce.annonce.id.toString(),
					comment_author: this.conn_user.user_display_name,
					comment_author_email: this.conn_user.user_email,
					comment_date: moment().format('YYYY-MM-DD HH:mm:ss'),
					comment_content: this.comment_text,
					user_id: this.conn_user.user_id.toString()
				}; */

				this.persistence.localUpdate('listing', this.annonce.annonce);
				this.persistence.localUpdate('historic_annonce', this.annonce.annonce);
				this.persistence.localUpdate('listing_fav', this.annonce.annonce);

				this.view.dismiss();
			} else {
				this.persistence.showMsgWithButton(this.txtpop.error_comm, 'top', 'toast-error');
			}
		} else {
			this.navCtrl.push('LoginPage');
			this.persistence.showMsgWithButton(this.txtpop.error_conn_comm, 'top', 'toast-error');
		}
	}

	ionViewDidLoad() {}

	close() {
		this.view.dismiss();
	}

	requestRdv() {
		if (this.rdv_date != '' && this.rdv_description != '') {
			// Send mail

			this.lgServ.isTable('wpIonicToken').then((user) => {
				if (user) {
					// Can take rdv
					this.sendMail(JSON.parse(user));
				} else {
					// Login before taking RDV
					this.navCtrl.push('LoginPage');
					this.persistence.showMsgWithButton(this.txtpop.error_conn_rdv, 'top', 'toast-error');
				}
			});

			this.view.dismiss();
		}
	}

	sendMail(user) {
		var rdv = {
			date: this.rdv_date,
			description: this.rdv_description,
			user: user,
			annonce_data: this.annonce
		};

		this.view.dismiss(rdv);
		this.persistence.saveRdvInLocal(rdv);

		let email = {
			to: this.annonce._embedded.author[0].userData.user_email,
			subject: 'Mr / Mme ' + user.user_display_name + ' est interessée pas votre annonce'
		};

		this.emailComposer.open(email);
	}

	/**
	 * Cette méthode permet de créer un 
	 * tableau 
	 */
	buildHours() {
		let objet = this.annonce.annonce;
		let week = [],
			id = 1;

		this.translate.get('week').subscribe((res) => {
			id = 1;
			for (const key in res) {
				if (res.hasOwnProperty(key) && key != 'close') {
					let element = res[key],
						valeur;

					// console.log("objet =>", objet['webbupointfinder_items_o_o'+id]);
					if (objet['webbupointfinder_items_o_o' + id].length > 2)
						valeur = objet['webbupointfinder_items_o_o' + id];
					else valeur = res.close;

					week.push({ name: element, text: valeur });
				}

				if (key != 'close') id++;
			}

			this.hours = week;
			// console.log(this.hours);
		});
	}
	onPackSelect() {
		if (this.radioTagsForm.touched == true) {
			var pack;

			for (let k = 0; k < this.packs.length; k++) {
				if (this.packs[k].PACK_CONTENT.ID == parseInt(this.radioTagsForm.value.selected_option)) {
					pack = this.packs[k].PACK_CONTENT.post_title;
				}
			}
			// console.log('Pack=>', pack);
			this.view.dismiss(pack);
		} else {
			this.view.dismiss();
		}
	}

	loadComments() {
		this.lgServ.isTable('_ona_comms').then((comms) => {
			if (comms) {
				var comments = [];
				var annonceComments = [];
				comments = JSON.parse(comms);

				for (let k = 0; k < comments.length; k++) {
					if (parseInt(comments[k].comment_post_ID) == this.annonce.annonce.id) {
						annonceComments.push(comments[k]);
					}
				}

				this.annonce.annonce.comments = annonceComments;
			}
		});
	}

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

	submitComment() {
		if (this.conn_user != undefined) {
			if (this.comment_txt != '') {
				var review;
				var com;
				review = {
					Post_Id: [ this.annonce.annonce.id.toString() ],
					Review_User_Id: [ this.conn_user.user_id.toString() ],
					Post_Date: moment().format('YYYY-MM-DD HH:mm:ss'),
					Review_Comment: this.comment_txt,
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
					content: this.comment_txt
				};
				this.annonce.annonce.comments.unshift(comment);
				this.persistence.syncCreateObjet('comments', commentToSend);
				this.comment_txt = '';
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

	openAction(item) {
		this.view.dismiss(item);
	}

	submitReviews() {
		if (this.conn_user != undefined) {
			if (this.avis_txt != '') {
				var createdCommsArray = [];
				let review = {
					Post_Id: [ this.annonce.annonce.id.toString() ],
					Review_User_Id: [ this.conn_user.user_id.toString() ],
					Post_Date: moment().format('YYYY-MM-DD HH:mm:ss'),
					Review_Comment: this.avis_txt,
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
}
