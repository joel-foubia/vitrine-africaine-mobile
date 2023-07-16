import { Component } from '@angular/core';
import { NavParams, Platform, ViewController, ToastController, IonicPage } from 'ionic-angular';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { TranslateService } from '@ngx-translate/core';

@IonicPage()
@Component({
  selector: 'page-speech-to-text',
  templateUrl: 'speech-to-text.html',
})
export class SpeechToTextPage {

	public isRecording = false;
	public matches = [];
	public langues = [];
	private txtFinal = "";
  private txtPop;

  constructor(private speechCtrl: SpeechRecognition, public navParams: NavParams, private plt: Platform, public vc: ViewController, public toastCtrl: ToastController, private translate: TranslateService) {
  	this.matches = [];
    this.txtPop = this.navParams.get('lang');
  }

  ionViewDidLoad() {}

  isIos() { //on vérifie si la plateforme est iOS
    return this.plt.is('ios');
  }
 
  /**
   * Cette fonction permet de stopper
   * l'enregistrement vocal faite par l'utilisateur
   **/
  stopListening() {

    this.speechCtrl.stopListening().then(() => {
      this.isRecording = false;
      this.vc.dismiss(this.txtFinal);
    });
  }
 
  /**
   * Cette fonction permet de lancer l'enregistrement
   * vocale. Mais avant, on vérifie si l'utilisateur a les permissions
   * 
   *
   **/
  startListening() {
    
    //On vérifie si l'appareil du user dispose d'un micro
    this.speechCtrl.isRecognitionAvailable().then((available) => {
    	
    	if(available){

    		//On vérifie l'application a les permissions
    		this.speechCtrl.hasPermission().then((hasPermission) => {

		        if (!hasPermission) {

		        	//On active les permissions pour accéder au microphone
		          	this.speechCtrl.requestPermission().then(
					    () => {
					    	this.getMessageError(this.txtPop.mic);
					    },
					    () => {
					    	this.getMessageError(this.txtPop.mic_fail);
					});

		        }else{
		        	
		        	this.processListening();
		        }
		    });

    	}else{
    		this.getMessageError(this.txtPop.mic_network);
    	}

    });

  }
 
  /**
   * Cette fonction de procéder au traitement
   * de la voix de l'utilisateur en convertissant la voix
   * par du texte
   *
   **/
  private processListening() {
    
    const currentLang =  this.translate.getDefaultLang();
    let selectLang = 'fr-FR';

    if(currentLang=='fr')
      selectLang = 'fr-FR'
    else if(currentLang =='en')
      selectLang = 'en-US';  

    // let options = { language: selectLang };
    
    this.speechCtrl.startListening().subscribe(matches => {
      
      this.matches = matches;
      //this.txtFinal = this.arrayToText(matches);
      this.txtFinal = matches[0];
      
      this.vc.dismiss(this.txtFinal);
      //this.cd.detectChanges();
    });

    this.isRecording = true;

  }

  /**
   * Cette fonction de récupérer le texte
   * choisit par le user
   **/
  selectText(match){
    //this.vc.dismiss(match);
  }

  /**
   * Cette fonction permet de lister les
   * langues qui sont supporter par le plugin
   *
   **/
  getListLanguages(){

  	this.speechCtrl.getSupportedLanguages().then((languages) => {
  		this.langues = languages;
  	},
    (error) => { 

    });
  }

  /**
   * Cette fonction permet de transformer un
   * tableau en texte
   * @param Array <String>
   * @return String
   **/
  // private arrayToText(strTab){
  // 	let result = "";

  // 	for (let i = 0; i < strTab.length; i++) {
  // 		result += strTab[i] + " ";
  // 	}

  // 	return result;
  // }

  //Définition des messages d'erreurs 
  //à afficher
  getMessageError(txtMessage){
  	
  	let toast = this.toastCtrl.create({
	    message: txtMessage,
	    duration: 4000,
	    position: 'top'
	  });

	toast.present();
  }

}
