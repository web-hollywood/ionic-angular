import { Component } from "@angular/core";
import {
	NavController,
	NavParams,
	ViewController,
	LoadingController,
	Events
} from "ionic-angular";
import { EventsService } from "../../providers/events-service";
import { UtilService } from "../../providers/util-service";
import { Config } from "../../providers/config";
import { IonicPage } from "ionic-angular";

@IonicPage()
@Component({
	selector: "page-select-student",
	templateUrl: "select-student.html"
})
export class SelectStudentPage {
	studentList: any;
	book_id: string;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public eventsService: EventsService,
		public utilService: UtilService,
		public events: Events,
		public loading: LoadingController,
		public config: Config
	) {
		this.studentList = this.navParams.get("studentList");
		this.book_id = this.navParams.get("book_id");
	}

	ionViewDidLoad() {}

	selectBook($event) {
		let data = {
			student_id: $event.id,
			book_id: this.book_id,
			event_type: "select"
		};
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.eventsService.createEvent(data).subscribe(
			data => {
				let message = `We have added this to ${$event.title}'s selected list.`;
				this.utilService.createToast(message);
				loader.dismiss();
				this.events.publish("load:currentreading");
			},
			err => {
				loader.dismiss();
			}
		);
		this.viewCtrl.dismiss();
	}
}
