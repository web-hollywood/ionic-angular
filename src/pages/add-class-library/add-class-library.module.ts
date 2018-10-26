import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { AddClassLibraryPage } from "./add-class-library";
import { ComponentsModule } from "../../components/components.module";

@NgModule({
	declarations: [AddClassLibraryPage],
	imports: [ComponentsModule, IonicPageModule.forChild(AddClassLibraryPage)]
})
export class AddClassLibraryPageModule {}
