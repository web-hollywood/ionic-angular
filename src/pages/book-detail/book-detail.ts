import { Component, ViewChild } from "@angular/core";
import {
	NavController,
	NavParams,
	Events,
	ModalController,
	ViewController,
	Tabs,
	LoadingController
} from "ionic-angular";
import { BookService } from "../../providers/book-service";
import { ClassService } from "../../providers/class-service";
import { Config } from "../../providers/config";
import { StudentService } from "../../providers/student-service";
import { UtilService } from "../../providers/util-service";
import { EventsService } from "../../providers/events-service";
import { Auth } from "../../providers/auth";
import { SwiperConfigInterface, SwiperDirective } from "ngx-swiper-wrapper";
import * as moment from "moment";
import { IonicPage } from "ionic-angular";

@IonicPage()
@Component({
	selector: "page-book-detail",
	templateUrl: "book-detail.html"
})
export class BookDetailPage {
	@ViewChild(SwiperDirective) directiveRef: SwiperDirective;
	book: any = {};
	showPane: boolean;
	bookDetail: any = {};
	tub: Array<any> = [];
	similarBooks: any = [];
	mode: string;
	logHours: any;
	genre: any = [];
	actions: any = [];
	shared: boolean;
	selected: boolean;
	data: any;
	showLogBookAfterOneDay = null;
	isCurrentReading = false;
	currentReading = [];
	sh_v = true;
	rbook: any = null;
	readminAry = [];
	isreadmin = true;
	pageNum = "";
	evReading: any;
	classId: any;
	studentId: any;
	showMore: boolean = false;
	pending: boolean = false;
	isDone: boolean = false;
	bookEvent = [];
	reviewList = [];
	options: any;
	isEditReview = false;
	bookdata: any;
	studentTitle = "";

	sub1: any;
	public config_swiper: SwiperConfigInterface = {
		scrollbar: null,
		direction: "horizontal",
		slidesPerView: 1,
		scrollbarHide: false,
		keyboardControl: false,
		mousewheelControl: false,
		scrollbarDraggable: true,
		scrollbarSnapOnRelease: true,
		//pagination: '.swiper-pagination',
		//paginationClickable: true,
		nextButton: ".swiper-button-next",
		prevButton: ".swiper-button-prev"
	};
	public callback;
	public isChangedReview = false;

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
		this.book = this.navParams.get("book");
		this.isDone = this.navParams.get("isDone");
		this.isCurrentReading = this.navParams.get("isCurrentReading");
		console.log(studentService.studentData);

		try {
			if (this.config.mode == "teacher" || this.config.mode == "class") {
				if (this.studentService.studentData.student) {
					this.studentTitle = this.studentService.studentData.student.title;
				} else {
					this.studentTitle = this.studentService.studentData.title;
				}
			}
			if (this.isCurrentReading) {
				this.sh_v = false;
				this.currentReading = this.book.events;
				this.rbook = this.book;
				this.book = this.rbook.book;
				this.pageNum = this.rbook.pages;
				this.classId = this.rbook.class_id;
				this.studentId = this.rbook.student_id;
				this.config.class_id = this.classId;
				this.config.student_id = this.studentId;
				let sdata = {
					mode: "class",
					class_id: this.classId,
					pin: "",
					student_id: this.studentId
				};
				let loader1 = this.loading.create({
					content: ""
				});
				loader1.present();
				this.auth.changeMode(sdata).subscribe(
					data => {
						this.loadCurrentReading();
						loader1.dismiss();
					},
					err => {
						this.utilService.createError(err);
						loader1.dismiss();
					}
				);
				setTimeout(() => {
					loader1.dismiss();
				}, 1000);
			}
		} catch (err) {
			console.log(err);
		}
		////////////////////////////////
		// setting mode
		this.config.getMode().then(mode => {
			this.mode = mode;
		});
		this.shared = false;
		this.selected = false;
		this.getBook();

		this.sub1 = this.bookService.getSimilarBooks(this.book.id).subscribe(
			data => {
				this.similarBooks = data.books;
			},
			err => {
				this.utilService.createError(err);
			}
		);

		// Mode Change Event
		this.events.subscribe("change:mode", mode => {
			this.mode = mode;
		});

		this.events.subscribe("addToTub: functionCall", eventData => {
			this.getBook();
		});

		this.data = { lastread: "" };

		this.readminAry = [];
		for (let i = 10; i <= 90; i = i + 5) {
			this.readminAry.push({ min: i, val: i });
		}

		this.options = {
			slidesPerView: 1,
			spaceBetween: 0
		};
	}

	ionViewWillEnter() {
		this.callback = this.navParams.get("callback");
	}

	ionViewWillLeave() {
		if (this.sub1) {
			this.sub1.unsubscribe();
		}
		if (this.callback && this.isChangedReview) {
			this.callback("refresh").then(() => { });
		}
	}

	ionViewDidLoad() {
		console.log("ionViewDidLoad BookDetailPage");
	}

	more() {
		try {
			this.showMore = !this.showMore;
			if (this.showMore) {
				setTimeout(() => {
					let w = document.getElementById("div_more").offsetWidth;
					// let t = document.getElementById("bt_more").offsetTop;
					let x = 10;
					if (w > 320) {
						x = 10;
					} else {
						x = 320 - w;
					}
					document.getElementById("div_more").style.left = x + "px";
					document.getElementById("div_more").style.top = "240px";//t * 1 + 25 + "px";
					document.getElementById("div_more").style.right = "auto";
					document.getElementById("div_more").style.opacity = '1';
				}, 100);
			}
		} catch (err) {
			console.log(err);
		}
	}

	// --------- get current Reading ----------
	loadCurrentReading() {
		try {
			var self = this;
			var evHistory = [];
			let loader = this.loading.create({
				content: ""
			});
			loader.present();
			self.studentService
				.getCurrentBooks(this.studentId, this.classId)
				.subscribe(
				data => {
					for (let i = 0; i < data.books.length; i++) {
						if (data.books[i].book_id == self.book.id) {
							this.rbook = data.books[i];
							this.rbook["class_id"] = this.classId;
							this.pageNum = this.rbook.pages;
							evHistory = this.rbook.events;
							break;
						}
					}
					var reads = 0;
					var avg = 0;
					var min = 0;
					var last = this.rbook.updated_at;
					if (this.rbook.event_count) reads = this.rbook.event_count;
					if (this.rbook.pages_average) avg = this.rbook.pages_average;
					if (this.rbook.minutes_average) min = this.rbook.minutes_average;
					this.evReading = { reads: reads, avg: avg, min: min, last: last };

					loader.dismiss();
				},
				err => {
					this.utilService.createError(err);
					loader.dismiss();
				}
				);
			setTimeout(() => {
				loader.dismiss();
			}, 10000);
		} catch (err) {
			console.log(err);
		}
	}
	// --------- ------------------- ----------

	history() { }

	openReview(data) {
		console.log(data);
		let modal = this.modalCtrl.create("ReviewPage", { book: data });
		modal.onDidDismiss(data => {
			this.isChangedReview = true;
			this.getReview();
			this.events.publish("refresh:feed");
		});
		modal.present();
	}

	checkFocus() {
		this.pageNum = "";
	}

	shReading() {
		this.sh_v = !this.sh_v;
	}

	updateReading(book, value, mins) {
		try {
			value = this.pageNum;
			if (parseInt(value) * 100 > parseInt(book.book.pages) * 125) {
				this.utilService.createAlert(
					"Error",
					"Your page number is 125% higher than expected."
				);
				this.loadCurrentReading();
				return;
			}
			console.log(mins);
			if (mins == "" || mins == null) {
				this.utilService.createAlert(
					"Oops!",
					"Don’t forget to record your minutes, too!"
				);
				return;
			}
			let data = {
				event_type: "current",
				student_id: this.studentId,
				book_id: book.book_id,
				pages: value.toString(),
				minutes: mins
			};
			if (this.pending) return;
			this.pending = true;
			this.eventsService.createEvent(data).subscribe(data => {
				book.pages = value;
				let message = `Updated current page to ` + value + ` pages`;
				this.utilService.createToast(message);
				this.pending = false;
				this.loadCurrentReading();
			},
				err => {
					this.utilService.createError(err);
				});
		} catch (err) {
			console.log(err);
		}
	}

	finishReading(book) {
		try {
			let class_id = this.classId;
			let student_id = this.studentId;
			let book_id = book.book_id;

			let modal = this.modalCtrl.create("BookLoggingPage", {
				classid: class_id,
				studentid: student_id,
				bookid: book_id,
				isCurrentReading: true,
				viewc: this.viewCtrl
			});
			modal.present();
		} catch (err) {
			console.log(err);
		}
	}

	openDetail(book) {
		try {
			if (this.config.mode == "parent") {
				let modal = this.modalCtrl.create(BookDetailPage, { book: book.data });
				modal.present();
			} else {
				this.navCtrl.push(BookDetailPage, { book: book.data });
			}
		} catch (err) {
			console.log(err);
		}
	}

	getDate(date) {
		if (date == "") return "";
		return new Date(date);
	}

	getReview() {
		try {
			this.bookService.getBookByClass(this.book.id).subscribe(data => {
				this.bookEvent = data.events;
				this.reviewList = [];
				for (let i in this.bookEvent) {
					if (this.bookEvent[i].event_type == "review") {
						this.reviewList.push(this.bookEvent[i]);
					}
				}
				for (let i = this.reviewList.length - 1; i > -1; i--) {
					if (this.reviewList[i].review == "") {
						this.reviewList.splice(i, 1);
					}
				}
				var temp = this.reviewList;
				this.reviewList = [];
				for (let i = temp.length - 1; i > -1; i--) {
					this.reviewList.push(temp[i]);
				}
				if (this.directiveRef) {
					this.directiveRef.update();
				}
				
				console.log(this.reviewList);
			},
				err => {
					this.utilService.createError(err);
				});
		} catch (err) {
			console.log(err);
		}
	}

	getBook() {
		try {
			let loader2 = this.loading.create({
				content: ""
			});
			loader2.present();
			this.bookService.getBook(this.book.id, this.config.student_id).subscribe(
				data => {
					this.bookdata = data;

					this.data = data;
					console.log(this.data);
					for (let i = 0; i < this.data.events.length; i++) {
						if (this.data.events[i].event_type == "log") {
							this.isEditReview = true;
							break;
						}
					}
					if (eval(this.data.counts.log) > 0) {
						this.isEditReview = true;
					}

					// Add the review to the reviewlist object
					/*
        this.bookEvent = data.events;
        this.reviewList = [];
        for(let i in this.bookEvent) {
          if(this.bookEvent[i].event_type == 'review') {
            this.reviewList.push(this.bookEvent[i]);
          }
        }*/
					this.getReview();

					this.bookDetail = data.book;
					this.tub = data.tub;
					let currentDateString: string = new Date().toISOString();
					let logDateString: string = data.lastread;
					let currentDate = new Date(currentDateString);
					let logDate = new Date(logDateString);
					let duration =
						(currentDate.valueOf() - logDate.valueOf()) / 1000 / 3600 / 24;
					if (duration >= 30) {
						this.logHours = Math.ceil(duration / 30) + " months ago ";
					} else this.logHours = Math.ceil(duration) + " days ago";
					if (duration < 1) {
						this.logHours = Math.ceil(duration * 24) + " hours ago";
					}
					if (data.lastread == null) {
						this.logHours = "You are first on this book";
					}

					let currentTime = moment(new Date());
					if (data.lastread == null) {
						this.showLogBookAfterOneDay = null;
					} else {
						this.showLogBookAfterOneDay = currentTime.diff(data.lastread, "h");
					}

					this.genre = Object.keys(this.bookDetail.genre);
					this.actions = data.actions;
					if (this.actions[0]["done"]) {
						this.shared = true;
					}
					if (this.actions[1]["done"]) {
						this.selected = true;
					}

					loader2.dismiss();
				},
				err => {
					this.utilService.createError(err);
					loader2.dismiss();
					this.utilService.createAlertTimeout(
						() => {
							this.getBook();
						},
						() => {
							this.viewCtrl.dismiss();
						}
					);
				}
			);
		} catch (err) {
			console.log(err);
		}
	}

	shareBook() {
		try {
			let book_id = this.bookDetail.id;
			if (this.mode === "teacher") {
				let readinggroups = this.classService.classData.readinggroups;
				let modal = this.modalCtrl.create("ShareReadingGroupPage", {
					readinggroups: readinggroups,
					book_id: book_id
				});
				modal.present();
			} else {
				let readinggroups = this.classService.classData.readinggroups;
				let modal = this.modalCtrl.create('ShareBookPage', { readinggroups: readinggroups, book_id: book_id });
				modal.present();

				// let read_info: any;
				// this.studentService
				// 	.getStudent(this.config.student_id, this.config.class_id)
				// 	.subscribe(data => {
				// 		read_info = data.readinggroup;
				// 		let data1 = {
				// 			book_id: book_id,
				// 			event_type: "share",
				// 			readinggroup_id: read_info.id
				// 		};
				// 		let loader = this.loading.create({
				// 			content: ""
				// 		});
				// 		this.eventsService.createEvent(data1).subscribe(data => {
				// 			let message = `Sharing to your reading group. Get extra points by getting somone to read this book`;
				// 			this.utilService.createToast(message);
				// 			var t: Tabs = this.navCtrl.parent;
				// 			if (this.config.mode == "class") {
				// 				t.select(3);
				// 			}
				// 			this.events.publish("load:currentreading");
				// 			loader.dismiss();
				// 		});
				// 	});
			}
		} catch (err) {
			console.log(err);
		}
	}

	selectBook() {
		try {
			let book_id = this.bookDetail.id;
			if (this.mode === "teacher") {
				//in teacher mode
				let selectedClass = this.classService.classData;
				let modal = this.modalCtrl.create("SelectStudentPage", {
					studentList: selectedClass,
					book_id: book_id
				});
				modal.present();
			} else {
				//in student mode
				let student: any;
				this.studentService
					.getStudent(this.config.student_id, this.config.class_id)
					.subscribe(data => {
						student = data.student;
						let event_data = {
							student_id: student.id,
							book_id: this.bookDetail.id,
							event_type: "select"
						};

						let loader = this.loading.create({
							content: ""
						});
						loader.present();
						this.eventsService.createEvent(event_data).subscribe(data => {
							let message = `We have added this to your selected list.`;
							this.utilService.createToast(message);
							var t: Tabs = this.navCtrl.parent;
							if (this.config.mode == "class") {
								t.select(3);
							}
							this.events.publish("load:currentreading");
							loader.dismiss();
						});
					});
			}
		} catch (err) {
			console.log(err);
		}
	}

	addToLibrary(option) {
		try {
			let class_id = this.classService.classData.class.id;
			let book_id = this.bookDetail.id;
			let modal;
			if (option == 1) {
				modal = this.modalCtrl.create("SelectTubPage", {
					class_id: class_id,
					book_id: book_id,
					option: option
				});
			} else if (option == 2) {
				modal = this.modalCtrl.create("SelectTubPage", {
					class_id: class_id,
					book_id: book_id,
					option: option
				});
			} else if (option == 3) {
				let readinggroups = this.classService.classData.readinggroups;
				modal = this.modalCtrl.create("ShareReadingGroupPage", {
					readinggroups: readinggroups,
					book_id: book_id,
					option: "aloud"
				});
			}
			modal.present();
			this.showMore = false;
		} catch (err) {
			console.log(err);
		}
	}

	logBook() {
		this.showMore = false;
		try {
			if (
				this.showLogBookAfterOneDay > 12 ||
				this.showLogBookAfterOneDay == null
			) {
				var stitle = "";
				if (this.studentService.studentData.student)
					stitle = this.studentService.studentData.student.title;
				if (this.config.mode == 'class') {
					this.events.publish("toggle:tab", "none");
				}
				this.navCtrl.push("BookLoggingPage", {
					bookdata: this.bookdata,
					stitle: stitle
				});
				//let modal = this.modalCtrl.create(BookLoggingPage, {bookid:this.book.id});
				//modal.present();
			} else {
				this.utilService.createAlert(
					"Log Again",
					"Sorry, You can't log the same book twice on a day!"
				);
			}
		} catch (err) {
			console.log(err);
		}
	}

	done() {
		this.viewCtrl.dismiss().catch();
	}

	selectReview(item) {
		let bookId = item.book_id;
		this.navCtrl.push("ReviewallPage", { bookId: bookId });
	}
	
	openFile(data) { console.log(data);
		try {
			let modal = this.modalCtrl.create("OpenFilePage", { data: data });
			modal.present();
		} catch (err) {
			console.log(err);
		}
	}

}
