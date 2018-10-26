import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { BookLoggingPage } from "./book-logging";
import { ComponentsModule } from "../../components/components.module";
import { SharedModule } from "../../app/shared.module";

@NgModule({
	declarations: [BookLoggingPage],
	imports: [
		ComponentsModule,
		SharedModule,
		IonicPageModule.forChild(BookLoggingPage)
	]
})
export class BookLoggingPageModule {}
