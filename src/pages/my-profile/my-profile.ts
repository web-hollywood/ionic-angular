import { Component } from "@angular/core";
import {
	NavController,
	NavParams,
	Events,
	ModalController
} from "ionic-angular";
import { StudentService } from "../../providers/student-service";
import { EventsService } from "../../providers/events-service";
import { ClassService } from "../../providers/class-service";
import { UtilService } from "../../providers/util-service";
import { Config } from "../../providers/config";
import { Auth } from "../../providers/auth";
import { IonicPage } from "ionic-angular";
declare var moxiechart: any;
@IonicPage()
@Component({
	selector: "page-my-profile",
	templateUrl: "my-profile.html"
})
export class MyProfilePage {
	user: any = {};
	studentData: any;
	recommended: Array<any> = [];
	currentBooks: Array<any> = [];
	classFeed: any;
	logFeed: any;
	selectFeed: any;
	studentID: string;
	classID: string;
	mode: string;
	sub: any;
	selectedSeg: string = "logged";
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public studentService: StudentService,
		public config: Config,
		public events: Events,
		public modalCtrl: ModalController,
		public eventsService: EventsService,
		public classService: ClassService,
		public utilService: UtilService,
		public auth: Auth
	) {
		this.events.subscribe("change:mode", mode => {
			this.mode = mode;
		});
	}

	ionViewDidLoad() {
		console.log("ionViewDidLoad MyProfilePage");
	}
}
