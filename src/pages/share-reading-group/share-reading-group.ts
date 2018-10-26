import { Component } from "@angular/core";
import {
	NavController,
	NavParams,
	ViewController,
	LoadingController
} from "ionic-angular";
import { EventsService } from "../../providers/events-service";
import { UtilService } from "../../providers/util-service";
import { Config } from "../../providers/config";
import { IonicPage } from "ionic-angular";
@IonicPage()
@Component({
	selector: "page-share-reading-group",
	templateUrl: "share-reading-group.html"
})
export class ShareReadingGroupPage {
	readinggroups: Array<any> = [];
	book_id: string;
	option: string;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public eventsService: EventsService,
		public utilService: UtilService,
		public loading: LoadingController,
		public config: Config
	) {
		this.readinggroups = this.navParams.get("readinggroups");
		this.book_id = this.navParams.get("book_id");
		this.option = this.navParams.get("option");
		console.log(this.readinggroups);
	}

	ionViewDidLoad() {
		console.log("ionViewDidLoad ShareReadingGroupPage");
	}

	shareBook(group) {
		let share = "share";
		if (this.option == "aloud") share = "readaloud";
		let data = {
			book_id: this.book_id,
			event_type: share,
			readinggroup_id: group.id
		};
		let message = `Sharing to ${
			group.title
		} reading group. Get extra points by getting someone to read this book`;
		if (this.option == "aloud") {
			message =
				"We have put this book into your students book history as read aloud!";
		}

		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.eventsService.createEvent(data).subscribe(
			data => {
				this.utilService.createToast(message);
				loader.dismiss();
			},
			err => {
				loader.dismiss();
			}
		);
		this.viewCtrl.dismiss();
	}

	shareBookWholeClass() {
		let share = "share";
		if (this.option == "aloud") share = "readaloud";
		let data = {
			book_id: this.book_id,
			event_type: share
		};
		let message = `Sharing to Whole Class. Get extra points by getting someone to read this book`;
		if (this.option == "aloud") {
			message =
				"We have put this book into your students book history as read aloud!";
		}
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.eventsService.createEvent(data).subscribe(
			data => {
				this.utilService.createToast(message);
				loader.dismiss();
			},
			err => {
				loader.dismiss();
			}
		);
		this.viewCtrl.dismiss();
	}
}
