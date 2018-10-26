import { Component, ViewChild, ElementRef } from "@angular/core";
import {
	NavController,
	NavParams,
	Events,
	Slides,
	ModalController,
	ViewController,
	Tabs,
	LoadingController,
	Platform
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { ClassService } from "../../providers/class-service";
import { StudentService } from "../../providers/student-service";
import { Config } from "../../providers/config";
import { Auth } from "../../providers/auth";
import { EventsService } from "../../providers/events-service";
import { UtilService } from "../../providers/util-service";
import { BookService } from "../../providers/book-service";
import { Keyboard } from "@ionic-native/keyboard";
import { IonicPage } from "ionic-angular";

@IonicPage()
@Component({
	selector: "page-home-parent",
	templateUrl: "home-parent.html"
})
export class HomeParentPage {
	pinMode: string;
	elementRef: ElementRef;
	teacher: any;
	mode: string;
	mode_title: string;
	view_Flag: boolean;
	autoComplete_show: boolean;
	classrooms: any;
	quality: boolean;
	searchValue: string = "";
	selectedClass: any = {};
	search_items: any[];
	classFeed: any = {};
	title: string = "Teacher";
	class_id: any;
	home_id: any;
	classData: any = {};
	sub: any;
	search_flag: string;
	books: any = [];
	auto_complete_items: any[];
	history_items: any[];
	isFirsTimeLogin: boolean = false;
	isReady: boolean = false;
	isEmpty: boolean = false;

	@ViewChild(Slides) slides: Slides;
	constructor(
		public navCtrl: NavController,
		public modalCtrl: ModalController,
		public viewController: ViewController,
		public loading: LoadingController,
		public storage: Storage,
		public navParams: NavParams,
		public classService: ClassService,
		public studentService: StudentService,
		public events: Events,
		public config: Config,
		public eventsService: EventsService,
		public utilService: UtilService,
		public bookService: BookService,
		private platform: Platform,
		public keyboard: Keyboard,
		public auth: Auth
	) {
		this.history_items = [];
		this.search_items = [];
		this.auto_complete_items = [];
		this.view_Flag = false;
		this.bookService.getHistoryList().subscribe(data => {
			this.history_items = data.data;
			let temp_items = [];
			for (let item of this.history_items) {
				if (
					item.data.q != undefined &&
					item.data.q != "" &&
					item.data.q != "[object Object]"
				) {
					temp_items.push(item);
				}
			}
			this.history_items = temp_items;
		});
		//this.events.publish('toggle:tab', ('none'));
	}

	refresh() {
		this.getClassData(this.home_id);
		setTimeout(() => {
			this.events.publish("toggle:tab", "none");
		}, 1000);
	}

	getClassData(homeID) {
		console.log("YYY======home - getClassData", this.config.goscan);
		this.config.goscan = false;
		this.config.parentFromLogging = false;

		this.isReady = false;
		let self = this;
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.classService.getHomeStudents(homeID).subscribe(
			data => {
				try {
					var homeData = data;
					if (homeData.students.length > 0) {
						self.config.class_id = homeData.students[0].classroom_id;
						self.config.student_id = homeData.students[0].id;
					} else {
						if (loader) loader.dismiss();
					}
					let lastIndex = homeData.students.length - 1;
					var bshow = true;
					homeData.students.forEach((student, index) => {
						self.loadCurrentReading(student).then(
							res => {
								student.currentBooks = res;
								if (index == lastIndex) {
									this.selectedClass = data;
									console.log("this.selectedClass =>", this.selectedClass);
									this.classService.classData = data;
									this.classService.classOptions = data.class;
									this.isReady = true;
									if (
										this.selectedClass &&
										this.selectedClass.students &&
										this.selectedClass.students.length != 0
									) {
										this.isEmpty = false;
										bshow = false;
									}
									if (loader) loader.dismiss();
								}
							},
							err => {
								student.currentBooks = err;
								if (index == lastIndex) {
									this.selectedClass = data;
									console.log("this.selectedClass =>", this.selectedClass);
									this.classService.classData = data;
									this.classService.classOptions = data.class;
									this.isReady = true;
									if (
										this.selectedClass &&
										this.selectedClass.students &&
										this.selectedClass.students.length != 0
									) {
										this.isEmpty = false;
										bshow = false;
									}
									if (loader) loader.dismiss();
								}
							}
						);
					});
					setTimeout(() => {
						if (bshow) self.isEmpty = true;
					}, 5000);
				} catch (err) {
					console.log(err);
				}
			},
			err => {
				this.utilService.createError(err);
				if (loader) loader.dismiss();
			}
		);
	}

	loadCurrentReading(student) {
		// Current Reading Books
		var currentBooks = [];
		let self = this;
		return new Promise((resolve, reject) => {
			if (student.home_status === "waiting") {
				reject([]);
			} else {
				self.studentService
					.getCurrentBooks(student.id, student.classroom_id)
					.subscribe(
						data => {
							try {
								currentBooks = data.books;
								let books = [];
								for (let i = 0; i < currentBooks.length; i++) {
									if (currentBooks[i].book != null) {
										books.push(currentBooks[i]);
									}
								}
								currentBooks = books;

								if (currentBooks.length > 0) {
									var countC = currentBooks.length;
									countC = countC - 1;
									for (let i = 0; i < currentBooks.length; i++) {
										if (
											currentBooks[i].minutes == null ||
											currentBooks[i].minutes == "null"
										) {
											currentBooks[i].minutes = "";
										}
										currentBooks[i]["class_id"] = student.classroom_id;
									}
								}
								resolve(currentBooks);
							} catch (err) {
								console.log(err);
							}
						},
						err => {
							this.utilService.createError(err);
							reject(currentBooks);
						}
					);
			}
		});
	}

	getClassFeed(classID) {
		this.classService.getFeed(classID).subscribe(data => {
			this.classFeed = data;
		},
		err => {
			this.utilService.createError(err);
		});
	}

	getClass(classID) {
		this.classService.getClass(classID).subscribe(data => {
			this.classData = data.class;
		},
		err => {
			this.utilService.createError(err);
		});
	}

	studentProfile(student) {
		console.log("fired student click");
		try {
			let classId = student.classroom_id;
			let newMode = {
				mode: "class",
				class_id: classId,
				student_id: student.id
			};
			this.config.loginMode = "parent";
			this.config.changeable = false;
			let loader = this.loading.create({
				content: ""
			});
			loader.present();
			this.studentService.getStudent(student.id, classId).subscribe(
				data => {
					this.studentService.studentData = data;
					this.config.student_id = student.id;
					this.config.class_id = classId;
					this.config.pstudent = true;
					this.config.parentFromLogging = false;

					this.config.mode = "class";
					loader.dismiss();
					this.auth.changeMode(newMode).subscribe(
						data => {
							loader.dismiss();
							if (data.success) {
								this.events.publish("toggle:tab", "flex");
								// var t:Tabs = this.navCtrl.parent;
								//t.select(3);
							}
						},
						err => {
							this.utilService.createError(err);
						}
					);
				},
				err => {
					this.utilService.createError(err);
					loader.dismiss();
				}
			);
			setTimeout(() => {
				loader.dismiss();
			}, 8000);
		} catch (err) {
			console.log(err);
		}
	}

	ionViewDidLoad() {
		if (this.config.mode != "parent") {
			return;
		}
		var tt = this;
		document
			.querySelector("page-home-parent")
			.addEventListener("click", function(event) {
				var nativeElement = document.getElementById("autocomplete");
				//  var searchBar  =document.querySelector('.searchbar-input');
				//  var clickedComponent = event.currentTarget;
				var inside = false;
				var target = <HTMLElement>event.target;
				var className = target.className;
				if (
					(className == "label label-md" && target.childElementCount == 0) ||
					className == "searchbar-input" ||
					className == "label label-ios"
				)
					inside = true;
				if (inside) {
				} else {
					if (tt.platform.is("cordova")) {
						tt.keyboard.hideKeyboardAccessoryBar(false);
					}
					tt.view_Flag = false;
					if (nativeElement != null) nativeElement.className = "hideDiv";
				}
			});
		this.isFirsTimeLogin = this.config.isFirsTimeLogin;

		this.events.subscribe("change:class", classID => {
			console.log("===XXX performance home-parent change:class");
			if (this.config.loginMode == "parent") {
				this.getClassData(classID);
			}
		});

		this.events.subscribe("change:log", classID => {
			console.log("===XXX performance home-parent change:log");
			if (this.config.loginMode == "parent") {
				this.getClassData(classID);
			}
		});

		this.events.subscribe("change:refresh", () => {
			if (this.config.loginMode == "parent") {
				this.refresh();
			}
		});

		this.events.subscribe("change:mode", mode => {
			console.log("home-parent change mode == " + mode);
			if (this.config.pstudent && mode == "parent") {
				this.config.mode = "parent";
				mode = "parent";
			}
			this.mode = mode;
			this.mode_title = mode;
			if (mode == "parent") this.mode_title = "Home";
			this.books = [];
			this.events.publish("toggle:tab", "none");
		});

		this.events.subscribe("functionCall:finish", eventData => {
			console.log("home-parent functionCall:finish == parent", eventData);
			if (eventData == "parent") {
				this.config.mode = "parent";
				this.events.publish("change:mode", "parent");
				this.events.publish("toggle:tab", "none");
				this.refresh();
				// var t: Tabs = this.navCtrl.parent;
				// t.select(0);
				// this.ionViewWillEnter();
			}
		});
	}

	ngOnDestroy() {
		console.log("ngOnDestroy --- parent home");
		this.events.unsubscribe("change:log", null);
		this.events.unsubscribe("change:mode", null);
		this.events.unsubscribe("functionCall:finish", null);
		this.events.unsubscribe("change:refresh", null);
	}

	ionViewWillEnter() {
		console.log("home-parent ionViewWillEnter == parent: ");
		if (this.config.loginMode == "teacher") {
			this.config.mode = "teacher";
			return;
		}
		this.config.mode = "parent";
		this.books = [];
		this.isReady = false;
		this.isEmpty = false;
		this.config.getConfig().then(data => {
			try {
				this.teacher = data;
				this.classrooms = this.teacher.classrooms;
				this.auth.getHome().subscribe(data => {
					this.home_id = data.home;
					this.config.home_id = this.home_id;
					console.log(this.config.mode);
					this.events.publish("change:mode", this.config.mode);
					this.getClassData(this.home_id);
				},
				err => {
					this.utilService.createError(err);
				});
			} catch (err) {
				console.log(err);
			}
		});
	}
	ionViewDidEnter() {
		this.mode = this.config.mode;
		this.mode_title = "Parent";
	}

	openDetail(ev: any) {
		this.navCtrl.push("BookDetailPage", { book: ev.data });
	}

	openDetailC(ev: any) {
		console.log(ev);
		try {
			let modal = this.modalCtrl.create("BookLoggingPage", {
				classid: ev.class_id,
				studentid: ev.student_id,
				bookid: ev.book_id,
				stitle: ""
			});
			//let modal = this.modalCtrl.create(BookLoggingPage, {bookid:ev.book.id, book:ev, isCurrentReading:true});
			modal.present();
		} catch (err) {
			console.log(err);
		}
	}

	addCurrentReading(student) {
		console.log("YYY=====addCurrentReading()", student);
		try {
			let classId = student.classroom_id;
			let newMode = {
				mode: "class",
				class_id: classId,
				student_id: student.id
			};
			this.config.loginMode = "parent";
			this.config.changeable = false;
			let loader = this.loading.create({
				content: ""
			});
			loader.present();
			this.studentService.getStudent(student.id, classId).subscribe(
				data => {
					this.studentService.studentData = data;
					this.config.student_id = student.id;
					this.config.class_id = classId;
					this.config.pstudent = true;
					this.config.goscan = true;

					this.config.mode = "class";
					loader.dismiss();
					this.auth.changeMode(newMode).subscribe(
						data => {
							loader.dismiss();
							if (data.success) {
								this.events.publish("toggle:tab", "flex");
								var t: Tabs = this.navCtrl.parent;
								t.select(1);
							}
						},
						err => {
							this.utilService.createError(err);
						}
					);
				},
				err => {
					this.utilService.createError(err);
					loader.dismiss();
				}
			);
			setTimeout(() => {
				loader.dismiss();
			}, 8000);
		} catch (err) {
			console.log(err);
		}
	}

	addStudent(readingGroup) {}

	openEditClass($ev) {
		let modal = this.modalCtrl.create("EditClassPage", {
			class: $ev,
			classData: this.classData
		});
		modal.present();
	}

	openAddStudent() {}

	selectBook(bookID) {
		try {
			let modal = this.modalCtrl.create("SelectStudentPage", {
				studentList: this.selectedClass,
				book_id: bookID
			});
			modal.onDidDismiss(result => {
				if (result) {
					var feed = this.classFeed.feed;
					var item = feed.find(item => item.book.id == bookID);
					if (item != null) {
						var action = item.actions.find(action => action.type === "select");
						if (action != null) {
							action.done = true;
						}
					}
				}
			});
			modal.present();
		} catch (err) {
			console.log(err);
		}
	}
	getActionTypeFromFeed(feed, type) {
		return feed.actions.find(action => action.type === type);
	}

	cheerBook(event) {
		let feed = event.feed;
		let data = { event_type: "cheer", event_id: feed.id };
		let cheer = this.getActionTypeFromFeed(feed, "cheer");
		if (cheer != null) {
			cheer.done = true;
		}
		// Mock up cheer object so we can make it appear stright away
		let cheerObj = {
			title: "Cheer",
			user_type: "teacher",
			added: true,
			animate: false
		};

		feed.cheer.push(cheerObj);

		this.eventsService.createEvent(data).subscribe(data => {
			cheerObj.animate = true;
			let message = `Cheering ${feed.student.title}, Nice!`;
			this.utilService.createToast(message);
		},
		err => {
			this.utilService.createError(err);
		});
	}

	shareBook(feed) {
		let readinggroups = this.selectedClass.readinggroups;
		let modal = this.modalCtrl.create("ShareReadingGroupPage", {
			readinggroups: readinggroups,
			book_id: feed.book_id
		});
		modal.onDidDismiss(data => {
			if (data && feed.actions.length) {
				let share = this.getActionTypeFromFeed(feed, "share");
				if (share) {
					share.done = true;
				}
			}
		});
		modal.present();
	}

	viewStudent(student) {
		this.studentProfile(student);
	}
	/* When book.animateRemove == true the .fadeOut class is added
   * which adds a 2 second CSS transition so wait for this to (roughly) finish
   * before removing the item
   */
	removeBook(book) {
		const fadeTime = 600;
		var feed = this.classFeed.feed;
		var item = feed.find(item => item.book.id == book.id);
		if (item) {
			book.animateRemove = true;
			setTimeout(() => {
				this.classFeed.feed.splice(feed.indexOf(item), 1);
				this.eventsService.deleteEvent(item.id).subscribe(data => {
					if (data && data.success) {
						let message = `Removed ${item.book.title}`;
						this.utilService.createToast(message);
					}
				},
				err => {
					this.utilService.createError(err);
				});
			}, fadeTime);
		}
	}

	getSearchBook(value) {
		this.quality = false;
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.bookService.searchBook(value, this.quality, true).subscribe(
			data => {
				this.books = data.books;
				this.view_Flag = false;
				var nativeElement = document.getElementById("autocomplete");
				if (nativeElement != null) {
					nativeElement.className = "hideDiv";
				}
				this.searchValue = "";
				loader.dismiss();
				this.navCtrl.push("SearchResultPage", {
					books: this.books,
					keyword: value, data: data, value: value, quality: this.quality
				});
			},
			err => {
				this.utilService.createError(err);
				loader.dismiss();
			}
		);
	}

	searchBook(value) {
		var nativeElement = document.querySelector(".hideDiv");
		if (nativeElement != null) {
			nativeElement.className = "autocomplete";
		}
		this.autoComplete_show = true;
		if (value == undefined) {
			this.view_Flag = false;
		}
		if (value != undefined) {
			if (value.length < 1) {
				this.search_items = this.history_items;
				this.search_flag = "history";
				this.view_Flag = true;
			}
			if (value.length >= 1 && value.length < 4) {
				this.view_Flag = false;
			}
			if (value.length >= 4) {
				this.bookService.getAutoCompleteList(value).subscribe(data => {
					this.auto_complete_items = data.data;
					this.search_flag = "auto_complete";
					this.view_Flag = true;
				});
			}
		}
	}

	itemClick(book_name: string) {
		this.searchValue = book_name;
		this.quality = true;
		if (this.autoComplete_show == false) this.view_Flag = false;
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.bookService.searchBook(book_name, this.quality, true).subscribe(
			data => {
				this.books = data.books;
				this.view_Flag = false;
				loader.dismiss();
				this.navCtrl.push("SearchResultPage", { books: this.books, data: data, value: book_name, quality: this.quality });
			},
			err => {
				this.utilService.createError(err);
				loader.dismiss();
			}
		);
	}

	checkBlur() {
		this.autoComplete_show = false;
		//  this.itemClick('');
	}

	goscan() {
		//this.navCtrl.push(ScanBookPage);
		if (this.platform.is("ios") || this.platform.is("android")) {
			let modal = this.modalCtrl.create("ScanBookPage", {
				homeData: this.selectedClass
			});
			modal.present();
		} else {
			let modal = this.modalCtrl.create("ScanBookPage", {
				homeData: this.selectedClass
			});
			modal.present();
		}
	}

	goClassCode() {
		let modal = this.modalCtrl.create("ClassCodePage", {
			home_id: this.home_id
		});
		modal.onDidDismiss(() => {
			this.getClassData(this.home_id);
		});
		modal.present();
	}
}
