import {
	Component,
	Input,
	Output,
	EventEmitter,
	ViewChild,
	ElementRef
} from "@angular/core";
import {
	Platform,
	LoadingController,
	AlertController,
	Events
} from "ionic-angular";
import { Config } from "../../providers/config";
import { UtilService } from "../../providers/util-service";
import { StudentService } from "../../providers/student-service";
import { EventsService } from "../../providers/events-service";
import { BookService } from "../../providers/book-service";
import { Auth } from "../../providers/auth";
import * as $ from "jquery";

declare let Swiper: any;

@Component({
	selector: "reading-bar",
	templateUrl: "reading-bar.html"
})
export class ReadingBarComponent {
	@Input() classId: string;
	@Input() studentId: string;
	@Input() rbook: any;
	@Input() isDownArrow: boolean;
	@Input() isreadmin = false;
	@Input() isFinish = false;
	@Input() isbooklogging = false;
	@Input() shv = false;
	@Input() fireButton = false;

	@Output() updateReadingCallback = new EventEmitter();
	@Output() updateFinishCallback = new EventEmitter();

	@ViewChild("bookPages") myinput: ElementRef;

	public mode: any;
	public pageNum: any;
	public evReading: any;
	public book: any;
	public rmin = "";
	public animateState = false;
	public animateState1 = false;
	readminAry = [];
	pagenumber = "";
	public selbook: any;
	public selmin: any;
	public logHistory = [];

	constructor(
		public platform: Platform,
		public config: Config,
		public utilService: UtilService,
		public studentService: StudentService,
		public eventsService: EventsService,
		public auth: Auth,
		public loading: LoadingController,
		public events: Events,
		public bookService: BookService,
		public alertCtrl: AlertController
	) {
		this.mode = this.config.mode;

		this.readminAry = [];
		for (let i = 10; i <= 90; i = i + 5) {
			this.readminAry.push({ min: i, val: i });
		}

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
	}

	ngOnInit() {}

	outDialog() {
		$("#dialog_overlay").removeClass("bounceIn");
		$("#dialog_overlay").addClass("bounceOut");
		setTimeout(() => {
			$("#dialog_overlay").removeClass("animated");
			$("#dialog_overlay").removeClass("bounceOut");
			$("#dialog_overlay").removeClass("showdialog");
		}, 1000);
	}
	outDialog1() {
		$("#dialog_overlay_minute").removeClass("bounceIn");
		$("#dialog_overlay_minute").addClass("bounceOut");
		setTimeout(() => {
			$("#dialog_overlay_minute").removeClass("animated");
			$("#dialog_overlay_minute").removeClass("bounceOut");
			$("#dialog_overlay_minute").removeClass("showdialog");
		}, 1000);
	}
	outDialog2() {
		$("#dialog_overlay_finish").removeClass("bounceIn");
		$("#dialog_overlay_finish").addClass("bounceOut");
		setTimeout(() => {
			$("#dialog_overlay_finish").removeClass("animated");
			$("#dialog_overlay_finish").removeClass("bounceOut");
			$("#dialog_overlay_finish").removeClass("showdialog");
		}, 1000);
	}
	ngOnChanges(changes: any) {
		//console.log(this.isreadmin);
		//console.log('=========================================', this.rbook);
		
		var tt = this;
		if (tt.isreadmin) {
			$("#bt_done").html("Next");
		} else {
			$("#bt_done").html("Done");
		}
		$("#bt_ok").unbind("click");
		$("#bt_ok").click(function() {
			tt.outDialog2();
		});
		$("#bt_cancel").unbind("click");
		$("#bt_cancel").click(function() {
			tt.outDialog();
			// tt.updateReadingCallback.emit(tt.rbook);
		});
		$("#bt_cancel1").unbind("click");
		$("#bt_cancel1").click(function() {
			tt.outDialog1();
			// tt.updateReadingCallback.emit(tt.rbook);
		});
		$("#bt_cancel2").unbind("click");
		$("#bt_cancel2").click(function() {
			tt.outDialog2();
		});
		$("#bt_done").unbind("click");
		$("#bt_done").click(function() {
			$("#dialog_overlay").removeClass("animated");
			$("#dialog_overlay").removeClass("bounceIn");
			$("#dialog_overlay").removeClass("showdialog");
			tt.pageNum = $("#pagenum").val();
			if (tt.isreadmin) {
				$("#dialog_overlay_minute").addClass("showdialog");
				$("#dialog_overlay_minute").addClass("animated");
				$("#dialog_overlay_minute").addClass("bounceIn");
				// if($('#pageminute').val()*1 == 0) {
				$("#pagehour").val("0");
				$("#pageminute").val("20");
				$("#pagehour_picker .clone-scroller").scrollTop(0);
				$("#pageminute_picker .clone-scroller").scrollTop(300);
				// }
			} else {
				tt.updatePageNum(tt.selbook, tt.selmin);
			}
		});
		$("#bt_done1").unbind("click");
		$("#bt_done1").click(function() {
			tt.outDialog1();
			tt.selmin = $("#pagehour").val() * 60 + eval($("#pageminute").val());
			tt.updatePageNum(tt.selbook, tt.selmin);
		});
		$("#dialog_overlay_finish1_minute .bt_ok").unbind("click");
		$("#dialog_overlay_finish1_minute .bt_ok").click(function() {
			$("#dialog_overlay_finish1_minute").removeClass("bounceIn");
			$("#dialog_overlay_finish1_minute").addClass("bounceOut");
			setTimeout(() => {
				$("#dialog_overlay_finish1_minute").removeClass("animated");
				$("#dialog_overlay_finish1_minute").removeClass("bounceOut");
				$("#dialog_overlay_finish1_minute").removeClass("showdialog");
			}, 1000);
		});

		//=================================================
		this.isFinish = false;
		console.log(this.fireButton, this.rbook);
		if (this.rbook && this.rbook.book) {
			if (eval(this.rbook.pages) > eval(this.rbook.book.pages) * 0.6) {
				this.isFinish = true;
			}

			if (this.rbook.book.pages && eval(this.rbook.book.pages) == 0) {
				//this.shv = false;
				//this.isDownArrow = false;
			}
			this.book = this.rbook.book;
			this.pageNum = this.rbook.pages;
			this.rmin = this.rbook.minutes;

			if (!this.classId) this.classId = this.rbook.class_id;
			if (!this.studentId) this.studentId = this.rbook.student_id;
			if (this.rmin == null) this.rmin = "";

			this.loadCurrentReading();

			if (this.fireButton) {
				this.updateReading(this.rbook, this.rmin);
			}
		}
	}

	ngAfterViewInit() {}

	checkFocus() {
		//this.pageNum = "";
		//$('#inputpage input').select();
	}

	getDate(date) {
		if (date == "") return "";
		return new Date(date);
	}

	shReading() {
		this.shv = !this.shv;
	}

	history() {}

	ionViewDidEnter() {
		console.log("ionViewDidEnter - reading bar");
	}

	openDialog() {
		var tt = this;

		let data = {
			event_type: "log",
			student_id: tt.studentId,
			book_id: tt.selbook.book_id,
			reason: $("#reason").val()
		};

		var message = "Congrats!. You have finished another book. Tell your team.";
		tt.eventsService.createEvent(data).subscribe(
			data => {
				var msg = "";
				if (data.messages.length > 0) {
					msg = data.messages[0];
				}
				if (data.messages.length > 1) {
					msg = data.messages[0] + "<br/>" + data.messages[1];
				}
				$("#dialog_overlay_finish .desc1").css("display", "none");
				$("#dialog_overlay_finish .desc2").css("display", "block");
				$("#dialog_overlay_finish .bt_ok").css("display", "block");
				$("#dialog_overlay_finish .desc2").html(msg);
				tt.utilService.createToast(message);
				//tt.loadCurrentReading(true);
				tt.rbook["state"] = "finish";
				tt.updateReadingCallback.emit(tt.rbook);
			},
			err => {
				message = "I'm having connection trouble!";
				tt.utilService.createToast(message);
				$("#dialog_overlay_finish .desc1").css("display", "none");
				$("#dialog_overlay_finish .desc2").css("display", "block");
				$("#dialog_overlay_finish .bt_ok").css("display", "block");
				$("#dialog_overlay_finish .desc2").html(message);
			}
		);
	}

	updateReading(book, mins) {
		this.config.selbook = book;
		this.selmin = mins;

		this.animateState = true;
		setTimeout(() => {
			this.animateState = false;
		}, 1000);

		setTimeout(() => {
			$("#dialog_overlay").addClass("showdialog");
			$("#dialog_overlay").addClass("animated");
			$("#dialog_overlay").addClass("bounceIn");
			$("#dialog_overlay .row span").html(this.rbook.book.pages);
			$("#pagenum").val("");
			$("#pagenum").focus();
		}, 100);
	}

	bookCreate(bookId) {
		this.alertCtrl.create({
			title: "Enter new page number",
			message: "",
			inputs: [
				{
					name: 'newpages',
					value: this.pageNum,
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
								this.rbook["state"] = "current";
								this.updateReadingCallback.emit(this.rbook);
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

	updatePageNum(book, mins) {
		console.log(this.config.selbook);
		// var tt = this;
		book = this.config.selbook;
		var value = this.pageNum;
		if (!value || value == null) value = 0;
		
		if (this.isreadmin && (mins == "" || mins == null)) {
			this.utilService.createAlert(
				"Oops!",
				"Don’t forget to record your minutes, too!"
			);
			return;
		}

		if ((value && value.toString() == "") || value == 0) {
			this.utilService.createAlert("Oops!", "Add your current page number.");
			return;
		}

		if (
			eval(book.book.pages) != 0 &&
			parseInt(value) * 100 > parseInt(book.book.pages) * 135
		) {
			this.alertCtrl.create({
				title: "Did you mean to enter "+value+" pages",
				message: "Can you look at the last page of the book, and type that number in so we can update your teacher with the correct number of pages<br/>Book Last Page Number: <b>"+book.book.pages+"</b>",
				buttons: [
					{
						text: "No",
						role: "cancel"
					},
					{
						text: "Yes",
						handler: () => {
							this.bookCreate(book.book.id);
						}
					}
				]
			}).present();
			// this.utilService.createAlert(
			// 	"Oops!",
			// 	"Your page number is 125% higher than expected."
			// );
			return;
		}
		let data = {
			event_type: "current",
			student_id: this.studentId,
			book_id: book.book.id,
			pages: value.toString()
		};
		if (this.isreadmin) {
			data["minutes"] = mins;
		}

		let loader = this.loading.create({
			content: "calculating"
		});
		loader.present();
		this.eventsService.createEvent(data).subscribe(
			data => {
				book.pages = value;

				if (value * 1 == 1 * book.book.pages) {
					let log_data = {
						event_type: "log",
						student_id: this.studentId,
						book_id: book.book.id
					};
					var msg = "";
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
					this.eventsService.createEvent(log_data).subscribe(
						data => {
							if (data.messages && data.messages.length > 0) {
								msg = data.messages[0];
							}
							if (data.messages && data.messages.length > 1) {
								msg = data.messages[0] + "<br/>" + data.messages[1];
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

							loader.dismiss();
							book["state"] = "current";
							this.updateReadingCallback.emit(book);
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
							loader.dismiss();
						}
					);
				} else {
					let message = `Updated current page to ` + value + ` pages`;
					book["state"] = "current";
					this.updateReadingCallback.emit(book);
					this.utilService.createToast(message);
					//this.loadCurrentReading(true);
					loader.dismiss();
				}
			},
			err => {
				loader.dismiss();
				this.utilService.createAlert(
					"Oops, having trouble with the network",
					""
				);
			}
		);
	}

	finishReading(book, mins) {
		this.config.selbook = book;
		this.selmin = mins;

		this.animateState1 = true;
		setTimeout(() => {
			this.animateState1 = false;
		}, 1000);
		book["state"] = "finish";
		this.updateReadingCallback.emit(book);
	}

	loadCurrentReading(isClose = false) {
		var self = this;
		var evHistory = [];
		this.logHistory = [];
		var book = this.book;
		try {
			var book_id = book.id;
			if (isClose) {
				book = self.config.selbook;
				book_id = book.book_id;
			}

			this.rbook["class_id"] = this.classId;
			this.pageNum = this.rbook.pages;
			this.rmin = this.rbook.minutes;
			evHistory = this.rbook.events; 
			for (let i=evHistory.length-1; i>-1; i--) {
				if(evHistory[i].pages) {
					this.logHistory.push(evHistory[i]);
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
			if (min != 0) this.rmin = this.rbook.minutes;
		} catch (err) {
			console.log(err);
		}
	}

	removeCurrentEvent(item, idx) {
		this.eventsService.deleteEvent(item.id).subscribe(
			data => {
				this.logHistory.splice(idx, 1);
			}, err => {
				this.utilService.createError(err);
			}
		);
	}
}
