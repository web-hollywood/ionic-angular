import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { SearchBookPage } from "./search-book";
import { ComponentsModule } from "../../components/components.module";

@NgModule({
	declarations: [SearchBookPage],
	imports: [ComponentsModule, IonicPageModule.forChild(SearchBookPage)]
})
export class SearchBookPageModule {}
