import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { IonicModule } from "ionic-angular";
import { FeedItemComponent } from "./feed-item/feed-item";
// import { PopoverComponent } from './popover/popover';
import { RunOnLoad } from "./run-on-load/run-on-load";
import { ReadingBarComponent } from "./reading-bar/reading-bar";
import { ReviewCardComponent } from "./review-card/review-card";
import { StudentBookListComponent } from "./student-book-list/student-book-list";
import { StudentListComponent } from "./student-list/student-list";
import { TubItemComponent } from "./tub-item/tub-item";
import { UserRegistrationComponent } from "./user-registration/user-registration";
import { SharedModule } from "../app/shared.module";
import { PipeModule } from "../pipes/pipe.module";

@NgModule({
	declarations: [
		FeedItemComponent,

		// PopoverComponent,
		ReadingBarComponent,
		ReviewCardComponent,
		StudentBookListComponent,
		StudentListComponent,
		TubItemComponent,
		UserRegistrationComponent,
		RunOnLoad
	],
	imports: [IonicModule, SharedModule, PipeModule],
	exports: [
		FeedItemComponent,
		// PopoverComponent,
		ReadingBarComponent,
		ReviewCardComponent,
		StudentBookListComponent,
		StudentListComponent,
		TubItemComponent,
		UserRegistrationComponent,
		RunOnLoad
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ComponentsModule {}
