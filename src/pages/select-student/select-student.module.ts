import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { SelectStudentPage } from "./select-student";
import { ComponentsModule } from "../../components/components.module";

@NgModule({
	declarations: [SelectStudentPage],
	imports: [ComponentsModule, IonicPageModule.forChild(SelectStudentPage)]
})
export class SelectStudentPageModule {}
