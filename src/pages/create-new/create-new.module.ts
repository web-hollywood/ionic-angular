import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { CreateNewPage } from "./create-new";
import { SharedModule } from "../../app/shared.module";

@NgModule({
	declarations: [CreateNewPage],
	imports: [SharedModule, IonicPageModule.forChild(CreateNewPage)]
})
export class CreateClassNewModule {}
