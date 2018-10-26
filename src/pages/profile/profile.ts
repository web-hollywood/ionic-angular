import { Component } from "@angular/core";
import { NavController, NavParams, Events } from "ionic-angular";
import { Config } from "../../providers/config";
import { IonicPage } from "ionic-angular";

@IonicPage()
@Component({
	selector: "page-profile",
	templateUrl: "profile.html"
})
export class ProfilePage {
	mode: string;
	student_id: number;
	mytimer: any;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public config: Config,
		public events: Events
	) {
		this.mode = this.config.mode;
		this.events.subscribe("change:mode", mode => {
			this.mode = mode;
		});
	}

	ionViewWillEnter() {
		console.log("profile view ionViewWillEnter");
	}
	ionViewDidEnter() {
		console.log("profile view ionViewDidEnter");
		this.student_id = this.config.student_id;
		this.config.firstload = true;
		if (this.mytimer) clearTimeout(this.mytimer);
		//this.mytimer = setTimeout(() => {
		this.events.publish("load:student");
		//}, 500);
	}
	ionViewDidLoad() {
		console.log("profile view ionViewDidLoad");
	}
}
