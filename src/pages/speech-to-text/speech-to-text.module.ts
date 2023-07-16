import { NgModule } from '@angular/core';
import { SpeechToTextPage } from './speech-to-text';
import { IonicPageModule } from 'ionic-angular';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [SpeechToTextPage],
  imports: [IonicPageModule.forChild(SpeechToTextPage), TranslateModule.forChild()],
})
export class SpeechToTextPageModule {}
