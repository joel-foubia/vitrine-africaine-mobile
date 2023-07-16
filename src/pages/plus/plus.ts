import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
// import { TabsPage } from '../tabs/tabs';
// import { AboutPage } from '../about/about';
import { TranslateService } from '@ngx-translate/core';


@IonicPage()
@Component({
  selector: 'page-plus',
  templateUrl: 'plus.html',
})
export class PlusPage {

  public otherMenus : any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public translate: TranslateService) {
  	this.chargerMenus();
  }

  ionViewDidLoad() {}
 
  //Cette fonction permet de charger
  //les autres menus
  chargerMenus(){

    this.translate.get('menu').subscribe((res) => {
			// console.log(res);
			this.otherMenus = this.setModulesOfUser(res);
			
    });
    
  }

  //On récupère la référence pour
  // afficher la page correspondante
  showPageItem(newItem){
  	
  	if(newItem.index!=undefined){
      this.navCtrl.parent.select(newItem.index);
    }else{
      if(newItem.name == 'DonnezAvisPage'){
        this.navCtrl.push(newItem.name, {action: newItem.action});
      }
      else{
        
        this.navCtrl.push(newItem.name, {type: newItem.type});
      }
    }

  }

  /**
	 * Cette fonction permet de définir les menus qui devront
	 * figurer sur le menu gauche de l'application
	 * @param leMenu any, les traductions
	 */
	private setModulesOfUser(leMenu) {
		let allMenus = [
			{ title: leMenu.guideafricain, name: 'DonnezAvisPage', image: 'assets/images/africa.png', action: 'guide' },
			{ title: leMenu.nearme, name: 'NearbyListPage', image: 'assets/images/nearme.png' },
			{ title: leMenu.meetings, name: 'MesRdvsPage', image: 'assets/images/timer.png' },
			{ title: leMenu.infos, name: 'InfosPage', image: 'assets/images/infos.png' },
			{ title: leMenu.avis, name: 'DonnezAvisPage', image: 'assets/images/rating.png', action: 'avis' },
      { title: leMenu.company, name: 'CompanyPage', image: 'assets/images/company.png' },
      { title: leMenu.location, name: 'TaxonomiesListPage', image: 'assets/images/map-location.png', type: { name: 'location' }},
			{ title: leMenu.tag, name: 'TaxonomiesListPage', image: 'assets/images/price-tag.png', type: { name: 'tag' }},
			
		];

		return allMenus;
	}

  //Fermer le formulaire
  close(){
  	this.navCtrl.pop();
  }

}
