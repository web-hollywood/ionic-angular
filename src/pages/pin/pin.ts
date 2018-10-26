import { Component, ViewChild } from "@angular/core";
import {
	NavController,
	NavParams,
	ViewController,
	Events,
	LoadingController
} from "ionic-angular";
import {
	IonDigitKeyboard,
	IonDigitKeyboardOptions
} from "../../components/ion-digit-keyboard/ion-digit-keyboard";
import { Auth } from "../../providers/auth";
import { Config } from "../../providers/config";
import { UtilService } from "../../providers/util-service";
import { StudentService } from "../../providers/student-service";
import { IonicPage } from "ionic-angular";

@IonicPage()
@Component({
	selector: "page-pin",
	templateUrl: "pin.html"
})
export class PinPage {
	keyboardSettings: IonDigitKeyboardOptions = {
		leftActionOptions: {
			iconName: "ios-backspace-outline",
			fontSize: "1.4em"
		},
		rightActionOptions: {
			iconName: "ios-checkmark-circle-outline",
			fontSize: "1.3em"
		},
		roundButtons: false,
		showLetters: false,
		swipeToHide: true,
		theme: "light"
	};
	pinMode: string = "";
	pin: string = "";
	pinModalValue: boolean;
	studentName: string;
	checkForStudentPin: boolean;
	checkForDefaultPin: boolean;
	pinIncorrectCount = 0;
	teacherPin: string = "";

	@ViewChild("pinValue") pinValue;

	sub: any;

	constructor(
		public navCtrl: NavController,
		public utilService: UtilService,
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public loading: LoadingController,
		public auth: Auth,
		public studentService: StudentService,
		public events: Events,
		public config: Config
	) {
		this.pinMode = this.navParams.get("pinMode");
		let student = this.navParams.get("studentData");
		console.log(this.pinMode);
		console.log(student);

		this.pinIncorrectCount = 0;
		this.checkForStudentPin = false;
		this.checkForDefaultPin = false;

		if (!student || student === undefined) {
			//Detect neither student pin is default(0000)
		} else {
			let class_id;
			if (this.config.classObject.class) {
				class_id = this.config.classObject.class.id;
			} else {
				class_id = this.config.classObject.classroom.id;
			}
			let stId = student.id;
			if (!stId || stId == undefined) stId = student.student.id;
			this.studentService
				.getStudent(stId, class_id)
				.subscribe(
				data => {
					console.log(data);
					student = data;
					if (
						this.pinMode == "studentPin" &&
						(student.student.pin == null || student.student.pin == "0000")
					) {
						this.checkForStudentPin = true;
						this.checkForDefaultPin = true;
						// let message = "Enter '0000' to login, then change your PIN";
						// this.utilService.createToast(message);

					}
				}
				);
		}

		this.pinModalValue = true;
		if (this.pinMode == "studentPin" && student != undefined)
			this.studentName = student.student.title;
		//Detect to make sure what techer pin is
		this.auth.getCurrent().subscribe(data => {
			let pin = data.data.pin;
			this.teacherPin = pin;
			if (this.pinMode == "teacherPin" && (pin == "0000" || pin == null || pin == undefined)) {
				// if (this.config.loginMode != "class") {
				// let message = "Enter '0000' to login, then change your PIN";
				// this.utilService.createToast(message);
				this.checkForDefaultPin = true;
				this.checkForStudentPin = true;
				// }
			} else if (this.pinMode == "teacherPin") {
				this.checkForDefaultPin = false;
				this.checkForStudentPin = false;
			}
		});
	}

	ionViewDidLoad() {
		console.log("ionViewDidLoad PinPage");
		this.sub = IonDigitKeyboard.onClick.subscribe((key: any) => {
			// Do something
			if (key === "left") {
				if (this.pin !== "") {
					this.pin = this.pin.slice(1);
				}
			} else if (key === "right") {
				// Make a call
				if (this.pinMode === "teacherPin") {
					this.changeMode();
				} else {
					this.changeMode();
				}
			} else {
				// If it is number;
				if (this.pin.length < 4) {
					this.pin += key;
				}
				console.log(this.pin);
			}
		});
	}

	// When Number is pressed
	numberClick($event) {
		console.log($event);
	}

	hideKeyboard() {
		let data = this.pin;
		this.viewCtrl.dismiss(data);
		this.sub.unsubscribe();
	}

	cancel() {
		this.viewCtrl.dismiss("");
		this.sub.unsubscribe();
	}

	changeMode() {
		if (this.pinModalValue == true) {
			if (this.pin.length === 4) {
				if (this.pinMode == "teacherPin" && this.config.mode == "class") {
					let request = { mode: "teacher", pin: this.pin };
					let loader = this.loading.create({
						content: ""
					});
					loader.present();
					this.auth.changeMode(request).subscribe(
						data => {
							loader.dismiss();

							if (data.success) {
								this.pinModalValue = false;
								this.config.setMode("teacher");
								this.hideKeyboard();
								this.events.publish("change:mode", "teacher");
								if (this.studentService.studentData != undefined) {
									this.events.publish("change:log", this.config.class_id);
									//this.events.publish("change:log", this.studentService.studentData.classroom.id);
								}
							} else {
								let message = `Incorrect PIN`;
								this.utilService.createToast(message);
								this.pin = "";
							}
						},
						err => {
							loader.dismiss();
						}
					);
				} else {
					if (
						(this.navParams.get("studentData").student.pin == null &&
							this.pin == "0000") ||
						(this.navParams.get("studentData").student.pin == this.pin &&
							this.config.mode == "class") ||
						(this.pinIncorrectCount >= 3 && this.pin == this.teacherPin)
					) {
						let loader = this.loading.create({
							content: ""
						});
						loader.present();
						if (this.pin == "0000") {
							this.config.checkUser = true;
						}
						this.hideKeyboard();
						this.pinModalValue = false;
						this.config.UpdatePIN = false;
						this.config.setMode("class");

						setTimeout(() => {
							loader.dismiss();
							this.events.publish("functionCall:tabSelected");
						}, 500);
					} else {
						let message = "Incorrect PIN for student ";
						this.utilService.createToast(message);
						this.pin = "";
						this.pinIncorrectCount ++;
					}
				}
			}
		}
	}
}
