import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, MenuController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { LoginProvider } from '../../providers/login/login';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { Storage } from '@ionic/storage';
import { TabsPage } from '../tabs/tabs';


@IonicPage()
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html',
})
export class SettingPage {

  current_distance: any;
  update = true;
  categories = {
    cat : ''
  };
  txtLangue: any;
  current_lang: string;
  objLoader: boolean;
  allcategories = [];
  categorie: any[];

  constructor(public navCtrl: NavController, public navParams: NavParams, public translate: TranslateService, private lgServ: LoginProvider, private wpServ: WpPersistenceProvider, public storage: Storage, public evT: Events, public menuCtrl: MenuController) {
    
    this.current_lang = this.translate.getDefaultLang();	
		this.translate.get('form').subscribe((reponse) => {
			this.txtLangue = reponse;
    });

    this.getCats();
    
  }

  ionViewDidLoad() {
    
    this.storage.get('_ona_distance').then(res=>{
      if(res)  this.current_distance = res+'';
      else this.current_distance = '20';
    });

    this.storage.get('preferedLangauge').then(res=>{
      if(res)
        this.current_lang = res;
      else
        this.current_lang = "fr";

      // console.log(this.current_lang);

    });
  }

  getCats() {

			this.lgServ.isTable('_ona_pointfinderltypes').then((data) => {

				this.objLoader = false;
        if(data){
          // var cat = JSON.parse(data);
          this.allcategories = JSON.parse(data);
        }
			
			});
		
	}

  
  //Active ou désactive les mises à jour automatique
	notify() {
		if (this.update) {
			this.lgServ.desactiveSync(true);
			this.wpServ.showMsgWithButton(this.txtLangue.notif_sync, 'top');
		} else {
			this.lgServ.desactiveSync(false);
			this.wpServ.showMsgWithButton(this.txtLangue.help_sync, 'top');
		}
  }

  onSelectChange(event){
    // console.log('event => ', event);
    if(event){
      this.storage.set('cat_notif', event);
      this.wpServ.showMsgWithButton('Vous serez dorénavant notifier sur cette catégorie', 'top');
    }
  }
  
  //Cette fonction permet de changer la langue de l'utilisateur
	changeLangue(ev) {
		
		// localStorage.setItem('preferedLangauge', this.current_lang);
		this.storage.set('preferedLangauge', this.current_lang);
		this.evT.publish('lang:done', this.current_lang);
    this.translate.use(ev);
    // this.translate.setDefaultLang(ev);
  }
  
  openLeftMenu() {
		this.menuCtrl.open();
	}

	changeValue(event, type) {
		switch (type) {
			case 'lang': {
				this.changeLangue(event);
				break;
			}
			case 'dist': {
				this.changeDistance(event);
				break;
			}
		}
  }
  
  /**
   * Cette méthode permet de définir la distance 
   * choisit par l'utilisateur
   * @param dist string
   */
  changeDistance(dist){
    // console.log(dist);
    this.storage.set('_ona_distance', parseInt(dist));
  }

  showMain(){
    let params = { tabIndex: 0, page: TabsPage };
    this.navCtrl.setRoot(TabsPage, params);
  }

}
