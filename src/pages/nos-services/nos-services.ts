import { Component } from '@angular/core';
import { IonicPage, ViewController } from 'ionic-angular';
import { AfProvider } from '../../providers/af/af';
import { MenuController } from 'ionic-angular/components/app/menu-controller';
import { EmailComposer } from '@ionic-native/email-composer';
import { TranslateService } from '@ngx-translate/core';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the NosServicesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-nos-services',
  templateUrl: 'nos-services.html',
})
export class NosServicesPage {
  company: any = {};
  segment = "first";
  nosService = [];
  txtLangue: any;
  tabs = [];
  services: any;
  actif: boolean = false;
  credentials: any;

  constructor(
    public af: AfProvider,
    public vc: ViewController,
    public storage: Storage,
    public menuCtrl: MenuController,
    public translate: TranslateService,
    private wpServ: WpPersistenceProvider,
    private emailComposer: EmailComposer) {
    this.af.nos_services((_val) => {
      this.nosService = _val;
    });
    this.translate.get('nos_service').subscribe((reponse) => {
      this.txtLangue = reponse;
    });

    this.storage.get('wpIonicToken').then((_val)=>{
      this.credentials = JSON.parse(_val);
    });
  }

  ionViewDidLoad() {
  }

  close() {
    this.vc.dismiss();
  }

  onChange(bann, event) {
    if (event) {
      this.services =  '';
      this.tabs.push({ 'nom': bann });
      for (let i = 0; i < this.tabs.length; i++) {
        this.services += "<li>"+this.tabs[i].nom + "</li>";
      }
    }

  }
  back(){
    this.segment = 'first';
    this.actif = false;
  }
  next() {
    this.segment = 'second';
    this.actif = true;
  }
  segmentChanged() {
    if (this.segment == 'first') {
      setTimeout(() => {
      }, 500);
    } else if (this.segment == 'second') {
    } else if (this.segment == 'other') {
    }
  }
  submit() {
    if (!this.company == undefined || this.company == '') {
      this.wpServ.showMsgWithButton(this.txtLangue.empty_form, 'top');
    } else if (!this.company.nom || this.company.nom == '') {
      this.wpServ.showMsgWithButton(this.txtLangue.empty_name, 'top');
    } else if (!this.company.prenom || this.company.prenom == '') {
      this.wpServ.showMsgWithButton(this.txtLangue.empty_prenom, 'top');
    } else if (!this.company.telephone || this.company.telephone == '') {
      this.wpServ.showMsgWithButton(this.txtLangue.empty_tel, 'top');
    } else if (!this.company.email || this.company.email == '') {
      this.wpServ.showMsgWithButton(this.txtLangue.empty_email, 'top');
    } else {
      this.emailComposer.isAvailable().then((_val: boolean) => {
        if (_val) {
          this.af.getInfosAbout((data) => {
            let email = {
              to: data.email,
              body: this.company.message + '<br > <b>'+ this.txtLangue.head_msg +
              '</b> <br > '+
              '<ul>'+
              this.services +
              '</ul>',
              subject: this.company.prenom + this.company.nom + this.txtLangue.mail_msg,
              isHtml: true
            }
            this.emailComposer.open(email);
          }
        );
        }
      });

    }
  }
  openLeftMenu() {
    this.menuCtrl.open();
  }

}
