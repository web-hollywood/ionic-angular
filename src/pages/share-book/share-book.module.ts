import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ShareBookPage } from "./share-book";
import { SharedModule } from "../../app/shared.module";

@NgModule({
	declarations: [ShareBookPage],
	imports: [
		SharedModule,
		IonicPageModule.forChild(ShareBookPage)
	]
})
export class SettingsPageModule {}
