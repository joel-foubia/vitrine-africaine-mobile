import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { WpPersistenceProvider } from '../../providers/wp-persistence/wp-persistence';

/**
 * Generated class for the NewsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-news',
  templateUrl: 'news.html',
})
export class NewsPage {
  sortedArray = [];
  finalObject = [];
  segment: any;
  objLoader = true;

  constructor(
              public navCtrl: NavController,
              public navParams: NavParams,
              public wp_provider: WpPersistenceProvider,
              public loadingCtrl: LoadingController) {
              this.getArticle().then((_val) => {
                this.compaire();
              });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NewsPage');
  }
  getArticle() {
    return new Promise((resolve, reject) => {
      this.wp_provider.retrieveArticles().then((_val: any) => {
        var result = _val;
        console.log('Articles => ', result);
        for (let a = 0; a < result.length; a++) {
          let arrayArticle = result[a];
          for (var j = a + 1; j < result.length; j++) {
            if (new Date(result[j].date) > new Date(result[a].date)) {
              var temp = result[j];
              result[j] = result[a];
              result[a] = temp;
            }
          }
        }
        this.sortedArray = result.slice(0, 10);
        console.log('New articles => ', this.sortedArray);
        resolve(this.sortedArray);
      }).catch((err)=>{
        console.log('error => ', err);
      });
    });
  }
  compaire() {
    return new Promise((resolve, reject) => {
      // console.log('Yess => ', this.sortedArray);
      this.finalObject = [];
      this.wp_provider.retrieveCategories().then((_val: any) => {
        for (let i = 0; i < _val.length; i++) {
          var cat = _val[i];
          let resultCat = [];
          for (let j = 0; j < this.sortedArray.length; j++) {
            var art = this.sortedArray[j];
            if (cat.id == art.categories) {
              resultCat.push(art);
            }
          }
          let object = {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            taxonomy: cat.taxonomy,
            article: resultCat
          }
          if (object.article.length > 0) {
            this.finalObject.push(object);
            this.objLoader = false
            this.segment = this.finalObject[0].id;
          }
        }
        console.log('Result Merged =>', this.finalObject);
      }).catch((err)=>{
        console.log('error => ', err);
      });
    });
  }

  details(data) {
    this.navCtrl.push('ActuDetailsPage', { details: data });
    // console.log('Data =>', data);
  }

  segmentChanged(obj, event) {
    // console.log('Segment =>', this.segment);
    // console.log('Ev =>', event);
    this.segment = obj.id;
    // for (let i = 0; i < obj.length; i++) {
    // }
    // console.log('Event OK!', event);
    // console.log('item OK!', obj);

    let segments = event.target.parentNode.children;
    let len = segments.length;

    for (let i = 0; i < len; i++) {
      segments[i].classList.remove('segment-activated');
    }
    event.target.classList.add('segment-activated');
  }

}
