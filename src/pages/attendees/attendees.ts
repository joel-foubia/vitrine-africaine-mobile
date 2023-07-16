import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { LoginProvider } from '../../providers/login/login';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { PaymentProvider } from '../../providers/payment/payment';
import swal from 'sweetalert';
import { TranslateService } from '@ngx-translate/core';


@IonicPage()
@Component({
  selector: 'page-attendees',
  templateUrl: 'attendees.html',
})
export class AttendeesPage {

  txtLangue: any;
  ticket_api_key: any;
  objLoader: boolean;
  max: number = 10;
  tickets = [];
  myEvent: any;
  roleType;

  constructor(public navCtrl: NavController, public navParams: NavParams, private lgServ: LoginProvider, private paymentServ: PaymentProvider, private wpServ: WpPersistenceProvider, public translate: TranslateService) {
    
    this.myEvent = this.navParams.get("myEvent");
    this.ticket_api_key = this.navParams.get("api_key");

    this.translate.get("ticket").subscribe(res=>{
      this.txtLangue = res;
    });
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad AttendeesPage');
    this.getTicketsOfEvent();
    this.getListAttendees();
  }

  //On récupère la liste des tickets liés à un événement
  getTicketsOfEvent(){
    this.objLoader = true;
    
    this.lgServ.isTable('_ona_tickets').then(_res=>{
      if(_res){
        // console.log(JSON.parse(_res));
        let ticket = JSON.parse(_res), result = [];

        for (let j = 0; j < ticket.length; j++) {
          if(ticket[j].post_id==this.myEvent.id){
            result.push(ticket[j]);
          } 
        }

        this.objLoader = false;
        this.tickets = result;
        if(this.tickets.length!=0)
          this.roleType = this.tickets[0].id+'';
          
        console.log(this.tickets);

      }
    });

  }

  /**
   * Cette fonction permet de récupérer la liste
   * des moyens de paiement
   */
  getListAttendees(){

    this.lgServ.isTable('_ona_attendees').then(res=>{
        if(res){
          
          let attendees = JSON.parse(res);
          console.log(attendees);
          // this.gateweways = gateways;
        }else{
          
          // this.objLoader = true;
          this.wpServ.getWpData('attendees', 100, 1).then((res: any) => {

            console.log(res);
            // this.ticket = this.getTicketOfEvent(res.tickets);
            this.lgServ.setTable('_ona_attendees', res.attendees);
            this.lgServ.setSync('_ona_attendees_date');
            this.objLoader = false;
            
          }).catch(err=>{
            // console.log(err);
          });

        }
    })
  }

  segmentChanged(obj, ev){

  }

  //AJout des éléments lorsque l'on scroll vers le
	doInfinite(infiniteScroll) {
	
		this.max += 10;
		infiniteScroll.complete();
  }
  
  checkIn(item){

    // console.log(item);
    let objet = {
      ticket_id: item.ticket_id,
      security_code: ""
    };

    // this.paymentServ.checkIn(this.ticket_api_key, objet).then((res: any)=>{
    //   console.log(res);
    //   swal({
    //     title: this.txtLangue.validation,
    //     text: res.msg,
    //     icon: "success"
    //   });

    // }).catch(err=>{
    //   console.log(err);
    //   this.wpServ.showMsgWithButton(this.txtLangue.internet, "top", 'toat-error');
    // });
    
  }

}
