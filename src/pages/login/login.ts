// import { Facebook } from '@ionic-native/facebook';
import { WpPersistenceProvider } from './../../providers/wp-persistence/wp-persistence';
import { Storage } from '@ionic/storage';
import { AuthProvider } from './../../providers/auth/auth';
import { Component } from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	Loading,
	AlertController,
	LoadingController,
	Events,
	ViewController,
	MenuController
} from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { LoginProvider } from '../../providers/login/login';
import { AfProvider } from '../../providers/af/af';

@IonicPage()
@Component({
	selector: 'page-login',
	templateUrl: 'login.html'
})
export class LoginPage {
	login: FormGroup;
	main_page: { component: any };
	loading: any;
	loginloader: Loading;
	email;
	password;
	conn_type;
	// loading: Loading;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public authProvider: AuthProvider,
		public persistence: WpPersistenceProvider,
		public lgProv: LoginProvider,
		public alertCtrler: AlertController,
		public loadingCtrler: LoadingController,
		public storage: Storage,
		public ev: Events,
		public view: ViewController,
		public af: AfProvider,
		public translate: TranslateService,
		public menuCtrler: MenuController
	) {
		this.conn_type = navParams.get('conn_type');

		this.login = new FormGroup({
			email: new FormControl('', Validators.required),
			password: new FormControl('', Validators.required)
		});
	}

	ionViewDidLoad() {}

	ionViewDidEnter() {}

	goToSignup(): void {
		this.navCtrl.push('signup');
	}

	goToForgotPassword() {}

	fbLogin() {}

	checklogin() {}

	presentLoading(msge) {
		this.loginloader = this.loadingCtrler.create({
			content: msge
		});
		this.loginloader.present();
	}

	wpLogin() {
		this.af.retrieveURL((url) => {
			this.presentLoading('Connexion en cours...');
			// console.log(this.login.get('email').value, this.login.get('password').value);
			this.authProvider.postLogin(this.login.get('email').value, this.login.get('password').value, url).subscribe(
				(data) => {
					this.loginloader.dismiss();
					// console.log('Login response ', data);
					this.persistence.getUserData(data, url).subscribe(
						(res) => {
							// console.log('user details =>', res);
							this.lgProv.setTable('_ona_userDetails', res);
						},
						(err) => {
							// console.log('User details error =>', err);
						}
					);
					this.storage.set('wpIonicToken', JSON.stringify(data)).then(() => {
						this.ev.publish('user:connected', data);
						this.view.dismiss();
					});
				},
				(err) => {
					// console.log('Error =>', err);
					this.loginloader.dismiss();
					this.lgProv.showError(err).present();
				}
			);
		});
	}

	openMenu() {
		this.menuCtrler.open();
	}

	close() {
		this.view.dismiss();
	}

	ionViewDidLeave() {}
	doFacebookLogin() {}
	doGoogleLogin() {}
}
