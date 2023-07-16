import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AfProvider } from '../../providers/af/af';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the PopBannerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-pop-banner',
  templateUrl: 'pop-banner.html',
})
export class PopBannerPage {
  banner = [];
  ban: any;
  tabs = [];
  formTable = [];

  constructor(
                public navCtrl: NavController, 
                public navParams: NavParams,
                public af: AfProvider,
                public vc: ViewController,
                public storage: Storage 
                ) {
                this.af.banner((callback) => {
                this.banner = callback;
                console.log('Banner => ', this.banner);
               });
  }
  setTable(type, data) {
		let newData = JSON.stringify(data);
		this.storage.set(type, newData);
  }

  isTable(type) {
		return this.storage.get(type);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PopBannerPage');
  }
  onChange(bann, event) {

    console.log('event => ', event);
    console.log('event => ', bann);

    if(event){
      this.tabs.push({'nom':bann});
      console.log('tab => ', this.tabs);
    }
   
  }
  
  submit(){
    // console.log(ban);
    this.vc.dismiss(this.tabs);
  }

}
