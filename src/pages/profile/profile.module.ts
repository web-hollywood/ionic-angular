import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ProfilePage } from "./profile";

@NgModule({
	declarations: [ProfilePage],
	imports: [IonicPageModule.forChild(ProfilePage)],
	exports: [ProfilePage],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfilePageModule {}
