import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { FormControl, Validators, FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';


@IonicPage()
@Component({
  selector: 'page-form-organizer',
  templateUrl: 'form-organizer.html',
})
export class FormOrganizerPage {

  validation_messages: any;
  organizer_form: any;
  constructor(public vc: ViewController, public navParams: NavParams, public formBuilder: FormBuilder, public translate: TranslateService) {
    
    
    //On traduit les messages d'erreurs
    this.translate.get('message').subscribe(rep=>{
      this.setMessageError(rep);
      this.buildFormLocation();
    });
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad FormLocationPage');
  }



  /**
   * Cette méthode permet de construire le 
   * formulaire d'un lieu
   */
  buildFormLocation(){

    let nom = ''; 
    if(nom!==undefined) nom = this.navParams.get('nom');

    //Création du formulaire organizer_form
    this.organizer_form = this.formBuilder.group({
      organizer: new FormControl(nom, Validators.compose([
        Validators.maxLength(255),
        Validators.minLength(2),
        Validators.required
      ])),
      email: new FormControl('', Validators.email),
      
      phone: new FormControl('', Validators.compose([
        Validators.maxLength(17),
        Validators.minLength(5),
      ])),
      website: new FormControl('')
    });

  }
  

  //Cette fonction permet de définir les messages d'erreur
  setMessageError(txtLang){

    this.validation_messages = {
      organizer: [
        { type: 'required', message: txtLang.fail_txtorg },
        { type: 'minlength', message: txtLang.fail_minorg },
        { type: 'maxlength', message: txtLang.fail_maxorg }
      ],

      email: [
        { type: 'email', message: txtLang.fail_emailorg }
      ],

      phone: [
        { type: 'minlength', message: txtLang.fail_minphone },
        { type: 'maxlength', message: txtLang.fail_minphone }
      ],
      
    };

  }

  //Cette fonction est appelé, lorsque l'utilisateur clique
  //pour valider le formulaire
  createPost(values) {
    
    let objOrg = {
      'id':0,
      'organizer': values.organizer,
      'email': values.email,
      'phone': values.phone,
      'website': values.website
    };

    this.vc.dismiss(objOrg);
  }

  close(){
    this.vc.dismiss();
  }


}
