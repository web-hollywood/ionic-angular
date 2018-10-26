import { NgModule } from "@angular/core";
import { IonicPageModule } from "ionic-angular";
import { TubContentList } from "./tub-content-list";
import { ComponentsModule } from "../../components/components.module";

@NgModule({
	declarations: [TubContentList],
	imports: [ComponentsModule, IonicPageModule.forChild(TubContentList)]
})
export class TubContentListModule {}
