import { Component, ViewChild } from "@angular/core";
import {
	NavController,
	NavParams,
	ViewController,
	Slides
} from "ionic-angular";
import { ClassService } from "../../providers/class-service";
import { UtilService } from "../../providers/util-service";
import { Auth } from "../../providers/auth";
import { AlertController } from "ionic-angular";
import { Config } from "../../providers/config";
import { IonicPage } from "ionic-angular";

@IonicPage()
@Component({
	selector: "page-edit-class",
	templateUrl: "edit-class.html"
})
export class EditClassPage {
	data: any;
	classData: any = {};
	currentIndex: number = 0;
	addLibrary: any;
	recordMinutes: any;
	pinRequirement: any;
	bookReview: any;
	grade: any;
	startDate: any;
	pin: number;
	reorderEnabled: boolean = false;

	@ViewChild(Slides) slides: Slides;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public classService: ClassService,
		public auth: Auth,
		public alertCtrl: AlertController,
		public config: Config,
		public utilService: UtilService
	) {
		this.data = this.navParams.get("class");
		// Class data contains more data about the specific class needed
		// to edit the class data in the edit popup
		this.classData = this.navParams.get("classData");
		console.log(this.classData);
	}

	ionViewDidLoad() {
		console.log("ionViewDidLoad EditClassPage");
		console.log(this.classData);
		this.recordMinutes = this.classData.recordminutes == 1;
		this.addLibrary = this.classData.addlibrary == 1;
		this.pinRequirement = this.classData.requirestudentpin == 1;
		//TODO:
		this.bookReview = this.classData.bookreview == 1;
	}

	closeModal() {
		this.viewCtrl.dismiss(this.bookReview);
	}

	switchSlide(index) {
		this.slides.slideTo(index);
	}

	prevSlide() {
		this.slides.slidePrev();
	}

	slideHome() {
		this.slides.slideTo(0);
		this.saveNewReadingGroups();
		if (this.reorderEnabled) {
			this.reorderEnabled = false;
			this.removeReadingGroupsWithoutTitle();
			this.updateReadingGroupListOrder();
		}
	}

	onSlideChange() {
		this.reorderEnabled = false;
		this.currentIndex = this.slides.getActiveIndex();
	}

	toggleReorderList() {
		this.reorderEnabled = !this.reorderEnabled;
		if (!this.reorderEnabled) {
			this.updateReadingGroupListOrder();
		}
	}

	reorderItems(indexes) {
		let element = this.data.readinggroups[indexes.from];
		this.data.readinggroups.splice(indexes.from, 1);
		this.data.readinggroups.splice(indexes.to, 0, element);
	}

	updateReadingGroupListOrder() {
		let list = this.data.readinggroups.map(item => {
			return item.id;
		});
		this.classService
			.reorderReadingGroup(this.data.class.id, { readinggroups: list })
			.subscribe(data => {
				console.log(data);
			});
	}

	// update Class Name and Grade
	updateClass(title) {
		let data = { title: title, grade: this.data.class.grade };
		this.classService.updateClass(this.data.class.id, data).subscribe(data => {
			console.log(data);
		});
	}

	updateReading() {
		let data = { readingsystem: this.data.class.readingsystem };
		this.classService.updateClass(this.data.class.id, data).subscribe(data => {
			console.log(data);
		});
	}
	isNumeric(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
	updatePin() {
		if (this.pin) {
			let pinString = this.pin.toString();
			pinString = pinString.trim();

			if (pinString.length != 4) {
				this.utilService.createToast("PIN code should be 4 digits.");
				return;
			}
			if (!this.isNumeric(pinString)) {
				this.utilService.createToast("PIN code should be numberic.");
				return;
			}
			let data = { pin: pinString };
			this.auth.updatePin(data).subscribe(data => {
				console.log(data);
				this.utilService.createToast("PIN code is updated.");
				this.slideHome();
			});
		}
	}

	addReadingGroup() {
		this.data.readinggroups.push({ title: "" });
	}

	removeReadingGroupsWithoutTitle() {
		this.data.readinggroups = this.data.readinggroups.filter(group => {
			return group.title.trim().length > 0;
		});
	}

	saveNewReadingGroups() {
		let newGroups = this.data.readinggroups.filter(group => {
			return !group.hasOwnProperty("id") && group.title.trim().length;
		});
		let groupCount = newGroups.length;
		newGroups.forEach(group => {
			this.saveReadingGroup(group, result => {
				if (result.success) {
					this.replaceReadingGroupInReadingGroupList(
						group,
						result.readinggroup
					);
					groupCount--;
					if (groupCount === 0) {
						this.updateReadingGroupListOrder();
					}
				}
			});
		});
	}

	showConfirmRemove(group) {
		let confirm = this.alertCtrl.create({
			title: "Remove Reading Group?",
			message: `Are you sure you want to remove ${group.title}?`,
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
						this.removeReadingGroup(group);
					}
				}
			]
		});
		confirm.present();
	}

	removeReadingGroup(group) {
		this.data.readinggroups.splice(this.data.readinggroups.indexOf(group), 1);
		this.deleteReadingGroup(group);
	}

	replaceReadingGroupInReadingGroupList(oldGroup, newGroup) {
		let groupIndex = this.data.readinggroups.indexOf(oldGroup);
		this.data.readinggroups.splice(groupIndex, 1);
		this.data.readinggroups.splice(groupIndex, 0, newGroup);
	}

	saveReadingGroup(group, done) {
		this.classService
			.createReadingGrp(this.data.class.id, group)
			.subscribe(done);
	}

	deleteReadingGroup(group) {
		this.classService
			.deleteReadingGrp(this.data.class.id, group.id)
			.subscribe(data => {});
	}

	addStudentChanged() {
		this.classData.addlibrary = this.addLibrary ? 1 : 0;
		this.classService
			.updateClassAttr(
				this.data.class.id,
				"addlibrary",
				this.classData.addlibrary
			)
			.subscribe(data => {});
	}

	minutesChanged() {
		this.classData.recordminutes = this.recordMinutes ? 1 : 0;
		this.classService
			.updateClassAttr(
				this.data.class.id,
				"recordminutes",
				this.classData.recordminutes
			)
			.subscribe(data => {});
	}

	pinRequirementChanged() {
		this.classData.requirestudentpin = this.pinRequirement ? 1 : 0;
		this.classService
			.updateClassAttr(
				this.data.class.id,
				"requirestudentpin",
				this.classData.requirestudentpin
			)
			.subscribe(data => {});
	}

	pinBookReviewChanged() {
		//TODO | will added the correct field after API is done.
		this.classData.bookreview = this.bookReview ? 1 : 0;
		this.classService
			.updateClassAttr(
				this.data.class.id,
				"bookreview",
				this.classData.bookreview
			)
			.subscribe(data => {
				this.getBookReview();
			});
	}

	getBookReview() {
		this.auth
			.getCurrent()
			.subscribe(data => {
				console.log(data);
			});
	}

	updateChallenge() {}
}
