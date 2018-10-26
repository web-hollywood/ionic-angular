import { Component } from "@angular/core";
import { Http } from "@angular/http";
import { NavController, NavParams, Events } from "ionic-angular";
import { Config } from "../../providers/config";
import { UtilService } from "../../providers/util-service";
import { Auth } from "../../providers/auth";
import "rxjs/add/operator/map";
import "rxjs/add/operator/timeout";
import { IonicPage } from "ionic-angular";

declare var cordova: any;

@IonicPage()
@Component({
	selector: "page-settings",
	templateUrl: "settings.html"
})
export class SettingsPage {
	version: any;
	touchTimer: any;
	touchCount: number = 0;
	advancedMode: boolean = false;
	mainURL: string;
	registrationURL: string;
	testAPIResponse: string;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public http: Http,
		public utilService: UtilService,
		public auth: Auth,
		public config: Config,
		public events: Events
	) {
		this.http
			.get("/assets/static/version.txt")
			.map(data => data["_body"])
			.subscribe(data => {
				///this.version = data;
			});

		this.version = "VERSION : " + this.config.appFullVersion;
		this.config.getAPIURL().subscribe(apiurl => {
			this.mainURL = apiurl;
		});

		this.config.getRegistrationURL().subscribe(registrationURL => {
			this.registrationURL = registrationURL;
		});

		this.config.getAdvancedConfigUnlocked().then(value => {
			if (value != null && value) {
				this.advancedMode = true;
			}
		});
	}

	accountWasClicked() {
		clearTimeout(this.touchTimer);
		this.touchCount++;
		this.touchTimer = setTimeout(() => {
			this.touchCount = 0;
		}, 2000);
	}

	hideAdvanced() {
		this.config.setAdvancedConfigUnlocked(false);
		this.advancedMode = false;
	}

	testMainURL(event) {
		this.http
			.get(this.mainURL)
			.timeout(4000)
			.map(data => data["_body"])
			.subscribe(
				data => {
					this.testAPIResponse = data;
				},
				error => {
					this.testAPIResponse = error;
				}
			);
	}

	saveData(event) {
		this.config.setMainUrl(this.mainURL).then(() => {
			this.utilService.createToast(
				"Main API URL Updated logging out in 3 seconds"
			);
			setTimeout(() => {
				this.events.publish("change:logout");
			}, 3000);
		});
	}

	apiWasClicked() {
		if (this.touchCount > 9) {
			this.advancedMode = true;
			this.config.setAdvancedConfigUnlocked(true);
			this.utilService.createToast(
				"Advanced settings unlocked - With great power comes great responsibility"
			);
		}
	}

	ionViewDidLoad() {
		console.log("ionViewDidLoad SettingsPage");
	}
}
