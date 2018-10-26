import { Component } from "@angular/core";
import {
	NavController,
	NavParams,
	Events,
	ModalController,
	ViewController,
	LoadingController
} from "ionic-angular";
import { BookService } from "../../providers/book-service";
import { ClassService } from "../../providers/class-service";
import { Config } from "../../providers/config";
import { StudentService } from "../../providers/student-service";
import { UtilService } from "../../providers/util-service";
import { EventsService } from "../../providers/events-service";
import { Auth } from "../../providers/auth";
import { IonicPage } from "ionic-angular";

@IonicPage()
@Component({
	selector: "page-reviewall",
	templateUrl: "reviewall.html"
})
export class ReviewallPage {
	bookId: any;
	reviewList = [];

	constructor(
		public navCtrl: NavController,
		public viewCtrl: ViewController,
		public navParams: NavParams,
		public eventsService: EventsService,
		public utilService: UtilService,
		public bookService: BookService,
		public classService: ClassService,
		public studentService: StudentService,
		public events: Events,
		public config: Config,
		public auth: Auth,
		public modalCtrl: ModalController,
		public loading: LoadingController
	) {
		this.bookId = navParams.get("bookId");
	}

	ionViewWillEnter() {
		this.loadData();
	}

	ngOnChanges() {
		this.loadData();
	}

	loadData() {
		this.bookService.getBookByClass(this.bookId).subscribe(data => {
			let bookEvent = data.events;
			this.reviewList = [];
			for (let i in bookEvent) {
				if (bookEvent[i].event_type == "review") {
					this.reviewList.push(bookEvent[i]);
				}
			}
			console.log(this.reviewList);
		});
	}

	editReview(ev: any) {
		console.log(ev);
		this.bookService.getBook(ev.book_id, ev.student_id).subscribe(data => {
			let modal = this.modalCtrl.create("ReviewPage", {
				book: data.book,
				studentId: ev.student_id
			});
			modal.onDidDismiss(data => {
				this.loadData();
			});
			modal.present();
		});
	}

	removeReview(re, i) {
		console.log(re);
		this.eventsService.deleteEvent(re.id).subscribe(
			data => {
				this.reviewList.splice(i, 1);
			},
			err => { }
		);
	}
}
