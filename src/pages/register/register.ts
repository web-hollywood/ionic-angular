import { Component } from "@angular/core";
import {
	NavController,
	NavParams,
	Events,
	ModalController,
	AlertController,
	ViewController
} from "ionic-angular";
import { Auth } from "../../providers/auth";
import { Config } from "../../providers/config";
import { Storage } from "@ionic/storage";
import { IonicPage } from "ionic-angular";

@IonicPage()
@Component({
	selector: "page-register",
	templateUrl: "register.html"
})
export class RegisterPage {
	user: any = {};
	userp: any = {};
	password_confirm = "";
	password_confirm_p = "";
	retData: any;
	public loading: boolean = false;
	loadingText: string;
	tab_index = 0;
	constructor(
		public storage: Storage,
		public config: Config,
		public navCtrl: NavController,
		public navParams: NavParams,
		public auth: Auth,
		public events: Events,
		public modalCtrl: ModalController,
		public viewCtrl: ViewController,
		public alertCtrl: AlertController
	) {
		this.registerProcess = this.registerProcess.bind(this);
		this.processError = this.processError.bind(this);

		var mmode = this.navParams.get("mode");
		if (mmode == "Parent") this.tab_index = 1;

		this.user = {
			email: "",
			password: "",
			name_first: "",
			name_last: "",
			title: "",
			grade: "",
			invite: "",
			salutionat: ""
		};
		this.userp = {
			email: "",
			password: "",
			name_first: "",
			name_last: "",
			title: "",
			grade: "",
			invite: "",
			salutionat: ""
		};
	}

	ionViewDidLoad() {}

	click_tab_teacher() {
		this.tab_index = 0;
	}
	click_tab_parent() {
		this.tab_index = 1;
	}

	register_parent() {
		this.loadingText =
			"Hang tight, you will need your childs class code on the next screen !";
		console.log(this.loadingText);
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
			this.userp.email
		);

		if (!re) {
			this.showError("Invalid Email");
			return;
		}

		let user = this.userp;
		if (user.email == "") {
			// email validation, we can use javascript function for that.
			this.showError("Invalid Email.");
			return;
		}
		if (user.password.length < 6) {
			this.showError("Too short password");
			return;
		}
		if (user.password != this.password_confirm_p) {
			// password != confirm password
			this.showError("Not matched password");
			return;
		}
		// XXX Bypass recaptcha for now
		this.userp.recaptchabypass = 11;
		this.userp.user_type = "home";
		this.userp.wait_demo = true;

		this.loading = true;

		this.auth
			.register(this.userp)
			.subscribe(this.registerProcess, this.processError);
	}

	// when click Register Button, we will call register API
	register() {
		this.loadingText =
			"Hang tight while the hamsters create your demo class. Then check your email to confirm your account and get started!";
		console.log(this.loadingText);
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
			this.user.email
		);

		if (!re) {
			this.showError("Invalid Email");
			return;
		}

		let user = this.user;
		if (user.email == "") {
			// email validation, we can use javascript function for that.
			this.showError("Invalid Email.");
			return;
		}
		if (user.password.length < 6) {
			this.showError("Too short password");
			return;
		}
		if (user.password != this.password_confirm) {
			// password != confirm password
			this.showError("Not matched password");
			return;
		}
		// XXX Bypass recaptcha for now
		this.user.recaptchabypass = 11;
		this.user.user_type = "teacher";
		this.user.wait_demo = true;

		this.loading = true;

		this.auth
			.register(this.user)
			.subscribe(this.registerProcess, this.processError);
	}

	processError(error) {
		console.log("YYY", error);
		this.loading = false;
		// XXX title etc
		let errorMessage = JSON.parse(error._body);
		this.showError(
			(errorMessage.error_type == "field" ? errorMessage.field + " " : "") +
				errorMessage.title
		);
	}

	registerProcess(data) {
		//Once registered, code in here
		console.log("XXX", data);
		// XXX Find iframe code and call the login method on returned token
		this.retData = data;
		this.loading = false;
		this.closeModal();
	}

	closeModal() {
		let data = this.retData;
		this.viewCtrl.dismiss({ token: data.login.token });
	}

	showError(message) {
		let confirm = this.alertCtrl.create({
			title: "Error Register",
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

	login() {
		this.viewCtrl.dismiss();
	}
}
