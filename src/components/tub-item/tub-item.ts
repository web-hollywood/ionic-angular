import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Config } from "../../providers/config";
import { PopoverController, ModalController } from "ionic-angular";
import { PopoverComponent } from "../../components/popover/popover";
import { AlertController } from "ionic-angular";
import { ClassService } from "../../providers/class-service";

@Component({
	selector: "tub-item",
	templateUrl: "tub-item.html"
})
export class TubItemComponent {
	@Input() advance: boolean;
	@Input() data: any;

	@Output() share = new EventEmitter();
	@Output() cheer = new EventEmitter();
	@Output() select = new EventEmitter();
	@Output() onClick = new EventEmitter();
	@Output() viewStudent = new EventEmitter();
	@Output() removeBook = new EventEmitter();

	constructor(
		public config: Config,
		public modalCtrl: ModalController,
		public classService: ClassService,
		private popoverCtrl: PopoverController,
		public alertCtrl: AlertController
	) {}

	ngOnInit() {}

	presentPopover(ev, item) {
		let popover = this.popoverCtrl.create(PopoverComponent, {
			itemList: [
				{ title: "Remove book", item: item },
				{ title: "Move Tub", item: item }
			]
		});
		popover.present({
			ev: ev
		});
		popover.onDidDismiss(data => {
			if (data && data.title == "Remove book") {
				this.showConfirm(data.item);
			} else if (data && data.title == "Move Tub") {
				let class_id = this.classService.classData.class.id;
				let book_id = data.item.id;
				let modal = this.modalCtrl.create('SelectTubPage', {
					class_id: class_id,
					book_id: book_id
				});
				modal.present();
			}
		});
	}

	getDate(date) {
		return new Date(date);
	}

	shareEvent() {
		this.share.emit(this.data);
	}

	selectEvent() {
		this.select.emit(this.data.book_id);
	}

	cheerEvent() {
		var item = this.data.actions.find(item => item.type == "cheer");
		if (item) {
			item.done = true;
		}
		this.cheer.emit(this.data);
	}

	bookClick(data) {
		this.onClick.emit({ data: data });
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
		let confirm = this.alertCtrl.create({
			title: "Remove book from Tub list",
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
