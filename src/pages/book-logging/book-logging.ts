import { Component, ViewChild } from "@angular/core";
import {
	NavController,
	NavParams,
	ViewController,
	AlertController,
	Events,
	Tabs,
	Platform,
	Content,
	LoadingController
} from "ionic-angular";
import { Keyboard } from "@ionic-native/keyboard";
import { StudentService } from "../../providers/student-service";
import { BookService } from "../../providers/book-service";
import { ClassService } from "../../providers/class-service";
import { UtilService } from "../../providers/util-service";
import { EventsService } from "../../providers/events-service";
import { Auth } from "../../providers/auth";
import { Config } from "../../providers/config";
import { IonicPage } from "ionic-angular";
import * as $ from "jquery";

@IonicPage()
@Component({
	selector: "page-book-logging",
	templateUrl: "book-logging.html"
})
export class BookLoggingPage {
	studentData: any;
	bookId: any;
	classId: any;
	studentId: any;
	mode: any;
	book: any;
	bookdata: any;
	rating = 0;
	isCurrent = false;
	star: any;
	student_title: any;

	isCurrentReading: any;
	rbook: any;
	animateState1 = false;
	isreadmin = false;
	bookEvent = [];
	pageNum = 0;
	fireButton = false;

	@ViewChild(Content) content: Content;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public studentService: StudentService,
		public eventsService: EventsService,
		public utilService: UtilService,
		public bookService: BookService,
		public auth: Auth,
		public alertCtrl: AlertController,
		public events: Events,
		private platform: Platform,
		public loading: LoadingController,
		public keyboard: Keyboard,
		public config: Config,
		public classService: ClassService
	) {
		this.isCurrentReading = this.navParams.get("isCurrentReading");
		console.log(this.studentService.studentData);
		console.log(this.isCurrentReading);
		/*
		if(this.navParams.get('isCurrentReading')) {
			this.rbook = this.navParams.get('book');
			this.classId = this.rbook.class_id;
			this.studentId = this.rbook.student_id;
			this.student_title = "";
		} else {
			this.studentData = this.studentService.studentData;
			this.classId = this.studentData.classroom.id;
			this.studentId = this.studentData.student.id;
			this.student_title = this.studentData.student.title;
		}*/

		try {
			this.studentData = this.studentService.studentData;
			this.classId = this.navParams.get("classid");
			this.studentId = this.navParams.get("studentid");
			this.student_title = this.navParams.get("stitle");

			if (this.classId) {
			} else {
				this.classId = this.studentData.classroom.id;
			}
			if (this.studentId) {
			} else {
				this.studentId = this.studentData.student.id;
			}

			this.bookdata = this.navParams.get("bookdata");

			this.bookId = this.navParams.get("bookid");
			if (!this.bookId && this.bookdata) {
				this.bookId = this.bookdata.book.id;
			}

			this.mode = this.config.mode;

			if (this.mode == "parent") {
				let newMode = {
					mode: "class",
					class_id: this.classId,
					student_id: this.studentId
				};
				this.auth.changeMode(newMode).subscribe(
					data => {
						if (data.success) {
							this.studentService
								.getStudent(this.studentId, this.classId, true)
								.subscribe(data => {
									this.studentService.studentData = data;
									this.student_title = data.student.title;
									this.onload();
								});
						}
					},
					err => {
						this.utilService.createError(err);
					}
				);
			} else {
				this.onload();
			}

			this.platform.ready().then(() => {
				this.keyboard.onKeyboardShow().subscribe(() => {
					let element = document.getElementById("book_title");
					//let element = document.getElementById('readingbar');
					this.scrollTop(element.offsetTop + 220);
				});
			});
			this.platform.ready().then(() => {
				if (this.platform.is("ios") || this.platform.is("android")) {
					$("#pagehour").css("display", "none");
					$("#pageminute").css("display", "none");
					$("#pagehour_finish1").css("display", "none");
					$("#pageminute_finish1").css("display", "none");
				} else {
					$("#pagehour_picker").css("display", "none");
					$("#pageminute_picker").css("display", "none");
					$("#pagehour_finish1_picker").css("display", "none");
					$("#pageminute_finish1_picker").css("display", "none");
					$(".row span.sbp").css("display", "none");
					$(".row span.sb").css("display", "block");
					$(".row1").css("margin-top", "40px");
				}
			});
		} catch (err) {
			console.log(err);
		}
	}

	scrollTop(topY) {
		try {
			this.content.scrollTo(0, topY, 500);
		} catch (err) {
			// swallow the error and keep going, this is just a scroll
			console.log(err);
		}
	}

	onload() { console.log(this.bookdata);
		try {
			this.bookEvent = [];

			if (
				this.studentService.studentData &&
				this.studentService.studentData.classroom &&
				this.studentService.studentData.classroom.recordminutes == "1"
			) {
				this.isreadmin = true;
				$('#bt_next_finish1_pages').html('Next');
			}

			if (!this.bookdata) {
				this.bookService
					.getBookDetail(this.classId, this.studentId, this.bookId, this.mode)
					.subscribe(data => {
						console.log(data);
						this.book = data.book;
						this.bookdata = data;
						if (data.events) {
							for (let i = 0; i < data.events.length; i++) {
								if (data.events[i].event_type == "current") {
									this.bookEvent.push(data.events[i]);
								}
							}
						}
					},
					err => {
						this.utilService.createError(err);
					});

				this.studentService
					.getCurrentBooks(this.studentId, this.classId)
					.subscribe(data => {
						let current = data.books;
						for (let i = 0; i < current.length; i++) {
							let book = current[i];
							if (this.bookId == book.book_id) {
								this.isCurrent = true;
								this.rbook = book;
								console.log("rbook=>", this.rbook);
								this.isCurrentReading = true;
								break;
							}
						}
						console.log(this.isCurrent);
					},
					err => {
						this.utilService.createError(err);
					});
			} else {
				this.book = this.bookdata.book;

				if (this.bookdata.events) {
					this.bookdata.events.sort(function(a, b) {
						return (
							new Date(a.updated_at).getTime() -
							new Date(b.updated_at).getTime()
						);
					});

					let lastEvent = this.bookdata.events[this.bookdata.events.length - 1];
					if (lastEvent && lastEvent.event_type == "current") {
						this.isCurrentReading = true;
						this.rbook = {
							book: this.bookdata.book,
							pages: lastEvent.pages,
							book_id: lastEvent.book_id,
							events: this.bookdata.events
						};
					} else {
						this.rbook = this.bookdata;
					}
					for (let i = 0; i < this.bookdata.events.length; i++) {
						if (this.bookdata.events[i].event_type == "current") {
							this.bookEvent.push(this.bookdata.events[i]);
						}
					}
				}
			}
		} catch (err) {
			console.log(err);
		}
	}

	outDialog2() {
		$("#dialog_overlay_finish1_pages").removeClass("bounceIn");
		$("#dialog_overlay_finish1_pages").addClass("bounceOut");
		setTimeout(() => {
			$("#dialog_overlay_finish1_pages").removeClass("animated");
			$("#dialog_overlay_finish1_pages").removeClass("bounceOut");
			$("#dialog_overlay_finish1_pages").removeClass("showdialog");
		}, 1000);
	}

	outDialog3() {
		$("#dialog_overlay_finish1_minute").removeClass("bounceIn");
		$("#dialog_overlay_finish1_minute").addClass("bounceOut");
		setTimeout(() => {
			$("#dialog_overlay_finish1_minute").removeClass("animated");
			$("#dialog_overlay_finish1_minute").removeClass("bounceOut");
			$("#dialog_overlay_finish1_minute").removeClass("showdialog");
		}, 1000);
	}

	openDialog3() {
		$("#dialog_overlay_finish1_minute .sec_cont").css("display", "block");
		$("#dialog_overlay_finish1_minute .sec_cont1").css("display", "none");
		$("#dialog_overlay_finish1_minute").addClass("showdialog");
		$("#dialog_overlay_finish1_minute").addClass("animated");
		$("#dialog_overlay_finish1_minute").addClass("bounceIn");
		$("#pagehour_finish1").val("0");
		$("#pageminute_finish1").val("20");
		$("#pagehour_finish1_picker .clone-scroller").scrollTop(0);
		$("#pageminute_finish1_picker .clone-scroller").scrollTop(300);
	}

	ionViewDidLoad() {
		console.log("ionViewDidLoad BookLoggingPage");
	
		$("#dialog_overlay_finish1_pages .sec_cont").css("display", "block");
		$("#dialog_overlay_finish1_pages .sec_cont1").css("display", "none");
		$("#dialog_overlay_finish1_pages .desc1").css("display", "none");
		$("#dialog_overlay_finish1_pages .desc2").css("display", "block");
		$("#dialog_overlay_finish1_pages .bt_ok").css("display", "block");
	
		$("#dialog_overlay_finish1_minute .sec_cont").css("display", "block");
		$("#dialog_overlay_finish1_minute .sec_cont1").css("display", "none");
		$("#dialog_overlay_finish1_minute .desc1").css("display", "none");
		$("#dialog_overlay_finish1_minute .desc2").css("display", "block");
		$("#dialog_overlay_finish1_minute .bt_ok").css("display", "block");
		
		var tt = this;
		$("#bt_next_finish1_pages").unbind("click");
		$("#bt_next_finish1_pages").click(function() {
			tt.pageNum = $("#pagenum_finish1").val();
			if (tt.isreadmin) {
				$("#dialog_overlay_finish1_pages").removeClass("animated");
				$("#dialog_overlay_finish1_pages").removeClass("bounceIn");
				$("#dialog_overlay_finish1_pages").removeClass("showdialog");
				tt.openDialog3();
			} else {
				if (tt.isCurrentReading) {
					tt.finishReading();
				} else {
					tt.finishReading1();
				}
			}
		});
		$("#bt_cancel_finish1_pages").unbind("click");
		$("#bt_cancel_finish1_pages").click(function() {
			tt.outDialog2();
		});
		$("#dialog_overlay_finish1_pages .bt_ok").unbind("click");
		$("#dialog_overlay_finish1_pages .bt_ok").click(function() {
			tt.outDialog2();
		});
		$("#bt_cancel_finish1_minute").unbind("click");
		$("#bt_cancel_finish1_minute").click(function() {
			tt.outDialog3();
		});
		$("#dialog_overlay_finish1_minute .bt_ok").unbind("click");
		$("#dialog_overlay_finish1_minute .bt_ok").click(function() {
			tt.outDialog3();
		});
		$("#bt_done_finish1_minute").unbind("click");
		$("#bt_done_finish1_minute").click(function() {
			if (tt.isCurrentReading) {
				tt.finishReading();
			} else {
				tt.finishReading1();
			}
		});
	}

	finishReading1() { console.log("XXX===finishReading1()");
		try {
			var tt = this;
			var minutes =
				$("#pagehour_finish1").val() * 60 +
				eval($("#pageminute_finish1").val());

			if (!tt.isreadmin) {
				$("#dialog_overlay_finish1_pages .sec_cont").css("display", "none");
				$("#dialog_overlay_finish1_pages .sec_cont1").css("display", "block");
				$("#dialog_overlay_finish1_pages .desc1").css("display", "block");
				$("#dialog_overlay_finish1_pages .desc2").css("display", "none");
				$("#dialog_overlay_finish1_pages .bt_ok").css("display", "none");
			} else {
				$("#dialog_overlay_finish1_minute .sec_cont").css("display", "none");
				$("#dialog_overlay_finish1_minute .sec_cont1").css("display", "block");
				$("#dialog_overlay_finish1_minute .desc1").css("display", "block");
				$("#dialog_overlay_finish1_minute .desc2").css("display", "none");
				$("#dialog_overlay_finish1_minute .bt_ok").css("display", "none");
			}
			var msg = "";
			let log_data = {
				event_type: "log",
				student_id: tt.studentId,
				book_id: tt.bookId
			};
			if (tt.isreadmin) {
				log_data["minutes"] = minutes;
			}
			msg = "";
			tt.eventsService.createEvent(log_data).subscribe(
				data => {
					if (data.messages && data.messages.length > 0) {
						msg = data.messages[0];
					}
					if (data.messages && data.messages.length > 1) {
						msg = data.messages[0] + "<br/>" + data.messages[1];
					}
					if (this.config.mode == "parent") {
						tt.config.parentFromLogging = true;
						tt.events.publish("change:refresh");
						this.viewCtrl.dismiss();
						this.events.publish("functionCall:finish", "parent");
					} else if (tt.navParams.get("isCurrentReading")) {
						tt.events.publish("functionCall:finish");
					} else {
						if (this.config.loginMode == "parent") {
							tt.config.parentFromLogging = true;
						}
						tt.config.changeable = false;
							console.log(tt.studentId);
							tt.config.setStudent_id(tt.studentId);
							tt.events.publish("toggle:tab", "flex");
							var t: Tabs = tt.navCtrl.parent;
							tt.events.publish("change:log", tt.classId);
							if (this.config.mode == "class") {
								t.select(3);
							} else {
								tt.onCancel();
							}
							tt.events.publish("load:currentreading");
					}
					if (!tt.isreadmin) {
						$("#dialog_overlay_finish1_pages .desc1").css("display", "none");
						$("#dialog_overlay_finish1_pages .desc2").css("display", "block");
						$("#dialog_overlay_finish1_pages .bt_ok").css("display", "block");
						$("#dialog_overlay_finish1_pages .desc2").html(msg);
					} else {
						$("#dialog_overlay_finish1_minute .desc1").css("display", "none");
						$("#dialog_overlay_finish1_minute .desc2").css("display", "block");
						$("#dialog_overlay_finish1_minute .bt_ok").css("display", "block");
						$("#dialog_overlay_finish1_minute .desc2").html(msg);
					}
				},
				err => {
					msg = "Failed!";
					if (!tt.isreadmin) {
						$("#dialog_overlay_finish1_pages .desc1").css("display", "none");
						$("#dialog_overlay_finish1_pages .desc2").css("display", "block");
						$("#dialog_overlay_finish1_pages .bt_ok").css("display", "block");
						$("#dialog_overlay_finish1_pages .desc2").html(msg);
					} else {
						$("#dialog_overlay_finish1_minute .desc1").css("display", "none");
						$("#dialog_overlay_finish1_minute .desc2").css("display", "block");
						$("#dialog_overlay_finish1_minute .bt_ok").css("display", "block");
						$("#dialog_overlay_finish1_minute .desc2").html(msg);
					}
				}
			);
		} catch (err) {
			console.log(err);
		}
	}

	bookCreate(bookId) {
		let tt = this;
		this.alertCtrl.create({
			title: "Enter new page number",
			message: "",
			inputs: [
				{
					name: 'newpages',
					value: this.pageNum.toString(),
				  	placeholder: 'New page number'
				}
			],
			buttons: [
				{
					text: "Cancel",
					role: "cancel"
				},
				{
					text: "Post",
					handler: data => {
						if (!this.config.isNumeric(data.newpages)) {
							this.utilService.createToast("Page number should be numberic.");
							return false;
						}
						let loader = this.loading.create({
							content: ""
						});
						loader.present();
						this.bookService.postNewBookPage(bookId, data.newpages).subscribe(
							data => {
								loader.dismiss();
								if (this.config.mode == "parent") {
									tt.config.parentFromLogging = true;
									tt.events.publish("change:refresh");
									this.viewCtrl.dismiss();
									this.events.publish("functionCall:finish", "parent");
								} else if (tt.navParams.get("isCurrentReading")) {
									tt.events.publish("functionCall:finish");
								} else {
									if (this.config.loginMode == "parent") {
										tt.config.parentFromLogging = true;
									}
									tt.config.changeable = false;
									console.log(tt.studentId);
									tt.config.setStudent_id(tt.studentId);
									tt.events.publish("toggle:tab", "flex");
									var t: Tabs = tt.navCtrl.parent;
									tt.events.publish("change:log", tt.classId);
									if (this.config.mode == "class") {
										t.select(3);
									} else {
										tt.onCancel();
									}
									tt.events.publish("load:currentreading");
								}
								return true;
							},
							err => {
								loader.dismiss();
								this.utilService.createError(err);
							}
						);
					}
				}
			]
		}).present();
	}

	finishReading() { console.log("XXX===finishReading()");
		try {
			if (this.pageNum * 100 > parseInt(this.bookdata.book.pages) * 135) {
				this.outDialog3();
				this.alertCtrl.create({
					title: "Did you mean to enter "+this.pageNum+" pages",
					message: "Can you look at the last page of the book, and type that number in so we can update your teacher with the correct number of pages<br/>Book Last Page Number: <b>"+this.bookdata.book.pages+"</b>",
					buttons: [
						{
							text: "No",
							role: "cancel"
						},
						{
							text: "Yes",
							handler: () => {
								this.bookCreate(this.bookId);
							}
						}
					]
				}).present();
				return;
			}
			var tt = this;
			var minutes =
				$("#pagehour_finish1").val() * 60 +
				eval($("#pageminute_finish1").val());
			let data = {
				event_type: "current",
				student_id: tt.studentId,
				book_id: tt.bookId,
				pages: this.pageNum
			};
			if (tt.isreadmin) {
				data["minutes"] = minutes;
			}
			if (!tt.isreadmin) {
				$("#dialog_overlay_finish1_pages .sec_cont").css("display", "none");
				$("#dialog_overlay_finish1_pages .sec_cont1").css("display", "block");
				$("#dialog_overlay_finish1_pages .desc1").css("display", "block");
				$("#dialog_overlay_finish1_pages .desc2").css("display", "none");
				$("#dialog_overlay_finish1_pages .bt_ok").css("display", "none");
			} else {
				$("#dialog_overlay_finish1_minute .sec_cont").css("display", "none");
				$("#dialog_overlay_finish1_minute .sec_cont1").css("display", "block");
				$("#dialog_overlay_finish1_minute .desc1").css("display", "block");
				$("#dialog_overlay_finish1_minute .desc2").css("display", "none");
				$("#dialog_overlay_finish1_minute .bt_ok").css("display", "none");
			}
			var msg = "";
			tt.eventsService.createEvent(data).subscribe(
				data => {
					let log_data = {
						event_type: "log",
						student_id: tt.studentId,
						book_id: tt.bookId
					};
					msg = "";
					tt.eventsService.createEvent(log_data).subscribe(
						data => {
							if (data.messages && data.messages.length > 0) {
								msg = data.messages[0];
							}
							if (data.messages && data.messages.length > 1) {
								msg = data.messages[0] + "<br/>" + data.messages[1];
							}
							if (this.config.mode == "parent") {
								tt.config.parentFromLogging = true;
								tt.events.publish("change:refresh");
								this.viewCtrl.dismiss();
								this.events.publish("functionCall:finish", "parent");
							} else if (tt.navParams.get("isCurrentReading")) {
								if (tt.config.mode == "teacher") {
									tt.onCancel();
								}
								tt.events.publish("functionCall:finish");
							} else {
								if (this.config.loginMode == "parent") {
									tt.config.parentFromLogging = true;
								}
								tt.config.changeable = false;
								tt.config.setStudent_id(tt.studentId);
								tt.events.publish("toggle:tab", "flex");
								var t: Tabs = tt.navCtrl.parent;
								tt.events.publish("change:log", tt.classId);
								if (this.config.mode == "class") {
									t.select(3);
								} else {
									tt.onCancel();
								}
								tt.events.publish("load:currentreading");
							}
							if (!tt.isreadmin) {
								$("#dialog_overlay_finish1_pages .desc1").css(
									"display",
									"none"
								);
								$("#dialog_overlay_finish1_pages .desc2").css(
									"display",
									"block"
								);
								$("#dialog_overlay_finish1_pages .bt_ok").css(
									"display",
									"block"
								);
								$("#dialog_overlay_finish1_pages .desc2").html(msg);
							} else {
								$("#dialog_overlay_finish1_minute .desc1").css(
									"display",
									"none"
								);
								$("#dialog_overlay_finish1_minute .desc2").css(
									"display",
									"block"
								);
								$("#dialog_overlay_finish1_minute .bt_ok").css(
									"display",
									"block"
								);
								$("#dialog_overlay_finish1_minute .desc2").html(msg);
							}
						},
						err => {
							msg = "Failed!";
							if (!tt.isreadmin) {
								$("#dialog_overlay_finish1_pages .desc1").css(
									"display",
									"none"
								);
								$("#dialog_overlay_finish1_pages .desc2").css(
									"display",
									"block"
								);
								$("#dialog_overlay_finish1_pages .bt_ok").css(
									"display",
									"block"
								);
								$("#dialog_overlay_finish1_pages .desc2").html(msg);
							} else {
								$("#dialog_overlay_finish1_minute .desc1").css(
									"display",
									"none"
								);
								$("#dialog_overlay_finish1_minute .desc2").css(
									"display",
									"block"
								);
								$("#dialog_overlay_finish1_minute .bt_ok").css(
									"display",
									"block"
								);
								$("#dialog_overlay_finish1_minute .desc2").html(msg);
							}
						}
					);
				},
				err => {
					msg = "Failed!";
					if (!tt.isreadmin) {
						$("#dialog_overlay_finish1_pages .desc1").css("display", "none");
						$("#dialog_overlay_finish1_pages .desc2").css("display", "block");
						$("#dialog_overlay_finish1_pages .bt_ok").css("display", "block");
						$("#dialog_overlay_finish1_pages .desc2").html(msg);
					} else {
						$("#dialog_overlay_finish1_minute .desc1").css("display", "none");
						$("#dialog_overlay_finish1_minute .desc2").css("display", "block");
						$("#dialog_overlay_finish1_minute .bt_ok").css("display", "block");
						$("#dialog_overlay_finish1_minute .desc2").html(msg);
					}
				}
			);
		} catch (err) {
			console.log(err);
		}
	}

	openDialog() {
		try {
			var tt = this;
			var minutes =
				$("#pagehour_finish1").val() * 60 +
				eval($("#pageminute_finish1").val());
			let data = {
				event_type: "log",
				student_id: tt.studentId,
				book_id: tt.bookId,
				pages: this.pageNum,
				minutes: minutes,
				rating: tt.star
			};
			var message =
				"Congrats!. You have finished another book. Tell your team.";
			tt.eventsService.createEvent(data).subscribe(
				data => {
					var msg = "";
					if (data.messages && data.messages.length > 0) {
						msg = data.messages[0];
					}
					if (data.messages && data.messages.length > 1) {
						msg = data.messages[0] + "<br/>" + data.messages[1];
					}
					$("#dialog_overlay_finish1 .desc1").css("display", "none");
					$("#dialog_overlay_finish1 .desc2").css("display", "block");
					$("#dialog_overlay_finish1 .bt_ok").css("display", "block");
					$("#dialog_overlay_finish1 .desc2").html(msg);
					//tt.viewCtrl.dismiss();
					if (this.config.mode == "parent") {
						tt.config.parentFromLogging = true;
						tt.events.publish("change:refresh");
						this.viewCtrl.dismiss();
						this.events.publish("functionCall:finish", "parent");
					} else if (tt.navParams.get("isCurrentReading")) {
						tt.events.publish("functionCall:finish");
					} else {
						if (this.config.loginMode == "parent") {
							tt.config.parentFromLogging = true;
						}
						tt.config.changeable = false;
						tt.config.setStudent_id(tt.studentId);
						tt.events.publish("toggle:tab", "flex");
						var t: Tabs = tt.navCtrl.parent;
						tt.events.publish("change:log", tt.classId);
						if (this.config.mode == "class") {
							t.select(3);
						} else {
							tt.onCancel();
						}
						tt.events.publish("load:currentreading");
					}
					tt.utilService.createToast(message);
				},
				err => {
					message = "Failed!";
					tt.utilService.createToast(message);
					$("#dialog_overlay_finish1 .desc1").css("display", "none");
					$("#dialog_overlay_finish1 .desc2").css("display", "block");
					$("#dialog_overlay_finish1 .bt_ok").css("display", "block");
					$("#dialog_overlay_finish1 .desc2").html(message);
				}
			);
		} catch (err) {
			console.log(err);
		}
	}

	onCancel() { 
		this.viewCtrl.dismiss().catch();
		if (this.config.mode != 'parent' && (!this.isCurrentReading || this.config.mode != "teacher")) {
			this.events.publish("toggle:tab", "flex");
		}
	}

	onUpdate() {
		try {
			//this.viewCtrl.dismiss();
			if (this.config.mode == "parent") {
				this.config.parentFromLogging = true;
				this.viewCtrl.dismiss();
				this.events.publish("functionCall:finish", "parent");
			} else {
				if (this.config.loginMode == "parent") {
					this.config.parentFromLogging = true;
				}
				if (this.config.mode == "teacher") {
					this.viewCtrl.dismiss();
					var t: Tabs = this.navCtrl.parent;
					t.select(0);
				}
				if (this.config.mode == "class") {
					this.config.changeable = false;
					this.config.setStudent_id(this.studentId);
					this.events.publish("toggle:tab", "flex");
					var t: Tabs = this.navCtrl.parent;
					this.events.publish("change:log", this.classId);
					if (this.config.mode == "class") {
						t.select(3);
					}
					this.events.publish("load:currentreading");
				}
			}
		} catch (err) {
			console.log(err);
		}
	}

	fireEvent(type) {
		this.loggingBook(type);
	}

	loggingBook(type) {
		if (type === "log") {
			// finish reading
			// this.isCurrentReading = false;
			this.pageNum = 0;
			var minutes = 0;
			var i = this.bookdata.events.length - 1;
			if (i > -1 && this.bookdata.events[i].pages != null) {
				this.pageNum = this.bookdata.events[i].pages;
			}
			for (i = 0; i < this.bookdata.events.length; i++) {
				if (this.bookdata.events[i].minutes != null) {
					minutes += this.bookdata.events[i].minutes;
				}
			}
			console.log(this.isCurrentReading);
			console.log(this.bookdata);
			if (this.isCurrentReading) {
				var pages = this.bookdata.book.pages;
				if (pages == null || pages * 1 == 0) {
					pages = "0";
					this.pageNum = 0;
				} else {
					this.pageNum = pages;
				}
				if (this.pageNum == 0) $("#pagenum_finish1").val("");
				else $("#pagenum_finish1").val(this.pageNum);
				$("#dialog_overlay_finish1_pages .inputlabel span").html(pages);
				// var str = "Congrats you completed the <span>" + pages + "</span>pages of the book";
				// if(pages == 0) str = "Congrats you completing book";
				// $('#dialog_overlay_finish1 .desc1').html(str);
				$("#dialog_overlay_finish1_pages").addClass("showdialog");
				$("#dialog_overlay_finish1_pages").addClass("animated");
				$("#dialog_overlay_finish1_pages").addClass("bounceIn");
				focus();
				//$('#pagenum_finish1').focus();
				// $('#dialog_overlay_finish1_pages .bt_ok').css('display', 'none');
				//this.openDialog();
				//this.viewCtrl.dismiss();
			} else {
				// this.bookService.getBookDetailEstimate(this.classId, this.studentId, this.bookId)
				// .subscribe(data => {
				// 	console.log(data);
				// });
				console.log(this.isreadmin);
				if (this.isreadmin) {
					this.openDialog3();
				} else {			
					$("#dialog_overlay_finish1_minute").addClass("showdialog");
					$("#dialog_overlay_finish1_minute").addClass("animated");
					$("#dialog_overlay_finish1_minute").addClass("bounceIn");
					
					$("#dialog_overlay_finish1_minute .sec_cont").css("display", "none");
					$("#dialog_overlay_finish1_minute .sec_cont1").css(
						"display",
						"block"
					);
					$("#dialog_overlay_finish1_minute .desc1").css("display", "block");
					$("#dialog_overlay_finish1_minute .desc2").css("display", "none");
					$("#dialog_overlay_finish1_minute .bt_ok").css("display", "none");
					var tt = this;
					let log_data = {
						event_type: "log",
						student_id: tt.studentId,
						book_id: tt.bookId
					};
					var msg = "";
					tt.eventsService.createEvent(log_data).subscribe(
						data => {
							if (data.messages && data.messages.length > 0) {
								msg = data.messages[0];
							}
							if (data.messages && data.messages.length > 1) {
								msg = data.messages[0] + "<br/>" + data.messages[1];
							}
							if (this.config.mode == "parent") {
								tt.config.parentFromLogging = true;
								tt.events.publish("change:refresh");
								this.viewCtrl.dismiss();
								this.events.publish("functionCall:finish", "parent");
							} else if (tt.navParams.get("isCurrentReading")) {
								tt.events.publish("functionCall:finish");
							} else {
								if (this.config.loginMode == "parent") {
									tt.config.parentFromLogging = true;
								}
								tt.config.changeable = false;
								tt.config.setStudent_id(tt.studentId);
								tt.events.publish("toggle:tab", "flex");
								var t: Tabs = tt.navCtrl.parent;
								tt.events.publish("change:log", tt.classId);
								if (this.config.mode == "class") {
									t.select(3);
								} else {
									tt.onCancel();
								}
								tt.events.publish("load:currentreading");
							}
							$("#dialog_overlay_finish1_minute .desc1").css("display", "none");
							$("#dialog_overlay_finish1_minute .desc2").css(
								"display",
								"block"
							);
							$("#dialog_overlay_finish1_minute .bt_ok").css(
								"display",
								"block"
							);
							$("#dialog_overlay_finish1_minute .desc2").html(msg);
						},
						err => {
							msg = "Failed!";
							$("#dialog_overlay_finish1_minute .desc1").css("display", "none");
							$("#dialog_overlay_finish1_minute .desc2").css(
								"display",
								"block"
							);
							$("#dialog_overlay_finish1_minute .bt_ok").css(
								"display",
								"block"
							);
							$("#dialog_overlay_finish1_minute .desc2").html(msg);
						}
					);
				}
			}
			return;
		}

		let data = {
			event_type: type,
			student_id: this.studentId,
			book_id: this.bookId,
			rating: this.star
		};

		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.eventsService.createEvent(data).subscribe(
			data => {
				let message: string;
				if (type === "log") {
					message =
						"Congrats!. You have finished another book. Tell your team.";
				} else if (type === "current") {
					message = `Set a new book as your currently reading.`;
				} else if (type === "history") {
					message = `Saved as a book you have read before`;
				}
				if (this.isCurrent && type === "log") {
					console.log("iscurrent = true");
					this.viewCtrl.dismiss();
					this.eventsService
						.deleteFromCurrentList(this.bookId)
						.subscribe(data => {
							if (this.navParams.get("isCurrentReading")) {
								this.events.publish("functionCall:finish");
								/*
					this.studentService.getStudent(this.studentId, this.classId)
					.subscribe(data => {
						this.studentService.studentData = data;
						this.config.student_id = this.studentId;
						this.config.class_id = this.classId;
						this.config.pstudent = true;
						
						this.config.mode = 'class';
						this.events.publish('toggle:tab', ('flex'));
						var t:Tabs = this.navCtrl.parent; console.log(t);
						t.select(3);
					});*/
							} else {
								this.config.changeable = false;
								this.config.setStudent_id(this.studentId);
								this.events.publish("toggle:tab", "flex");
								var t: Tabs = this.navCtrl.parent;
								this.events.publish("change:log", this.classId);
								t.select(3);
								//this.navCtrl.push(StudentProfilePage, {studentID: this.studentId, classID: this.classId});
							}
							this.utilService.createToast(message);
							this.viewCtrl.dismiss();
						},
						err => {
							this.utilService.createError(err);
						});
				} else if (type === "current") {
					this.rbook = this.bookdata;
					console.log(this.rbook);
					this.isCurrent = true;
					this.isCurrentReading = true;
					this.fireButton = true;
				} else {
					this.viewCtrl.dismiss();
					this.config.changeable = false;
					this.config.setStudent_id(this.studentId);
					this.events.publish("toggle:tab", "flex");
					var t: Tabs = this.navCtrl.parent;
					this.events.publish("change:log", this.classId);
					if (this.config.mode == "class") {
						t.select(3);
					} else {
						this.onCancel();
					}
					this.events.publish("load:currentreading");
					this.utilService.createToast(message);

					/*this.navCtrl.remove(1, 2);
			let tt = this;
			setTimeout(function(){
				var t: Tabs = tt.navCtrl.parent;
				t.select(3);
			}, 1000);*/
					//this.navCtrl.push(StudentProfilePage, {studentID: this.studentId, classID: this.classId});

					//this.viewCtrl.dismiss();
				}
				loader.dismiss();
			},
			err => {
				this.utilService.createError(err);
				loader.dismiss();
			}
		);
	}

	starClicked(ev) {
		this.star = ev;
		//this.studentService.setRatings("log", this.bookId, this.star)
		//.subscribe(data => {
		//});
	}

	readingResponse() {
		var msg =
			"Our reading response system provides an innovative way to engage students with their reading. Rather than relying on quizzes, we aim to inspire students to read more, to help them build strong peer accountability and reading habits, and to increase reading comprehension through guided reflections and prompts.";

		let alert = this.alertCtrl.create({
			title: "Coming Soon",
			message: msg,
			enableBackdropDismiss: false,
			buttons: [
				{
					text: "Ok",
					handler: () => {}
				}
			]
		});
		alert.present();
	}
}
