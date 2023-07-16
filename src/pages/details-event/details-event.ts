import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ModalController, AlertController, MenuController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { LoginProvider } from '../../providers/login/login';
import { PaymentProvider } from '../../providers/payment/payment';
import { ApiConfig } from '../../config';
import { AfProvider } from '../../providers/af/af';
import { SyncOptions } from '../../config';
import swal from 'sweetalert';
// import { ListEventsPage } from '../list-events/list-events';
// import { counterRangeValidator } from '../../components/counter-input/counter-input';


@IonicPage()
@Component({
  selector: 'page-details-event',
  templateUrl: 'details-event.html',
})
export class DetailsEventPage {

  txtPop: any;
  checkSync: number;
  totalProduits: number = 0;
  user_id: string;
  ticket_api_key: any;
  defaultImg: string;
  configs: {};
  user: any;
  gateweways = [];
  txtLangue: any;
  ticket = [];
  lang: string;
  qtyTicket = 0;
  objEvent: any;
  public objLoader = true;

  // public mapTypeControl = true;
  // public streetViewControl = true;
  // public zoom = 17;

  constructor(public navCtrl: NavController, public navParams: NavParams, public translate: TranslateService, private wpServ: WpPersistenceProvider, private lgServ: LoginProvider, public actionCtrl: ActionSheetController, private paymentServ: PaymentProvider, private afServ: AfProvider, public modalCtrl: ModalController, public alertCtrl: AlertController, public menuCtrl: MenuController) {
    
    this.lang = this.translate.getDefaultLang();
    this.objEvent = this.navParams.get('objet');
    this.defaultImg ="assets/images/logo.png";
    // console.log(this.objEvent);

    this.getConfigPayments();
    this.translate.get(['events','ticket']).subscribe(res=>{
      this.txtLangue = res.events;
      this.txtPop = res.ticket;
    });

    this.checkSync = setInterval(() => this.activateSyn(), SyncOptions.modelSyncTimer);
    // this.syncOffOnline();
    // this.getListGateways();
  }

  ionViewDidLoad() {
    
    //On récupère le User
    this.lgServ.isTable('wpIonicToken').then((user) => {
      if (user){
        this.user = JSON.parse(user);
        this.user_id = this.user.user_id+'';
        // console.log(this.user);
      } 
    });

    this.syncOffOnline();
    this.getListGateways();

  }

  syncOffOnline() {
    
		this.lgServ.checkStatus('_ona_tickets').then((res) => {
			if (res == 'i') {
				//Première utilisation sans connexion
				this.objLoader =  false;
			}else if (res == 's') {
				// console.log('Reading from Storage ticket');
				this.lgServ.isTable('_ona_tickets').then(_res=>{
          if(_res){
            // console.log(JSON.parse(_res));
            this.ticket = this.getTicketOfEvent(JSON.parse(_res));
            this.objLoader = false;
          }
        });

			}
      
      //SYnc de la liste depuis le serveur
			if (res == 'w' || res == 'rw') {
				// console.log('Reading from server listing');
				this.getFromServer();
      }
      
    });
    
  }

    //Cette fonction permet d'activer la synchronisation
activateSyn() {
  this.lgServ.connChange('_ona_tickets').then((res) => {
    if (res) {
      this.backgroundSync();
    } else {
      clearInterval(this.checkSync);
    }
  });
}

backgroundSync() {
  this.wpServ.pageBgSyncTribe('tickets');
}

ionViewDidLeave() {
  clearInterval(this.checkSync);
}

  /**
   * Cette fonction permet de récupérer la liste
   * des moyens de paiement
   */
  getListGateways(){

    this.lgServ.isTable('_ona_gateways').then(res=>{
        if(res){
          
          let gateways = JSON.parse(res);
          // console.log(gateways);
          this.gateweways = gateways;
        }else{
          
          this.paymentServ.getProductsWC(ApiConfig.url_gateways).then((data: any)=>{
            
            this.gateweways = data;
            this.lgServ.setTable('_ona_gateways', data);
            this.lgServ.setSync('_ona_gateways_date');

          }).catch(error=>{

          });

        }
    })
  }

  /**
   * Cette fontion permet de récupérer la liste
   * des tickets correspondants à un événement
   * @param tickets Array<any>, tableau des tickets
   * @returns Array<any>, tableau des tickets liées à l'événement
   */
  getTicketOfEvent(tickets: any){
    
    let result = [];
    
    for (let j = 0; j < tickets.length; j++) {
      if(tickets[j].post_id==this.objEvent.agenda.id){
        result.push(tickets[j]);
      } 
    }

    return result;
  }

  /**
	 * Method to get current models data, save in storage and display in current view
	 */
	getFromServer() {

		// this.objLoader = true;
		this.wpServ.getWpData('tickets', 100, 1).then((res: any) => {

      // console.log(res);
      this.ticket = this.getTicketOfEvent(res.tickets);
			this.lgServ.setTable('_ona_tickets', res.tickets);
      this.lgServ.setSync('_ona_tickets_date');
      this.objLoader = false;
      
		}).catch(err=>{
      // console.log(err);
    });

  }

  /**
   * Cette fonction permet de lancer un appel
   * @param phonenumber string
   */
  appeler(phonenumber){
    this.wpServ.doCall(phonenumber, "");
  }

  /**
   * Cette fonction permet d'envoyer un mail
   * @param email string
   */
  sendMail(email){
    this.wpServ.doEmail(email, "");
  }

  /**
   * Cette fonction permet d'ouvrir le site web
   * @param url string
   */
  openBrowser(url){
    this.wpServ.doWebsite(url, "");
  }

  /**
   * Cette fontion permet d'afficher la liste 
   * des modes de paiements
   */
  commander(){
    // console.log(this.ticket);
    // this.buildInterested();
    let degree = this.selectApropriateAction();
    // console.log(degree);

    if(degree==0){
      this.wpServ.showMsgWithButton(this.txtLangue.txt_interest, "top", "toast-info");

    }else if(degree==1){
      
        let currentMode = this.findMode(this.gateweways, "cod");
        // console.log("gateway=>", currentMode);
        
        let produits = this.buildListProduits();
        // console.log("produits =>", produits);
        
        let options = {
          
          description: this.objEvent.title,
          image: "assets/images/free.png",
          currency: 'EUR'
        };

      this.showLoginPage("cod", produits, currentMode, options);

    }else if(degree==2 || degree==3){

      let menu_actionSheet = this.actionCtrl.create({
        title: this.txtLangue.mode,
        cssClass: 'custom-action-sheetEvent',
        buttons: this.getListButtons()
      });
  
      menu_actionSheet.present();

    }

  }

/**
 * Cette méthode permet de vérifier les
 * choix de l'utilisateur et de les valider en
 * fonction
 * @returns Array<any>
 */
  private buildInterested(): Array<any>{
    
    let result = [];

    for (let j = 0; j < this.ticket.length; j++) {
      const element = this.ticket[j];
      if(element.qtyTicket===undefined && (element.cost_details.values[0]=="0")){
        result.push({type:'free', item: element, ok: false});

      }else if((element.qtyTicket!==undefined && element.qtyTicket!=0) && element.cost_details.values[0]=="0"){
        result.push({type:'free', item: element, ok: true});
    
      }else if(element.qtyTicket===undefined && element.cost_details.values[0]!="0"){
        result.push({type:'paid', item: element, ok: false});
      
      }else if((element.qtyTicket!==undefined && element.qtyTicket!=0) && element.cost_details.values[0]!="0"){
        result.push({type:'paid', item: element, ok: true});
      }
    }

    // console.log(result);
    return result;
  }

  /**
   * Cette méthode permet de définir le type d'action à
   * appliquer en fonction 
   */
  private selectApropriateAction(): number{

    let tabs = this.buildInterested();
    let trouve = 0;

    for (let k = 0; k < tabs.length; k++) {
      
      if(!tabs[k].ok && tabs[k].type=="free") 
        trouve = trouve + 0;  
      else if(!tabs[k].ok && tabs[k].type=="paid") 
        trouve = trouve + 0;  
      else if(tabs[k].ok && tabs[k].type=="free") 
        trouve = trouve + 1;  
      else if(tabs[k].ok && tabs[k].type=="paid") 
        trouve = trouve + 2;  
    }

    return trouve;
  }



  /**
   * Cette fontion va ouvrir la vue Maps permettant
   * à l'utilisateur de s'y rendre aisement
   */
  getToLocation(){

    let coords = [];
    if(this.objEvent.agenda.venue.geo_lat!==undefined && this.objEvent.agenda.venue.geo_lng!==undefined){

      coords.push(this.objEvent.agenda.venue.geo_lat);
      coords.push(this.objEvent.agenda.venue.geo_lng);
  
      this.lgServ.navigateToArticle(coords);
      
    }

  }


  /**
   * Cette fonction permet de définir la liste
   * des modes de paiements
   */
  private getListButtons(){

    let tab = [];
		let mymenus = [
      {id: 1, titre: this.txtLangue.paypal, css:'btn-paypal', slug: 'paypal', image:"assets/images/paypal-credit-card.jpg"},
      {id: 2, titre: this.txtLangue.payconiq, css:'btn-payconiq', slug: 'payconiq', image:"assets/images/payconiq_large.png"},
    ];

		for (let i = 0; i < mymenus.length; i++) {
						
			tab.push({
				text: mymenus[i].titre,
				cssClass: mymenus[i].css,
				handler: () => {

				  let currentMode = this.findMode(this.gateweways, mymenus[i].slug);
				  // console.log("gateway=>", currentMode);
				  let produits = this.buildListProduits();
				  // console.log("produits =>", produits);
				  // console.log("configs =>", this.configs);
				  
				  //Vérifier que les paramètres de config sont disponible
				  if(this.configs && this.user && currentMode){

            this.configs["image"] = mymenus[i].image;
            this.paymentServ.selectPayment(mymenus[i].slug, this.configs, produits, this.user, currentMode);

				  }else if(!this.user && currentMode){
            this.configs["image"] = mymenus[i].image;
            this.showLoginPage(mymenus[i].slug, produits, currentMode);
					
				  }else{
					  this.wpServ.showMsgWithButton(this.txtLangue.txt_purchase, "top", "toast-info");
				  }

				}
        
			});
			
		} 

		return tab;
  }

  /**
   * Cette méthode permet de récupérer une passerelle
   * spécifique
   * 
   * @param gateways Array<any>
   * @param slug string
   */
  private findMode(gateways: Array<any>, slug): any{
    for (let j = 0; j < gateways.length; j++) {
      if(gateways[j].id==slug) 
        return gateways[j];
    }

    return null;
  }

  /**
   * Cette fonction permet de récupérer les paramètres
   * de configuration 
   */
  private getConfigPayments(){
    
    this.afServ.retrievepaypalCredits((res)=>{
        // console.log(res);
      this.configs = {
            paypal: {
              prod: res.prod,
              sandbox: res.sandbox,
              statut: res.statut
            },
            payconiq: res.payconiq,
            description: this.objEvent.title,
            currency: 'EUR'
      };

      this.ticket_api_key = res.ticket_api_key;

    });

  }


  /**
   * @description Cette méthode permet de construire
   * la liste des produits
   *  
   * @returns Array<any>
   */
  private buildListProduits(): Array<any>{
    let result = [];
    
    for (let i = 0; i < this.ticket.length; i++) {
      const element = this.ticket[i];
      if(element.qtyTicket!==undefined){

        result.push({
          id: element.id,
          quantity: parseInt(element.qtyTicket),
          title: element.title,
          cost: parseFloat(element.cost_details.values[0])
        });
      }
    }

    return result;
  }

    //On affiche le login dans le modal
    showLoginPage(slug, produits, mode, options?: any){

      let params = {'provider':'DetailsEventPage'};
      let addModal = this.modalCtrl.create('FormPaymentPage', params);
  
      addModal.onDidDismiss((data) => {
  
        if(data){
          if(options!==undefined)
            this.paymentServ.startFreeOrder(options, produits, data, mode);
          else
            this.paymentServ.selectPayment(slug, this.configs, produits, data, mode);
        }
        
      });
  
      addModal.present();
    }

    //Afficher la vue Attendees
    showAttendees(){
      this.navCtrl.push('AttendeesPage', {'myEvent': this.objEvent.agenda, 'api_key': this.ticket_api_key});
    }

    /**
     * Cette méthode permet de vérifier
     * si un ticket est valide
     */
    checkTickets(){
      
      this.paymentServ.checkTicket(this.objEvent.agenda.id, this.ticket_api_key).then((res: any)=>{
        // console.log(res);
        swal({
          title: this.txtPop.validation,
          text: res.msg,
          icon: "success"
        });

      }).catch(err=>{
        // console.log(err);
        this.wpServ.showMsgWithButton(this.txtPop.internet, "top", 'toast-info');
      });

    }

    /**
   * Cette méthode permet de calculer
   * le montant total à débourser
   * 
   * @returns number
   */
  totalAmount(){

    let somme = 0;
    // console.log(this.ticket);
    for (let j = 0; j < this.ticket.length; j++) {
      if(this.ticket[j].qtyTicket!==undefined){

        let element = parseFloat(this.ticket[j].cost_details.values[0])*parseInt(this.ticket[j].qtyTicket);
        somme += element;
      }
    }

    // console.log(somme);
    this.totalProduits = somme;
    
  }

  openLeftMenu(){
    this.menuCtrl.open();
  }

  //modifier un événement
  edit(){

    let params = {'modif':true, 'event':this.objEvent.agenda};
    let addModal = this.modalCtrl.create('FormEventPage', params);

    addModal.onDidDismiss((data) => {

      if(data){
        
			//  console.log(data);
			 let toSend = this.lgServ.buildEventToServer(data, this.user);
       this.addToServer(toSend);
      
       this.wpServ.updateReview("events", data);
       this.wpServ.showMsgWithButton(this.txtLangue.txt_added, "bottom", "toast-info");
			 
      }
      
    });

    addModal.present();
  }

  /**
	 * Cette méthode permet d'envoyer une
	 * requête 
	 * 
	 * @param data any, évènement à insérer
	 */
	addToServer(data){

    // this.persistence.syncCreateObjet(this.model, data);

    this.wpServ.createDataToServer("events", data, 'tribe/events/v1').then(res=>{
        //load.dismiss();
        // console.log(res);
        this.wpServ.showMsgWithButton(this.txtLangue.txt_added, "bottom", "toast-info");
    }).catch(err=>{

        // console.log(err);
        if(err.status===undefined && err.error==3){

        }else if (err.status!==undefined && err.status==403){
          
        }
    });
  }

  goToShare() {
		this.lgServ.doShare(
			this.objEvent.agenda.description,
			this.objEvent.agenda.title,
			this.objEvent.agenda.image.url,
			this.objEvent.agenda.url
		);
	}
 

}
