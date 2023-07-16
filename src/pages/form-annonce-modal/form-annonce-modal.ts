import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ViewController } from 'ionic-angular/navigation/view-controller';
import { FormControl, FormGroup } from '@angular/forms';
import { LoginProvider } from '../../providers/login/login';

/**
 * Generated class for the FormAnnonceModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-form-annonce-modal',
	templateUrl: 'form-annonce-modal.html'
})
export class FormAnnonceModalPage {
	model;
	categories = [];
	subcategories = [];
	locations = [];
	feautures = [];
	checkboxTagsForm: FormGroup;
	dumpCats = [];
	checkboxFeaturesForm: FormGroup;
	checkboxSubCatsForm: FormGroup;
	radioCategForm: FormGroup;
	radioSubCat: FormGroup;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public vc: ViewController,
		public lgServ: LoginProvider
	) {
		this.model = navParams.get('param');

		this.radioCategForm = new FormGroup({
			selected_catego: new FormControl()
		});

		this.radioSubCat = new FormGroup({
			selected_subcat: new FormControl()
		});

		if (this.model == 'categories') {
			setTimeout(() => {
				this.loadCategories();
			}, 500);
		} else if (this.model == 'features') {
			setTimeout(() => {
				this.loadFeatures();
			}, 500);
		} else if (this.model == 'sub-categories') {
			let cat = navParams.get('cat');
			// console.log('Category =>', cat);
			this.loadSubCats(cat);
		} else {
		}
	}

	ionViewDidLoad() {}

	close() {
		this.vc.dismiss();
	}

	finish() {
		if (this.model == 'categories') {
			// this.vc.dismiss(this.checkboxTagsForm);
			this.vc.dismiss(this.radioCategForm);
		} else if (this.model == 'fatures') {
			this.vc.dismiss(this.checkboxFeaturesForm);
		} else if (this.model == 'sub-categories') {
			// this.vc.dismiss(this.checkboxSubCatsForm);
			this.vc.dismiss(this.radioSubCat);
		}
	}
	loadFeatures() {
		this.feautures = [];
		this.lgServ.isTable('_ona_pointfinderfeatures').then((categories) => {
			this.feautures = JSON.parse(categories);

			/* this.feautures.push({
				name: 'View all...',
				id: 0,
				slug: 'all'
			}); */
			let result = {};
			for (var i in this.feautures) {
				let current = this.feautures[i];
				let key = current.id;
				result[key] = new FormControl(false);
			}
			this.checkboxFeaturesForm = new FormGroup(result);
		});
	}

	loadCategories() {
		this.categories = [];
		this.lgServ.isTable('_ona_pointfinderltypes').then((categories) => {
			this.dumpCats = JSON.parse(categories);
			// console.log('Dump cats =>', JSON.parse(categories));

			for (let k = 0; k < JSON.parse(categories).length; k++) {
				if (JSON.parse(categories)[k].parent == 0) {
					this.categories.push(JSON.parse(categories)[k]);
				}
			}
			/* this.categories.push({
									name: 'View all...',
									id: 0,
									slug: 'all'
								}); */

			/* let result = {};

			for (var i in this.categories) {
				let current = this.categories[i];
				let key = current.id;
				result[key] = new FormControl(false);
			}
			this.checkboxTagsForm = new FormGroup(result); */
		});
	}
	loadSubCats(cat) {
		// console.log('Loading subcats');
		this.lgServ.isTable('_ona_pointfinderltypes').then((categories) => {
			var allCats = JSON.parse(categories);
			for (let k = 0; k < allCats.length; k++) {
				if (allCats[k].parent == cat.id) {
					this.subcategories.push(allCats[k]);
				}
			}

			/* this.subcategories.push({
				name: 'View all...',
				id: 0,
				slug: 'all'
			}); */

			/* let result = {};

			for (var i in this.subcategories) {
				let current = this.subcategories[i];
				let key = current.id;
				result[key] = new FormControl(false);
			}
			this.checkboxSubCatsForm = new FormGroup(result); */
		});
	}
}
