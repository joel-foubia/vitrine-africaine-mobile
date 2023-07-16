import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';
import { LoginProvider } from '../../providers/login/login';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';

@IonicPage()
@Component({
	selector: 'page-taxonomies-list',
	templateUrl: 'taxonomies-list.html'
})
export class TaxonomiesListPage {
	txtSearch: string = "";
	type;
	taxonomy = [];
	dumpTaxonomy = [];

	max = 10;
	model;
	showSearch = false;

	constructor(
		public navCtrl: NavController,
		public menuCtrl: MenuController,
		public navParams: NavParams,
		public lgSer: LoginProvider,
		public persistence: WpPersistenceProvider
	) {
		// console.log(navParams.data);
		this.type = navParams.data;

		if (this.type.type.name == 'location') {
			this.model = 'pointfinderlocations';
		} else {
			this.model = 'tags';
		}

		// console.log('Type =>', this.type);

		this.loadData(this.model);
	}

	ionViewDidLoad() {}

	loadData(model) {
		this.lgSer.isTable('_ona_' + model).then((data) => {
			if (data) {
				var results = JSON.parse(data);
				this.dumpTaxonomy = this.filterTaxonomies(results);
				this.taxonomy = this.filterTaxonomies(results);
			}

			// console.log('Taxonomy list =>', this.taxonomy);
		});
	}

	doInfinite(infiniteScroll) {
		this.max += 10;
		infiniteScroll.complete();
	}

	openLeftMenu() {
		this.menuCtrl.open();
	}

	goToAnounceParent(item) {
		this.navCtrl.push('AnnoncesPage', { location: item, type: this.type.type.name });
	}

	/**
	 * Cette méthode permet de filtrer les éléments (locations ou tags)
	 * @param elements Array<any>, tableau d'élements
	 */
	filterTaxonomies(elements) {
		let results = [];

		for (let i = 0; i < elements.length; i++) {
			const element = elements[i];
			if (element.count > 0) results.push(element);
		}

		return results;
	}
	displaySearchBar() {
		this.showSearch = true;
	}
	searchCanceled() {
		// console.log('Canceled');
		this.showSearch = false;
	}
	setFilteredItems(ev) {

		if (ev.target.value === undefined || ev == '') {
			this.taxonomy = this.dumpTaxonomy;
			this.max = 10;

			return;
		}

		if (ev.target.value == '') {
			this.taxonomy = this.dumpTaxonomy;
			this.max = 10;
		} else {
			this.txtSearch = ev.target.value;
			this.taxonomy = this.dumpTaxonomy.filter((item) => {
				return item.name.toLowerCase().indexOf(ev.target.value.toLowerCase()) > -1;
			});

			this.max = 10;
		}
	}
}
