import { Component } from '@angular/core';
import { IonicPage, ViewController, NavParams } from 'ionic-angular';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { TranslateService } from '@ngx-translate/core';


@IonicPage()
@Component({
  selector: 'page-form-payment',
  templateUrl: 'form-payment.html',
})
export class FormPaymentPage {

  txtLang: any;
  public infos : any = {};
  constructor(public vc: ViewController, public navParams: NavParams, private wpServ: WpPersistenceProvider, public translate: TranslateService) {
    this.translate.get("events").subscribe(res=>{
      this.txtLang = res;
    });  
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad FormPaymentPage');
  }

  onAdd(){
    
    if(this.infos.user_display_name===undefined && this.infos.user_email===undefined)
      this.wpServ.showMsgWithButton(this.txtLang.f_required,"top","toast-error");
    else if (this.infos.user_email===undefined)
      this.wpServ.showMsgWithButton(this.txtLang.f_email,"top","toast-info");
    else if(this.infos.user_display_name!==undefined && this.infos.user_email!==undefined)
      this.vc.dismiss(this.infos);
  }

  close(){
    this.vc.dismiss();
  }

}
