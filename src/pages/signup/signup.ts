import { Storage } from '@ionic/storage';
import { Component, ViewChild } from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	Loading,
	AlertController,
	LoadingController,
	Events,
	ViewController,
	Slides
} from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalController } from 'ionic-angular/components/modal/modal-controller';
import { LoginProvider } from '../../providers/login/login';
import { AfProvider } from '../../providers/af/af';
import { InAppBrowser } from '@ionic-native/in-app-browser';

/**
 * Generated class for the SignupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
	name: 'signup'
})
@Component({
	selector: 'page-signup',
	templateUrl: 'signup.html'
})
export class SignupPage {
	@ViewChild(Slides) slides: Slides;
	loginloader: Loading;
	user: any;
	signup: FormGroup;
	loading: any;
	terms_url;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public auth: AuthProvider,
		public http: HttpClient,
		public storage: Storage,
		public alertCtrler: AlertController,
		public loadingCtrler: LoadingController,
		public persistence: WpPersistenceProvider,
		public ev: Events,
		public lgProv: LoginProvider,
		public modal: ModalController,
		public view: ViewController,
		public af: AfProvider,
		public translate: TranslateService,
		public inapp: InAppBrowser
	) {
		this.lgProv.isTable('_ona_fireData').then((data) => {
			this.terms_url = JSON.parse(data)[1].conditions_utilisation;
		});

		this.signup = new FormGroup({
			email: new FormControl('', Validators.required),
			username: new FormControl('', Validators.required),
			password: new FormControl('test', Validators.required),
			confirm_password: new FormControl('test', Validators.required)
		});
	}

	ionViewDidLoad() {}

	checkPWD() {
		return new Promise((reolve, reject) => {
			if (this.signup.get('password').value == this.signup.get('confirm_password').value) {
				reolve('Correct');
			} else {
				let alert = this.alertCtrler.create({
					message: 'Les 2 mots de passe ne sont pas identique',
					buttons: [
						{
							text: 'OK',
							role: 'cancel'
						}
					]
				});
				alert.present();
				reject('Incorrect');
			}
		});
	}

	goBack() {
		this.navCtrl.setRoot('sidemenu');
	}

	showTermsModal() {
		this.inapp.create(this.terms_url, '_system');
	}

	showError(error) {
		let confirm = this.alertCtrler.create({
			message: error.msg,
			buttons: [
				{
					text: 'OK',
					handler: () => {}
				}
			]
		});
		confirm.present().then(() => {
			this.storage.remove('Signup_Info');
		});
	}

	presentLoading(msge) {
		this.loginloader = this.loadingCtrler.create({
			content: msge
		});
		this.loginloader.present();
	}

	showErrorAlert(error) {
		let alert = this.alertCtrler.create({
			message: error,
			buttons: [ 'OK' ]
		});
		alert.present();
	}
	doGoogleSignup() {}
	doFacebookSignup() {}

	doSignup() {
		this.af.retrieveURL((url) => {
			this.presentLoading('Creation de votre compte ...');
			this.checkPWD().then(
				(res) => {
					var admin_username = 'filigor2@gmail.com';
					var admin_password = '6190SSRA';
					//only authenticated administrators can create users
					this.auth.postLogin(admin_username, admin_password, url).subscribe(
						(res) => {
							var response;
							response = res;
							let user_data = {
								username: this.signup.get('username').value,
								email: this.signup.get('email').value,
								password: this.signup.get('password').value
							};
							this.auth.createAccount(user_data, response.token).then(
								(result) => {
									var sub_res;
									sub_res = result;
									// console.log('Register result =>', JSON.parse(sub_res));
									this.loginloader.dismiss();
									this.presentLoading('Compte créé, Connexion en cours...');
									this.auth.postLogin(user_data.username, user_data.password, url).subscribe(
										(data) => {
											this.loginloader.dismiss();
											var user;
											user = data;
											user.sub_result = JSON.parse(sub_res);
											this.storage.set('wpIonicToken', JSON.stringify(user)).then(() => {
												this.ev.publish('user:connected', user);
												this.view.dismiss();
												this.navCtrl.push('ProfilePage', { objet: user });
											});
										},
										(err) => {
											// console.log('Error =>', err);
											this.loginloader.dismiss();
											this.lgProv.showError(err).present();
										}
									);
								},
								(error) => {
									// console.log('Register Error =>', error);
									this.loginloader.dismiss();

									this.lgProv.showError(error).present();
								}
							);
						},
						(err) => {
							this.loginloader.dismiss();
							this.lgProv.showError(err).present();
							// console.log(err);
						}
					);
				},
				(err) => {
					this.loginloader.dismiss();
				}
			);
		});
	}
}
