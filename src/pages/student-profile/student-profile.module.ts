import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { StudentProfilePage } from "./student-profile";
import { ComponentsModule } from "../../components/components.module";
import { SharedModule } from "../../app/shared.module";

@NgModule({
	declarations: [StudentProfilePage],
	imports: [
		ComponentsModule,
		SharedModule,
		IonicPageModule.forChild(StudentProfilePage)
	]
})
export class StudentProfilePageModule {}
