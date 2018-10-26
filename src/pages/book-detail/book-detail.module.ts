import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { BookDetailPage } from "./book-detail";
import { ComponentsModule } from "../../components/components.module";
import { SharedModule } from "../../app/shared.module";

@NgModule({
	declarations: [BookDetailPage],
	imports: [
		ComponentsModule,
		SharedModule,
		IonicPageModule.forChild(BookDetailPage)
	]
})
export class BookDetailPageModule {}
