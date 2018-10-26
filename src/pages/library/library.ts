import { Component } from "@angular/core";
import {
	IonicPage,
	NavController,
	NavParams,
	Platform,
	ModalController,
	LoadingController
} from "ionic-angular";
import { UtilService } from "../../providers/util-service";
import { Config } from "../../providers/config";
import { StudentService } from "../../providers/student-service";
import { EventsService } from "../../providers/events-service";
import { ClassService } from "../../providers/class-service";

@IonicPage()
@Component({
	selector: "page-library",
	templateUrl: "library.html"
})
export class LibraryPage {
	public pages: any;
	public selectedSeg: string = "class";
	public feed: any;
	public feed_school: any;
	private isLoadingFeed = false;
	public popCallback;
	public isCheerClick = false;
	public studentID: any;
	public subscribeFeed: any;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		private platform: Platform,
		public modalCtrl: ModalController,
		public utilService: UtilService,
		public studentService: StudentService,
		public eventsService: EventsService,
		public loading: LoadingController,
		public classService: ClassService,
		public config: Config
	) {
		this.pages = [
			{
				name: "Class Library View",
				component: "ClassLibraryPage",
				type: "page"
			},
			{
				name: "Add to My Class Library",
				component: "AddClassLibraryPage",
				type: "page"
			},
			{ name: "Search All Books", component: "SearchBookPage", type: "page" }
		];
		if (platform.is("ios")) {
		}
		this.popCallback = params => {
			return new Promise((resolve, reject) => {
				this.loadFeed();
				resolve();
			});
		};
	}
	public ionViewWillEnter(): void {
		console.log("library-ionViewWillEnter");
		this.loadFeed();

	}

	ionViewDidLoad() {
		console.log("ionViewDidLoad LibraryPage");
	}

	ionViewWillLeave() {
		console.log("ionViewWillLeave LibraryPage");
		if (this.subscribeFeed) {
			this.subscribeFeed.unsubscribe();
		}
	}
	open(page) {
		if (page.type === "page") {
			if (page.name === "Add to My Class Library") {
				if (this.platform.is("ios") || this.platform.is("android")) {
					let modal = this.modalCtrl.create("AddClassLibraryPage", {});
					modal.present();
				} else {
					this.utilService.createAlert(
						"Quick scan on devices only",
						"Laptop cameras are not clear enough for high quality scanning at this time."
					);
				}
			} else {
				this.navCtrl.push(page.component);
			}
		}
	}

	loadFeed() {
		if (this.studentService.studentData) {
			try {
				this.studentID = this.studentService.studentData.student.id;
			} catch (err) {
				console.log(err);
			}
		}
		
		this.isLoadingFeed = true;
		try {
			this.subscribeFeed = this.studentService.getFeedReviews(this.studentID).subscribe(
				data => {
					this.feed = data.feed;
					for (let i=0; i<this.feed.length; i++) {
						this.feed[i]['isclass'] = false;
						// if (this.feed[i].student) {
						// 	this.feed[i]['title'] = this.feed[i].student.title;
						// }
					}
					this.feed_school = this.feed.map(x => Object.assign({}, x)); 
					for (let i=0; i<this.feed_school.length; i++) {
						this.feed_school[i]['isclass'] = true;
					}

					this.isLoadingFeed = false;
				},
				err => {
					this.utilService.createError(err);
					this.isLoadingFeed = false;
				}
			);
		} catch (err) {
			console.log(err);
			this.isLoadingFeed = false;
		}
	}

	editReview(data, i) {
		console.log(data);
		try {
			let modal;
			if (this.config.mode == 'class') {
				let readonly = true;
				if (this.config.student_id == data.item.student_id) {
					readonly = false;
				}
				modal = this.modalCtrl.create("ReviewPage", { book: data.data, studentId: data.item.student_id, readonly: readonly });
			} else { 
				let studentId: any;
				try {
					studentId = data.item.student.id;
				} catch (err) {
					console.log(err);
				}
				modal = this.modalCtrl.create("ReviewPage", { book: data.data, studentId: studentId });
			}
			modal.onDidDismiss(data => {
				if (data) {
					this.loadFeed();
				}
			});
			modal.present();
		} catch (err) {
			console.log(err);
		}
	}
	
	cheerBook(event) { console.log(event);
		try {
			let feed = event.feed;
			let data;
			// feed['student'] = this.studentService.studentData.student;

			let cheerObj = {
				title: "Cheer",
				added: true,
				animate: false
			};

			if (this.config.mode === "teacher") {
				Object.assign(cheerObj, { user_type: "teacher" });
			} else {
				Object.assign(cheerObj, {
					user_type: "student",
					student_id: this.studentID
				});
			}

			feed.cheer.push(cheerObj);
			this.isCheerClick = true;
		
			data = {
				event_type: "cheer",
				event_id: feed.id,
				student_id: this.studentID,
				reason: "",
				reason_id: null
			}
			let loader = this.loading.create({
				content: ""
			});
			loader.present();
			this.eventsService.getReason()
				.subscribe(data1 => {
					loader.dismiss();
					let reasonList = data1.reasons;
					let readinggroups = this.classService.classData.readinggroups;					
					let modal = this.modalCtrl.create('ShareBookPage', { reasonList: reasonList, cheer: true, data: data, readinggroups: readinggroups });
					modal.present();
					modal.onDidDismiss(da => {
						if (da && da.reason_id) {
							data.reason = da.reason;
							data.reason_id = da.reason_id;
							this.eventsService.createEvent(data).subscribe(data => {
								cheerObj.animate = true;
								if (feed.student != null && feed.student.title != null) {
									let message = `Cheering ${feed.student.title}, Nice!`;
									this.utilService.createToast(message);
									this.loadFeed();
								}
							}, err => {

							});
						}
					});
				}, 
				err => {
					loader.dismiss();
				}
			);
			
		} catch (err) {
			console.log(err);
		}
	}

	openDetail(ev: any) {
		try {
			this.navCtrl.push("BookDetailPage", {
				book: ev.data,
				callback: this.popCallback
			});
		} catch (err) {
			console.log(err);
		}
	}

	openFile(data) {
		try {
			let modal = this.modalCtrl.create("OpenFilePage", { data: data.data });
			modal.present();
		} catch (err) {
			console.log(err);
		}
	}

	click_classBookReviews() {
		this.selectedSeg = 'class';
	}

	click_schoolBookReviews() {
		this.selectedSeg = 'school';
	}

}
