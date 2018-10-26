import { Component, ViewChild } from "@angular/core";
import {
	IonicPage,
	NavController,
	NavParams,
	Events,
	Slides,
	ModalController,
	ViewController
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { ClassService } from "../../providers/class-service";
import { StudentService } from "../../providers/student-service";
import { Config } from "../../providers/config";
import { Auth } from "../../providers/auth";
import { EventsService } from "../../providers/events-service";
import { TubsService } from "../../providers/tubs-service";
import { UtilService } from "../../providers/util-service";
@IonicPage()
@Component({
	selector: "tub-content-list",
	templateUrl: "tub-content-list.html"
})
export class TubContentList {
	teacher: any;
	mode: string;
	classrooms: any;
	books_auto_items: any[];
	library: any[];
	filtered_tub_books: any[];
	selectedClass: any = {};
	classFeed: any = {};
	title: string = "Teacher";
	class_id: any;
	tub_id: any;
	fromMyClassLibrary: boolean;

	@ViewChild(Slides) slides: Slides;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public modalCtrl: ModalController,
		public storage: Storage,
		public classService: ClassService,
		public studentService: StudentService,
		public viewCtrl: ViewController,
		public events: Events,
		public config: Config,
		public eventsService: EventsService,
		public utilService: UtilService,
		public tubsService: TubsService,
		public auth: Auth
	) {
		let tub = this.navParams.get("tub");
		let class_id = this.navParams.get("class_id");
		this.fromMyClassLibrary = this.navParams.get("fromMyClassLibrary");
		if (this.fromMyClassLibrary == undefined) this.fromMyClassLibrary = false;
		console.log(tub);
		this.class_id = class_id;
		this.tub_id = tub.id;

		this.books_auto_items = [];
		this.classService.getClassLibrary(class_id).subscribe(data => {
			this.library = data.books;
			this.books_auto_items = [];
			this.library.forEach(item => {
				if (typeof item.book === "object") {
					if (item.book.title != undefined && item.book.title != null)
						this.books_auto_items.push(item);
				}
			});
			this.filtered_tub_books = [];
			for (var book of this.books_auto_items) {
				if (book.title == tub.title) {
					this.filtered_tub_books.push(book);
				}
			}

			for (var book of this.filtered_tub_books) {
			}

			this.events.publish("update:tubs");
		});

		this.config.getConfig().then(data => {
			let class_id = this.navParams.get("class_id");
			if (!class_id) {
				this.teacher = data;
				this.classrooms = this.teacher.classrooms;
				class_id = this.class_id = Object.keys(this.classrooms)[1];
			}
			this.getClassData(class_id);
			this.config.class_id = class_id;
		});
	}

	getClassData(classID) {
		this.classService.getStudents(classID).subscribe(data => {
			// Setting ClassID in Config Object
			this.config.class_id = data.class.id;
			this.selectedClass = data;
			this.classService.classData = data;
		});
		// Also get Class Feed
		this.getClassFeed(classID);
	}

	getClassFeed(classID) {
		this.classService.getFeed(classID).subscribe(data => {
			this.classFeed = data;
		});
	}

	studentProfile(student) {}

	ionViewDidLoad() {}

	ionViewDidEnter() {}

	openDetail(ev: any) {
		this.navCtrl.push("BookDetailPage", { book: ev.data });
	}

	searchBook(value) {
		this.navCtrl.push("SearchBookPage", { keyword: value });
	}

	addStudent(readingGroup) {
		console.log(readingGroup);
	}

	openEditClass($ev) {
		let modal = this.modalCtrl.create("EditClassPage", { class: $ev });
		modal.present();
	}

	openAddStudent() {}

	selectBook(book_id) {
		let modal = this.modalCtrl.create("SelectStudentPage", {
			studentList: this.selectedClass,
			book_id: book_id
		});
		modal.present();
	}

	cheerBook($event) {
		let data = {
			event_type: "cheer",
			event_id: $event.id
		};

		this.eventsService.createEvent(data).subscribe(data => {
			let message = `Cheering ${$event.student.title}, Nice!`;
			this.utilService.createToast(message);
		});
	}

	shareBook($event) {
		let readinggroups = this.selectedClass.readinggroups;
		let modal = this.modalCtrl.create("ShareReadingGroupPage", {
			readinggroups: readinggroups,
			book_id: $event.book_id
		});
		modal.present();
	}

	viewStudent(student) {
		this.studentProfile(student);
	}

	removeBook(book) {
		var feed = this.classFeed.feed;
		var item = feed.find(item => item.book.id == book.id);
		if (item) {
			this.classFeed.feed.splice(feed.indexOf(item), 1);
			this.eventsService.deleteEvent(item.id).subscribe(data => {
				if (data && data.success) {
					let message = `${data.title}`;
					this.utilService.createToast(message);
				}
			});
		}
	}

	removeBookTub(ev, i) {
		let book = ev;
		this.tubsService
			.deleteBookFromSpecificTub(this.class_id, this.tub_id, book.id)
			.subscribe(data => {
				this.filtered_tub_books.splice(i, 1);
			});
	}

	done() {
		this.tubsService.deleteAllScanedBook().subscribe(data => {
			this.viewCtrl.dismiss();
			this.events.publish("addToTub: functionCall");
		});
	}
}
