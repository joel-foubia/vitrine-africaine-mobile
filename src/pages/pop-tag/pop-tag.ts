import { Component } from '@angular/core';
import { ViewController, NavParams, IonicPage } from 'ionic-angular';
import { LoginProvider } from '../../providers/login/login';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';

@IonicPage()
@Component({
  selector: 'page-pop-tag',
  templateUrl: 'pop-tag.html',
})
export class PopTagPage {
  dumpData: any[];
  is_tax: boolean;
	public objSpinner;
	public list_tags = [];
	public autocompleteItems = [];
	public new_tag = '';
  public category;
  public message;
	public tabs = [];
	public tags = [];
  private txtPop;

  constructor(public vc: ViewController, public navParams: NavParams, private wpServ: WpPersistenceProvider, private lgServ: LoginProvider) {
    
    let type;
    this.txtPop = this.navParams.get('lang');
    this.message = this.txtPop.txt_tag;
    
    if(this.navParams.get('event')!==undefined){
      
      if(this.navParams.get('event')=='categories'){
        this.category = true;
        this.message =  this.txtPop.category;
        type = "ev_categories";
      }else{
        this.category = false;
        type = 'ev_tags';
      }
      
    }else{
      
      this.category = false;
    }

  	this.loadTags(type);
  }

  ionViewDidLoad() {}

  loadTags(type){
  	
  	this.objSpinner = true;
  	this.lgServ.isTable('_ona_'+type).then(res=>{
      
      if(res){
        // console.log(res);
        this.objSpinner = false;
        this.list_tags = JSON.parse(res);
        this.dumpData = this.list_tags;
      }else{
        
        //Données non synchroniser
        // this.wpServ.displayCustomMessage(this.txtPop.tag_network);
        this.wpServ.getWpData(type, 100, 1).then((res: any) => {
          // console.log(res);
          this.objSpinner = false;
          if(type=="ev_categories"){
            this.list_tags = res.categories;
            this.dumpData = res.categories;
            this.lgServ.setTable('_ona_'+type, res.categories); 
            
          }else if(type=="ev_tags")  {
            this.list_tags = res.tags;
            this.dumpData = res.tags;
            this.lgServ.setTable('_ona_'+type, res.tags); 
          }

          this.lgServ.setSync('_ona_'+type+'_date');

        });

      }

    });
        
  }

  //Cette fonction permet de remplir le 
  //tableau des valeurs cochées
  onChange(tag, checked){
    
    if(tag.id!=0){

      if(checked){
        this.tabs.push(tag.id);
        this.tags.push(tag);
      }else{
        for (var i = 0; i < this.tabs.length; i++) {
          if(this.tabs[i]== tag.id){
            this.tabs.splice(i,1);
            this.tags.splice(i,1);
            break;
          }
        }
  
      }

    }
  	//console.log(this.tabs);
  }

  //Permet d'ajouter un tag
  //elle va vérifier les tags existants
  //@param res Object, tableau contenant la liste d'objets (tag)
  onAddTag(){
  	
  	if(this.existTag())
  		this.wpServ.displayCustomMessage(this.txtPop.tag_exist);
  	else{
      this.addTagToList();
  		this.wpServ.displayCustomMessage(this.txtPop.tag_add);
    }
  }


  //Cette fonction permet d'ajouter le tag dans la liste
  addTagToList(){
    let tag = {
      me:{
        id: {me: 0},
        name: {me: this.new_tag}
      }
    };

    this.list_tags.push(tag);
  }

  onFinish(){

  	let objet = {
  		tab: this.tabs,
  		add: this.new_tag,
      tags: this.tags
  	};

  	//	this.wpServ.displayCustomMessage(this.txtPop.tag_exist);
  	this.vc.dismiss(objet);

  }

  //Cette fonction permet de vérifier si 
  //un tag existe déjà
  private existTag(){

  	for (var i = 0; i < this.list_tags.length; i++) {
  		if(this.list_tags[i].name==this.new_tag)
  			return true;
  	}

  	return false;
  }

  /**
   * Cette fonction permet de
   * recherche un élément dans la liste des événements
   *
   **/
	setFilteredItems(ev) {

		if (ev.target.value === undefined) {
      this.list_tags = this.dumpData;
      // this.max = 10;
			return;
		}

		var val = ev.target.value;

		if (val != '' && val.length > 2) {
			this.list_tags = this.dumpData.filter(item => {
				let txtNom = item.name;
				return txtNom.toLowerCase().indexOf(val.toLowerCase()) > -1;
			});
		} else if (val == '' || val == undefined) {
			this.list_tags = this.dumpData;
			// this.max = 10;
    }
    
  }


}
