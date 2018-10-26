import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ScanBookWebPage } from "./scan-book-web";

@NgModule({
	declarations: [ScanBookWebPage],
	imports: [IonicPageModule.forChild(ScanBookWebPage)]
})
export class ScanBookWebPageModule {}
