import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { HomeParentPage } from "./home-parent";
import { ComponentsModule } from "../../components/components.module";
import { SharedModule } from "../../app/shared.module";

@NgModule({
	declarations: [HomeParentPage],
	imports: [
		ComponentsModule,
		SharedModule,
		IonicPageModule.forChild(HomeParentPage)
	]
})
export class HomeParentPageModule {}
