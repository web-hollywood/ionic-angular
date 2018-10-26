import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { BookListPage } from "./book-list";
import { ComponentsModule } from "../../components/components.module";

@NgModule({
	declarations: [BookListPage],
	imports: [ComponentsModule, IonicPageModule.forChild(BookListPage)]
})
export class BookListPageModule {}
