import { Component } from "@angular/core";
import {
	IonicPage,
	NavController,
	NavParams,
	Events,
	ModalController,
	AlertController,
	Platform
} from "ionic-angular";
import { Auth } from "../../providers/auth";
import { Config } from "../../providers/config";
import { Storage } from "@ionic/storage";
import { InAppBrowser } from "@ionic-native/in-app-browser";
import { Network } from "@ionic-native/network";
import { UtilService } from "../../providers/util-service";

@IonicPage()
@Component({
	selector: "page-login",
	templateUrl: "login.html"
})
export class LoginPage {
	user: any = {};
	public loading: boolean = false;
	public isConnectNetwork = true;
	constructor(
		public storage: Storage,
		public config: Config,
		public navCtrl: NavController,
		public navParams: NavParams,
		public auth: Auth,
		public events: Events,
		public modalCtrl: ModalController,
		public alertCtrl: AlertController,
		public platform: Platform,
		public utilService: UtilService,
		public inAppBrowser: InAppBrowser,
		public network: Network
	) {
		this.loginProcess = this.loginProcess.bind(this);
		this.processLoginViaToken = this.processLoginViaToken.bind(this);
		this.processError = this.processError.bind(this);
		/*
    let disconnnect = this.network.onDisconnect().subscribe(() => {
      this.isConnectNetwork = false;
    })
    let connnect = this.network.onConnect().subscribe(() => {
      this.isConnectNetwork = true;
      setTimeout(() => {
        if(this.network.type === 'wifi') {
        }
      }, 3000);
    })
    */
	}

	ionViewDidLoad() {}

	register() {
		let alert = this.alertCtrl.create({
			title: "Registration Type",
			message: "Select to register as a teacher or parent.",
			inputs: [
				{
					name: "Teacher",
					label: "Teacher",
					type: "radio",
					value: "Teacher",
					checked: true
				},
				{
					name: "Parent",
					label: "Parent",
					type: "radio",
					value: "Parent"
				}
			],
			buttons: [
				{
					text: "Cancel",
					role: "cancel",
					handler: data => {}
				},
				{
					text: "Register",
					handler: data => {
						console.log(data);
						let registerModal = this.modalCtrl.create("RegisterPage", {
							mode: data
						});
						registerModal.onDidDismiss(data => {
							if (data) {
								this.loading = true;
								console.log("Login data", data);
								this.loginViaToken(data);
							}
						});
						registerModal.present();
					}
				}
			]
		});
		alert.present();

		/*
    let registerModal = this.modalCtrl.create(UserRegistrationComponent);
    registerModal.onDidDismiss(data => {
      if (data) {
        this.loading = true;
        this.loginViaToken(data);
      }
    });
    registerModal.present();
    */
	}

	// When user click on Login Button
	login() {
		console.log(this.user, "->>>>>>>>>>>>>>");
		if (this.network.type == "none") {
			this.utilService.createAlert(
				"Network Error",
				"Network was disconnected."
			);
			return;
		}
		this.loading = true;
		this.config.isFirsTimeLogin = true;
		this.user['appName'] = "desktop";
		if(this.platform.is('ios') || this.platform.is('android')) {
			this.user['appName'] = "app";
		}
		this.user['appVersion'] = this.config.appVersion;
		this.auth.login(this.user).subscribe(this.loginProcess, this.processError);
	}

	//login via a token
	loginViaToken(tokenData) {
		this.processLoginViaToken(tokenData);
	}

	processError(error) {
		this.loading = false;
		let errorMessage = JSON.parse(error._body);
		this.showError(errorMessage.message);
	}

	processLoginViaToken(tokenData) {
		//Set token so we can authenticate
		this.config.setConfig(tokenData);
		this.auth.getCurrent().subscribe(data => {
			//Mockup data to match data returned from login api call
			let loginData = {
				id: data.id,
				token: tokenData.token,
				classrooms: data.classrooms,
				title: data.data.title,
				user_type: data.user_type,
				mode: {
					mode: data.user_type,
					student_id: null
				}
			};
			this.loginProcess(loginData);
		}, this.processError);
	}

	loginProcess(data) {
		this.storage.set("teacher", JSON.stringify(data));
		this.config.setConfig(data);
		this.config.isRefresh = false;
		localStorage.setItem("blogin", "1");
		localStorage.setItem("mode", data.mode.mode);
		// Setting Mode

		this.events.publish("user:login", data);
		console.log("data.user_type ===>", data.user_type);
		if (data.mode && data.mode.mode == "class") {
			this.config.loginMode = "class";
			this.config.class_id = data.mode.class_id;
			this.config.setMode("class");
			this.events.publish("change:mode", "class");
		} else if (data.user_type == "parent" || data.user_type == "home") {
			this.config.loginMode = "parent";
			this.config.pstudent = true;
			this.config.setMode("parent");
			this.events.publish("change:mode", "parent");
		} else {
			this.config.loginMode = "teacher";
			this.config.pstudent = false;
			this.config.setMode("teacher");
			this.events.publish("change:mode", "teacher");
		}
		this.navCtrl.setRoot("TabsPage");

		this.loading = false;
	}

	showError(message) {
		/* - Trust message from server.
    if(this.user.email == 'class') {
      message = "invalid class login";
    }
    */
		let confirm = this.alertCtrl.create({
			title: "Error logging in",
			message,
			buttons: [
				{
					text: "Ok",
					handler: () => {}
				}
			]
		});
		confirm.present();
	}

	forgotPassword() {
		let resetPasswordUrl = this.config.resetPasswordURL;
		if (this.platform.is("cordova")) {
			this.inAppBrowser.create(resetPasswordUrl, "_system");
		} else {
			window.open(resetPasswordUrl, "_self");
		}
	}

	forgotClassLogin() {
		let prompt = this.alertCtrl.create({
			title: "Class Login",
			message:
				"Enter the class login - this should only be used in your classroom.",
			cssClass: "propmt-alert",
			inputs: [
				{
					name: "classcode",
					placeholder: "Class Login"
				}
			],
			buttons: [
				{
					text: "Cancel",
					handler: data => {
						console.log("Cancel clicked");
					}
				},
				{
					text: "Login",
					handler: data => {
						console.log("Saved clicked", data.classcode);
						this.user.email = "class";
						this.user.password = data.classcode;
						this.login();
					}
				}
			]
		});
		prompt.present();
	}
}
