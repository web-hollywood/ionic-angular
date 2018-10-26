import { Injectable } from "@angular/core";
import { Headers } from "@angular/http";
import { Events, Platform } from "ionic-angular";
import { Storage } from "@ionic/storage";
import "rxjs/add/operator/map";
import "rxjs/add/operator/mergeMap";
import "rxjs/add/observable/of";
import "rxjs/add/observable/fromPromise";
import { Observable } from "rxjs/Observable";

@Injectable()
export class Config {
	public mainURL: string;
	public registrationURL: string;
	public defaultApiURL: string = "https://api.moxiereader.com";
	public defaultRegistrationURL: string = "https://auth.moxiereader.com/v3/#/register/app";
	public class_id: any;
	public student_id: any;
	public home_id: any;
	public config;
	public mode: string;
	public pstudent: boolean = false;
	public token: string;
	public selectedProfile: any = {};
	public changeable: boolean;
	public UpdatePIN: boolean; //check for student pin is accepted
	public pinAcceptedStudents: Array<any> = [];
	public checkUser: boolean;
	public pinModal: any;
	public firstload = true;
	public appVersion: number;
	public appFullVersion: string;
	public addLibrary: string = "1";
	public gscanner: any;
	public resetPasswordURL: string = "https://auth.moxiereader.com/#/recover";
	public loginMode: string;
	public isFirsTimeLogin: boolean = false;
	public searchPlaceholder = "Type book title and author's name";
	public goscan: boolean = false;
	public barcodePicker: any;
	public parentFromLogging: any = false;
	public noCacheImg: number;
	public clearBrowserData: any = 2; // set value for clear data
	public isLoadStudentDetail: any = 0;

	// ----- storage variables ------
	public classData = null;
	public classObject = null;
	public studentObject = { student: [], currentReading: [], feed: [] };

	// ----- http request timeout -----
	public timeout = 60000; // 15 seconds

	// ----- select book ------
	public selbook: any;

	// ----- improve search ------
	public grade = "";
	public quality = false;
	public qualityValue = 0;

	// ------------------------
	public scannerLoaded = false;
	public scannerLoaded1 = false;
	public isRefresh = true;
	public isOnStudentProfile = false;

	constructor(public storage: Storage, public events: Events, public platform: Platform) {
		this.storage.ready().then(this.setDefaults.bind(this));
		this.selectedProfile = {data: null};
	}

	clearAllDataBrowser() {
		console.log("===clearAllDataBrowser===");
		localStorage.clear();
		this.storage.clear();
		setTimeout(()=>{
			this.storage.ready().then(this.setDefaults.bind(this));
		}, 500);
	}

	goLogin() {
		localStorage.setItem("blogin", "0");
		this.storage.set("teacher", "");
		this.storage.remove("teacher");
		// let classID = this.config.class_id;
		// this.storage.set("class_id", classID);
		this.storage.set("classObject", "");
		this.storage.remove("classObject");
		localStorage.setItem("classObject", "0");
		this.clearConfig();
		// location.href = "./";
	}

	setSelectedProfile(params) {
		this.selectedProfile = params;
	}
	getSelectedProfile(): any {
		return this.selectedProfile;
	}
	setStudent_id(student_id) {
		this.student_id = student_id;
	}
	getStudent_id(): any {
		return this.class_id;
	}
	setClass_id(class_id) {
		this.class_id = class_id;
	}
	getClass_id(): any {
		return this.student_id;
	}
	setConfig(config) {
		this.config = config;
		this.token = config.token;
		this.storage.set("teacher", JSON.stringify(config));
	}

	clearConfig() {
		this.config = {};
	}

	isNumeric(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}
	
	setDefaults() {
		// =======================================
		this.storage.get("mainURL").then(val => {
			if (val == null) {
				this.storage.set("mainURL", this.defaultApiURL);
			}
      		{
				//this.storage.set("noCacheImg", (Math.round(Math.random() * 10000)))
				this.noCacheImg = (Math.round(Math.random() * 10000));
				console.log("set No Cache Value");
			}

			if (window && window.location && window.location.href && window.location.href.match(/test.moxiereader.com/)) {
				console.log("NOTE URL Forced to Test URL");
				this.storage.set("mainURL", "https://api.test.moxiereader.com");
			}
			if (this.platform.is('ios') || this.platform.is('android')) {
				this.storage.set("mainURL", this.defaultApiURL);
			}
		});
		this.storage.get("registrationURL").then(val => {
			if (val == null) {
				this.storage.set("registrationURL", this.defaultRegistrationURL);
			}
		});
	}

	setAdvancedConfigUnlocked(locked) {
		this.storage.set("advancedConfigUnlocked", locked);
	}

	getAdvancedConfigUnlocked() {
		return this.storage.get("advancedConfigUnlocked");
	}

	setMainUrl(mainURL) {
		this.mainURL = mainURL;
		return this.storage.set("mainURL", mainURL);
	}

	setRegistrationURL(registrationURL) {
		this.storage.set("registrationURL", this.registrationURL);
	}

	getAPIURL() {
		if (!this.mainURL || this.mainURL == null) {
			return Observable.fromPromise(this.storage.get("mainURL")).flatMap(
				apiurl => {
					this.mainURL = apiurl;
					return Observable.of(apiurl);
				}
			);
		}
		return Observable.of(this.mainURL);
	}

	getRegistrationURL() {
		return Observable.fromPromise(this.storage.get("registrationURL"));
	}

	getConfig(): any {
		var p;
		if (this.config) {
			p = Promise.resolve(this.config);
		} else {
			p = this.storage.get("teacher");
		}
		return p;
	}

	setMode(mode) {
		console.log("config set mode == " + mode);
		this.mode = mode;
		this.storage.set("mode", mode);
	}

	getMode(): any {
		let data: any;
		if (this.mode) {
			data = Promise.resolve(this.mode);
		} else {
			data = this.storage.get("mode");
		}
		data = this.storage.get("mode");
		return data;
	}

	getHeaders() {
		let headers = new Headers();
		try {
			let token = this.config.token;
			headers.append("Authorization", `Bearer ${token}`);
		} catch (err) {
			console.log(err);
		}
		return headers;
	}

	getClassIdInStart(classrooms, class_id) {
		let keys = [];
		if (class_id == null || class_id == "") {
			for (let key in classrooms) {
				keys.push(key);
			}
			class_id = keys[keys.length - 1];
		}
		return class_id;
	}
}
