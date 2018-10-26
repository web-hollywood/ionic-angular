import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { OpenFilePage } from "./open-file";
import { ComponentsModule } from "../../components/components.module";

@NgModule({
	declarations: [OpenFilePage],
	imports: [
		ComponentsModule,
		IonicPageModule.forChild(OpenFilePage)
	]
})
export class OpenFilePageModule { }
