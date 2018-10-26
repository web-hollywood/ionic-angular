import { Component } from "@angular/core";
import { NavController, NavParams, LoadingController } from "ionic-angular";
import { HomeService } from "../../providers/home-service";
import { UtilService } from "../../providers/util-service";
import { IonicPage } from "ionic-angular";

@IonicPage()
@Component({
	selector: "page-class-code",
	templateUrl: "class-code.html"
})
export class ClassCodePage {
	public classCode: string;
	public childName: string;
	public home_id: any;
	public warningCodeText: string;
	public warningNameText: string;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public loading: LoadingController,
		public homeService: HomeService,
		public utilService: UtilService
	) {
		this.classCode = "";
		this.childName = "";
		this.warningCodeText = "Enter class code to request access.";
		this.warningNameText = "";
		this.home_id = this.navParams.get("home_id");
	}

	ionViewDidLoad() {
		console.log("ionViewDidLoad ClassCodePage");
	}

	onInputClassID(event) {
		//this.warningCodeText = '';
	}

	onInputChildName(event) {
		//this.warningNameText = '';
	}

	check() {
		var isValid = true;
		if (this.classCode == "") {
			//this.utilService.createAlert("Enter class code to request access.", "");
			//this.warningCodeText = 'Enter class code to request access.';
			isValid = false;
		}
		if (this.childName == "") {
			//this.utilService.createAlert("Please enter childs first name.", "");
			this.warningNameText = "Please enter childs first name.";
			isValid = false;
		}
		if (!isValid) return;
		//var token = 'E9o6S51KLV';
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.homeService
			.addStudent(this.home_id, this.classCode, this.childName)
			.subscribe(
				data => {
					console.log(data);
					if (data.existing) {
						this.utilService.createAlert(
							"",
							"You have already subscribed to this class"
						);
						return;
					}
					if (data.success == true) {
						let message =
							"We found a class and have requested access, check back in 24-48 hours for updates.";
						this.openToast(message, 0);
						var classroom_id = data.classroom.id;
						this.homeService.getHomeData(this.home_id).subscribe(
							res => {
								console.log(" getHomeData res ==> ", res);
								var students = res.students;
								if (students != null) {
									for (var i = 0; i < students.length; i++) {
										let student = students[i];
										if (
											student.classroom_id == classroom_id &&
											student.title == this.childName
										) {
											if (student.home_status == "active") {
												let message = this.childName + " is approved.";
												this.openToast(message, 8000);
												//TODO Send the push notificaiton.
											} else if (student.home_status == "waiting") {
												console.log(student);
												let message =
													"awating teacher of " +
													this.childName +
													" to approve class access";
												this.openToast(message, 8000);
											}
											break;
										}
									}
									loader.dismiss();
									this.navCtrl.pop();
								}
							},
							err => {
								loader.dismiss();
							}
						);
					} else {
						loader.dismiss();
						let message = "Please check, I couldn't find that class code.";
						this.utilService.createAlert("Not found", message);
						this.classCode = "";
						this.childName = "";
						//this.openToast(message, 0);
						//this.navCtrl.pop();
					}
				},
				err => {
					loader.dismiss();
					let message = "Please check, I couldn't find that class code.";
					this.utilService.createAlert("Not found", message);
					this.classCode = "";
					this.childName = "";
					//this.openToast(message, 0);
					//this.navCtrl.pop();
				}
			);
		setTimeout(() => {
			loader.dismiss();
		}, 5000);
	}
	cancel() {
		this.navCtrl.pop();
	}

	openToast(message, delay) {
		setTimeout(() => {
			this.utilService.createToast(message);
		}, delay);
	}
}
