import { Component, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { Config } from "../../providers/config";
import { PopoverController, Events, ModalController } from "ionic-angular";
import { PopoverComponent } from "../../components/popover/popover";
import { AlertController } from "ionic-angular";
import { ClassService } from "../../providers/class-service";
import { StudentService } from "../../providers/student-service";
import { BookService } from "../../providers/book-service";
import { EventsService } from "../../providers/events-service";
import { SwiperConfigInterface, SwiperDirective, SwiperComponent } from "ngx-swiper-wrapper";

@Component({
	selector: "feed-item",
	templateUrl: "feed-item.html"
})
export class FeedItemComponent {
	@ViewChild(SwiperComponent) componentRef: SwiperComponent;
  	@ViewChild(SwiperDirective) directiveRef: SwiperDirective;

	@Input() advance: boolean;
	@Input() showDate: boolean;
	@Input() ishome: boolean;
	@Input() data: any;
	@Input() canRemoveBook: boolean = false;
	@Input() removeBookType: string = "EVENT";
	@Input() supergenre: any;
	@Input() series: any;
	@Input() currentStudent: any;
	@Input() stmode: any;
	@Input() lastread: any;
	@Input() reviewlst = [];
	@Input() reviews = 0;
	@Input() showReviewArrow: boolean;
	@Input() showReview: boolean;
	@Input() isfeed: boolean;
	@Input() isLogFeed: boolean;
	@Input() isGroupFeed: boolean;
	@Input() isedit: boolean;
	@Input() visibleReview: boolean = true;
	@Input() isRefresh: boolean = false;
	@Input() classfeed: boolean = false;
	@Input() isCollective: boolean = false;
	@Input() bookReview: boolean = false;
	@Input() isSelected: boolean = false;
	@Input() reasonList: any;

	@Output() share = new EventEmitter();
	@Output() cheer = new EventEmitter();
	@Output() select = new EventEmitter();
	@Output() onClick = new EventEmitter();
	@Output() viewStudent = new EventEmitter();
	@Output() removeBook = new EventEmitter();
	@Output() editReview = new EventEmitter();
	@Output() openReview = new EventEmitter();
	@Output() openFile = new EventEmitter();

	public animateCheerState: boolean = false;
	public animateShareState: boolean = false;
	public animateSelectState: boolean = false;
	public userHasCheered: boolean = false;
	public reviewList = [];
	public myreview: boolean = false;
	public disableReview: boolean = false;
	public reason_length = 0;
	public cheer_list = [];
	public config_swiper: SwiperConfigInterface = {
		scrollbar: null,
		direction: "horizontal",
		slidesPerView: 1,
		scrollbarHide: false,
		keyboardControl: false,
		mousewheelControl: false,
		scrollbarDraggable: true,
		scrollbarSnapOnRelease: true,
		nextButton: ".swiper-button-next",
		prevButton: ".swiper-button-prev"
	};
	public config_swiper1: SwiperConfigInterface = {
		scrollbar: null,
		direction: "horizontal",
		slidesPerView: 3,
		spaceBetween: 0
	};
	public groupStudentIds = [];

	constructor(
		public bookService: BookService,
		public classService: ClassService,
		public studentService: StudentService,
		public config: Config,
		private popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public eventsService: EventsService,
		public events: Events,
		public modalCtrl: ModalController
	) {
		this.showReviewArrow = true;
		this.showReview = false;

		this.events.subscribe("refresh:feed", () => {
			if (this.isRefresh) {
				this.loadData();
			}
		});
		var tt = this;
		window.onresize = e => {
			tt.resizeWin(window.innerWidth);
		};
	}

	resizeWin(w) {
		var n = 1;
		if (w > 768 && !this.classfeed) {
			n = Math.floor((w/2/2 - 60) / 100);
			if (n < 1) n = 1;
			this.config_swiper1.slidesPerView = n;
		} else {
			n = Math.floor((w/2 - 60) / 100);
			if (n < 1) n = 1;
			this.config_swiper1.slidesPerView = n;
		}
	}

	ngOnInit() {

	}

	convert_to_minutes_hours(estmin) {
		var aa = eval(estmin);
		var hr = Math.floor(aa / 60);
		var min = aa - hr * 60;
		var ret = hr + " hr, " + min + " min";
		if (hr == 0) ret = min + " min";
		if (
			this.classService.classOptions &&
			this.classService.classOptions.recordminutes == "1"
		) {
			return "Time : " + ret;
		} else {
			return "";
		}
	}

	loadData() {
		if (this.studentService.studentData && this.studentService.studentData.readinggroup && this.classService.classData.readinggroups) {
			let readinggroup_id = this.studentService.studentData.readinggroup.id;
			for (let i=0; i<this.classService.classData.readinggroups.length; i++) {
				if (this.classService.classData.readinggroups[i].id == readinggroup_id) {
					for (let j=0; j<this.classService.classData.readinggroups[i].students.length; j++) {
						this.groupStudentIds.push(this.classService.classData.readinggroups[i].students[j].id);
					}
					break;
				}
			}
		}

		this.cheer_list = [];
		if (this.data.cheer) {
			for (let i=0; i<this.data.cheer.length; i++) {
				if (this.data.cheer[i].reason) {
					this.cheer_list.push(this.data.cheer[i]);
					this.reason_length ++;
				}
			}
		}

		if (this.isSelected) {
			// this.studentService.getSelectedList(this.config.student_id, this.config.class_id)
			// 	.subscribe(data => {
			// 		console.log(data);
			// 	})
			if (this.reasonList) {
				for (let i=0; i<this.reasonList.reasons.length; i++) {
					if (this.reasonList.reasons[i].title == this.data.reason) {
						this.data['reason_id'] = this.reasonList.reasons[i].id;
						break;
					}
				}
			}
		}

		var classData = this.classService.classOptions;
		if (classData && classData.bookreview) {
			this.disableReview = true;
		}
		if (this.data && this.data.book) {
			// NOTE PERFORMANCE FIX - Always assume feed has reviews. API to be updated later
			this.isfeed = true;
			// let studentId = this.config.student_id;
			if (this.data.reviews) {
				var classId = this.config.class_id;
				if (classId == null) {
					classId = this.data.class_id;
				}
				this.reviewList = this.data.reviews;
				for (let i = 0; i < this.reviewList.length; i++) {
					this.reviewList[i]["classroom_id"] = classId;
				}
				this.reviews = this.reviewList.length;
			} else {
				this.reviewList = [];
				if (this.data.reviewlst && this.data.reviewlst.length > 0) {
					this.reviewList = this.data.reviewlst;
				}
				this.reviews = this.reviewList.length;
			}

			for (let i = this.reviewList.length - 1; i > -1; i--) {
				if (this.reviewList[i].review == "") {
					this.reviewList.splice(i, 1);
					this.reviews--;
				}
			}
			var temp = this.reviewList;
			this.reviewList = [];
			for (let i = temp.length - 1; i > -1; i--) {
				if (this.classfeed || this.isCollective) {
					// if (temp[i].student_id == this.data.student_id)
					this.reviewList.push(temp[i]);
				} else {
					if (this.isGroupFeed) {
						if (this.groupStudentIds.indexOf(temp[i].student_id) > -1) {
							this.reviewList.push(temp[i]);
						}
					} else {
						if (temp[i].student_id == this.config.student_id)
							this.reviewList.push(temp[i]);
					}
				}
			}
		}
	}

	ngOnChanges(changes: any) {
		this.loadData();
		if (changes.data != null) {
			this.updateCheerState(
				changes.data.currentValue,
				changes.currentStudent != null
					? changes.currentStudent.currentValue
					: null
			);
		}
		this.resizeWin(window.innerWidth);
	}

	removeReview(re, i) {
		console.log(re);
		this.eventsService.deleteEvent(re.id).subscribe(
			data => {
				this.reviewList.splice(i, 1);
				if (this.directiveRef) {
					this.directiveRef.update();
				}
			},
			err => { }
		);
	}

	public onIndexChange(index: number): void {
		console.log('Swiper index: ', index);
	}

	clickReviewDown() {
		this.showReview = !this.showReview;
	}

	presentPopover(ev, item) {
		let popover = this.popoverCtrl.create(PopoverComponent, {
			itemList: [{ title: "Remove book", item: item }]
		});
		popover.present({
			ev: ev
		});
		popover.onDidDismiss(data => {
			if (data && data.title == "Remove book") {
				this.showConfirm(data.item);
			}
		});
	}

	getDate(date) {
		return new Date(date);
	}

	shareEvent() {
		var item = this.getAction("share");

		item.done = true;
		this.animateShareState = true;
		setTimeout(() => {
			this.animateShareState = false;
		}, 1000);

		this.share.emit(this.data);
	}

	getAction(type) {
		return this.data.actions.find(action => action.type === type);
	}

	selectEvent() {
		var item = this.getAction("select");

		if (item.done) {
			return;
		}
		item.done = true;
		this.animateSelectState = true;
		setTimeout(() => {
			this.animateSelectState = false;
		}, 1000);

		this.select.emit(this.data.book_id);
	}

	hasTub() {
		return this.data.tub && this.data.tub.title;
	}

	isTeacherMode() {
		return this.config.mode == "teacher";
	}

	isStudent() {
		return !this.isTeacherMode() && this.currentStudent != null;
	}

	updateCheerState(data, student) {
		// These could be loaded in any order so make sure we get
		// the one that isn't null
		let d = data == null ? this.data : data;
		let s = student == null ? this.currentStudent : student;
		if (s == null) return;
		if (d == null || d.cheer == null) {
			return;
		}

		if (this.isTeacherMode()) {
			let action = data.actions.find(action => action.type === "cheer");
			if (action != null) {
				this.userHasCheered = action.done;
			}
			return;
		}

		this.userHasCheered =
			data.cheer.find(cheer => cheer.student_id == s.id) != null;
			console.log(this.userHasCheered);
	}

	enlargeReason(reason_id) {
		let reasonIcon = this.config.mainURL + "/event/reason/" + reason_id + '/icon';
		this.modalCtrl.create('EnlargeReasonPage', {
			url: reasonIcon
		}).present();
	}

	cheerEvent() {
		if (this.userHasCheered) {
			return;
		}
		this.cheer.emit({ feed: this.data, student: this.currentStudent, bookreview: ((this.reviewList.length > 0 || this.showReview) && this.visibleReview) });

		this.userHasCheered = true;

		this.animateCheerState = true;
		setTimeout(() => {
			this.animateCheerState = false;
		}, 1000);
	}

	bookClick(data) {
		this.onClick.emit({ data: data });
	}

	reviewClick(data, i, item) {
		if (i != null && i != undefined) {
			// if (this.config.mode == 'class' && item.student_id == this.config.student_id) {
			// 	this.editReview.emit({ data: data, item:item });
			// } else if (this.config.mode != 'class') {
			// 	this.editReview.emit({ data: data, item:item });
			// }
			this.editReview.emit({ data: data, item:item });
		} else {
			this.editReview.emit({ data: data, item:item });
		}
	}

	clickFile(data) {
		this.openFile.emit({ data: data });
	}

	selectReview(data) {
		this.openReview.emit(data);
	}

	studentClick(student) {
		this.viewStudent.emit(student);
	}

	removeBookClick(book) {
		this.removeBook.emit(book);
	}
	is_showable(book): Boolean {
		let ret_val: Boolean = true;
		if (typeof book.primary_genre === "object") ret_val = false;
		return ret_val;
	}
	showConfirm(book) {
		let message = "Remove book from ";
		if (this.removeBookType == "EVENT") {
			message += "logged list";
		} else if (this.removeBookType == "SELECTED") {
			message += "selected list";
		}

		let confirm = this.alertCtrl.create({
			title: message,
			message: "Are you sure you want to remove this book?",
			buttons: [
				{
					text: "Cancel",
					handler: () => {
						//do nothing
					}
				},
				{
					text: "Ok",
					handler: () => {
						this.removeBookClick(book);
					}
				}
			]
		});
		confirm.present();
	}
}
