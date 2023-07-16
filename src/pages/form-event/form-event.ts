import { Component } from '@angular/core';
import { IonicPage, NavParams, MenuController, normalizeURL, ModalController, PopoverController, ViewController } from 'ionic-angular';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LoginProvider } from '../../providers/login/login';


@IonicPage()
@Component({
  selector: 'page-form-event',
  templateUrl: 'form-event.html',
})
export class FormEventPage {

  objLoader: boolean;
  selectedLimited: boolean;

  tickets: any;
  section: string;
  txtLang;
  list_orgs = [];
  list_tags = [];
  list_categories = [];
  categories = [];
  txtPop: any;
  tags = [];
  validation_messages: any;
  othersForm: FormGroup;
  locationForm: FormGroup;
  ticketForm: FormGroup;

  postForm: any;
  public modif = false;
  public objEvent;
  selected_image: any;
  public location = {};
  orgs = [];

  constructor(public vc: ViewController, public navParams: NavParams, public menuCtrl: MenuController, private wpServ: WpPersistenceProvider, public modalCtrl: ModalController, public formBuilder: FormBuilder, public translate: TranslateService, public popCtrl: PopoverController, private lgServ: LoginProvider) {
    
    this.modif = this.navParams.get('modif');
    this.objEvent = this.navParams.get('event');
    this.section = 'post';
    
    //On traduit les messages d'erreurs
    this.translate.get(['message','pop']).subscribe(rep=>{
      this.txtPop = rep.pop;
      this.txtLang = rep.message;
      this.setMessageError(rep.message);     
      this.buildFormEvent();
    });

    if(this.modif){ //On 
      this.fillFormEvent();
    }

    this.loadTickets();

  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad FormEventPage');
  }

  openLeftMenu(){
    this.menuCtrl.open();
  }

  //Cette fonction permet de fermer le Formulaire
  annuler(){
    this.vc.dismiss();
  }

  next(){

    if(this.section=='post')
      this.section = 'event';
    else if(this.section=="event")
      this.section = "others";
    else if(this.section == "others")
      this.section = "ticket";
  }

  previous(){
    
    if(this.section=='ticket')
      this.section = 'others';
    else if(this.section=="others")
      this.section = "event";
    else if(this.section == "event")
      this.section = "post";
  }

  loadTickets(){
    
    this.objLoader = true;
    this.lgServ.isTable('_ona_tickets').then(_res=>{
      if(_res){
        // console.log(JSON.parse(_res));
        this.tickets = JSON.parse(_res);
        // console.log(this.tickets);

        this.objLoader = false;
      }

    });
  }

  //Cette fonction permet d'afficher la liste des tags
  //ou la liste des catégories, ou organizers
  private loadObjetsFromRemote(type){
  	
  	if(type=='tags'){

      this.list_tags = this.buildIdsOfArray(this.tags);
      this.othersForm.patchValue({tags: this.list_tags});
    }else if(type=='categories'){
      
      this.list_categories = this.buildIdsOfArray(this.categories);
      this.othersForm.patchValue({categories: this.list_categories});
      
    }else{
      this.list_orgs = this.buildIdsOfArray(this.orgs);
      this.locationForm.patchValue({organizer: this.list_orgs});
    }

  }

  /**
   * Cette méthode permet de créer unn
   * tableau d'identifiants sur la base d'un tab existant
   * 
   * @param list Array<any>
   */
  private buildIdsOfArray(list){
    
    let results  = [];

    for (let index = 0; index < list.length; index++) 
      results.push(list[index].id);
      
    return results;
  }

  /**
   * Cette fonction permet de construire le 
   * formulaire d'édition d'un événement
   */
  buildFormEvent(){
      
    //Création du formulaire de la tab post
    this.postForm = this.formBuilder.group({
        title: new FormControl('', Validators.compose([
          Validators.maxLength(255),
          Validators.minLength(2),
          Validators.required
        ])),
        description: new FormControl('',
        Validators.required),
        start_date: new FormControl('', Validators.compose([
          Validators.required
        ])),
        end_date: new FormControl('', Validators.compose([
          Validators.required
        ])),
        all_day: new FormControl(false),
    });
    
    //Création du formulaire de la tab location
    this.locationForm = this.formBuilder.group({
        venue: new FormControl('', Validators.compose([
          Validators.required
        ])),
        
        organizer: new FormControl('', Validators.compose([
          Validators.required
        ])),
        image: new FormControl(''),
        // image: new FormControl('', Validators.compose([
        //   Validators.required
        // ])),
        
    });
    
    //Création du formulaire de la tab location
    this.othersForm = this.formBuilder.group({
        website: new FormControl(''),
        categories: new FormControl(''),
        tags: new FormControl(''),
        // cost: new FormControl('', Validators.min(3)),
    });
    
    //Création du formulaire de la tab location
    this.ticketForm = this.formBuilder.group({
        
        places: new FormControl(''),
        title: new FormControl('', Validators.compose([
          Validators.required
        ])),
        cost: new FormControl('', Validators.compose([
          Validators.required
        ])),
        // cost: new FormControl('', Validators.min(3)),
    });

  }

  /**
   * Cette fonction permet de préremplir
   * les champs du formulaire à partir des données existants 
   */
  fillFormEvent(){

    if(this.objEvent){
      let objetPost = {
        title: this.objEvent.title,
        description: this.objEvent.description,
        all_day: this.objEvent.all_day,
        start_date: this.objEvent.start_date,
        end_date: this.objEvent.end_date,
        // image: this.objEvent.image.url.id
      };

      //On fixe les valeurs de la section Post
      this.postForm.patchValue(objetPost);

      //Location and organizer
      this.location = this.objEvent.venue;
      let venue_ids = [];
      venue_ids.push(this.objEvent.venue.id);
      this.locationForm.patchValue({venue: venue_ids});

      this.orgs = this.objEvent.organizer;
      this.loadObjetsFromRemote('organizers');

      this.locationForm.patchValue({image: parseInt(this.objEvent.image.id)});
      this.selected_image = this.objEvent.image.url;
      
      //Others section
      this.othersForm.patchValue({website: this.objEvent.website});
      this.categories = this.objEvent.categories;
      this.loadObjetsFromRemote('categories');
      
      this.tags = this.objEvent.tags;
      this.loadObjetsFromRemote('tags');

    }
  }

  //gestion de la case à cocher
  onChange(checked){
    this.postForm.patchValue({all_day: checked});
  }

  //Cette fonction permet de valider les informations du form
  //et de quitter la vue
  valider(){

    let objToSend = this.setEvent();
    if(!this.postForm.valid){
      this.wpServ.showMsgWithButton(this.txtLang.require_event, "top", "toast-error");
      this.section = 'post';
    }else if(!this.locationForm.valid){
      this.section = 'event';
      this.wpServ.showMsgWithButton(this.txtLang.require_event, "top", "toast-error");

    }else{

      this.vc.dismiss(objToSend);
    }
  }

  /**
   * Constructions de l'objet qui sera
   * utilisé pour l'envoie des données sur le serveur
   */
  private setEvent(){

    let objet = {
      id: this.objEvent===undefined ? 0 : this.objEvent.id,
      title: this.postForm.value.title,
      all_day: this.postForm.value.all_day,
      start_date: this.postForm.value.start_date,
      end_date: this.postForm.value.end_date,
      description: this.postForm.value.description,
      venue: this.locationForm.value.venue,
      organizer: this.locationForm.value.organizer,
      image: this.locationForm.value.image,
      categories: this.othersForm.value.categories,
      tags: this.othersForm.value.tags,
      website: this.othersForm.value.website,
      ticket: {
        title: this.ticketForm.value.title,
        cost: this.ticketForm.value.cost,
        available: this.ticketForm.value.places,
        is_available: this.selectedLimited
      }
    };

    // console.log(objet);

    return objet;
  }

  /**
   * Cette fonction permet de lier une
   * image à l'événement
   */
  openImagePicker(){

    this.wpServ.takeOnePicture().then((res : any)=>{
        
      let image  = normalizeURL(res);
      this.selected_image = image;

    }).catch(err=>{

    });
    
  }

  /**
   * Cette fonction permet de sélectionner un
   * lieu ou un organisateur
   * @param model string, le type de donnée
   */
  selectPartner(model){

    let data = { "data": model }; 
    let modal = this.modalCtrl.create('HelperPage', data);
    
    modal.onDidDismiss(_data => {
      if (_data) {
        // console.log(_data);
        if(model=='venues'){
          let venue_ids = [];
          // venue_ids.push(_data.id);
          
          this.location = _data;
          if(_data.id==0)
            this.locationForm.patchValue({venue: _data});
          else  
            this.locationForm.patchValue({venue: _data.id});

        }else if(model=='organizers'){
          // let organizers = [];
          this.setTabOrganizers(_data);
        }
      }
    });

    modal.present();
  }


  //cette fonction permet de définir le tableau des organisateurs
  setTabOrganizers(data){

      // console.log(data);
      let find = false;
      
      for (let j = 0; j < this.orgs.length; j++) 
        if(this.orgs[j].id==data.id){
          find = true;
          break;
        }

      if(!find){
        
        let objet = data;
        
        //On met à jour l'attribut orgs
        this.orgs.push(objet);
        // console.log(this.orgs);
        
        //On met à jour l'attribut list_orgs
        this.list_orgs.push(data.id);
      }

      //On fixe le tableau des Organisateurs au formulaire

      if(data.id==0)
        this.locationForm.patchValue({organizer: this.orgs});
      else 
        this.locationForm.patchValue({organizer: this.list_orgs});
  }


  //Cette fonction permet de définir les messages d'erreur
  setMessageError(txtLang){

      this.validation_messages = {
        title: [
          { type: 'required', message: txtLang.fail_txtevent },
          { type: 'minlength', message: txtLang.fail_minevent },
          { type: 'maxlength', message: txtLang.fail_maxevent }
        ],
        ladate: [
          { type: 'required', message: txtLang.fail_dateEvent },
        ],
        description: [
          { type: 'required', message: txtLang.fail_description },
        ],
        type: [
          { type: 'required', message: txtLang.fail_type },
        ],
        cost: [
          { type: 'required', message: txtLang.fail_cost },
        ],
        
      };
  
  }


  //Ajouter un tag ou un reminder à partir d'une 
  //fenêtre Pop up
  addObjetFromPop(event, type){
  	
  	let elements = [];
  	if(type=='tags')
  		elements = this.tags;
  	else
  		elements = this.categories;

  	// console.log(type);
  	let popover = this.popCtrl.create('PopTagPage', {'event':type, 'lang':this.txtPop}, {cssClass: 'custom-popaudio'});
    
    popover.present({ev: event});
    popover.onDidDismiss((result)=>{
        
        if(result){ 
          // console.log(result);
          let find = false;

          for(let i = 0; i< result.tags.length; i++){

            //On vérifie si le tableau n'est pas vide
            if(elements!==undefined){
            	for (let j = 0; j < elements.length; j++) 
	              if(elements[j].id==result.tags[i].id){
	                find = true;
	                break; 
	              }	
            }

            //On insère les éléments dans le tableau vide
            if(!find || elements.length==0)
              elements.push(result.tags[i]);
          }

          //Ici on met à jour les attributs de l'objet Agenda
          for(let i = 0; i< result.tab.length; i++){

          	if(type=='categories'){ //tags
            	
            	if(this.list_categories.indexOf(result.tab[i])==-1 || this.list_categories.length==0)
                this.list_categories.push(result.tab[i]);

          	}else{ //categories
          		if(this.list_tags.indexOf(result.tab[i])==-1 || this.list_tags.length==0)
              		this.list_tags.push(result.tab[i]);
          	}

          }

          //On met à jour les attributs tags et categories du Controller
          if(type=='tags')
          	this.tags = elements;
          else
          	this.categories = elements;
          
          //On fixe les champs du formulaire
          this.othersForm.patchValue({categories: this.list_categories});
          this.othersForm.patchValue({tags: this.list_tags});

        }
  
    });//Fin du Pop Tag 

  }

  /**
   * Cette fonction permet de retirer un tag,
   * une catégorie ou un organisateur dans le formulaire
   * 
   * @param tag any, l'objet à retirer
   * @param index number, l'index de l'objet
   * @param type string, le modèle wp
   */
  removeObj(tag, index, type){
    
    let elements;

  	if(type=='tags'){
    	this.tags.splice(index,1);
      elements = this.list_tags;
      
  	}else if(type=='categories'){
    	this.categories.splice(index,1);
      elements = this.list_categories;
      
    }else{
    	this.orgs.splice(index,1);
    	elements = this.list_orgs;
    }
    
    //On met à jour les attributs de l'objet
    for(let i = 0; i < elements.length; i++){
      
      if(tag.id==elements[i]){
      	if(type=='tags')
        	this.list_tags.splice(i,1);
        else if(type=='categories')
        	this.list_categories.splice(i,1);
        else
        	this.list_orgs.splice(i,1);

        break;
      }
    }

    //On fixe le tableau des Organisateurs au formulaire
    this.locationForm.patchValue({organizer: this.list_orgs});
    this.othersForm.patchValue({categories: this.list_categories});
    this.othersForm.patchValue({tags: this.list_tags});

  }

  selectCapacity(){

    if(!this.selectedLimited)
      this.selectedLimited = true;
    else
      this.selectedLimited = false;
  }


}
