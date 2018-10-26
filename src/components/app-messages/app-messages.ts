import { Component } from "@angular/core";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import {
	NavController,
	NavParams,
	ViewController,
	Platform
} from "ionic-angular";

@Component({
	selector: "app-messages",
	templateUrl: "app-messages.html"
})
export class AppMessagesComponent {
	messages: any;

	constructor(
		public iab: InAppBrowser,
		public navCtrl: NavController,
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public platform: Platform
	) {
		this.messages = this.navParams.get("messages");
	}

	fireEvent(eventName) {
		// This should be setup to fire an event which can be responded to
		console.log("Fire!" + eventName);
		if (eventName == "open:appstore") {
			let url = "https://app.moxiereader.com";
			let url_ios =
				"https://itunes.apple.com/app/moxiereader/id1181588105?mt=8";
			let url_android =
				"https://play.google.com/store/apps/details?id=com.moxiemethods.moxiereader";

			let options = "location=yes,toolbar=no,hardwareback=yes";
			if (this.platform.is("ios")) {
				this.iab.create(url_ios, "_blank", options);
			} else if (this.platform.is("android")) {
				this.iab.create(url_android, "_blank", options);
			} else {
				window.open(url, "_system", "location=yes");
			}
		}
	}

	dismiss() {
		this.viewCtrl.dismiss();
	}
}
