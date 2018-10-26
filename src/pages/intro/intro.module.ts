import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { SharedModule } from "../../app/shared.module";
import { IntroPage } from "./intro";

@NgModule({
	declarations: [IntroPage],
	imports: [SharedModule, IonicPageModule.forChild(IntroPage)]
})
export class IntroPageModule {}
