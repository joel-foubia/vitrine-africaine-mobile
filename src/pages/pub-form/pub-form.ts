import { Component } from '@angular/core';
import { IonicPage} from 'ionic-angular';
import { AfProvider } from '../../providers/af/af';
import { TranslateService } from '@ngx-translate/core';
import { EmailComposer } from '@ionic-native/email-composer';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { MenuController } from 'ionic-angular/components/app/menu-controller';
import { Storage } from '@ionic/storage';


@IonicPage()
@Component({
  selector: 'page-pub-form',
  templateUrl: 'pub-form.html',
})
export class PubFormPage {
  company: any = {};
  banner = [];
  txtLangue: any;
  segment = "first";
  credentials: any;
  constructor(
              public af: AfProvider,
              public storage: Storage,
              public menuCtrl: MenuController,
              private emailComposer: EmailComposer,
              private wpServ: WpPersistenceProvider,
              public translate: TranslateService
              ) {
                this.translate.get('pub_form').subscribe((reponse) => {
                  this.txtLangue = reponse;
                });
                this.storage.get('wpIonicToken').then((_val)=>{
                  this.credentials = JSON.parse(_val);
                });
  }

  ionViewDidLoad() {
  }
  
  openLeftMenu() {
		this.menuCtrl.open();
	}
        submit(){

          // console.log('data => ', this.company);
          if(!this.company == undefined || this.company == ''){
            this.wpServ.showMsgWithButton(this.txtLangue.empty_form,'top');
          }else if(!this.company.nom || this.company.nom == ''){
            this.wpServ.showMsgWithButton(this.txtLangue.empty_name,'top');
          }else if(!this.company.prenom || this.company.prenom == ''){
            this.wpServ.showMsgWithButton(this.txtLangue.empty_prenom,'top');
          }else if(!this.company.telephone || this.company.telephone == ''){
            this.wpServ.showMsgWithButton(this.txtLangue.empty_tel,'top');
          }else if(!this.company.email || this.company.email == ''){
            this.wpServ.showMsgWithButton(this.txtLangue.empty_email,'top');
          }else{
              this.emailComposer.isAvailable().then((_val : boolean)=>{
                if(_val){
                  this.af.getInfosAbout((data)=>{
                      let email = {
                        to : data.email,
                        body: this.company.message,
                        subject: this.company.prenom + this.company.nom +this.txtLangue.mail_msg + data.email,
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
      
}
