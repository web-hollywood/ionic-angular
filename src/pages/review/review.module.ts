import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ReviewPage } from "./review";
import { SharedModule } from "../../app/shared.module";

@NgModule({
	declarations: [ReviewPage],
	imports: [SharedModule, IonicPageModule.forChild(ReviewPage)]
})
export class ReviewPageModule {}
