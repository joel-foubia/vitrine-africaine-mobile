import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AfProvider } from '../../providers/af/af';
import { EmailComposer } from '@ionic-native/email-composer';



@IonicPage()
@Component({
  selector: 'page-raport',
  templateUrl: 'raport.html',
})
export class RaportPage {
  type: any;
  message = {
    report : ''
  };
  aide ={
    name : '',
    company : '',
    phonenumber : '',
    message : ''
  }
  test: any;

  constructor(
              public navCtrl: NavController, 
              public navParams: NavParams,
              private vc: ViewController,
              private emailComposer: EmailComposer,
              private af: AfProvider 
              ) {

      this.type = this.navParams.get('type');           
  }

  ionViewDidLoad() {
  }
  closeRecharge() {
    this.vc.dismiss(); 
  }

   sendMessage(){
    this.af.getInfosAbout((_val)=>{
      var data : any = _val;
      if(this.type.label == "Report"){
          
          let email = {
            to: data.email,
            subject: this.type.label,
            body: this.message.report,
            isHtml: true
          };
          this.emailComposer.open(email);
        }
        this.vc.dismiss(); 
      });
}

}
