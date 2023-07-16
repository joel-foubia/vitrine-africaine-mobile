import { Component } from '@angular/core';
import { ViewController, NavParams, IonicPage, ModalController, LoadingController } from 'ionic-angular';

import { LoginProvider } from '../../providers/login/login';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-helper',
  templateUrl: 'helper.html',
})
export class HelperPage {
  txtLang: any;
	public partners = [];
	public type_partner;
	public objLoader;
	public currentName;
  private listPartners = [];

  constructor(public vc: ViewController, public navParams: NavParams, private wpServ: WpPersistenceProvider, private lgServ: LoginProvider, public modalCtrl: ModalController, public loadCtrl: LoadingController, public translate: TranslateService) {
    
    this.type_partner = this.navParams.get('data');
    this.currentName = this.navParams.get('name');

    this.translate.get("message").subscribe(res=>{
      this.txtLang = res;
    });

    this.lgServ.isTable('_ona_'+this.type_partner).then(_data=>{ 
        
        if(_data){
          this.listPartners = JSON.parse(_data);
        }else{
          
          this.wpServ.getWpData(this.type_partner, 100, 1).then((res: any) => {
            let results;
            if(this.type_partner=='venues')
              results = res.venues;
            else if(this.type_partner=='organizers')
              results = res.organizers;

            this.listPartners = results;
            this.lgServ.setTable('_ona_'+this.type_partner, this.listPartners);
            this.lgServ.setSync('_ona_'+this.type_partner+'_date');

          }).catch(res=>{
            this.wpServ.showMsgWithButton("Impossible de récupérer les données. Vérifier votre connexion Internet","top");
          });
          
        }

    });

  }

  getItems(ev) {

     let val = ev.target.value;

    if(val=='' || val==undefined){
      this.partners = [];
      this.objLoader = false;
      return;
    }
  
    if(val!='' && val.length>1){ 

      this.objLoader = true;
      //let params = { 'search': val};
              
      if(this.listPartners.length!=0){
        // console.log(this.listPartners);        
        this.objLoader = false;
        this.partners = this.listPartners.filter((item) => {
          let txtNom = '';

          if(this.type_partner=='venues')
            txtNom = item.venue+" "+item.address;
          else if(this.type_partner=='organizers')
            txtNom = item.organizer;
            
            return txtNom.toLowerCase().indexOf(val.toLowerCase()) > -1;
        });

      }else{

      }

    }else if(val=='' || val==undefined){
      this.partners = [];
      this.objLoader = false;
    }
    
  }

  //Effacer la liste 
  clearItems(ev){
  	let val = ev.target.value;	

  	if(val=='' || val==undefined){
      this.partners = [];
      this.objLoader = false;
      return;
    }
  }

  //On récupère l'élément choisit
  selectedItem(item) {	
    let objet;

    objet = item;
  	
    this.vc.dismiss(objet);
  }

  close(){
  	this.vc.dismiss();
  }

  //Cette fonction permet d'ajouter un organisateur à l'événement
  addOrganizeer(){
    
    let params = {'modif':false, 'type':this.type_partner, 'nom': this.currentName};
    let addModal = this.modalCtrl.create('FormOrganizerPage', params);
    addModal.onDidDismiss((data) => {

      if(data){
        
        //const load = this.loadCtrl.create({ content: this.txtLang.load_org});
        //load.present();

        // console.log(data);
        //this.wpServ.copiedAddObjet('organizers', data);
        this.vc.dismiss(data);
        // this.wpServ.createDataToServer('organizers', data, 'tribe/events/v1').then(res=>{
        //     load.dismiss();
        //     console.log(res)
        //     this.vc.dismiss(res);

        // }).catch(err=>{

        //     console.log(err);
        //     load.dismiss();

        //     if(err.status===undefined && err.error==3){
              
        //       let addLogin = this.modalCtrl.create('LoginPage');
        //       addLogin.onDidDismiss((_data) => {
        //         this.wpServ.showMsgWithButton(this.txtLang.try, "top");
        //       });
        //       addLogin.present();

        //     }else if (err.status!==undefined && err.status==403){

        //       this.wpServ.showMsgWithButton(this.txtLang.auth,"top","toast-info");
        //     }
        // });

      }

    });

    addModal.present();

  }

  //Cette fonction permet d'ajouter un client ou contact ou tribunal
  addLocation(){
    
    let params = {'modif':false, 'type':this.type_partner, 'nom': this.currentName};
    let addModal = this.modalCtrl.create('FormLocationPage', params);
    addModal.onDidDismiss((data) => {
      
      if(data){
        
        //const load = this.loadCtrl.create({ content: this.txtLang.load_venue});
        //load.present();

        //console.log(data);
        this.vc.dismiss(data);

        // this.wpServ.createDataToServer('venues', data, 'tribe/events/v1').then(res=>{
        //     load.dismiss();
        //     console.log(res)
        // //   this.vc.dismiss(res);
        // }).catch(err=>{

        //     console.log(err);
        //     load.dismiss();
        //     if(err.status===undefined && err.error==3){
              
        //       let addLogin = this.modalCtrl.create('LoginPage');
        //       addLogin.onDidDismiss((_data) => {
        //         this.wpServ.showMsgWithButton(this.txtLang.try,"top");
        //       });
        //       addLogin.present();

        //     }else if (err.status!==undefined && err.status==401){

        //       this.wpServ.showMsgWithButton(this.txtLang.auth,"top","toast-info");
        //     }
        // });

      }

    });

    addModal.present();

  }


}
