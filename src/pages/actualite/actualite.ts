import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, MenuController } from 'ionic-angular';
import { ViewChild } from '@angular/core';
import { Slides } from 'ionic-angular';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';
import { LoginProvider } from '../../providers/login/login';
import { ImgCacheService } from '../../global';

@IonicPage()
@Component({
  selector: 'page-actualite',
  templateUrl: 'actualite.html',
})
export class ActualitePage {
  @ViewChild("idSlide") slides: Slides;
  Category: any;
  Article: any;
  art: any;
  cat: any;
  finalObject = [];
  segment: any;
  active_slide_index: number;
  title: any;
  savedArticle = [];
  sortedArray = [];
  catUrl: any;
  artUrl: any;
  defaultImg: string;
  objLoader: boolean = true;
  loginloader: any;
  model: string;
  model_cat: string;
  posts = [];
  categorie = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrler: LoadingController,
    public wp_provider: WpPersistenceProvider,
    public menuCtrl: MenuController,
    public cache: ImgCacheService,
    private lgServ: LoginProvider
  ) {
    this.model = 'actualite';
    this.model_cat = 'categorie_actu';
    this.syncOffOnline();
    this.defaultImg = "assets/images/logo.png";
  }

  ionViewDidLoad() {
  }
  /**
   * @description Cette fonction permet de recuperer la liste des categories
   * @author Foubia
   */
  getCategory() {
    return new Promise((resolve, reject) => {
      this.wp_provider.retrieveCategories().then((_val) => {
        this.Category = _val;
        for (let i = 0; i < this.Category.length; i++) {
          this.cat = this.Category[i];
        }
        resolve(this.cat);
      });
    });
  }

  syncOffOnline() {
    return new Promise((resolve, reject) => {
      this.lgServ.checkStatus('_ona_' + this.model).then((res) => {
        if (res == 'i') {
          //Première utilisation sans connexion
          this.objLoader = false;
        } else if (res == 's') {
          this.lgServ.isTable('_ona_' + this.model).then((_val) => {
            this.posts = JSON.parse(_val);
            this.lgServ.isTable('_ona_' + this.model_cat).then((_data) => {
              this.categorie = JSON.parse(_data);
              /**
         * @author Joel Bonbon
         * @description Comparaison des categorie et posts
         */
              this.finalObject = [];
              this.savedArticle = this.posts;
              for (let i = 0; i < this.categorie.length; i++) {
                let result = [];
                var cat = this.categorie[i];
                for (let h = 0; h < this.posts.length; h++) {
                  var art = this.posts[h];
                  if (cat.id == art.categories) {
                    result.push(art);
                  }
                  resolve(result);
                }
                var object = {
                  id: cat.id,
                  name: cat.name,
                  slug: cat.slug,
                  taxonomy: cat.taxonomy,
                  article: result
                }
                if (object.article.length > 0) {
                  this.objLoader = false;
                  this.finalObject.push(object);
                  this.segment = this.finalObject[0].id;
                }
              }
              var arrayDate = this.savedArticle;
              for (var i = 0; i < arrayDate.length; i++) {
                // le tableau est trié de 0 à i-1 
                // La boucle interne recherche le maximum
                // de i+1 à la fin du tableau. 
                for (var j = i + 1; j < arrayDate.length; j++) {
                  if (new Date(arrayDate[j].date) > new Date(arrayDate[i].date)) {
                    var temp = arrayDate[j];
                    arrayDate[j] = arrayDate[i];
                    arrayDate[i] = temp;
                  }
                }
              }
              this.sortedArray = arrayDate.slice(0, 4);
              this.objLoader = false;
            });
          });
        }
        if (res == 'w' || res == 'rw') {
          this.getFromServer();
          // this.objLoader = false;
        }
      });


    });
  }

  liste(model) {
    this.wp_provider.getWpData(model, 100, 1).then((_val: any) => {
      this.lgServ.setTable('_ona_' + model, _val);
      this.lgServ.setSync('_ona_' + model + '_date');
    }).catch((err) => {
    });
  }

  getFromServer() {
    this.wp_provider
      .getWpData(this.model, 100, 1)
      .then((res: any) => {

        this.objLoader = false;
        this.lgServ.setTable('_ona_' + this.model, res);
        this.lgServ.setSync('_ona_' + this.model + '_date');
      })
      .catch((err) => {
      });

    this.liste(this.model_cat);
  }

  presentLoading() {
    this.loginloader = this.loadingCtrler.create({
      spinner: 'dots'
    });
    this.loginloader.present();
  }

  onAddToFav(actu: any) {
    if (actu.like) {
      if (actu.like == true) {
        actu.like = false;
        this.lgServ.disLikeItem(actu, 'article');
      } else {
        actu.like = true;
        this.lgServ.likeItem(actu, 'article');
      }
    } else {
      actu.like = true;
      this.lgServ.likeItem(actu, 'article');
    }
  }
  openLeftMenu() {
    this.menuCtrl.open();
  }
  /**
   * @description Changer de slider apres chaque clique.
   * @author Foubia
   */
  goToNext() {
    this.slides.slideTo(2, 500);
  }
  /**
   * @description Elle sert a faire basculer d'une rubrique a une autre et renvoie les informations
   * @author Foubia
   * @param obj
   * @param event
   */
  details(data) {
    console.log('Detls => ', data);
    this.navCtrl.push('ActuDetailsPage', { details: data });
  }

  segmentChanged(obj, event) {
    this.segment = obj.id;
    let segments = event.target.parentNode.children;
    let len = segments.length;

    for (let i = 0; i < len; i++) {
      segments[i].classList.remove('segment-activated');
    }
    event.target.classList.add('segment-activated');
  }

  /**
   * @description Cette fonction permet de faire une comparaison entre les categories et les article
   * @author Foubia  
   */

}
