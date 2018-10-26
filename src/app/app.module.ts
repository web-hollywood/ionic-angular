import { NgModule, ErrorHandler, enableProdMode } from "@angular/core";
import { IonicApp, IonicModule, IonicErrorHandler } from "ionic-angular";
// import { IonicStorageModule } from '@ionic/storage';
// import { MomentModule } from 'angular2-moment';
// import { Ionic2RatingModule } from 'ionic2-rating';
import { BrowserModule } from "@angular/platform-browser";
import { HttpModule } from "@angular/http";
import { SwiperModule } from "ngx-swiper-wrapper";
import { SwiperConfigInterface } from "ngx-swiper-wrapper";

// Page and Main App Component
import { MyApp } from "./app.component";

// Providers
import { Auth } from "../providers/auth";
import { Config } from "../providers/config";
import { ClassService } from "../providers/class-service";
import { StudentService } from "../providers/student-service";
import { BookService } from "../providers/book-service";
import { EventsService } from "../providers/events-service";
import { UtilService } from "../providers/util-service";
import { TubsService } from "../providers/tubs-service";
import { ScanService } from "../providers/scan-service";
import { HomeService } from "../providers/home-service";
import { AppMessages } from "../providers/app-messages";

import { ComponentsModule } from "../components/components.module";
import { PopoverComponent } from "../components/popover/popover";
import { AppMessagesComponent } from "../components/app-messages/app-messages";

// Ionic Native Services
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { AppVersion } from "@ionic-native/app-version";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { Network } from "@ionic-native/network";
import { Camera } from "@ionic-native/camera";
import { Keyboard } from "@ionic-native/keyboard";

// Pages
// import { TabsPage } from "../pages/tabs/tabs";

// Enabling Producation mode
enableProdMode();

// Scandit SDK deps
import { Enums } from "../providers/enums";
import { Scanner } from "../providers/scanner";
import { ScannerSettings } from "../providers/scanner-settings";

//Native page transitions
import { NativePageTransitions } from "@ionic-native/native-page-transitions";

//Const for Swiper
const SWIPER_CONFIG: SwiperConfigInterface = {
	direction: "horizontal",
	slidesPerView: "auto",
	keyboardControl: true
};

// Enabling Producation mode
enableProdMode();

@NgModule({
	declarations: [MyApp, PopoverComponent, AppMessagesComponent],
	imports: [
		BrowserModule,
		HttpModule,
		IonicModule.forRoot(MyApp),
		SwiperModule.forRoot(SWIPER_CONFIG),
		ComponentsModule
	],
	bootstrap: [IonicApp],
	entryComponents: [MyApp, PopoverComponent, AppMessagesComponent],
	providers: [
		StatusBar,
		SplashScreen,
		Auth,
		Config,
		ClassService,
		StudentService,
		BookService,
		EventsService,
		UtilService,
		TubsService,
		{ provide: ErrorHandler, useClass: IonicErrorHandler },
		Scanner,
		ScannerSettings,
		Enums,
		ScanService,
		HomeService,
		NativePageTransitions,
		AppMessages,
		AppVersion,
		InAppBrowser,
		Network,
		Camera,
		Keyboard
	]
})
export class AppModule {}
