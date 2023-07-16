import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { EmailComposer } from '@ionic-native/email-composer';
import { AfProvider } from '../../providers/af/af';
import { TranslateService } from '@ngx-translate/core';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { Storage } from '@ionic/storage';


@IonicPage()
@Component({
  selector: 'page-recevoir-papier',
  templateUrl: 'recevoir-papier.html',
})
export class RecevoirPapierPage {
  aide : any = {};
  segment = 'first';
  txtLangue : any;
  actif: boolean = false;
  credentials: any;

  constructor(
              public navCtrl: NavController, 
              public vc: ViewController,
              public navParams: NavParams,
              public af: AfProvider,
              public storage: Storage,
              private wpServ: WpPersistenceProvider,
              public translate: TranslateService,
              private emailComposer: EmailComposer) {
                this.translate.get('report').subscribe((reponse) => {
                  this.txtLangue = reponse;
                });

                this.storage.get('wpIonicToken').then((_val)=>{
                  this.credentials = JSON.parse(_val);
                });
  }

  ionViewDidLoad() {
  }

  segmentChanged() {
		if (this.segment == 'first') {
			setTimeout(() => {
			}, 500);
		} else if (this.segment == 'seconde') {
		} else if (this.segment == 'other') {
		}
  }
  back(){
    this.segment = 'first';
    this.actif = false;
  }
  next(){
    this.segment = 'second'; 
    this.actif = true;
   }
  
  submit(){
    if(!this.aide == undefined || this.aide == ''){
      this.wpServ.showMsgWithButton(this.txtLangue.empty_form,'top');
    }else if(!this.aide.name || this.aide.name == ''){
      this.wpServ.showMsgWithButton(this.txtLangue.empty_name,'top');
    }else if(!this.aide.prenom || this.aide.prenom == ''){
      this.wpServ.showMsgWithButton(this.txtLangue.empty_prenom,'top');
    }else if(!this.aide.phonenumber || this.aide.phonenumber == ''){
      this.wpServ.showMsgWithButton(this.txtLangue.empty_tel,'top');
    }else if(!this.aide.email || this.aide.email == ''){
      this.wpServ.showMsgWithButton(this.txtLangue.empty_email,'top');
    }else{
        this.emailComposer.isAvailable().then((_val : boolean)=>{
          if(_val){
            this.af.getInfosAbout((data)=>{
                let email = {
                  to : data.email,
                  body: this.aide.message,
                  subject: this.aide.prenom + this.aide.name +this.txtLangue.mail_msg_2 + data.email,
                  isHtml: true 
                }
                this.emailComposer.open(email);
            });
          }
        });

    }

  }

  close(){
    this.vc.dismiss();
  }

}
