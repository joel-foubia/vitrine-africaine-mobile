import { EmailComposer } from '@ionic-native/email-composer';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { AfProvider } from '../../providers/af/af';
import { Storage } from '@ionic/storage';


@IonicPage()
@Component({
  selector: 'page-assist',
  templateUrl: 'assist.html',
})
export class AssistPage {
  type: any;
	test: any;
	aide = {
		name: '',
		company: '',
		phonenumber: '',
		message: ''
	};

  constructor(
              public navCtrl: NavController, 
              public navParams: NavParams,
              private emailComposer: EmailComposer,
              private vc: ViewController,
              public storage: Storage,
              public af: AfProvider,
              ) {
              this.type = this.navParams.get('type');
              
  }

  ionViewDidLoad() {
  }

  sendReport() {
      this.af.getInfosAbout((_val)=>{
        var data : any = _val;
        if (this.type.label == 'assistance') {
          let email = {
            to: data.email,
            subject: this.type.label,
            body: this.aide.message,
            isHtml: true
          };
          this.emailComposer.open(email);
        }
        this.vc.dismiss();
      });
  }
  closeAssist() {
		this.vc.dismiss();
	}

}
