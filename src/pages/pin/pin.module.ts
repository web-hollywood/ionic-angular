import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { PinPage } from "./pin";
import { SharedModule } from "../../app/shared.module";
import { IonDigitKeyboard } from "../../components/ion-digit-keyboard/ion-digit-keyboard";

@NgModule({
	declarations: [PinPage, IonDigitKeyboard],
	imports: [SharedModule, IonicPageModule.forChild(PinPage)]
})
export class PinPageModule {}
