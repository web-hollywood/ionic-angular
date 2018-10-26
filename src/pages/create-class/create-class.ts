import { Component } from "@angular/core";
import { NavController, NavParams, Events, Platform } from "ionic-angular";
import { ClassService } from "../../providers/class-service";
import { UtilService } from "../../providers/util-service";
import { Config } from "../../providers/config";
import { IonicPage } from "ionic-angular";

@IonicPage()
@Component({
	selector: "page-create-class",
	templateUrl: "create-class.html"
})
export class CreateClassPage {
	newClass: any = {};
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public events: Events,
		public classService: ClassService,
		public utilService: UtilService,
		public config: Config,
		public platform: Platform
	) {}

	ionViewDidLoad() {
		console.log("ionViewDidLoad CreateClassPage");
	}

	createClass() {
		this.newClass.addlibrary = 1;
		this.classService.createClass(this.newClass).subscribe(data => {
			let title = "Class Created";
			let message = "New Class is Created.";
			this.events.publish("update:classes");
			this.utilService.createAlert(title, message);
			this.newClass = {};
		});
	}

	goToDashBoard() {
		if (!this.platform.is("cordova")) {
			let url = "https://dashboard.moxiereader.com/";
			console.log("open!" + url);
			window.open(url, "_system", "location=yes");
		}
	}
}
