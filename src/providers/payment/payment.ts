import { Injectable } from '@angular/core';
import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal';
// import { LoginProvider } from '../login/login';
import { WpPersistenceProvider } from '../wp-persistence/wp-persistence';

import { TranslateService } from '@ngx-translate/core';
import { Platform, LoadingController, ModalController } from 'ionic-angular';
import { AfProvider } from '../af/af';
import { ApiConfig } from '../../config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BarcodeScanner ,BarcodeScannerOptions } from '@ionic-native/barcode-scanner';
import swal from 'sweetalert';


@Injectable()
export class PaymentProvider {

  
  private urlWC: any;
  private wcParams: any;
  objMessage: any;

  constructor(private payPal: PayPal, private wpServ: WpPersistenceProvider, public translate: TranslateService, public platform: Platform, public modalCtrl: ModalController, private afServ: AfProvider, public http: HttpClient, public loadCtrl: LoadingController, private qrScanner: BarcodeScanner) {
    this.errorMessage();

  }

  /**
   * Cette fonction permet de configurer
   * les urls woocommerce
   * @param pattern string
   */
  setConfigWc(pattern: string){
    
    return new Promise((resolve, reject)=>{

        //On récupère la liste des configs woocommerce
        this.afServ.retrieveURL((data)=>{
          // console.log(data);
              
          this.afServ.getConfigWC((res)=>{
            // console.log(res);
            let wcParams = data.url+ pattern+'?consumer_key=' +res.customer +'&consumer_secret=' +res.secret +'';
            resolve(wcParams);

          });
    
        });

    });
    
  }

  /**
   * Cette méthode permet de configurer les messages
   * d'erreur
   */
  private errorMessage(){
    
    this.translate.get("message").subscribe(res=>{
      this.objMessage = res;
    });
  }


  /**
   * Cette fonction permet d'executer le paiement en fonction
   * de la méthode de paiement choisi par l'utilisateur
   * 
   * @param slug string, le choix du mode de paiement
   * @param objets any, l'objet sur l'événement, les crédentials du Client
   * @param produits Array<any>, la liste des produits commandés
   * @param gateway any, il s'agit de l'objet passerelle de paiement
   * 
   */
  selectPayment(slug, objets, produits, user, gateway){

    switch (slug) {
      case 'paypal':{
        this.initPayPalPayment(objets, produits, user, gateway);
        break;
      }
      
      case 'payconiq':{
        this.startPayconiqPayment(objets, produits, user, gateway);
        break;
      }
    
      default:
        break;
    }
  }

  /**
   * Création de la fonction permettant
   * de controller le paiement via PayPal 
   * et d'executer le plugin
   *
   * @param details any, il contient les configurations relatives au compte PayPal
   * @param options any, personnaliser les messages d'erreur
   * 
   * @returns Promise
   **/
  startPayPalPayment(details, options?: any){

    return new Promise((resolve, reject)=>{
      // console.log(details);

      let cred = details.paypal;
  
      this.payPal.init({
          PayPalEnvironmentProduction: cred.prod,
          PayPalEnvironmentSandbox: cred.sandbox
        }).then(() => {
          // Environments: PayPalEnvironmentNoNetwork, PayPalEnvironmentSandbox, PayPalEnvironmentProduction
          this.payPal.prepareToRender(cred.statut, new PayPalConfiguration({
            // Only needed if you get an "Internal Service Error" after PayPal login!
            //payPalShippingAddressOption: 2 // PayPalShippingAddressOptionPayPal
          })).then(() => {
            
            let prix =  JSON.stringify(details.price);
            let currency = details.currency;
            let description = details.description;
  
            let payment = new PayPalPayment(prix, currency, description, 'sale');
            this.payPal.renderSinglePaymentUI(payment).then((res) => {
              // Successfully paid
              if(res.response.state=="approved"){
                resolve(res.response);
              }else{
                reject({code: 1, message: this.objMessage.paypal_fail});
                // this.wpServ.showMsgWithButton(this.objMessage.paypal_fail,'top', 'toast-error');
              }
  
            }, () => {
              // Error or render dialog closed without being successful
              reject({code:2, message: this.objMessage.paypal_cancel});
              // this.wpServ.showMsgWithButton(this.objMessage.paypal_cancel, "bottom", "toast-info");
            });
          }, () => {
            // Error in configuration
            reject({code:3, message: this.objMessage.paypal_error});
            // this.wpServ.showMsgWithButton(this.objMessage.paypal_error, "bottom", "toast-error");
          });
        }, () => {
          // Error in initialization, maybe PayPal isn't supported or something else
          reject({code:4, message: this.objMessage.paypal_init});
          // this.wpServ.showMsgWithButton(this.objMessage.paypal_init, "bottom", "toast-error");
        });

    });


  }

  /**
   * Cette méthode permet d'initier le paiement via Payconiq
   * et de finaliser le processus de paiement
   * 
   * @param user any, l'utilisateur connecté
   * @param produits Array<any>, la liste des produits
   * @param gateways any, il s'agit de la passerelle de paiement
   * @param objets any, les informations liées à Payconiq
   */
  startPayconiqPayment(objets, produits, user, gateways){

    let basePath = objets.payconiq.url;
    let cred = objets.payconiq.apikey;

    let load = this.loadCtrl.create({ content: this.objMessage.payconiq_init});
    load.present();
    
    this.wpServ.callPayConiq(objets, cred, basePath).subscribe(res=>{
      
        load.dismiss();  
        
        let env;
        if(this.platform.is('ios'))
          env = 'ios';
        else if(this.platform.is('android'))
          env = 'android';
        
        // console.log(_data);
        let params = {'order': produits, 'objet':objets, 'env': env, 'idTrans': res.transactionId, 'currency':"EUR"};
        let popover = this.modalCtrl.create('ConfirmPayconiqPage', {'params': params});
  
        popover.present();
        popover.onDidDismiss((result)=>{

          if(result){
            //Après le paiement effectué par l'utilisateur via l'App Payconiq
            this.platform.resume.subscribe((e) => {
              
              this.checkPayconiqAndValidate(res.transactionId, cred, basePath).then((reponse : any)=>{
                
                if(reponse.status=="SUCCEEDED"){

                  load = this.loadCtrl.create({ content: this.objMessage.payconiq_req});
                  load.present();
  
                  this.initOrder(produits, user, gateways).then(_data=>{
                    load.dismiss();
                    // console.log(_res);
                    swal({
                      title: this.objMessage.payconiq_success_t+user.user_display_name,
                      text: this.objMessage.payconiq_success,
                      icon: "success"
                    }).then((value) => {
                         
                    });
  
                  }).catch(err=>{ //Erreur lors de la validation du paiement
                    
                    load.dismiss();
                    // console.log(err);
                    swal({
                      title: this.objMessage.payconiq_fail_t,
                      text: this.objMessage.payconiq_fail,
                      icon: "error",
                      // button: "Aww yiss!"
                    });
                  });

                }

              }).catch(error=>{

              });

            });
          }

        });

      },(err)=>{
        load.dismiss();
        // console.log(err);
      });

  }

  /**
   * Cette méthode permet de vérifier et de valider
   * la transaction sur PayConiq
   * 
   * @param transactionId string, l'id de transaction Payconiq
   * @param cred string, l'api key Payconiq
   * @param url string, l'url api de la transaction Payconiq
   */
  private checkPayconiqAndValidate(transactionId, cred, url: string){
    
    return new Promise((resolve, reject)=>{
      this.wpServ.getPayConiq(transactionId, cred, url).subscribe(res=>{
        resolve(res);
      },(err)=>{
        reject(err);
      });

    });

  }


  /**
   * Cette méthode permet d'initier le paiement via Paypal
   * paiement par carte de crédit ou compte Paypal
   * 
   * @param user any, l'utilisateur connecté
   * @param produits Array<any>, la liste des produits
   * @param gateways any, il s'agit de la passerelle de paiement
   * @param objets any, les informations liées à Payconiq
   * @param options any, les expressions 
   */
  initPayPalPayment(objets, produits, user, gateways, options?:any){
  
        let load; 
        let params = {'order': produits, 'objet': objets, 'currency': "EUR" };
        let popover = this.modalCtrl.create('ConfirmPayconiqPage', {'params': params});
  
        popover.present();
        popover.onDidDismiss((result)=>{
          if(result){

              let details = {
                paypal: objets.paypal,
                price: result.total,
                currency: result.currency,
                description: objets.description
              };
              
              // console.log(details);
              //On ouvre le plugin Paypal
              this.startPayPalPayment(details).then(reponse=>{

                load = this.loadCtrl.create({ content: this.objMessage.payconiq_init});
                load.present();

                this.initOrder(produits, user, gateways).then((_data: any)=>{
                  load.dismiss();
                  // console.log(_res);
                  swal({
                    title: this.objMessage.payconiq_success_t+user.user_display_name,
                    text: this.objMessage.payconiq_success,
                    icon: "success"
                  }).then((value) => {
                       
                  });

                }).catch(err=>{ //Erreur lors de la validation du paiement
                  
                  load.dismiss();
                  // console.log(err);
                  swal({
                    title: this.objMessage.payconiq_fail_t,
                    text: this.objMessage.payconiq_fail,
                    icon: "error",
                    // button: "Aww yiss!"
                  });
                });

              }).catch(err=>{
                  // load.dismiss();
                  this.wpServ.showMsgWithButton(err.message, "top",'toast-error');
              });
          }

        });
    
  }

  /**
   * Cette méthode permet d'initier la commande 
   * pour l'acquisition d'un ticket gratuit
   * 
   * @param user any, l'utilisateur connecté
   * @param produits Array<any>, la liste des produits
   * @param gateways any, il s'agit de la passerelle de paiement
   * @param objets any, les informations liées à Payconiq
   * @param options any, les expressions 
   */
  startFreeOrder(objets, produits, user, gateways, options?:any){
  
    let load = this.loadCtrl.create({ content: this.objMessage.free_pending});
    load.present();

    //On initialise la commande
    this.initOrder(produits, user, gateways).then((_data: any)=>{
        
        load.dismiss();
        // console.log(_data);
        swal({
          title: this.objMessage.payconiq_success_t+user.user_display_name,
          text: this.objMessage.free_success,
          icon: "success",
        }).then((value) => {
              
        });

        // let params = {'order': _data, 'objet': objets };
        // let popover = this.modalCtrl.create('ConfirmPayconiqPage', {'params': params});
  
        // // let ev = { target : { getBoundingClientRect : () => { return { top: '100' }; } }};
        // popover.present();
        // popover.onDidDismiss((result)=>{
        //   if(result){

        //       this.validPayment(_data).then(_res=>{
        //         load.dismiss();
        //         // console.log(_res);
        //         swal({
        //           title: "Félicitations ! "+user.user_display_name,
        //           text: "L'acquisition de votre billet a été validé. Pour acquérir votre billet veuillez consulter votre adresse mail !",
        //           icon: "success",
        //         }).then((value) => {
                      
        //         });

        //       }).catch(err=>{ //Erreur lors de la validation du paiement
                
        //         load.dismiss();
        //         console.log(err);
        //         swal({
        //           title: "Echec de la validation ! ",
        //           text: "L'acquisition du billet n'a pas aboutie veuillez réessayer. Si le problème persiste, contactez nous 'Aide et Assistance'",
        //           icon: "success",
        //           // button: "Aww yiss!"
        //         });
        //       });
             
        //   }

        // });

      }).catch(err=>{

        load.dismiss();
        // console.log(err);
        swal({
          title: this.objMessage.payconiq_fail_t,
          text: this.objMessage.free_fail,
          icon: "error",
          // button: "Aww yiss!"
        });
      });
    
  }

  /**
   * Cette méthode permet de créer ou de modifier une commande
   * sur WooCommerce
   * @param data any
   * @param id number, l'identifiant de la commande à modifier (option)
   * @author davart
   * 
   * @returns Promise
   */
  editOrder(data, id?: number){

    return new Promise((resolve, reject)=>{

      this.setConfigWc(ApiConfig.url_orders).then((reponse: any)=>{
        
        let finalURL = reponse;
        let headers = new HttpHeaders({
          'Content-Type': 'application/json'
        });
        
        if(id!==undefined)
          finalURL = finalURL+'/'+id;

        //Creation d'une commande  
        if(id===undefined){

          this.http.post(finalURL, data, { headers: headers }).subscribe(res=>{
            // console.log(res);
            resolve(res);
          },(err)=>{
            // console.log(err);
            reject(err);
          });

        }else{ //Mise à jour d'une commande 
          
          this.http.put(finalURL, data, { headers: headers }).subscribe(res=>{
            // console.log(res);
            resolve(res);
          },(err)=>{
            // console.log(err);
            reject(err);
          }); 

        }
  
      });

    });

  }
  

  /**
   * Cette méthode permet de valider le paiement
   * de l'utilisateur
   * @param order any, l'objet commande
   * @returns Promise
   */
  validPayment(order){

    return new Promise((resolve, reject)=>{

      const load = this.loadCtrl.create({ content: "Validation du paiement cours... "});
      load.present();
      
      let toSend = {
        "status": "completed",
        "set_paid": true
      };
  
      this.editOrder(toSend, order.id).then(res=>{
        load.dismiss();
        resolve(res);
  
      }).catch(err=>{
        load.dismiss();
        // console.log(err);
      });

    });
    

  }


  /**
   * Cette méthode permet de récupérer la 
   * liste des modèles woocommerce
   * @param link string, le pattern woocommerce
   * 
   * @returns Promise
   */
  getProductsWC(link){

    return new Promise((resolve, reject)=>{

      this.setConfigWc(link).then((reponse: any)=>{
        // console.log(reponse);
  
        this.http.get(reponse).subscribe(res=>{
          // console.log(res);
          resolve(res);
        },(err)=>{
          // console.log(err);
          reject(err);
        });
  
      });

    });

  }
  
  /**
   * Cette méthode permet d'initier la commande
   * d'un ticket
   * @param produits Array<any>, il s'agit d'un objet contenant les informations du produit
   * @param user any, il s'agit des paramètres de l'utilisateur
   * @param gateway any, la passerelle de paiement (méthode de paiement utilisé)
   */
  initOrder(produits: Array<any>, user: any, gateway: any, options?: any){

    return new Promise((resolve, reject)=>{

      let order = {};
      order = {
        "payment_method": gateway.id,
        "status":"completed",
        // "customer_id": user.id,
        "payment_method_title": gateway.title,
        "set_paid": options===undefined ? true : false,
        "billing": {
          "first_name": user.user_display_name,
          "last_name": user.last_name === undefined ? "" : user.last_name,
          "address_1": user.address === undefined ? "" : user.address,
          "city": user.city === undefined ? "" : user.city,
          "state": "CA",
          "postcode": user.postalcode === undefined ? "" : user.postalcode,
          "country": user.country === undefined ? "" : user.country,
          "email": user.user_email,
          "phone": user.phonenumber === undefined ? "" : user.phonenumber
        },
        "shipping": {
          "first_name": user.user_display_name,
          "last_name": user.last_name === undefined ? "" : user.last_name,
          "address_1": user.address === undefined ? "" : user.address,
          "city": user.city === undefined ? "" : user.city,
          "state": "CA",
          "postcode": user.postalcode === undefined ? "" : user.postalcode,
          "country": user.country === undefined ? "" : user.country,
        },
        "line_items": this.buildProductsOrder(produits)
        // "shipping_lines": [
        //   {
        //     "method_id": "flat_rate",
        //     "method_title": "Flat Rate",
        //     "total": 0
        //   }
        // ]
      }

      //On initie la commande sur woocommerce
      this.editOrder(order).then(res=>{
        // console.log(res);
        resolve(res);
      }).catch(err=>{
        // console.log(err);
        reject(err);
      });


    });
    
  }


  /**
   * Cette fonction permet de construire la liste
   * des produits à commander 
   * @param products Array<any>, la liste des produits à commander
   */
  buildProductsOrder(products: Array<any>): Array<any>{
    let result = [];

    for (let i = 0; i < products.length; i++) {
      const element = products[i];
      result.push({"product_id": element.id, "quantity": element.quantity});
    }

    return result;
  }

  /**
   * Cette méthode permettra de valider le 
   * ticket d'un participant 
   */
  checkTicket(idTicket: number, api_key: string){

    return new Promise((resolve, reject)=>{
      
      this.qrScanner.scan().then((barcodeData) => {
        
        const load = this.loadCtrl.create({ content: this.objMessage.valid_ticket});
        load.present();

        // resolve(barcodeData);
        let objet = this.formatTicketOfEvent(barcodeData);

        let pattern = "/wp-json/tribe/tickets/v1/qr/";
        this.afServ.retrieveURL((data)=>{
          
            let finalURL = data.url+pattern;
            // alert(finalURL);

            let params = "?api_key="+api_key;
                params +="&ticket_id="+objet.ticket_id;
                params +="&security_code="+objet.security_code;
            
            // alert(finalURL+params);
            this.http.get(finalURL+params).subscribe(res=>{
              
              load.dismiss();
              // console.log(res);
              resolve(res);
            },(err)=>{

              load.dismiss();
              // console.log(err);
              reject(err);
            });

        });

       }, (err) => {
           reject(err);
       });

    });

  }

  /**
   * Cette méthode permet à un organisateur de faire un
   * check in des participants
   * 
   * @param api_key string, l'api key pour accéder au plugin du checked in
   * @param objet any, objet contenant l'id du ticket et le code de sécurité
   */
  checkIn(api_key, objet){

    return new Promise((resolve, reject)=>{
      
      const load = this.loadCtrl.create({ content: this.objMessage.valid_ticket});
      load.present();

      let pattern = "/wp-json/tribe/tickets/v1/qr/";
      this.afServ.retrieveURL((data)=>{
          
          let finalURL = data.url+pattern;
          // alert(finalURL);

          let params = "?api_key="+api_key;
              params +="&ticket_id="+objet.ticket_id;
              params +="&security_code="+objet.security_code;
          
          // alert(finalURL+params);
          this.http.get(finalURL+params).subscribe(res=>{
            
            load.dismiss();
            // console.log(res);
            resolve(res);
          },(err)=>{

            load.dismiss();
            // console.log(err);
            reject(err);
          });

        });

    });
  }

  /**
   * Cette méthode permettra de récupérer les 
   * données et de les formater
   * @param data any
   */
  formatTicketOfEvent(data: any): any{
    
    let result : any;
    // alert(data);
    let tabs = data.split("&");
    let line_ticket = tabs[1].split("=");
    let line_code = tabs[3].split("=");

    result = {
      ticket_id: line_ticket[1],
      security_code: line_code[1]
    };

    // console.log(result);

    return result;
  }


}
