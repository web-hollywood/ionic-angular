import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";

import { IonicStorageModule } from "@ionic/storage";
import { MomentModule } from "angular2-moment";
import { Ionic2RatingModule } from "ionic2-rating";
import { SwiperModule } from "ngx-swiper-wrapper";

@NgModule({
	declarations: [],

	imports: [
		CommonModule,
		IonicStorageModule.forRoot({
			name: "__mydb",
			driverOrder: ["indexeddb", "websql", "sqlite"]
		}),
		MomentModule,
		Ionic2RatingModule,
		SwiperModule.forChild()
	],
	exports: [
		CommonModule,
		IonicStorageModule,
		MomentModule,
		Ionic2RatingModule,
		SwiperModule
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedModule {}
