import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { PopoverSearch } from "./popover-search";

@NgModule({
	declarations: [PopoverSearch],
	imports: [IonicPageModule.forChild(PopoverSearch)]
})
export class PopoverSearchModule {}
