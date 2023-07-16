import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams } from 'ionic-angular';



@IonicPage()
@Component({
  selector: 'page-pop-event',
  templateUrl: 'pop-event.html',
})
export class PopEventPage {

  defaultImg: string;
  lang: any;
  objEvent: any;

  constructor(public vc: ViewController, public navParams: NavParams) {
    this.defaultImg = 'assets/images/logo.png';
    this.lang = this.navParams.get('lang');
    this.objEvent = this.navParams.get('objet');
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad PopEventPage');
  }

  openDetails(){
    this.vc.dismiss(true);
  }

}
