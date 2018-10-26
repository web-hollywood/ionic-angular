import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ClassLibraryPage } from "./class-library";
import { SharedModule } from "../../app/shared.module";
import { ComponentsModule } from "../../components/components.module";

@NgModule({
	declarations: [ClassLibraryPage],
	imports: [
		SharedModule,
		ComponentsModule,
		IonicPageModule.forChild(ClassLibraryPage)
	]
})
export class ClassLibraryPageModule {}
