import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AppRate } from '@ionic-native/app-rate';
import { TranslateService } from '@ngx-translate/core';
import { AfProvider } from '../../providers/af/af';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { TabsPage } from '../tabs/tabs';


@IonicPage()
@Component({
	selector: 'page-about',
	templateUrl: 'about.html'
})
export class AboutPage {
  
  defaultImg: string;
	// pending: any;
	about:any;
	test: any;
  android: any;

	constructor(
		
		public navCtrl: NavController,
		public navParams: NavParams,
		public appRate: AppRate,
		public translate: TranslateService,
		public af:AfProvider,
		public iab : InAppBrowser
	) {
		 
    this.defaultImg = "assets/images/team.jpg";  

    this.af.getInfosAbout((_val)=>{
      this.about = _val;
      this.android = this.about.playstore;
        // console.log('Value =>', this.about);
        // console.log('logo =>', this.about.playstore);
      });

} 

  
  ionViewDidLoad() {
    // console.log('ionViewDidLoad AboutPage');
  }
  
  facebook(){
    // console.log(this.test.facebookPage);
     this.iab.create(this.about.facebookPage);
  }
  
  instagram(){
    // console.log(this.test.instagramPage);
   this.iab.create(this.about.instagramPage);
  }
  twitter(){
     this.iab.create(this.about.twitterPage);
  }

  conditions(url){
    this.iab.create(url);
  }


  /**
   * Cette fonction ouvre la boite de dialogue
   * afin que l'utilisateur puisse évaluer l'application
   * @param android string, le lien vers le Play Store
   * @param ios string, le lien vers l'App Store
   * @param objEvaluate any, l'objet JSON
   */
  //arriere plan gray light
  doEvaluate(ios?:any){
    

    this.appRate.preferences = {
      usesUntilPrompt: 3,
      simpleMode: true,
      // useLanguage: this.translate.getDefaultLang(),
      displayAppName:"VIRTRINE AFRICAINE",
      storeAppURL: { 
       //ios: '<app_id>',
       android: 'market://details?id='+this.about.playstore
      }
    };

    this.appRate.preferences.useLanguage = this.translate.getDefaultLang();
    this.appRate.promptForRating(true);
  }

  showMain(){
    let params = { tabIndex: 0, page: TabsPage };
    this.navCtrl.setRoot(TabsPage, params);
  }
  
		
}
