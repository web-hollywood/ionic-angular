import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { ReviewallPage } from "./reviewall";
import { ComponentsModule } from "../../components/components.module";

@NgModule({
	declarations: [ReviewallPage],
	imports: [ComponentsModule, IonicPageModule.forChild(ReviewallPage)]
})
export class ReviewallPageModule {}
