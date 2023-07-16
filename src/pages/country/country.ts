import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Country } from '../form-location/form-validations.model';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';


@IonicPage()
@Component({
  selector: 'page-country',
  templateUrl: 'country.html',
})
export class CountryPage {

  max: number = 10;
  dumpPays: any[];
  pays: any[] = [];
  constructor(public vc: ViewController, public navParams: NavParams, private wpServ: WpPersistenceProvider) {
    this.wpServ.getCountries().subscribe(res=>{
      
      this.pays = this.buildPays(res);
      
    },(err)=>{

    });
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad CountryPage');
  }

  /**
   * Cette fonction créer un tableau d'objets de type Country sur la liste des pays
   * @param pays Array<any>, tabbleau liste des pays
   * @returns Array<Country>
   */
  buildPays(pays){

    let countries = [];
    
    for (let i = 0; i < pays.length; i++) {
      var country: any = pays[i], objCountry;
      objCountry = new Country(country.alpha2Code, country.nativeName);
      countries.push(objCountry);
    }

    this.dumpPays = countries;

    return countries;
  }

  onSelected(item){
    this.vc.dismiss(item);
  }

  /**
   * Cette fonction permet de
   * recherche un élément dans la liste des événements
   *
   **/
	setFilteredItems(ev) {

		if (ev.target.value === undefined) {
      this.pays = this.dumpPays;
      this.max = 10;
			return;
		}

		var val = ev.target.value;

		if (val != '' && val.length > 2) {
			this.pays = this.dumpPays.filter(item => {
				let txtNom = item.name;
				return txtNom.toLowerCase().indexOf(val.toLowerCase()) > -1;
			});
		} else if (val == '' || val == undefined) {
			this.pays = this.dumpPays;
			this.max = 10;
    }
    
  }

  //AJout des éléments lorsque l'on scroll vers le
	//bas
	doInfinite(infiniteScroll) {
	
		// let params = { options: { offset: this.offset, max: this.max } };
		this.max += 10;

		infiniteScroll.complete();
	}

}
