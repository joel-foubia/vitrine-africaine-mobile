import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AfProvider } from '../../providers/af/af';
import { TabsPage } from '../tabs/tabs';


@IonicPage()
@Component({
  selector: 'page-aide-et-assistance',
  templateUrl: 'aide-et-assistance.html',
})
export class AideEtAssistancePage {

  constructor(
              public navCtrl: NavController, 
              public navParams: NavParams,
              public modalCtrl: ModalController,
              public af: AfProvider
            ) {
  }

  ionViewDidLoad() {
  }
  openReport() {

    let addModal = this.modalCtrl.create('RaportPage',
      {
        'type': {
          'label': 'Report'
        }
      });
    addModal.onDidDismiss((data) => {



    });

    addModal.present();
  }

  openAssistance(){
    let assistancModal = this.modalCtrl.create('AssistPage',
    {
      'type': {
        'label': 'assistance'
      }
    });
    assistancModal.onDidDismiss((data) => {
  });

  assistancModal.present();
  }
  openFaq(){
   
    let faqModal = this.modalCtrl.create('FaqPage',
        {
          'type': {
            'label': 'Report'
          }
        });
        faqModal.onDidDismiss((data) => {
      });
  
      faqModal.present();
  }

  showMain(){
    let params = { tabIndex: 0, page: TabsPage };
    this.navCtrl.setRoot(TabsPage, params);
  }

}
