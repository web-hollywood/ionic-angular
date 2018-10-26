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
import { Config } from "../../providers/config";
import { StudentService } from "../../providers/student-service";
import { AlertController } from "ionic-angular";
import { IonicPage } from "ionic-angular";

@IonicPage()
@Component({
	selector: "page-set-student",
	templateUrl: "set-student.html"
})
export class SetStudentPage {
	data: any;
	classData: any = {};
	currentIndex: number = 0;
	addLibrary: any;
	recordMinutes: any;
	pinRequirement: any;
	grade: any;
	startDate: any;
	pin: number;
	studentData: any;
	reorderEnabled: boolean = false;

	@ViewChild(Slides) slides: Slides;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public config: Config,
		public viewCtrl: ViewController,
		public classService: ClassService,
		public studentService: StudentService,
		public auth: Auth,
		public alertCtrl: AlertController,
		public utilService: UtilService
	) {
		this.studentData = this.studentService.studentData;
		this.classData = this.classService.classData;
	}

	ionViewDidLoad() {
		console.log("ionViewDidLoad EditClassPage");
	}

	closeModal() {
		this.viewCtrl.dismiss();
	}

	switchSlide(index) {
		this.slides.slideTo(index);
	}

	prevSlide() {
		this.slides.slidePrev();
	}

	slideHome() {
		this.slides.slideTo(0);
		if (this.reorderEnabled) {
			this.reorderEnabled = false;
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

	reorderItems(indexes) {}

	updateReadingGroupListOrder() {}

	// update Class Name and Grade
	updateClass(title) {}

	updateReading() {}
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
			this.studentService
				.setStudentPin(
					this.studentData.student.id,
					this.classData.class.id,
					this.pin
				)
				.subscribe(data => {
					this.utilService.createToast("PIN code is updated.");
					this.viewCtrl.dismiss();
				});
		}
	}

	addReadingGroup() {}

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

	updateChallenge() {}
}
