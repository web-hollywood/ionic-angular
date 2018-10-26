import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { HomePage } from "./home";
import { ComponentsModule } from "../../components/components.module";
import { SharedModule } from "../../app/shared.module";

@NgModule({
	declarations: [HomePage],
	imports: [ComponentsModule, SharedModule, IonicPageModule.forChild(HomePage)],
	exports: [HomePage]
})
export class HomePageModule {}
