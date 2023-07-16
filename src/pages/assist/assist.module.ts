import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AssistPage } from './assist';

@NgModule({
  declarations: [
    AssistPage,
  ],
  imports: [
    IonicPageModule.forChild(AssistPage),
  ],
})
export class AssistPageModule {}
