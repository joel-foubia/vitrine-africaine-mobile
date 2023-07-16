import { Component } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';


@IonicPage()
@Component({
  selector: 'page-confirm-payconiq',
  templateUrl: 'confirm-payconiq.html',
})
export class ConfirmPayconiqPage {

  commande: any;
  lang: string;
  urlTransaction: any;
  objOrder: any;
  total = 0;
  
  constructor(public vc: ViewController, public navParams: NavParams, public translate: TranslateService) {
    this.lang = this.translate.getDefaultLang();
    this.objOrder = this.navParams.get('params');
    this.commande = this.objOrder.order; 
    this.total = this.totalAmount();

    if(this.objOrder.env!==undefined)
      this.urlTransaction = this.buildUrl();
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad ConfirmPayconiqPage');
  }


  buildUrl(): string{
    
    let url = '';
    let env = this.objOrder.env;
    let payconiq = this.objOrder.payconiq.payconiq;
    
    if(env=='android'){

        if(payconiq.statut=='dev')
          url+= 'intent://'+payconiq.sandbox+this.objOrder.idTrans+"#Intent;scheme=payconiq;package=com.payconiq.customers.external;end";
        else
          url+= payconiq.prod+this.objOrder.idTrans+"#Intent;scheme=payconiq;package=com.payconiq.customers;end";
        
    }else{
        
        if(payconiq.statut=='dev')
          url+= 'payconiq.ext://'+payconiq.sandbox+this.objOrder.idTrans+"?returnUrl="+payconiq.returnURL;
        else
          url+= payconiq.prod+this.objOrder.idTrans+"?returnUrl="+payconiq.returnURL;
    }
    

    return url;
  }

  validPayment(){
    this.vc.dismiss({total: this.total, currency: this.objOrder.currency});
  }

  /**
   * Cette méthode permet de calculer
   * le montant total à débourser
   * 
   * @returns number
   */
  totalAmount(): number{

    let somme = 0;
    
    for (let j = 0; j < this.commande.length; j++) {
      let element = this.commande[j].cost*this.commande[j].quantity;
      somme += element;
    }

    // console.log(somme);
    return somme;
  }

  close(){
    this.vc.dismiss();
  }

}
