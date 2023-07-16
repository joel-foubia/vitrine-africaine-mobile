import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController, PopoverController} from 'ionic-angular';
import { AfProvider } from '../../providers/af/af';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { EmailComposer } from '@ionic-native/email-composer';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the ReportPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name: 'report',
})
@Component({
  selector: 'page-report',
  templateUrl: 'report.html',
})
export class ReportPage {
  type: any;
  segment = "first";
  report: string;
  txtLangue : any;
  aide: any = {};
  sect: any;
  activity =[];
  hieght = [];
  actif: boolean = false;
  credentials: any;
  constructor(
              public navCtrl: NavController, 
              public navParams: NavParams, 
              public vc: ViewController,
              public af: AfProvider,
              public storage: Storage,
              public popCtrl: PopoverController, 
              private emailComposer: EmailComposer, 
              private wpServ: WpPersistenceProvider,
              public translate: TranslateService
            ) {
              this.taille();
    this.type = this.navParams.get('type');

    this.translate.get('report').subscribe((reponse) => {
      this.txtLangue = reponse;
    });
    this.storage.get('wpIonicToken').then((_val)=>{
      this.credentials = JSON.parse(_val);
    });
  }
  back(){
    this.segment = 'first';
    this.actif = false;
  }
  suivant(){
    this.segment = 'second';
    this.actif = true;
  }

  ionViewDidLoad() {
  }
  taille(){
    this.af.tailleAnnonce((_tal)=>{
      this.hieght = _tal;
    });
  }
 
  sendReport(){

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
                  subject: this.aide.prenom + this.aide.name +this.txtLangue.mail_msg + data.email,
                  isHtml: true 
                }
                this.emailComposer.open(email);
            });
          }
        });

    }
  }

  

  segmentChanged() {
		if (this.segment == 'first') {
			setTimeout(() => {
			}, 500);
		} else if (this.segment == 'seconde') {
		} else if (this.segment == 'other') {
		}
	}

  tailleAnnonce(){
    this.af.tailleAnnonce((_val)=>{
    });
  }

  close(){
    this.vc.dismiss();
  }
}
