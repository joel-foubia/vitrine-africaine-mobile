import { Component } from '@angular/core';
import { IonicPage, NavParams, MenuController } from 'ionic-angular';
import { SocialSharing } from '@ionic-native/social-sharing';
import { AfProvider } from '../../providers/af/af';


@IonicPage()
@Component({
  selector: 'page-actu-details',
  templateUrl: 'actu-details.html',
})
export class ActuDetailsPage {
  details: any;
  text: any;
  title: string;

  constructor(
    public navParams: NavParams,
    public menuCtrl: MenuController,
    private socialSharing: SocialSharing,
    public afServ: AfProvider
  ) {
    this.details = this.navParams.get('details');
    var containt ="";
    containt = this.details.content.rendered;

    this.text = containt.replace("[vc_row widthopt=”” fixedbg=”” footerrow=””][vc_column][vc_row_inner][vc_column_inner width=”1/4″][vc_single_image image=”4814″ img_size=”medium”][/vc_column_inner][vc_column_inner width=”3/4″][vc_column_text]", " ");
  
  }

  ionViewDidLoad() {
  }
  openLeftMenu(){
    this.menuCtrl.open();
  }
  share(){
    this.afServ.retrieveEmail((_val)=>{
      let email = _val.email;
      this.socialSharing.shareViaEmail('Partage d\'article', 'Partage', [email]).then((_val)=>{
  
      }).catch((err)=>{
      });
    });
  }

}
