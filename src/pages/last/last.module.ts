import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LastPage } from './last';
import { ComponentsModule } from '../../components/components.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    LastPage,
  ],
  imports: [
    IonicPageModule.forChild(LastPage),
    ComponentsModule,
		TranslateModule.forChild(),
  ],
})
export class LastPageModule {}
