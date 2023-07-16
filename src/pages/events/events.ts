import { Component, ViewChild} from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, PopoverController, ModalController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { LoginProvider } from '../../providers/login/login';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { CalendarComponent } from "ionic2-calendar/calendar";
import { SyncOptions } from '../../config';


@IonicPage()
@Component({
  selector: 'page-events',
  templateUrl: 'events.html',
})
export class EventsPage {

  defaultImg: string;
  @ViewChild(CalendarComponent) myCalendar:CalendarComponent;
  
  public meetings = [];
  public dumpEvents = [];
  public objSpinner = false;
  txtAllDay = "";
  txtLangue: any;
  objLoader: boolean = false;
  checkSync: any;
  txtPop: any;
  model: string;
  current_lang: string;
  date: any;
	eventSource = [];
	viewTitle: string;
	selectedDay = new Date();
	calendar : any;
  public txtNoEvents = "";
  pagenum = 0;
	total = 0;
  

  constructor(public navCtrl: NavController, public navParams: NavParams, public translate: TranslateService, private lgServ: LoginProvider, private persistence: WpPersistenceProvider, public popCtrl: PopoverController, public modalCtrl: ModalController, public menuCtrl: MenuController) {
    
    this.current_lang = this.translate.getDefaultLang();
    this.model = 'events';
    this.defaultImg = 'assets/images/logo.png';
    this.calendar = {
      mode: 'month',
      currentDate: this.selectedDay,
      locale: this.lgServ.setLangOfCalendar(this.current_lang)
   };
    //On active la traduction
		this.translate.get(['pop','events']).subscribe(res=>{
      this.txtPop = res.pop;
      this.txtLangue = res.events;
      this.txtNoEvents = this.txtLangue.rdv;
      this.txtAllDay = this.txtLangue.allday;
      
    });
    
    this.objLoader = true;
    this.syncOffOnline();
    this.checkSync = setInterval(() => this.activateSyn(), SyncOptions.modelSyncTimer);
  }

//Cette fonction permet d'activer la synchronisation
activateSyn() {
  this.lgServ.connChange('_ona_' + this.model).then((res) => {
    if (res) {
      this.backgroundSync();
    } else {
      clearInterval(this.checkSync);
    }
  });
}

backgroundSync() {
  this.persistence.pageBgSyncTribe(this.model);
}

	syncOffOnline() {

		this.lgServ.checkStatus('_ona_' + this.model).then((res) => {
			if (res == 'i') {
				//Première utilisation sans connexion
				this.objLoader =  false;
			}else if (res == 's') {
				console.log('Reading from Storage catalogue');
				this.lgServ.isTable('_ona_'+this.model).then(_res=>{
          if(_res){
            console.log(JSON.parse(_res));
            let results = this.getListAgendaFilters(JSON.parse(_res));
            this.loadMeetings(results);
            this.objLoader = false;
          }
        });

			}
      
      //SYnc de la liste depuis le serveur
			if (res == 'w' || res == 'rw') {
				console.log('Reading from server listing');
				this.getFromServer();
				// this.objLoader =  false;
      }
      
    });
    
  }
  
  /**
   * Cette fonction récupère la liste des 
   * évènements qui seront trier en fonction de la recherche
   * @param rdvs Array<Agenda>
   */
  getListAgendaFilters(rdvs: Array<any>){
    
    let results = [];

    if(this.navParams.get('tab_ids')===undefined){
      results = rdvs;
    }else{

      let tabs = this.navParams.get('tab_ids');
      for (let i = 0; i < rdvs.length; i++) {
        if(tabs.indexOf(rdvs[i].id)>-1) 
          results.push(rdvs[i]);
      }

    }

    return results;
  }

	ionViewDidLeave() {
		clearInterval(this.checkSync);
	}

  /**
	 * Method to get current models data, save in storage and display in current view
	 */
	getFromServer() {

		// this.objLoader = true;
    this.persistence
    .getWpData(this.model, 100, 1)
    .then((res: any) => {
      // console.log('Serve response for events=>', res);
      this.pagenum = res.total_pages;
      this.total = res.total;
      let results = this.getListAgendaFilters(res.events);
      this.loadMeetings(results);
      this.objLoader =  false;
      this.lgServ.setTable('_ona_' + this.model, res.events);
      this.lgServ.setSync('_ona_' + this.model + '_date');
    })
    .catch((err) => {
      console.log(err);
    });

  }

  openLeftMenu(){
    this.menuCtrl.open();
  }
  
  /**
   * Cette fonction permet de charger les meetings
   * relative à une affaire
   *
   **/
  loadMeetings(sources){

    let tab_ids = [];

    // tab_ids.push(this.objUser.partner_id.id);
    //this.objSpinner = true;
    this.meetings = sources;
    
    //this.objSpinner = false; 
    this.dumpEvents = this.meetings;
    this.eventSource = this.loadHearingInCalendar();
    console.log(this.eventSource);

  }

  //Changer le libellé du mois
  onViewTitleChanged(titre){
    this.viewTitle = titre;
  }

  //permet de selectionner une date dans le calendrier
  onTimeSelected(event){
    this.selectedDay = event.selectedTime;
  }

  //changer le mode de vue
  changeMode(mode) {
    this.calendar.mode = mode;
  }

  //Cette fonction affiche la date d'aujourd'hui
  today() {
	  this.calendar.currentDate = new Date();
  }

  //selectionne un evenement
  onEventSelected(event){}

  eventSelected(pos, event){
    
    let popover = this.popCtrl.create('PopEventPage', {'objet':event, 'lang':this.current_lang}, { cssClass: 'custom-agenda'});
    // let ev = { target : { getBoundingClientRect : () => { return { top: '100' }; } }};
    
    popover.present({ev:pos});
    popover.onDidDismiss((result)=>{
      if(result){
        //console.log(result);
        this.navCtrl.push('DetailsEventPage', {'objet': event});
          
        }
    });

  }

  //Cette fonction permet d'ouvrir le menu contextuel
  //pour le choix du mode de lecture
  openMode(theEvent){

    let popover = this.popCtrl.create('PopNote2Page', {'agenda': true, 'lang':this.txtPop});

      popover.present({ ev: theEvent});
      popover.onDidDismiss((result)=>{
          if(result){
            if(result.slug!='list')
               this.changeMode(result.slug);            
            else
              this.navCtrl.push('ListEventsPage');
          }
      });
  }

  //Convertir le temps en millisecondes
  private miliseconds(hrs,min,sec){
      return ((hrs*60*60+min*60+sec)*1000);
  }


  //Cette fonction charge les meetings
  // dans le calendrier
  loadHearingInCalendar(){

    let events = [];
              
    console.log(this.meetings);

    for(let i = 0; i < this.meetings.length; i += 1) {
      let currentObj = this.meetings[i];    
      let startTime, endTime;

      if(currentObj.all_day){ //all day
        startTime = new Date(currentObj.start_date);
        endTime = new Date(currentObj.end_date);
      }else{
        startTime = new Date(currentObj.start_date);
        endTime = new Date(currentObj.end_date);
      }
            
  	  events.push({
  	      title: currentObj.title,
  	      startTime: startTime,
  	      endTime: endTime,
          agenda: currentObj,
  	      allDay: currentObj.all_day,
  	  });

    }

    //On synchronise l'agenda avec celui de l'appareil du Client
      /*this.odooServ.synInCalendar(events).then((res)=>{

      });*/

    // console.log(events);
    return events;
  }

  //Cette fonction permet d'ajouter un événement
  onAdd(){

    this.lgServ.isLoggedIn().then((res) => {
			if (res) {
        let params = {'modif':false, 'action':'add'};
        let addModal = this.modalCtrl.create('FormEventPage', params);
    
        addModal.onDidDismiss((data) => {
    
          if(data){
            // data.idx = new Date().valueOf();
    
            this.persistence.copiedAddSync(this.model, data);
            this.persistence.syncCreateObjet(this.model, data);
    
            // msgLoading.dismiss();
            // this.odooService.showMsgWithButton(message, 'top', 'toast-success');        
            this.persistence.showMsgWithButton(this.txtLangue.txt_added, 'top', 'toast-success');
          }
          
        });
    
        addModal.present();
			} else {
				this.persistence.showMsgWithButton(
					'Connectez vous pour ajouter un enregistrement',
					'top',
					'toast-info'
				);
				this.navCtrl.push('LoginPage');
			}
		});
  

  }
  //Fin ajout dans l'agenda

  //Modification d'un événement
  onUpdate(objet, type){
    
    let params = {'modif':true, 'objet':objet, 'action':type};
    let addModal = this.modalCtrl.create('FormEventPage', params);

    addModal.onDidDismiss((data) => {

      if(data){
  
        this.persistence.showMsgWithButton(this.txtLangue.update_rdv,'top');
      }
      
    });

    addModal.present();
  }


  //Cette fonction permet d'afficher les événements
  //en fonction du filtre
  onFilter(event){

    let popover = this.popCtrl.create('PopFilterPage', {'agenda': true, 'lang': this.txtPop});
      popover.present({ ev: event});

      popover.onDidDismiss((result)=>{

          if(result){ 
            
            if(result.length==0){

              //Mise à jour des rendez vous
              this.lgServ.isTable('_ona_'+this.model).then(sources=>{
                  if(sources){
                    
                  }
              });

            }else{
              //let req = {agenda: 'all'};
              //On affiche les rendez vous de tout le monde
              this.lgServ.isTable('_ona_'+this.model).then(sources=>{
                if(sources){

                }

              });
              
            }
          }
      });  
  }


  //Cette fonction permet d'ajouter un participant
  //à l'événement
  onAddPartner(){
    
    let data = { "data": 'contact', "name":'', 'lang':this.txtPop }; 
    let modal = this.modalCtrl.create('HelperPage', data);
    
    modal.onDidDismiss(data => {
      
      if(data) {
      
      }

    });
    
    modal.present();
  }

  onListViews(){

  }

  helpMe(){
    this.persistence.showMsgWithButton(this.txtLangue.txt_help,'top');
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad EventsPage');
  }

}
