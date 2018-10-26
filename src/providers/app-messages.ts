import { Injectable } from "@angular/core";
import { Events } from "ionic-angular";
import { Storage } from "@ionic/storage";
import "rxjs/add/operator/map";
import { Config } from "../providers/config";
import { Http } from "@angular/http";

@Injectable()
export class AppMessages {
	// This is a fake version change to app version numbers
	// private currentAppVersion:number = 100;

	constructor(
		public storage: Storage,
		public config: Config,
		public http: Http,
		public events: Events
	) {}

	checkLoginDataForMessages(data) {
		console.log("checkLoginDataForMessages", data);
		var messages = [];

		if (data.info != null) {
			if (this.compareAppVersion(data.info) != null) {
				messages.push(this.compareAppVersion(data.info));
			}
		}

		//NOTE: This is hidden for https://github.com/moxiereader/Internal/issues/445
		/*
    if (data.license != null) {
      if (this.checkLicense(data.license) != null) {
        messages.push(this.checkLicense(data.license));
      }
    }
    */

		if (messages.length) {
			this.events.publish("message:displayMessage", messages);
		}
	}

	checkDemo(data) {
		console.log("checkDemoMessage", data);
		var messages = [];

		if (data.license != null) {
			if (this.checkLicense(data.license) != null) {
				messages.push(this.checkLicense(data.license));
			}
		}

		if (messages.length) {
			this.events.publish("message:displayMessage", messages);
		}
	}

	checkLicense(license) {
		console.log("license ", license);
		let demo = {
			title: "Enjoy MoxieReader in demo mode!!",
			text:
				"Check your email to activate your subscription to create your own class!"
		};
		if (license.details == null) {
			return demo;
		} else {
			let type = license.details.type;
			if (type == undefined || type == null || type == "" || type == "demo") {
				return demo;
			}
		}
	}

	compareAppVersion(info) {
		let appMinimum = parseInt(info.app_minimum);
		let appRecommended = parseInt(info.app_recommended);
		console.log("appMinimum : ", appMinimum);
		console.log("appRecommended : ", appRecommended);
		console.log("config.appVersion : ", this.config.appVersion);
		if (
			this.config.appVersion != null &&
			appMinimum != null &&
			appRecommended != null
		) {
			if (this.config.appVersion < appMinimum) {
				return {
					title: "News from the Hamsters!",
					text:
						"Your app is really far behind the curve. Update in the app store to keep it working top notch!",
					action: {
						title: "Launch App Store",
						event: "open:appstore"
					}
				};
			}
			if (this.config.appVersion < appRecommended) {
				return {
					title: "News from the Hamsters!",
					text:
						"Your app needs an update. Click here to head to the app store!",
					action: {
						title: "Launch App Store",
						event: "open:appstore"
					}
				};
			}
		}
	}
}
