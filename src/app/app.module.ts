import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicStorageModule } from '@ionic/storage';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { MyApp } from './app.component';
import { TabsPage } from '../pages/tabs/tabs';
import { HttpModule } from '@angular/http';
import { AuthProvider } from '../providers/auth/auth';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireOfflineModule } from 'angularfire2-offline';
import { WpPersistenceProvider } from '../providers/wp-persistence/wp-persistence';
import { Ionic2RatingModule } from 'ionic2-rating';
import { SocialSharing } from '@ionic-native/social-sharing';
import { CallNumber } from '@ionic-native/call-number';
import { YoutubeVideoPlayer } from '@ionic-native/youtube-video-player';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Geolocation } from '@ionic-native/geolocation';
import { SMS } from '@ionic-native/sms';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
import { AppRate } from '@ionic-native/app-rate';
import { Keyboard } from '@ionic-native/keyboard';
import { File } from '@ionic-native/file';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { CacheImgModule } from '../global';
// import { AppVersion } from '@ionic-native/app-version';
// import { ImageCacheDirective } from '../imagecache/imagecache';
import {
	GoogleMaps,
	GoogleMap,
	GoogleMapsEvent,
	GoogleMapOptions,
	CameraPosition,
	MarkerOptions,
	Marker,
	Geocoder
} from '@ionic-native/google-maps';

// import { PreloadImage } from '../components/preload-image/preload-image';
import { ImagePicker } from '@ionic-native/image-picker';
import { Camera } from '@ionic-native/camera';
import { FileTransfer } from '@ionic-native/file-transfer';
import { Network } from '@ionic-native/network';
import { Globalization } from '@ionic-native/globalization';
import { EmailComposer } from '@ionic-native/email-composer';
import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal';


import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import { LoginProvider } from '../providers/login/login';
import { AfProvider } from '../providers/af/af';
// import { SwipeUpDirective } from '../directives/swipe-up/swipe-up';
import { ParallaxHeaderDirective } from '../directives/parallax-header/parallax-header';
import { DirectivesModule } from '../directives/directives.module';
import { ParallaxHeaderDirectiveModule } from '../directives/parallax-header/parallax-header.module';
// import { SwipeUpDirectiveModule } from '../directives/swipe-up/swipe-up.module';

import { ComponentsModule } from '../components/components.module';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { PaymentProvider } from '../providers/payment/payment';

import { AgmCoreModule } from '@agm/core';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { LocalNotifications } from '@ionic-native/local-notifications';
//Register fr language
registerLocaleData(localeFr);

export const firebaseConfig = {
	apiKey: 'AIzaSyAH4HdWE-iXXMdOX-KNAWCH_wXk8OGZ_1c',
	authDomain: 'besat-mobile.firebaseapp.com',
	databaseURL: 'https://besat-mobile.firebaseio.com',
	projectId: 'besat-mobile',
	storageBucket: 'besat-mobile.appspot.com',
	messagingSenderId: '662065602888'
};

@NgModule({
	declarations: [ MyApp, TabsPage ],
	imports: [
		
		BrowserModule,
		IonicModule.forRoot(MyApp),
		// SwipeUpDirectiveModule,
		ParallaxHeaderDirectiveModule,
		AgmCoreModule.forRoot({
			apiKey: "AIzaSyAH4HdWE-iXXMdOX-KNAWCH_wXk8OGZ_1c",
			libraries: ["places"]
		  }),
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: setTranslateLoader,
				deps: [ HttpClient ]
			}
		}),
		HttpModule,
		HttpClientModule,
		Ionic2RatingModule,
		CacheImgModule.forRoot(),
		AngularFireModule.initializeApp(firebaseConfig),
		AngularFireDatabaseModule,
		AngularFireOfflineModule,
		IonicStorageModule.forRoot({
			name: '_ona_va'
		})
	],
	bootstrap: [ IonicApp ],
	entryComponents: [ MyApp, TabsPage ],
	providers: [
		StatusBar,
		SocialSharing,
		CallNumber,
		ImagePicker,
		Camera,
		FileTransfer,
		Network,
		Geolocation,
		// AppUpdate,
		GoogleMaps,
		Geocoder,
		LaunchNavigator,
		EmailComposer,
		SMS,
		HttpClientModule,
		SplashScreen,
		AppRate,
		Globalization,
		File,
		SpeechRecognition,
		YoutubeVideoPlayer,
		Keyboard,
		InAppBrowser,
		LocalNotifications,
		{ provide: ErrorHandler, useClass: IonicErrorHandler },
		LoginProvider,
		AfProvider,
		AuthProvider,
		LocationAccuracy,
		WpPersistenceProvider,
		PayPal,
		BarcodeScanner,
    	PaymentProvider
	]
})
export class AppModule {}

export function setTranslateLoader(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}