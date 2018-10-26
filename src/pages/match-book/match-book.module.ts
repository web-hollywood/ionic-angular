import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { MatchBookPage } from "./match-book";
import { ComponentsModule } from "../../components/components.module";

@NgModule({
	declarations: [MatchBookPage],
	imports: [ComponentsModule, IonicPageModule.forChild(MatchBookPage)]
})
export class MatchBookPageModule {}
