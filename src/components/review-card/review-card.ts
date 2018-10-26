import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Platform } from "ionic-angular";
import { Config } from "../../providers/config";
import { PopoverController, AlertController } from "ionic-angular";
import { PopoverComponent } from "../../components/popover/popover";
import { EventsService } from "../../providers/events-service";

declare let Swiper: any;

@Component({
	selector: "review-card",
	templateUrl: "review-card.html"
})
export class ReviewCardComponent {
	@Input() type: string;
	@Input() data: any;
	@Input() showmore: any;
	@Input() isfeed: boolean;
	@Input() studenttitle: any;
	@Input() isedit: boolean;
	@Input() canRemoveReview: boolean = false;
	@Input() showForceItem: boolean = false;

	@Output() selectReview = new EventEmitter();
	@Output() editReview = new EventEmitter();
	@Output() removeReview = new EventEmitter();
	@Output() openFile = new EventEmitter();

	public isMore: any;
	public rating: any;
	public mode: any;
	public myreview = false;
	ricon = [];
	reaction_idx = -1;

	constructor(
		public platform: Platform,
		public eventsService: EventsService,
		private popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public config: Config
	) {
		this.rating = "4.5";
		this.isMore = true;
		this.mode = this.config.mode;
		this.isfeed = false;

		this.ricon.push({ icon: "happy", text: "Happy" });
		this.ricon.push({ icon: "sad", text: "Sad" });
		//this.ricon.push({icon:'wow', text:'Wow'});
		this.ricon.push({ icon: "bored", text: "Bored" });
		this.ricon.push({ icon: "scared", text: "Scared" });
		this.ricon.push({ icon: "love", text: "Love" });
		this.ricon.push({ icon: "funny", text: "Funny" });
		this.ricon.push({ icon: "angry", text: "Angry" });
	}

	ngOnInit() { }

	ngOnChanges(changes: any) {
		if (this.data.student_id == this.config.student_id) {
			this.myreview = true;
		}
		for (let i = 0; i < this.ricon.length; i++) {
			if (this.data.reaction == this.ricon[i].icon) {
				this.reaction_idx = i;
				break;
			}
		}
		if (this.data.student_id == null) {
			this.studenttitle = 'teacher';
		} else {
			if (this.data.student) {
				this.studenttitle = this.data.student.title;
			}
		}
	}

	getDate(date) {
		return new Date(date);
	}

	ngAfterViewInit() { }

	more() {
		this.isMore = !this.isMore;
	}

	clickReview() {
		this.selectReview.emit(this.data);
	}

	clickFile() {
		this.openFile.emit(this.data);
	}

	goReviewEdit() {
		this.editReview.emit(this.data);
	}

	presentPopover(ev, item) {
		let popover = this.popoverCtrl.create(PopoverComponent, {
			itemList: [{ title: "Remove review", item: item }]
		});
		popover.present({
			ev: ev
		});
		popover.onDidDismiss(data => {
			if (data && data.title == "Remove review") {
				this.showConfirm(data.item);
			}
		});
	}

	showConfirm(book) {
		let message = "Remove review";
		let confirm = this.alertCtrl.create({
			title: message,
			message: "Are you sure you want to remove this review?",
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
						this.removeReviewClick(book);
					}
				}
			]
		});
		confirm.present();
	}

	removeReviewClick(book) {
		this.removeReview.emit(book);
	}
}
