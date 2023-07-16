import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';

/**
 * Generated class for the LesExpertsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-les-experts',
  templateUrl: 'les-experts.html',
})
export class LesExpertsPage {
  finalObject = [];
  segment: any;
  objLoader = true;

  constructor(
              public navCtrl: NavController,
              public navParams: NavParams,
              public wp_provider : WpPersistenceProvider,
              public loadingCtrl: LoadingController) {
                this.getCategory();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LesExpertsPage');
  }

  details(data) {
    this.navCtrl.push('ActuDetailsPage', { details: data });
    // console.log('Data =>', data);
  }
  getCategory(){
    return new Promise((resolve, reject)=>{
      this.wp_provider.retrievePost().then((_val : any)=>{
        this.objLoader = false;
        this.finalObject = _val;
        console.log('object => ', this.finalObject);
      });
    });
  }
  

}
