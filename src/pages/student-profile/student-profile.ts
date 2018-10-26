import { Component, ViewChild, OnChanges, Input } from "@angular/core";
import {
	NavController,
	NavParams,
	Events,
	ModalController,
	Platform,
	LoadingController,
	Tabs,
	Content,
	PopoverController,
	AlertController,
	ViewController
} from "ionic-angular";
import { Keyboard } from "@ionic-native/keyboard";
import { StudentService } from "../../providers/student-service";
import { EventsService } from "../../providers/events-service";
import { ClassService } from "../../providers/class-service";
import { UtilService } from "../../providers/util-service";
import { Auth } from "../../providers/auth";
import { Config } from "../../providers/config";
import { PopoverComponent } from "../../components/popover/popover";
import { SwiperConfigInterface } from "ngx-swiper-wrapper";
import { IonicPage } from "ionic-angular";
import * as $ from "jquery";
declare var moxiechart: any;

@IonicPage()
@Component({
	selector: "page-student-profile",
	templateUrl: "student-profile.html"
})
export class StudentProfilePage implements OnChanges {
	@ViewChild(Content) content: Content;
	// Need this input for Change Detection and updating content accordingly.
	@Input("studentID") student_input;

	studentData: any;
	recommended: Array<any> = [];
	currentBooks: Array<any> = [];
	classFeed: Array<any> = [];
	logFeed: Array<any> = [];
	selectFeed: Array<any> = [];
	studentID: string;
	classID: string;
	selectedSeg: string = "logged";
	mode: string;
	readmin = 0;
	readminAry = [];
	pf: any;
	isreadmin = false;
	pageNum = [];
	sh_v = [];
	pending: boolean = false;
	loginMode: string;
	selCurBook: any;

	sub1: any;
	totalMinutes = 0;
	totalPages = 0;
	ch_books = [0, 0];
	ch_pages = [0, 0];
	ch_minutes = [0, 0];
	ch_points = [0, 0];
	ch_idx = 0;
	ch_title = "Challenge Stats";
	cur_book: any;
	reason: any;
	reason_id: any;
	isCheerClick = false;

	private mytimer: any; //== timer for loading
	private firstcall = false;
	private isLoadingFeed = false;
	private isLoadingCurrent = false;
	public reasonList: any;

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
	public popCallback;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public studentService: StudentService,
		public config: Config,
		public events: Events,
		public modalCtrl: ModalController,
		public loading: LoadingController,
		public eventsService: EventsService,
		public classService: ClassService,
		public auth: Auth,
		private platform: Platform,
		public utilService: UtilService,
		private popoverCtrl: PopoverController,
		public keyboard: Keyboard,
		private alertCtrl: AlertController,
		public viewCtrl: ViewController
	) {
		this.pf = platform;
		this.mode = this.config.mode;
		this.loginMode = this.config.loginMode;
		console.log("is is called?");
		this.firstcall = false;

		//this.loadStudentData = this.loadStudentData.bind(this);
		this.loadData = this.loadData.bind(this);

		// When publish "load:student" event - When call ionViewWillEnter() on Profile page
		this.events.subscribe("load:student", () => {
			//console.log("XXX performance == load:student");
		});

		this.events.subscribe("load:currentreading", () => {
			console.log("XXX performance == load:currentreading");
			if (this.config.mode == 'teacher') {
				var t: Tabs = this.navCtrl.parent;
				t.select(0);
			}
			clearTimeout(this.mytimer);
			this.mytimer = setTimeout(() => {
				this.loadCurrentReading();
				this.loadFeed();
				this.loadHuntMessage();
			}, 1000);
		});

		this.platform.ready().then(() => {
			this.keyboard.onKeyboardShow().subscribe(() => {
				let element = document.getElementById("current-reading-element");
				//let element = document.getElementById('readingbar');
				this.scrollTop(element.offsetTop + 120);
			});
		});

		this.popCallback = params => {
			return new Promise((resolve, reject) => {
				this.loadFeed(false, true);
				resolve();
			});
		};
		try {
			if (this.config.goscan && this.config.firstload) {
				this.config.goscan = false;
				this.config.firstload = false;
				if (this.config.parentFromLogging) {
					this.config.parentFromLogging = false;
					this.loadData();
				}
			}
		} catch (err) {
			console.log(err);
		}
	}

	ch_click() {
		if (this.ch_idx == 1) {
			this.ch_idx = 0;
			this.ch_title = "Challenge Stats";
		} else {
			this.ch_idx = 1;
			this.ch_title = "Yearly Stats";
		}
	}

	loadData() {		
		console.log(
			"student profile-----" +
			this.config.goscan +
			" --- " +
			this.config.firstload +
			"== " +
			this.mode
		);
		this.ch_idx = 0;
		this.ch_title = "Challenge Stats";
		var tt = this;
		clearTimeout(this.mytimer);
		//this.mytimer = setTimeout(() => {
		tt.loadStudentData();
		//}, 500);

		//----- remove dialog events ------
		$("#bt_remove_cancel").unbind("click");
		$("#bt_remove_cancel").click(function () {
			tt.outDialog();
		});
		$("#removereason").unbind("change");
		$("#removereason").change(function () {
			tt.outDialog();
			try {
				let data = {
					event_type: "incomplete",
					student_id: tt.studentID,
					book_id: tt.selCurBook.book_id,
					reason: $("#removereason").val()
				};
				tt.eventsService.createEvent(data).subscribe(data => {
					let message = `Removed the book from current reading.`;
					tt.utilService.createToast(message);
					tt.loadCurrentReading();
					tt.loadFeed();
					tt.loadHuntMessage();
				});
			} catch (err) {
				console.log(err);
			}
		});
		$("#bt_remove_ok").unbind("click");
		$("#bt_remove_ok").click(function () {
			console.log(tt.selCurBook);
			tt.outDialog();
			try {
				let data = {
					event_type: "incomplete",
					student_id: tt.studentID,
					book_id: tt.selCurBook.book_id,
					reason: $("#removereason").val()
				};
				tt.eventsService.createEvent(data).subscribe(data => {
					let message = `Removed the book from current reading.`;
					tt.utilService.createToast(message);
					tt.loadCurrentReading();
					tt.loadFeed();
					tt.loadHuntMessage();
				});
			} catch (err) {
				console.log(err);
			}
		});
	}

	ionViewWillLeave() {
		console.log("Called ionViewWillLeave on student detail.");
		this.firstcall = false;
		this.student_input = null;
		this.config.goscan = false;
		if (this.sub1) {
			this.sub1.unsubscribe();
		}
	}

	// When Page is loaded using NavPush
	ionViewWillEnter() {
		this.config.isLoadStudentDetail = 0;
		this.config.isOnStudentProfile = true;
		$('.span_temp').remove();
		if (!this.config.parentFromLogging || this.config.mode == "teacher") {
			try {
				console.log(
					"Called ionViewWillEnter on student detail.",
					this.config.parentFromLogging
				);
				this.mode = this.config.mode;
				this.firstcall = false;
				this.loginMode = this.config.loginMode;
				//if(this.config.mode != "class")
				this.loadData();

				if (this.firstcall) {
					console.log("XXX PERFORMANCE loadFeed firstcall");
					this.loadFeed();
				}
			} catch (err) {
				console.log(err);
			}
		}
		setTimeout(() => {
			this.scrollTop(0);
		}, 1000);

		// load reason list
		this.eventsService.getReason()
			.subscribe(data1 => {
				this.reasonList = data1;
			});
	}

	// When Page is loaded as Angular Component inside Profile.ts
	ngOnChanges(changes: any) {
		console.log("Called ngOnChanges - ");
		console.log(changes);
		if (changes.student_input.currentValue) {
			this.loadData();
		}
	}

	editReview(data, i) {
		try {
			let readonly = true;
			if (this.config.mode == 'teacher' || this.config.mode == 'class' && this.config.student_id == data.item.student_id) {
				readonly = false;
			}
			var tt = this;
			let modal = this.modalCtrl.create("ReviewPage", { book: data.data, studentId: data.item.student_id, readonly: readonly});
			modal.onDidDismiss(data => {
				if (data) {
					tt.reloadGroupFeed();
				}
			});
			modal.present();
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

	scrollTop(topY) {
		if (this.content && this.content != null) {
			try {
				this.content.scrollTo(0, topY, 500);
			} catch (err) {
				// swallow the error and keep going, this is just a scroll
				console.log(err);
			}
		}
	}

	loadHuntMessage(ch_only = false) {
		console.log("load hunt message");
		try {
			var tt = this;
			this.studentService
				.getStudent(this.studentID, this.classID, true)
				.subscribe(data => {
					this.studentData = data;
					this.studentService.studentData = data;
					if (data.classroom.recordminutes == "1") this.isreadmin = true;
					this.updateChallenge(data); console.log(!ch_only, this.isCheerClick)
					if (!ch_only || !this.isCheerClick) {
						setTimeout(() => {
							this.loadChart(data);
							tt.scrollTop(0);
						}, 1000);
					}
					this.isCheerClick = false;
				});
		} catch (err) {
			console.log(err);
		}
	}

	updateChallenge(data) { console.log(data);
		try {
			this.ch_books[0] = data.student.cycle.books;
			this.ch_pages[0] = data.student.cycle.pages_total;
			this.ch_minutes[0] = data.student.cycle.minutes_total;
			this.ch_points[0] = data.student.cycle.points;

			this.ch_books[1] = data.student.year.books;
			this.ch_pages[1] = data.student.year.pages_total;
			this.ch_minutes[1] = data.student.year.minutes_total;
			this.ch_points[1] = data.student.year.points;
		} catch (err) {
			console.log(err);
		}
	}

	public loadStudentData(): void {
		try {
			console.log("called loadStudent");
			this.studentID = this.config.student_id;
			console.log(this.studentID);
			this.classID = this.config.class_id;
			console.log(this.classID);
			this.mode = this.config.mode;
			this.isreadmin = false;
			let data = this.studentService.studentData;
			let pins = "";

			if (this.mode == "class") {
				console.log(data);
				if (!this.studentID) {
					this.config.student_id = data.student.id;
					this.studentID = this.config.student_id;
				}
				if ("student" in data && data.student.pin != null) {
					pins = data.student.pin;
				}
			}
			//----------------------------------------------

			console.log(
				"class ID = " + this.classID + " & student ID = " + this.studentID
			);
			this.studentService
				.getStudent(this.studentID, this.classID, true)
				.subscribe(data => {
					//console.log(data);
					//this.studentService.addStudentObject(data, 'student');
					localStorage.setItem('studentdata', JSON.stringify(data));
					try {
						if (data.student.year.pages == null) data.student.year.pages = 0;
						this.studentData = data;
						this.studentService.studentData = data;
						if (data.classroom.recordminutes == "1") this.isreadmin = true;

						// ==========
						this.updateChallenge(data);
						// current Book is at data.student.current_book_id
						console.log("========= XXX PERFORMANCE loadChart loadStudentData");
						this.loadChart(data);
					} catch (err) {
						console.log(err);
					}
				});

			console.log("XXX PERFORMANCE loadFeed loadStudentData");
			this.loadFeed();
			this.loadCurrentReading();

			this.events.subscribe("change:mode", mode => {
				this.mode = mode;
			});

			this.readminAry = [];
			for (let i = 10; i <= 90; i = i + 5) {
				this.readminAry.push({ min: i, val: i });
			}
		} catch (err) {
			console.log(err);
		}
	}

	reloadGroupFeed() {
		console.log("XXX PERFORMANCE loadFeed reloadGroupFeed");
		this.loadFeed(false, true);
	}

	click_reloadGroupFeed() { }

	calculatePageMinutes(isCurPage = false) {
		this.totalPages = 0;
		this.totalMinutes = 0;
		// for(var i=0; i<this.logFeed.length; i++) {
		//   if(this.logFeed[i].card_type == 'log') {
		//     this.totalPages += eval(this.logFeed[i].book.pages);
		//   }
		// }
		// for(let i=0; i<this.currentBooks.length; i++) {
		//   this.totalPages += eval(this.currentBooks[i].totalPages);
		//   this.totalMinutes += eval(this.currentBooks[i].totalMinutes);
		// }

		var pageStep = 0;
		var minStep = 0;
		if (isCurPage) {
			// for(let i=0; i<this.currentBooks.length; i++) {
			//   if(this.currentBooks[i].book.id == this.cur_book.book.id) {
			//     var ev = this.currentBooks[i].events;
			//     var ev1 = 0;
			//     if(ev.length > 1) {
			//       ev1 = ev[ev.length-2].pages;
			//     }
			//     pageStep = ev[ev.length-1].pages - ev1;
			//     minStep = ev[ev.length-1].minutes;
			//     break;
			//   }
			// }
			console.log(this.cur_book);
			this.ch_pages[0] += pageStep;
			this.ch_minutes[0] += minStep;
		}

		if (this.currentBooks.length > 1) {
			$(".div_currentSlider .swiper-button-next").removeClass(
				"swiper-button-disabled"
			);
		}
		if (this.recommended[0] && this.recommended[0].books.length > 1) {
			$(".div_recommendSlider .swiper-button-next").removeClass(
				"swiper-button-disabled"
			);
		}
	}

	loadFeed(isUpdateRecommanded = true, forceAPICall = false) {
		try {
			console.log("XXX PERFORMANCE loadFeed the actual call");
			// Student's Book Feed
			// get Grouped feed student data
			this.isLoadingFeed = true;
			this.studentService.getFeed(this.studentID, "grouped", true).subscribe(
				data => {
					//this.studentService.addStudentObject(data, 'feed', this.studentID);
					if (isUpdateRecommanded) {
						this.recommended = data.recommendfeed;
					}
					this.logFeed = data.logfeed;
					this.classFeed = data.classfeed;
					this.selectFeed = data.selectfeed;

					this.isLoadingFeed = false;

					setTimeout(() => {
						this.calculatePageMinutes();
					}, 500);
				},
				err => {
					this.utilService.createError(err);
					this.isLoadingFeed = false;
				}
			);
		} catch (err) {
			console.log(err);
		}
	}

	loadChart(data, isOnlyBookBar = false) { 
		if (this.config.mode == 'class' && $('.span_temp').length > 0) return;
		try {	
			console.log(this.config.isLoadStudentDetail);
			if (this.config.isLoadStudentDetail == 1) {
				this.viewCtrl.dismiss().catch();
				return;
			}
			this.config.isLoadStudentDetail = 1;
			// // Creating Chartfrom  MoxieChart
			console.log("========= XXX PERFORMANCE loadChart actual call");
			let w = 350;
			if (this.mode == "teacher") {
				w = document.getElementById("growthChart").offsetWidth;
			} else {
				w = document.getElementById("gaugeChart").offsetWidth;
			}
			if (w == 0) {
				w = 350;
			}
			w = w - 30;
			if (w > 600) w = 400; 

			if ((this.mode === "class" || this.mode === "parent") && !isOnlyBookBar) {
				document.getElementById("gaugeChart").innerHTML = "";
			}

			if (this.mode === "teacher" && !isOnlyBookBar) {
				document.getElementById("growthChart").innerHTML = "";
			}

			document.getElementById("progressChart").innerHTML = "<span class='span_temp'></span>";

			if (
				this.mode == "class" ||
				this.mode == "teacher" ||
				this.mode == "parent"
			) {
				if (!isOnlyBookBar) {
					console.log(
						"<<========= XXX PERFORMANCE loadChart actual call ----- isOnlyBar = false"
					);
					if (this.mode == "teacher") {
						this.generateChart(data, "readinggrowth", ".growthChart", w, 0);
					} else {
						this.generateChart(data, "gauge", ".gaugeChart", w, 0);
					}
				}
				console.log(
					"<<========= XXX PERFORMANCE loadChart actual call ----- progress bar"
				);
				if (this.pf.is("ios") || this.pf.is("android")) {
					this.generateChart(data, "bookprogress", "#progressChart", 100, 40);
				} else {
					this.generateChart(data, "bookprogress", "#progressChart", 300, 70);
				}
			}
		} catch (err) {
			console.log(err);
		}
	}

	loadCurrentReading(isCurpage = false) {
		try {
			this.totalMinutes = 0;
			this.currentBooks = [];
			// ===
			console.log("YYY=====");
			this.studentID = this.config.student_id;
			console.log(this.studentID);
			this.classID = this.config.class_id;
			console.log(this.classID);
			this.mode = this.config.mode;
			this.isreadmin = false;
			let data = this.studentService.studentData;
			let pins = "";

			if (this.mode == "class") {
				console.log(data);
				if (!this.studentID) {
					this.config.student_id = data.student.id;
					this.studentID = this.config.student_id;
				}
				if ("student" in data && data.student.pin != null) {
					pins = data.student.pin;
				}
			}
			// Current Reading Books
			this.isLoadingCurrent = true;
			this.studentService
				.getCurrentBooks(this.studentID, this.classID, true)
				.subscribe(
				data => {
					//this.studentService.addStudentObject(data, 'currentReading', this.studentID,  this.classID);
					//console.log(data,'->>>>>>>>>>>>>>>>');
					this.currentBooks = data.books;
					let books = [];
					for (let i = 0; i < this.currentBooks.length; i++) {
						if (this.currentBooks[i].book != null) {
							books.push(this.currentBooks[i]);
						}
					}
					this.currentBooks = books;

					if (this.currentBooks.length > 0) {
						var temp = this.currentBooks;
						this.currentBooks = [];
						for (let i = temp.length - 1; i > -1; i--) {
							this.currentBooks.push(temp[i]);
						}
						for (let i = 0; i < this.currentBooks.length; i++) {
							if (
								this.currentBooks[i].minutes == null ||
								this.currentBooks[i].minutes == "null"
							) {
								this.currentBooks[i].minutes = "";
							}
							this.pageNum[i] = this.currentBooks[i].pages;
							this.sh_v[i] = true;

							this.currentBooks[i]["totalMinutes"] = 0;
							this.currentBooks[i]["totalPages"] = 0;
							if (this.currentBooks[i].events) {
								for (let j = 0; j < this.currentBooks[i].events.length; j++) {
									if (
										this.currentBooks[i].events[j].event_type == "current"
									) {
										if (this.currentBooks[i].events[j].minutes) {
											this.totalMinutes += eval(
												this.currentBooks[i].events[j].minutes
											);
										}
									}
								}
								this.currentBooks[i]["totalMinutes"] = this.totalMinutes;
								var j = this.currentBooks[i].events.length - 1;
								if (j > -1 && this.currentBooks[i].events[j].pages != null) {
									this.currentBooks[i]["totalPages"] = this.currentBooks[
										i
									].events[j].pages;
								}
							}
						}
					}
					setTimeout(() => {
						this.calculatePageMinutes(isCurpage);
					}, 500);

					this.isLoadingCurrent = false;
				},
				err => {
					this.utilService.createError(err);
					this.isLoadingCurrent = false;
				}
				);
		} catch (err) {
			console.log(err);
		}
	}

	//==== recommended slide event ====

	//==== current reading slide event ====

	//======================================

	getDate(date) {
		return new Date(date);
	}

	generateChart(data, type, selector, width, height) {
		// let params = {
		//   access_token: this.config.token,
		//   chart_type: type,
		//   class_id: this.studentData.classroom.id,
		//   cycle_id: this.studentData.student.cycle.cycle_id,
		//   student_id: this.studentData.student.id,
		//   base_url: this.config.mainURL
		// };
		try {
			let params = {
				access_token: this.config.token,
				chart_type: type,
				class_id: data.classroom.id,
				cycle_id: data.student.cycle.cycle_id,
				student_id: data.student.id,
				base_url: this.config.mainURL
			};
			moxiechart.generateChartFromParameters(params, width, height, selector);
		} catch (err) {
			console.log(err);
		}
	}

	openDetailC(ev: any) {
		try {
			let class_id = this.classID;
			let student_id = this.studentID;
			let book_id = ev.data.id;

			this.navCtrl.push("BookLoggingPage", {
				classid: class_id,
				studentid: student_id,
				bookid: book_id,
				stitle: this.studentData.student.title
			});
		} catch (err) {
			console.log(err);
		}
	}

	openUpdate(ev: any) {
		console.log(ev);
		try {
			this.cur_book = ev;
			if (ev.state == "current") {
				this.loadCurrentReading(true);
				this.isCheerClick = true;
				this.loadHuntMessage(true);
			} else {
				if (ev.state) {
					let class_id = this.classID;
					let student_id = this.studentID;
					let book_id = ev.book_id;
					this.navCtrl.push("BookLoggingPage", {
						classid: class_id,
						studentid: student_id,
						bookid: book_id,
						stitle: this.studentData.student.title
					});
				}
			}
		} catch (err) {
			console.log(err);
		}
	}

	openFinish(ev: any) {
		console.log(ev);
	}

	openDetail(ev: any) {
		console.log(ev);
		// this.navCtrl.push(BookDetailPage, {book:ev.data});
		try {
			this.navCtrl.push("BookDetailPage", {
				book: ev.data,
				callback: this.popCallback
			});
		} catch (err) {
			console.log(err);
		}
	}

	/* When book.animateRemove == true the .fadeOut class is added
  * which adds a .5 second CSS transition so wait for this to (roughly) finish
  * before removing the item
  */

	removeBookFromLogged(book) {
		try {
			const fadeTime = 600;
			var feed = this.logFeed;
			var item = feed.find(item => item.book.id == book.id);
			if (item) {
				book.animateRemove = true;
				setTimeout(() => {
					this.logFeed.splice(feed.indexOf(item), 1);
					this.eventsService.deleteEvent(item.id).subscribe(data => {
						if (data && data.success) {
							let message = `Removed ${item.book.title}`;
							this.utilService.createToast(message);
							this.loadHuntMessage();
						}
					}, err => {
						this.utilService.createError(err);
					});
				}, fadeTime);
			}
		} catch (err) {
			console.log(err);
		}
	}

	removeBookFromRead(ev, i, removeType) {
		try {
			let book = ev;
			if (removeType == "SELECTED") {
				book.animateRemove = true;
				setTimeout(() => {
					this.classService
						.deleteBookFromList(this.classID, this.studentID, "select", book.id)
						.subscribe(data => { 
							this.selectFeed.splice(i, 1);
							this.loadHuntMessage();
						}, err => {
							this.utilService.createError(err);
						});
				}, 500);
			} else {
				this.eventsService.deleteEvent(book.id).subscribe(data => {
					this.logFeed.splice(i, 1);
					this.loadHuntMessage();
				}, err => {
					this.utilService.createError(err);
				});
			}
		} catch (err) {
			console.log(err);
		}
	}

	removeBookFromSelectedList(book) { }

	selectBook(bookId) {
		try {
			if (this.mode === "teacher") {
				let studentList = this.classService.classData;
				let modal = this.modalCtrl.create("SelectStudentPage", {
					studentList: studentList,
					book_id: bookId
				});
				modal.present();
			} else {
				let event = {
					event_type: "select",
					book_id: bookId,
					student_id: this.studentID
				};

				this.eventsService.createEvent(event).subscribe(data => {
					let message = `We'have added this to your selected list!`;
					this.utilService.createToast(message);
					console.log("XXX PERFORMANCE loadFeed subscribe selectBook");
					this.loadFeed(false, true);
					this.loadHuntMessage();
				});
			}
		} catch (err) {
			console.log(err);
		}
	}

	cheerBook(event) {
		try {
			let feed = event.feed;
			let student = event.student;
			let data;

			let cheerObj = {
				title: "Cheer",
				added: true,
				animate: false
			};

			if (this.mode === "teacher") {
				Object.assign(cheerObj, { user_type: "teacher" });
			} else {
				Object.assign(cheerObj, {
					user_type: "student",
					student_id: student.id
				});
			}

			feed.cheer.push(cheerObj);
			this.isCheerClick = true;
			if (event.bookreview) {
				data = {
					event_type: "cheer",
					event_id: feed.id,
					student_id: this.studentID,
					reason: this.reason,
					reason_id: this.reason_id
				}
				this.eventsService.getReason()
					.subscribe(data1 => {
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
										console.log("XXX PERFORMANCE loadFeed subscribe eventService 1");
										this.loadFeed(false, true);
										this.loadHuntMessage(true);
									}
								});
							}
						});
					});
			} else {
				data = {
					event_type: "cheer",
					event_id: feed.id
					//student_id: this.studentID
				};
				this.eventsService.createEvent(data).subscribe(data => {
					cheerObj.animate = true;
					if (feed.student != null && feed.student.title != null) {
						let message = `Cheering ${feed.student.title}, Nice!`;
						this.utilService.createToast(message);
						console.log("XXX PERFORMANCE loadFeed subscribe eventService 1");
						this.loadFeed(false, true);
						this.loadHuntMessage(true);
					}
				});
			}
		} catch (err) {
			console.log(err);
		}
	}

	shareBook($event) {
		try {
			if (this.mode === "teacher") {
				let readinggroups = this.classService.classData.readinggroups;
				let modal = this.modalCtrl.create("ShareReadingGroupPage", {
					readinggroups: readinggroups,
					book_id: $event.book_id
				});
				modal.present();
			} else {
				let readinggroups = this.classService.classData.readinggroups;
				let modal = this.modalCtrl.create('ShareBookPage', { readinggroups: readinggroups, book_id: $event.book_id });
				modal.present();
				modal.onDidDismiss(data => {
					this.loadFeed(false, true);
					this.loadHuntMessage();
				});
				// let event = {
				// 	event_type: "share",
				// 	book_id: $event.book_id
				// 	//student_id: this.studentID
				// };

				// this.eventsService.createEvent(event).subscribe(data => {
				// 	let message = `Sharing to your group. Get extra points by getting somone to read this book`;
				// 	this.utilService.createToast(message);
				// 	console.log("XXX PERFORMANCE loadFeed subscribe eventService 2");
				// 	this.loadFeed(false, true);
				// 	this.loadHuntMessage();
				// });
			}
		} catch (err) {
			console.log(err);
		}
	}

	shReading(i) {
		this.sh_v[i] = !this.sh_v[i];
	}

	checkFocus(i) {
		this.pageNum[i] = "";
	}

	updateReading(book, value, mins, i) {
		try {
			value = this.pageNum[i];
			if (
				this.isreadmin &&
				parseInt(value) * 100 > parseInt(book.book.pages) * 125
			) {
				this.utilService.createAlert(
					"Error",
					"Your page number is 125% higher than expected."
				);
				//this.loadCurrentReading();
				return;
			}
			if (this.isreadmin && (mins == "" || mins == null)) {
				this.utilService.createAlert(
					"Oops!",
					"Don’t forget to record your minutes, too!"
				);
				return;
			}
			let data = {
				event_type: "current",
				student_id: this.studentID,
				book_id: book.book_id,
				pages: value.toString(),
				minutes: mins
			};
			console.log(data);
			if (this.pending) return;
			this.pending = true;
			this.eventsService.createEvent(data).subscribe(data => {
				book.pages = value;
				let message = `Updating current page to read this book`;
				this.utilService.createToast(message);
				this.pending = false;
			}, err => {
				this.utilService.createError(err);
			});
		} catch (err) {
			console.log(err);
		}
	}

	finish() {
		//this.events.publish('functionCall:finish');
		try {
			var t: Tabs = this.navCtrl.parent;
			t.select(0);
		} catch (err) {
			console.log(err);
		}
	}

	goedit() {
		let modal = this.modalCtrl.create("SetStudentPage", {});
		modal.present();
	}

	ngOnDestroy() {
		console.log("ngOnDestroy --- student profile");
		this.events.unsubscribe("load:student", this.loadStudentData);
		this.events.unsubscribe("load:currentreading", null);
		this.config.goscan = false;
		this.config.firstload = true;
		this.config.isOnStudentProfile = false;
	}

	presentPopover(ev, item) {
		console.log(ev);
		console.log(item);
		let popover = this.popoverCtrl.create(PopoverComponent, {
			itemList: [{ title: "Remove book", item: item }]
		});
		popover.present({
			ev: ev
		});
		popover.onDidDismiss(data => {
			console.log(data);
			if (data && data.title == "Remove book") {
				this.showConfirm(data.item);
			}
		});
	}
	showConfirm(book) {
		this.selCurBook = book;
		$("#dialog_overlay_remove").addClass("showdialog");
		$("#dialog_overlay_remove").addClass("animated");
		$("#dialog_overlay_remove").addClass("bounceIn");
	}

	outDialog() {
		$("#dialog_overlay_remove").removeClass("bounceIn");
		$("#dialog_overlay_remove").addClass("bounceOut");
		setTimeout(() => {
			$("#dialog_overlay_remove").removeClass("animated");
			$("#dialog_overlay_remove").removeClass("bounceOut");
			$("#dialog_overlay_remove").removeClass("showdialog");
		}, 1000);
	}
}
