import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams, Range } from 'ionic-angular';
import { FormGroup, FormControl } from '@angular/forms';
// import { counterRangeValidator } from '../../components/counter-input/counter-input';
import { LoginProvider } from '../../providers/login/login';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
	selector: 'page-filter',
	templateUrl: 'filter.html'
})
export class FilterPage {
	txtLang: any;
	calendrier;
	rangeFormCalendar: FormGroup;
	rangeFormComing: FormGroup;
	model: any;
	currency: any;
	tags = [];
	features = [];
	rangeForm: any;
	checkboxTagsForm: FormGroup;
	featuresForm: FormGroup;
	switchersForm: FormGroup;
	counterForm: any;
	private maxDistance = 25;
	rangeFormFeat: FormGroup;
	rangeFormVerif: FormGroup;
	locations = [];
	locations_results = [];
	categories_results = [];
	category_query = '';

	location_query = '';
	locationSelected;
	place_found: boolean;
	rangeFormDate: FormGroup;
	rangeFormComms: FormGroup;
	rangeFormPop: FormGroup;
	rangeFormAva: FormGroup;
	categories = [];
	category_found: boolean;
	categoryselected: any;

	constructor(
		public vc: ViewController,
		public navParams: NavParams,
		private lgServ: LoginProvider,
		private translate: TranslateService,
		private wpServ: WpPersistenceProvider
	) {
		this.model = this.navParams.get('model');
		let str_model = '_ona_pointfinderlocations';
		let str_category = '_ona_pointfinderltypes';

		if (this.model){
			str_model = '_ona_venues';
			str_category = "_ona_ev_categories";
		} 

		this.lgServ.isTable(str_model).then((locs) => {
			if (locs) {
				this.locations = JSON.parse(locs);
			}
		});

		this.lgServ.isTable(str_category).then((cats) => {
			if (cats) {
				this.categories = JSON.parse(cats);
			}
		});

		this.currency = { name: 'EUR' };
		this.translate.get('message').subscribe((res) => {
			this.txtLang = res;
		});

		this.setFormGroup();
	}

	ionViewDidLoad() {}

	//Cette fonction permet de définir la distance en Km choisit par l'utilisateur
	setFormGroup() {
		//On définit les valeurs à proximité
		this.rangeForm = new FormGroup({
			single: new FormControl(this.maxDistance)
			// nearme: new FormControl(false)
		});
		this.rangeFormFeat = new FormGroup({
			feat: new FormControl(false)
		});
		this.rangeFormVerif = new FormGroup({
			verif: new FormControl(false)
		});
		this.rangeFormDate = new FormGroup({
			date: new FormControl(false)
		});
		this.rangeFormComms = new FormGroup({
			comments: new FormControl(false)
		});
		this.rangeFormPop = new FormGroup({
			popular: new FormControl(false)
		});
		this.rangeFormAva = new FormGroup({
			dispos: new FormControl(false)
		});
		this.rangeFormComing = new FormGroup({
			coming: new FormControl(false)
		});
		// this.rangeFormCalendar = new FormGroup({
		// 	calendrier: new FormControl('')
		// });

		//On récupère la liste des tags
		this.getResults('tags').then((res: any) => {
			let objet = {};
			this.tags = res;

			for (let i = 0; i < res.length; i++) {
				const element = res[i];
				objet['t_' + res[i].id] = new FormControl(false);
			}

			this.checkboxTagsForm = new FormGroup(objet);
		});

		//ON récupère la liste des features
		// this.getResults('pointfinderfeatures').then((res: any) => {
		// 	let objet = {};
		// 	this.features = res;

		// 	for (let i = 0; i < res.length; i++) {
		// 		const element = res[i];
		// 		objet['f_' + res[i].id] = new FormControl(false);
		// 	}

		// 	this.featuresForm = new FormGroup(objet);
		// });

		//Disponibilité et nombre de vues
		this.switchersForm = new FormGroup({
			views: new FormControl(false)
		});

		//Filtre sur les montants (X 10000)
		this.counterForm = new FormGroup({
			dual: new FormControl({ lower: 33, upper: 60 })
		});
	}

	close() {
		this.vc.dismiss();
	}

	//On récupère les filtres afin qu'ils puissent
	//servir pour trier les annonces
	onSearch() {
		let filters = this.buildFilters();
		this.vc.dismiss(filters);
		// console.log("filters ", filters);
	}

	/**
   * Cette fonction permet de construire
   * l'objet filtres qui sera utilisé pour 
   * trier la liste
   * @returns Array<any>
   */
	private buildFilters() {
		let resutls = [];

		if (this.place_found == true) {
			resutls.push({ slug: 'location', val: this.locationSelected.id });
		}
		if (this.category_found == true) {
			resutls.push({ slug: 'category', val: this.categoryselected.id });
		}

		if (this.counterForm.touched == true) {
			resutls.push({ slug: 'amount', val: this.counterForm.value.dual });
		}
		if (this.rangeForm.touched == true) {
			this.lgServ.isTable('_ona_lastPosition').then((currentCoords) => {
				if (currentCoords) {
					resutls.push({ slug: 'distance', val: this.rangeForm.value.single, coords: currentCoords });
				} else {
					this.wpServ.checkGps(this.txtLang.gps);
				}
			});
		}
		if (this.checkboxTagsForm.touched == true) {
			resutls.push({ slug: 'tags', val: this.buildTabs(this.checkboxTagsForm.value) });
		}
		if (this.switchersForm.touched == true && this.switchersForm.value.views) {
			resutls.push({ slug: 'views', val: this.switchersForm.value.views });
		}
		if (this.rangeFormFeat.touched == true && this.rangeFormFeat.value.feat) {
			resutls.push({ slug: 'feat', val: this.rangeFormFeat.value.feat });
		}
		if (this.rangeFormVerif.touched == true && this.rangeFormVerif.value.verif) {
			resutls.push({ slug: 'verif', val: this.rangeFormVerif.value.verif });
		}
		if (this.rangeFormComms.touched == true && this.rangeFormComms.value.comments) {
			resutls.push({ slug: 'comments', val: this.rangeFormComms.value.comments });
		}
		if (this.rangeFormPop.touched == true && this.rangeFormPop.value.popular) {
			resutls.push({ slug: 'popular', val: this.rangeFormPop.value.popular });
		}
		if (this.rangeFormDate.touched == true && this.rangeFormDate.value.date) {
			resutls.push({ slug: 'date', val: this.rangeFormDate.value.date });
		}
		if (this.rangeFormAva.touched == true && this.rangeFormAva.value.dispos) {
			resutls.push({ slug: 'dispo', val: this.rangeFormAva.value.dispos });
		}

		//Events filter
		if (this.model) {
			if (this.rangeFormComing.touched == true && this.rangeFormComing.value.coming) {
				resutls.push({ slug: 'coming', val: this.rangeFormComing.value.coming });
			}
			if (this.calendrier) {
				resutls.push({ slug: 'calendrier', val: this.calendrier });
			}
		}
		// resutls.push({'slug':'nearme', 'val':this.rangeForm.value.nearme});
		// resutls.push({'slug':'available', 'val':this.switchersForm.value.dispos});

		return resutls;
	}

	/**
   * Cette fonction permet de construire
   * un tableau d'ids d'éléments sélectionner par
   * l'utilisateur
   * @param tags Object, la liste des tags
   * @returns Array<number>
   */
	private buildTabs(tags) {
		let tabs = [];

		for (var key in tags) {
			let strSplit = key.split('_');
			if (tags[key]) tabs.push(parseInt(strSplit[1]));
		}

		return tabs;
	}

	/**
	 * Cette fonction permet de recupérer
	 * la liste des annonces
	 */
	getResults(model) {
		return new Promise((resolve, reject) => {
			this.lgServ.isTable('_ona_' + model).then((res) => {
				if (res) {
					resolve(JSON.parse(res));
				} else {
					this.wpServ
						.getWpData(model)
						.then((data) => {
							// console.log(data);
							resolve(data);
						})
						.catch((error) => {
							// console.log(error);
						});
				}
			});
		});
	}

	//Distance modifié
	rangeChange(range: Range) {
		// console.log("Distance ", range );
	}

	//On change le montant
	amountChange(range: Range) {
		// console.log("Montant ", range);
	}

	/**
	 * Cette méthode permet de rechercher un 
	 * lieu, ville ou pays
	 * 
	 * @param query any, requete sur la recherche
	 * @param ev string, pattern à rechercher
	 */
	searchLoaction(query, ev) {
		if (this.locations.length > 0) {
			if (ev.target.value == '') {
				// this.loadData(this.model);
				this.locations_results = [];
				this.place_found = false;
			} else {
				if(!this.model){
					this.locations_results = this.locations.filter((item) => {
						return item.name.toLowerCase().indexOf(ev.target.value.toLowerCase()) > -1;
					});
				}else{

					this.locations_results = this.locations.filter((item) => {
						let txtNom = item.venue+" "+item.city+" "+item.country;
						return txtNom.toLowerCase().indexOf(ev.target.value.toLowerCase()) > -1;
					});
				}
			}
		} else {
			this.wpServ.showMsgWithButton(this.txtLang.search_location, 'top', 'toast-info');
		}
	}

	selectLocation(place) {
		
		if(!this.model){
			this.location_query = place.name;
		}else{
			this.location_query = place.venue;
		}

		this.locationSelected = place;
		this.place_found = true;
		this.locations_results = [];
	}

	selectCategory(place) {
		this.category_query = place.name;
		this.category_found = true;
		this.categoryselected = place;
		this.categories_results = [];
	}
	searchCategory(query,ev) {
		if (this.categories.length > 0) {
			if (ev.target.value == '') {
				this.categories_results = [];
				this.category_found = false;
			} else {
				this.categories_results = this.categories.filter((item) => {
					return item.name.toLowerCase().indexOf(ev.target.value.toLowerCase()) > -1;
				});
			}
		} else {
			this.wpServ.showMsgWithButton(this.txtLang.search_location, 'top', 'toast-info');
		}
	}
	clearSearchCategory() {}
}
