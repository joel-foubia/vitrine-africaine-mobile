import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, MenuController, PopoverController, ModalController, AlertController, Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { LoginProvider } from '../../providers/login/login';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { SyncOptions } from '../../config';


@IonicPage()
@Component({
  selector: 'page-list-events',
  templateUrl: 'list-events.html',
})
export class ListEventsPage {

  vuesToDisplay: number = 1;
  featured = [];
  user: any;
  defaultImg: string;
  public list_events = [];
  public dumpEvents = [];
  public objSpinner = false;
  public isSearchbarOpened = false;
  txtFiltre = [];
  txtLangue: any;
  objLoader: boolean = false;
  checkSync: any;
  txtPop: any;
  events;
  max = 10;
  maxFeatured = 10;
  model: string;
  current_lang: string;
  viewTitle: string;
  pagenum = 0;
	total = 0;

  constructor(public navCtrl: NavController, public navParams: NavParams, public translate: TranslateService, private lgServ: LoginProvider, private persistence: WpPersistenceProvider, public popCtrl: PopoverController, public modalCtrl: ModalController, public menuCtrl: MenuController, public alertCtrl: AlertController, public platform: Platform) {
    
    this.current_lang = this.translate.getDefaultLang();
    this.model = 'events';
    this.defaultImg = 'assets/images/logo.png';
    this.objLoader = true;

    //On active la traduction
	this.translate.get(['pop','events']).subscribe(res=>{
      this.txtPop = res.pop;
      this.txtLangue = res.events;
      
    });
  
  //On définit les actions sur les items
	this.events = {
			onTapItem: function(event: any) {
				// console.log(event);
				let objEvent, startTime, endTime;

				if(event.current.all_day){ //all day
				  startTime = new Date(event.current.start_date);
				  endTime = new Date(event.current.end_date);
				}else{
				  startTime = new Date(event.current.start_date);
				  endTime = new Date(event.current.end_date);
				}
					  
				objEvent = {
					title: event.current.title,
					startTime: startTime,
					endTime: endTime,
					agenda: event.current,
					allDay: event.current.all_day,
				};

				navCtrl.push('DetailsEventPage', {'objet': objEvent});
			},
			onAddToFav: function(event: any) {
				// console.log(event);
				if (event.current.like) {
					if (event.current.like == true) {
						event.current.like = false;
						lgServ.disLikeItem(event.current, 'events');
					} else {
						event.current.like = true;
						lgServ.likeItem(event.current, 'events');
					}
				} else {
					event.current.like = true;
					lgServ.likeItem(event.current, 'events');
				}
			},
			showMap: function(event: any) {
				let coords = [];
				// console.log(event);
				coords.push(event.current.geo_lat);
				coords.push(event.current.geo_lng);

				lgServ.navigateToArticle(coords);
			},
			
		};
		
    
    this.syncOffOnline();
    this.checkSync = setInterval(() => this.activateSyn(), SyncOptions.syncTimer);
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad ListEventsPage');
    this.lgServ.isTable('wpIonicToken').then((user) => {
			if (user) {
				this.user = JSON.parse(user);
			} 
    });
    
    // On a desktop, and is wider than 1200px
		// console.log(this.platform.width());

		if (this.platform.width() > 1200) {
			this.vuesToDisplay = 3;
		} else if (this.platform.width() >= 768) {
			// On a desktop, and is wider than 768px
			this.vuesToDisplay = 2;
		} else if (this.platform.width() > 400) {
			// On a desktop, and is wider than 400px
			this.vuesToDisplay = 1;
		} else if (this.platform.width() > 319) {
			// On a desktop, and is wider than 319px
			this.vuesToDisplay = 1;
		}
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
				// console.log('Reading from Storage events');
				this.lgServ.isTable('_ona_'+this.model).then(_res=>{
          if(_res){
            // console.log(JSON.parse(_res));
            this.list_events = JSON.parse(_res);
            this.dumpEvents = JSON.parse(_res);
            this.loadFeatures();
          }

          this.objLoader = false;
        });

			}
      
      //SYnc de la liste depuis le serveur
			if (res == 'w' || res == 'rw') {
				// console.log('Reading from server '+this.model);
				this.getFromServer();
				this.objLoader =  false;
      }
      
    });
    
  }

  /**
	 * Method to get current models data, save in storage and display in current view
	 */
	getFromServer() {

		// this.objLoader = true;
		this.persistence.getWpData(this.model, 100, 1).then((res: any) => {

      // console.log(res);
      this.pagenum = res.total_pages;
      this.total = res.total;
      this.list_events = res.events;
      this.dumpEvents = res.events;

      this.loadFeatures();
			this.lgServ.setTable('_ona_' + this.model, res.events);
      this.lgServ.setSync('_ona_' + this.model + '_date');
      
		}).catch(err=>{
      // console.log(err);
    });

  }

  openLeftMenu(){
    this.menuCtrl.open();
  }

  //AJout des éléments lorsque l'on scroll vers le
	//bas
	doInfinite(infiniteScroll) {
	
		// let params = { options: { offset: this.offset, max: this.max } };
		this.max += 10;

		infiniteScroll.complete();
	}

  	/**
   * Cette fonction permet de
   * recherche un élément dans la liste des événements
   *
   **/
	setFilteredItems(ev) {

		if (ev.target.value === undefined) {
			this.list_events = this.dumpEvents;
			this.max = 10;
			return;
		}

		var val = ev.target.value;

		if (val != '' && val.length > 2) {
			this.list_events = this.dumpEvents.filter(item => {
				let txtNom = item.title + ' ' + item.city + ' ' + item.address;
				return txtNom.toLowerCase().indexOf(val.toLowerCase()) > -1;
			});
		} else if (val == '' || val == undefined) {
			this.list_events = this.dumpEvents;
			this.max = 10;
    }
    
  }

  /**
   * Cette méthode permet d'afficher 
   * la liste des événements A la Une
   */
  loadFeatures() {
		for (let j = 0; j < this.list_events.length; j++) {
			if (this.list_events[j].featured) {
				this.featured.push(this.list_events[j]);
			}
		}
		// console.log('Featured=>', this.featured);
  }
  

	ionViewDidLeave() {
		clearInterval(this.checkSync);
	}
	
    //Cette fonction permet de créer un événement
  onAdd(){
    if(this.user){
      this.addEvent();
    }else{
      this.logIn();
    }
  }

  /**
	 * Cette fonction permet à l'utilisateur de
   * se connecter avant de créer un événement (si ce dernier n'est pas encore connecté)
	 */
	logIn() {
		const confirm = this.alertCtrl.create({
			title: this.txtLangue.btn_create,
			message: this.txtLangue.txt_login,
			buttons: [
				{
					text: this.txtLangue.btn_no,
					handler: () => {}
				},
				{
					text: this.txtLangue.btn_login,
					handler: () => {
            this.showLoginPage();
					}
				}
			]
    });
    
		confirm.present();
  }
  
  //On affiche le login dans le modal
  showLoginPage(){

    let params = {'provider':'StartEventPage'};
    let addModal = this.modalCtrl.create('LoginPage', params);

    addModal.onDidDismiss((data) => {

      if(data){
        this.addEvent();
      }
      
    });

    addModal.present();
  }

  //Cette fonction permet d'appeler
  //le composant FormEvent 
  addEvent(){

    let params = {'modif':false};
    let addModal = this.modalCtrl.create('FormEventPage', params);

    addModal.onDidDismiss((data) => {

      if(data){
        
			//  console.log(data);
			 let toSend = this.lgServ.buildEventToServer(data, this.user);
			 this.addToServer(toSend);

			 this.lgServ.buildObjetEvent(data, this.user).then(res=>{
				  
					// console.log(res);
					this.list_events.push(res);
					this.persistence.copiedAddSync(this.model, res);
					this.persistence.showMsgWithButton(this.txtLangue.txt_added, "bottom", "toast-info");
					
			 });
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

				this.persistence.createDataToServer(this.model, data, 'tribe/events/v1').then(res=>{
            //load.dismiss();
            // console.log(res);
						this.persistence.showMsgWithButton(this.txtLangue.txt_added, "bottom", "toast-info");
        }).catch(err=>{

            // console.log(err);
            if(err.status===undefined && err.error==3){

            }else if (err.status!==undefined && err.status==403){
              
            }
        });
	}


  showCalendar(){
    this.navCtrl.push('EventsPage');
  }

  showOnMap(){
  }

  /**
   * Cette fonction permet d'effectuer des filtres sur la vue
   * liste des événements
   */
  onFilter(event){

    let modal = this.modalCtrl.create('FilterPage', { lang: this.txtPop, model: this.model });
		modal.onDidDismiss((result) => {
			if (result) {
				this.txtFiltre = result;

				if (this.txtFiltre.length > 0) {
					// console.log('Filter results=>', this.txtFiltre);
					this.filterListEvents(result);
				}
			}
		});
		modal.present();
  }

  /**
   * Cette méthode est utilisée pour executer un
   * ensemble de filtre sur la liste
   * 
   * @param result Array<any>, tableau de filtre
   */
  filterListEvents(result) {
    
    this.max = 10;
		let resultats = [];
		
		for (let i = 0; i < this.dumpEvents.length; i++) {
			if (this.applyFilterEvent(result, this.dumpEvents[i])) {
				resultats.push(this.dumpEvents[i]);
				
			}
    }
    
		this.list_events = resultats;
		
	}

  /**
   * Cette méthode permet de filter un objet
   * des événement sur plusieurs filtres
   * 
   * @param searchs any, objet du filter
   * @param objet any, JSON object (event)
   */
	applyFilterEvent(searchs, objet) {
		let cpt = 0;

		for (let j = 0; j < searchs.length; j++) {
			switch (searchs[j].slug) {
				case 'tags': {
					//tag

					// var tags = [];
					// tags = objet.tags;
					// for (let k = 0; k < searchs[j].val.length; k++) {
					// 	if (tags.indexOf(searchs[j].val[k]) > -1) {
					// 		cpt++;
					// 	}
					// }

					break;
				}
				case 'category': {
					//Category
					var cats = [];
					cats = objet.categories;
					for (let k = 0; k < cats.length; k++) {
						if (cats[k].id==searchs[j].val) {
							cpt++;
							break;
						}
					}

					break;
				}
				case 'amount': {
					//Prix
					var min = objet.cost_details.values[0], max;
					
					if(objet.cost_details.values[1]!==undefined)
						max = objet.cost_details.values[1];
					else 
						max = min;

					if (parseFloat(min) >= searchs[j].val.lower * 10000 &&	parseFloat(max) <= searchs[j].val.upper * 10000) {
						// console.log('Event=>', objet);
						cpt++;
					}
					break;
				}
				case 'distance': {
					//Distance near you
					var annonceCoords = objet.venue;
					
					if(objet.venue.geo_lat!==undefined){

						var distance = this.persistence.calcDistance(
								searchs[j].coords.latitude,
								searchs[j].coords.longitude,
								annonceCoords.geo_lat,
								annonceCoords.geo_lng,
								'K'
							) * 1000;
	
						if (distance <= searchs[j].val) {
							objet.distFrom = distance;
							cpt++;
						}

					}
					break;
				}
				case 'feat': { //Featured
					
					if (objet.featured) cpt++;
					break;
				}
				case 'coming': {
					//A venir
					if (new Date(objet.start_date) > new Date()) cpt++;
					break;
				}
				case 'calendrier': {
					
					if(searchs[j].val=="today"){
						if (this.lgServ.theSameDate(objet.start_date)) cpt++;

					}else if(searchs[j].val=="week"){
						if (this.lgServ.weekBetween(objet.start_date)) cpt++;

					}else if(searchs[j].val=="month"){
						if (this.lgServ.dateBetween(objet.start_date)) 
							cpt++;
					}

					
					break;
				}
		
			}
    } //Fin tab searchs
    
		// console.log('Compteur=>', cpt);
		// console.log('Search length=>', searchs.length);

		if (cpt == searchs.length) return true;
		else return false;
	}

}
