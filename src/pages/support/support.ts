import { Component } from "@angular/core";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { IonicPage, NavController, NavParams, Platform } from "ionic-angular";
import { Config } from "../../providers/config";

@IonicPage()
@Component({
	selector: "page-support",
	templateUrl: "support.html"
})
export class SupportPage {
	links: Array<{ title: string; url: string; pageId: string }> = [];
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public iab: InAppBrowser,
		public platform: Platform,
		public config: Config
	) {
		this.links = [
			{
				title: "Join the MoxieReader Home Community",
				url: "groups/MoxieReaderHomeCommunity/",
				pageId: "1835777510083631"
			},
			{
				title: "MoxieReader News",
				url: "moxiereader/",
				pageId: "1104199569671618"
			},
			{
				title: "Support Questions",
				url: "hamsters@moxiereader.com",
				pageId: ""
			},
			{
				title: "MoxieReader Resource Center",
				url: "resources.moxiereader.com/",
				pageId: ""
			}
		];
	}

	ionViewDidLoad() {
		console.log("ionViewDidLoad SupportPage");
		if (this.config.mode != 'parent') {
			this.links.splice(0, 1);
		}
	}

	openLink(index) {
		let url = this.links[index].url;
		let pageId = this.links[index].pageId;
		if (index == 2) {
			window.open("mailto:" + url);
		} else if (index == 3) {
			var realUrl = "http://" + url;
			if (this.platform.is("ios") || this.platform.is("android")) {
				let options = "location=yes,toolbar=no,hardwareback=yes";
				this.iab.create(realUrl, "_system", options);
			} else {
				window.open(realUrl, "_system", "location=yes");
			}
		} else {
			var realUrl = "";
			if (this.platform.is("ios") || this.platform.is("android")) {
				realUrl = "fb://profile/" + pageId;
				let options = "location=yes,toolbar=no,hardwareback=yes";
				this.iab.create(realUrl, "_system", options);
			} else {
				realUrl = "https://www.facebook.com/" + pageId;
				window.open(realUrl, "_system", "location=yes");
			}
		}
		return false;
	}
}
