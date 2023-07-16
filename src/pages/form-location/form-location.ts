import { Component } from '@angular/core';
import { IonicPage, NavParams, PopoverController, ViewController } from 'ionic-angular';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { PhoneValidator } from '../../components/validators/phone.validator';
import { Country } from './form-validations.model';
import { TranslateService } from '@ngx-translate/core';


@IonicPage()
@Component({
  selector: 'page-form-location',
  templateUrl: 'form-location.html',
})
export class FormLocationPage {

  objLoader: boolean;
  validation_messages: any;
  country_phone_group: FormGroup;
  pays: any = {};
  venue_form: FormGroup;

  constructor(public vc: ViewController, public navParams: NavParams, public popCtrl: PopoverController, public formBuilder: FormBuilder, private wpServ: WpPersistenceProvider, public translate: TranslateService) {
    
    this.objLoader =  true;
    
    this.wpServ.getCountries().subscribe(res=>{
      
      let pays = this.buildPays(res);
      this.buildFormLocation(pays);
      this.objLoader = false;
    },(err)=>{});

    //On traduit les messages d'erreurs
    this.translate.get('message').subscribe(rep=>{
      this.setMessageError(rep);
    });
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad FormLocationPage');
  }

  /**
   * Cette fonction créer un tableau d'objets de type Country sur la liste des pays
   * @param pays Array<any>, tabbleau liste des pays
   * @returns Array<Country>
   */
  buildPays(pays){

    let countries = [];
    
    for (let i = 0; i < pays.length; i++) {
      var country: any = pays[i], objCountry;
      objCountry = new Country(country.alpha2Code, country.nativeName);
      countries.push(objCountry);
    }

    return countries;
  }

  /**
   * Cette méthode permet de construire le 
   * formulaire d'un lieu
   */
  buildFormLocation(countries){

    let country = new FormControl(countries[38]);
		let phone = new FormControl('', Validators.compose([ PhoneValidator.validCountryPhone(country) ]));

    //Création du formualire pays et téléphone
    this.country_phone_group = new FormGroup({
      country: country,
      phone: phone
    });

    let nom = ''; 
    if(nom!==undefined) nom = this.navParams.get('nom');

    //Création du formulaire venue_form
    this.venue_form = this.formBuilder.group({
      venue: new FormControl(nom, Validators.compose([
        Validators.maxLength(255),
        Validators.minLength(2),
        Validators.required
      ])),
      address: new FormControl(''),
      city: new FormControl(''),
      stateprovince: new FormControl(''),
      zip: new FormControl(''),
      website: new FormControl(''),
      country_phone: this.country_phone_group,
    });

  }

  /**
   * Cette fonction va ouvrir la fenetre PopUp 
   * afin de sélectionner la liste des pays
   * @param country string, le modèle de donnée
   */
  selectPartner(theEvent, country){
    
    let popover = this.popCtrl.create('CountryPage', {'type':country});
    popover.present({ ev: theEvent});

    popover.onDidDismiss((result)=>{

        if(result){
          // console.log(result);
          this.pays = result;
          this.country_phone_group.patchValue({country: result});
        }
    });

  }

  //Cette fonction permet de définir les messages d'erreur
  setMessageError(txtLang){

    this.validation_messages = {
      venue: [
        { type: 'required', message: txtLang.fail_txtvenue },
        { type: 'minlength', message: txtLang.fail_minvenue },
        { type: 'maxlength', message: txtLang.fail_maxvenue }
      ],

      phone: [
        { type: 'validCountryPhone', message: txtLang.fail_telvenue }
      ],

    };

  }

  //Cette fonction est appelé, lorsque l'utilisateur clique
  //pour valider le formulaire
  createPost(values) {
    
    var code = values.country_phone.country.code;
    var tell = values.country_phone.phone;
    var nationalNumber = code + tell;
    var txtTel = '';

    if(tell!='')
      txtTel = nationalNumber.replace(/[\. ,_-]+/g, '');
        
    // console.log('NationalNumber', txtTel);

    let objVenue = {
      'id':0,
      'venue': values.venue,
      'country': values.country_phone.country.name,
      'phone': txtTel,
      'city': values.city,
      'zip': values.zip,
      'address': values.address,
      'website': values.website,
      'stateprovince': values.stateprovince,
    };

    this.vc.dismiss(objVenue);
  }

  close(){
    this.vc.dismiss();
  }


}
