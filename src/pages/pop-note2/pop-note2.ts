import { Component } from '@angular/core';
import { NavParams, ViewController, IonicPage } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-pop-note2',
  templateUrl: 'pop-note2.html',
})
export class PopNote2Page {
	public actions = [];
	public maxItems = 5;
	public mask = false;
  public agenda = false;
  public pipeline = false;
  private txtPop;

  constructor(public navParams: NavParams, public vc: ViewController) {
      
      this.txtPop = this.navParams.get('lang');

      if(this.navParams.get('agenda')!==undefined){ 
        this.actions = this.getListModes();
        this.agenda = true;
      }else{
        this.actions = this.getListOfActions();
      }
  }

  ionViewDidLoad() {}

  onAction(item){
  	if(item.more!==undefined){
  		if(item.more){
  			this.maxItems = 10;
  			this.mask = true;
  		}else{
  			this.maxItems = 5;
  			this.mask =false;
  		}
  	}else{
  		this.vc.dismiss(item);	
  	}
    
  }

  //sélection du mode d'affichage calendrier
  onSelect(item){
    this.vc.dismiss(item);
  }

  //On définit la liste des filtres
  //à appliquer dans la vue liste des notes
  getListOfActions(){
 
  	 let tab = [
  	 	{ nom: this.txtPop.copy, copie: true, icon:'ios-copy-outline', slug: 'copie'},
  	 	{ nom: this.txtPop.share, share: true, icon:'share-alt', slug: 'share'},
  	 	
  	 ];

  	 return tab;
  }

  //Cette fonction permet de retourner
  //la liste des modes
  getListModes(){

    return [
      { nom: this.txtPop.month, slug: 'month'},
      // { nom: this.txtPop.week, slug: 'week'},
      { nom: this.txtPop.day, slug: 'day'},
      { nom: this.txtPop.list, slug: 'list'},
    ];
  }

}
