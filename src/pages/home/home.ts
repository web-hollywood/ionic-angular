import { Component, ViewChild, ElementRef } from "@angular/core";
import {
	NavController,
	NavParams,
	Events,
	Slides,
	ModalController,
	ViewController,
	Tabs,
	LoadingController
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { ClassService } from "../../providers/class-service";
import { StudentService } from "../../providers/student-service";
import { Config } from "../../providers/config";
import { Auth } from "../../providers/auth";
import { EventsService } from "../../providers/events-service";
import { UtilService } from "../../providers/util-service";
import { BookService } from "../../providers/book-service";
import { IonicPage } from "ionic-angular";
declare var moxiechart: any;
declare var ScanditSDK: any;

@IonicPage()
@Component({
	selector: "page-home",
	templateUrl: "home.html"
})
export class HomePage {
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
	classData: any = {};
	sub: any;
	search_flag: string;
	books: any = [];
	auto_complete_items: any[];
	history_items: any[];

	countAtOnce = 20;
	book_list_items: any = [];
	book_list_start = 0;
	offset = 0;
	limit = 20;

	public loader: any;
	public bChart = false;
	public pending = false;
	scannerSettings: any;

	mytimer = null;

	sub1: any;

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
		public auth: Auth
	) {
		this.loader = this.loading.create({
			content: ""
		});
		this.loader.present();

		// this.loadWebScanner();
	}

	loadWebScanner() {
		console.log('XXX - loadWebScanner');
		// ===== new key =====
		var mytestkey =
			"AcwrGiBaOx+fAw/oXREh/7w/zNFaMBqIqH/qsBhwVp+mbA5sk29dr0x5iy/0VPS9BWyoFCh7Ow/4JzEG+1J0c0g43f/sPi5eACsBh+Rln4NGIlJMMRH+1XttSz85WkTRZnc3c7xwkLtOa6i1hzvXXy8+qT6m834foYcshoS8aZoWoA1wD2xg3F8Be6+3OEOvmMO+OIJFkbKmL4Qz8iW36cOb4Y41srDbi4NbwJSd0ue62SCXqviT5VUYZ3BFk7f3Y873fspF2r3UQZ6u4JVj7MIkpp7wygxI+EBsvLTWbL7k6IO3zjOed6rVggGTw9DTBFwRIDUPMRLkIYDCkiedWSx/vvQIYw4qNvvADTfIjQ1CoyF5A6xWM2MqHNgkeGOYsp/yH0eje6xo1n3Jj7PoeydGs+bKG2QAVi1jRybreR2WJ2QS5OHl+vBCjKUjHSWqiKro/1xDM2oxhRtx1my1xNMtXrrmTrpPpYSXcDXrmzmsbA50b8IG/YFKuWV5eCpf/uBzwIEzcVFkBBZA7rK3UgNihB95UKdlYol8y5ISnnKTuPUkM2jv6TQXgSrd1lYXJJXKKqNOQ8FJV4FiTBc9AtlDqIRIRB1qluMAVofA1LIwaXGW8B3XEnpbtWDxB58t3tdUIfVHkoBos5kFOq/JW3at1w78pYGXYc5PbIHyZ2n0AU5lFgxTse07NcctTqTLCfyBT1kd+ilra/0wCeN+I1FHNVhdOczm8VTAOp8DD+QNy78VeGg2dhO7tJ5uREtjNSUIT3Ad+cRkcJ64frKrfu9wHcCHx89IuGjuTshFPEpZ00g62HPWbAvuoVGoDFI=";

		var self = this;
		this.scannerSettings = new ScanditSDK.ScanSettings({
			codeCachingDuration: -1,
			enabledSymbologies: [
				"ean13",
				"upca",
				"ean8",
				"five-digit-add-on",
				"two-digit-add-on"
			],
			codeDuplicateFilter: 0,
			maxNumberOfCodesPerFrame: 2
		});
		ScanditSDK.configure(mytestkey, {
			engineLocation: "assets/scandit-sdk"
		});
		ScanditSDK.BarcodePicker.create(document.getElementById("barcodeReader1"), {
			playSoundOnScan: true,
			vibrateOnScan: true
		})
			.then(function (barcodePicker) {
				console.log("scandit load done");
				self.config.barcodePicker = barcodePicker;
				self.config.barcodePicker.applyScanSettings(self.scannerSettings);
				self.config.barcodePicker.scanner.engineSDKWorker.postMessage({ type: "enable-blurry-decoding" });
				setTimeout(() => {
					self.config.barcodePicker.stopCamera();
				}, 1000);
			})
			.catch(function (error) {
				console.log("error : " + error.message);
			});
	}

	initData() {
		this.pending = true;
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

		if (localStorage.getItem("classObject") == "1") {
			this.storage.get("classObject").then(val => {
				let classObj = JSON.parse(val);
				console.log(classObj);
				this.config.classObject = classObj;
			});
		}
		this.config.getConfig().then(data => {
			//let class_id = this.navParams.get('class_id');
			//if(!class_id) {
			try {
				this.teacher = data;
				console.log("home-getconfig()");
				console.log(this.config);
				if (this.config.mode == "parent") this.config.setMode("teacher");
				this.classrooms = this.teacher.classrooms;
				let email: string;
				this.auth.getCurrent().subscribe(data => {
					console.log("AAA - Performance ==== /account/current", data);
					localStorage.setItem("account_current", JSON.stringify(data));
					this.classrooms = data.classrooms;
					if (!data.success) {
						this.loader.dismiss();
						this.config.goLogin();
						return;
					}
					let profileParams: any = {};
					profileParams.user = {};
					profileParams.user.data = {};
					profileParams.user.data.title = data.data.title;
					profileParams.user.data.email = data.data.email;
					profileParams.user.data.avatar = "./assets/images/user.png";
					this.config.setSelectedProfile(profileParams.user);

					if (data.mode.mode == "class" && data.mode.class_id != null) {
						this.class_id = data.mode.class_id;
						this.config.class_id = this.class_id;
						this.events.publish("change:mode", this.config.mode);
						this.getClassData(this.class_id);
					} else {
						email = data.data.email;
						this.storage.get(email).then(val => {
							this.class_id = JSON.parse(val);
							if (this.class_id == undefined || this.class_id == null) {
								try {
									this.class_id = Object.keys(this.classrooms)[
										Object.keys(this.classrooms).length - 1
									];
								} catch (err) {
									console.log(err);
								}
								if (this.config.class_id != null && this.config.mode == "class")
									this.class_id = this.config.class_id;
							}
							this.config.class_id = this.class_id;
							console.log(this.config.mode + "------" + this.config.class_id);
							this.events.publish("change:mode", this.config.mode);
							this.getClassData(this.class_id);
						});
					}
				});
			} catch (err) {
				console.log(err);
				this.loader.dismiss();
			}
			//}
			//this.storage.set('class_id', class_id);
			// this.getClassData(class_id);
			// this.config.class_id = class_id;
		});
	}

	ionViewWillLeave() {
		console.log("home - ionViewWillLeave");
		if (this.sub1) {
			this.sub1.unsubscribe();
		}
	}

	ngOnChanges() {
		console.log("Called ngOnChanges - home");
	}

	getClassData(classID) {
		console.log("========getClassData, classID = ", classID);
		
		this.book_list_items = [];
		this.offset = 0;
		this.limit = 20;

		if (this.pending) {
			this.pending = false;
			var tt = this;
			this.classService.getStudents(classID, true).subscribe(
				data => {
					try {
						setTimeout(() => {
							tt.loader.dismiss();
							this.getClass(classID);
						}, 1000);
						this.classService.addClassObject(data);
						// Setting ClassID in Config Object
						this.config.class_id = data.class.id;
						this.selectedClass = data;
						this.classService.classData = data;
						localStorage.setItem('classdata', JSON.stringify(data));

						// Also get Class Feed
						this.getClassFeed(classID);
					} catch (err) {
						console.log(err);
					}
				},
				err => {
					this.utilService.createError(err);
					tt.loader.dismiss(); /*

        this.utilService.createAlertTimeout(()=>{
          this.loader = this.loading.create({
            content: '',
          });
          this.loader.present();
          this.getClassData(this.class_id)
        });*/
				}
			);
		}
	}

	getClassFeed(classID) {
		this.sub1 = this.classService
			.getFeed(classID, this.offset, this.limit)
			.subscribe(data => {
				console.log(data);
				this.classFeed = data;
				this.initBookListItems();
			},
			err => {
				this.utilService.createError(err);
			});
	}

	getClass(classID) {
		console.log("home - getClass==" + classID + "--bchart--" + this.bChart);
		//this.classService.getClass(classID)
		//  .subscribe(data => {
		try {
			var data: any;
			var classData = this.config.classData.class;
			for (let i = 0; i < classData.length; i++) {
				if (classData[i].id == classID) {
					data = classData[i];
					break;
				}
			}
			console.log(data);
			this.bChart = true;
			if (data) {
				this.classData = data;
				this.classService.classOptions = data;
				//----- draw Read challenge charts ------
				if (this.mode == "teacher" || this.mode == "class") {
					if (this.mytimer != null) {
						clearTimeout(this.mytimer);
					}
					this.mytimer = setTimeout(() => {
						this.loadCycleChart();
					}, 500);
				}
			}
			//});
		} catch (err) {
			console.log(err);
		}
	}

	loadCycleChart() {
		if (this.bChart) {
			try {
				this.bChart = false;
				console.log("render chart challenge");
				document.getElementById("readchallenge").innerHTML = "";
				let w = 300;
				w = document.getElementById("readchallenge").offsetWidth;
				w = w - 0;
				if (w > 600) w = 600;
				document.getElementById("readchallenge").style.width = w + "px";
				let data = this.classData;
				console.log(data);
				let params = {
					access_token: this.config.token,
					chart_type: "readingcard",
					class_id: data.id,
					cycle_id: data.default_cycle_id,
					base_url: this.config.mainURL
				};
				if (data.id) {
					moxiechart.generateChartFromParameters(
						params,
						w,
						0,
						"#readchallenge"
					);
				}
			} catch (err) {
				console.log(err);
			}
		}
	}

	studentProfile(student) {
		console.log("fired student click");
		console.log(student);
		try {
			let newMode = {
				mode: "class",
				class_id: this.selectedClass.class.id,
				student_id: student.id
			};
			let loader = this.loading.create({
				content: ""
			});
			loader.present();
			this.config.loginMode = this.config.mode;
			this.config.changeable = false;
			this.studentService.studentData = student;
			this.config.setStudent_id(student.id);
			if (this.mode === "class" && this.classData.requirestudentpin == 1) {
				this.pinMode = "studentPin";
				this.studentService
					.getStudent(student.id, this.selectedClass.class.id)
					.subscribe(
					data => {
						// this.studentService.addStudentObject(data, "student");
						localStorage.setItem('studentdata', JSON.stringify(data));
						loader.dismiss();
						if (true) {
							this.studentService.studentData = data;
							this.config.pinModal = this.modalCtrl.create("PinPage", {
								pinMode: this.pinMode,
								studentData: data,
								studentID: student.id,
								classID: this.selectedClass.class.id
							});
							this.config.pinModal.onDidDismiss(data => {
								console.log("pinModal - dismiss =>" + data);
								this.config.student_id = student.id;
								this.config.class_id = this.selectedClass.class.id;

								if (data != "") {
									let newMode1 = {
										mode: "class",
										class_id: this.selectedClass.class.id,
										student_id: student.id,
										pin: data
									};
									this.auth.changeMode(newMode1).subscribe(data => {
										if (data.success) {
											this.config.student_id = student.id;
											this.config.class_id = this.selectedClass.class.id;
											this.events.publish("toggle:tab", "flex");
										}
									});
								}
							});
							this.config.pinModal.present();
						}
					},
					err => {
						this.utilService.createError(err);
						loader.dismiss();
						this.utilService.createAlert("I'm having connection trouble", "");
					}
					);
			} else if (this.mode === "class") {
				this.auth.changeMode(newMode).subscribe(
					data => {
						setTimeout(() => {
							loader.dismiss();
						}, 1000);
						if (data.success) {
							console.log(this.config.class_id);
							this.config.student_id = student.id;
							this.config.class_id = this.selectedClass.class.id;
							// this.events.publish("toggle:tab:flex");
							this.events.publish("toggle:tab", "flex");
						}
					},
					err => {
						this.utilService.createError(err);
						loader.dismiss();
					}
				);
			} else {
				let tt = this;
				setTimeout(() => {
					tt.navCtrl.push("StudentProfilePage", {
						studentID: student.id,
						classID: this.selectedClass.class.id
					});
				}, 500);
				setTimeout(() => {
					loader.dismiss();
				}, 1500);
			}
		} catch (err) {
			console.log(err);
		}
	}

	ionViewDidLoad() {
		console.log('XXX - home - ionViewDidLoad');
		setTimeout(() => {
			this.initData();
		}, 500);
		
		this.events.subscribe("change:class", classID => {
			console.log("event - change:class");
			this.pending = true;
			this.getClassData(classID);
		});

		this.events.subscribe("change:log", classID => {
			if (this.mode == "teacher") {
				this.pending = true;
				this.getClassData(classID);
			}
		});

		this.events.subscribe("change:mode", mode => {
			console.log("home-change:mode ==== " + mode);
			this.config.isOnStudentProfile = false;
			this.mode = mode;
			this.mode_title = mode;
			if (mode == "class") this.mode_title = "Student";
			if (this.mode === "teacher") {
				this.events.publish("toggle:tab", "flex");
				console.log(this.bChart);
				if (this.classData && this.bChart) {
					setTimeout(() => {
						this.loadCycleChart();
					}, 1000);
				}
			} else {
				this.events.publish("toggle:tab", "none");
				this.events.publish("remove:profile");
			}
			this.books = [];
		});
		this.events.subscribe("functionCall:finish", eventData => {
			if (eventData != "parent") {
				var t: Tabs = this.navCtrl.parent;
				t.select(0);
				//this.navCtrl.push(StudentProfilePage, {studentID: this.studentService.studentData.id, classID: this.selectedClass.class.id});
			}
		});
	}

	ionViewWillEnter() {
		console.log("XXX - home - Called ionViewWillEnter - ");

		this.book_list_items = [];
		this.offset = 0;
		this.limit = 20;

		if (this.class_id) {
			this.getClassFeed(this.class_id);
		}
	}

	ionViewDidEnter() {
		this.mode = this.config.mode;
		if (this.mode === "class") {
			this.mode_title = "Student";
			this.events.publish("toggle:tab", "none");
		}
	}

	openDetail(ev: any) {
		this.navCtrl.push("BookDetailPage", { book: ev.data });
	}

	addStudent(readingGroup) { }

	openEditClass($ev) {
		try {
			let modal = this.modalCtrl.create("EditClassPage", {
				class: $ev,
				classData: this.classData
			});
			modal.onDidDismiss(data => {
				console.log(data);
				this.classData.bookreivew = data ? 1 : 0;
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

	openAddStudent() { }

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

		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		if (event.bookreview) {
			let data = {
				event_type: "cheer",
				event_id: feed.id,
				reason: "",
				reason_id: ""
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
									this.ionViewWillEnter();
								}
								loader.dismiss();
							}, err => {
								loader.dismiss();
								console.log(err);
							});
						}
					});
				}, err => {
					loader.dismiss();
					console.log(err);
				});
		} else {
			this.eventsService.createEvent(data).subscribe(data => {
				cheerObj.animate = true;
				let message = `Cheering ${feed.student.title}, Nice!`;
				this.utilService.createToast(message);
				loader.dismiss();
			},
			err => {
				loader.dismiss();
				this.utilService.createError(err);
			});
		}
	}

	shareBook(feed) {
		try {
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
		} catch (err) {
			console.log(err);
		}
	}

	viewStudent(student) {
		this.studentProfile(student);
	}
	/* When book.animateRemove == true the .fadeOut class is added
   * which adds a 2 second CSS transition so wait for this to (roughly) finish
   * before removing the item
   */
	removeBook(book) {
		try {
			const fadeTime = 600;
			var feed = this.book_list_items;
			var item = feed.find(item => item.book.id == book.id);
			if (item) {
				book.animateRemove = true;
				setTimeout(() => {
					this.book_list_items.splice(feed.indexOf(item), 1);
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
		} catch (err) {
			console.log(err);
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
				try {
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
				} catch (err) {
					console.log(err);
				}
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

	goreviewall(ev: any) {
		console.log(ev);
		let bookId = ev.data.id;
		this.navCtrl.push("ReviewallPage", { bookId: bookId });
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

	initBookListItems() { console.log("initBookListItems ======= ", this.classFeed.feed);
		if (this.config.mode != 'teacher') return;
		// for (let i = 0; i < this.getMaxCount(this.countAtOnce); i++) {
		for (let i = 0; i < this.classFeed.feed.length; i++) {
			this.book_list_items.push(this.classFeed.feed[i]);
		}
	}

	getMaxCount(count) {
		if (this.classFeed.feed.length < count) {
			return this.classFeed.feed.length;
		}
		return count;
	}

	doInfinite_list(infiniteScroll) {
		if (this.classFeed.feed.length > 0) {
			setTimeout(() => {
				this.offset += this.countAtOnce;
				this.limit += this.countAtOnce;
				this.sub1 = this.classService
					.getFeed(this.class_id, this.offset, this.limit)
					.subscribe(data => {
						this.classFeed = data;
						this.initBookListItems();
						infiniteScroll.complete();
					});
			}, 500);
		} else {
			infiniteScroll.complete();
		}
		// setTimeout(() => {
		// 	this.book_list_start += this.countAtOnce;
		// 	for (
		// 		let i = this.book_list_start;
		// 		i < this.getMaxCount(this.book_list_start + this.countAtOnce);
		// 		i++
		// 	) {
		// 		this.book_list_items.push(this.classFeed.feed[i]);
		// 	}
		// 	infiniteScroll.complete();
		// }, 500);
	}
}
