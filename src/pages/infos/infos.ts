import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-infos',
  templateUrl: 'infos.html',
})
export class InfosPage {

  constructor(public navCtrl: NavController, public navParams: NavParams, public menuCtrl: MenuController) {
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad InfosPage');
  }

  goToNews(){
    this.navCtrl.push("ActualitePage");
  }
  
  goToWebTV(){
    this.navCtrl.push("WebtvPage");
  }

  openLeftMenu(){
    this.menuCtrl.open();
  }

}
