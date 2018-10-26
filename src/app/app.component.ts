import { Component, ViewChild, NgZone } from "@angular/core";
import {
	Platform,
	Nav,
	Events,
	ModalController,
	LoadingController,
	AlertController,
	App
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { AppVersion } from "@ionic-native/app-version";
import { Auth } from "../providers/auth";
import { Config } from "../providers/config";
import { ClassService } from "../providers/class-service";
import { StudentService } from "../providers/student-service";
import { AppMessages } from "../providers/app-messages";
import * as $ from "jquery";
declare var ScanditSDK: any;

@Component({
	templateUrl: "app.html"
})
export class MyApp {
	rootPage: any = "TabsPage";
	@ViewChild(Nav) nav: Nav;
	pages: Array<{ title: string; component: any }>;
	mode: string;
	pinMode: string;
	classes: Array<any> = [];
	teacher: any;
	classrooms: any;
	classTitle: string;
	scannerSettings: any;
	constructor(
		public platform: Platform,
		public statusBar: StatusBar,
		public studentService: StudentService,
		public splashScreen: SplashScreen,
		public events: Events,
		public auth: Auth,
		public modalCtrl: ModalController,
		public loading: LoadingController,
		public storage: Storage,
		public config: Config,
		public classService: ClassService,
		public ngZone: NgZone,
		public appMsg: AppMessages,
		public myApp: App,
		public alertCtrl: AlertController,
		private app: AppVersion
	) {
		// if (this.platform.is('ios') || this.platform.is('android')) {
		// } else {
		// 	this.rootPage = "TabsPage";
		// }
		this.initializeApp();
		this.pages = [
			{ title: "Settings", component: "SettingsPage" },
			{ title: "Support", component: "SupportPage" },
			{ title: "Create Class", component: "CreateClassPage" },
			{ title: "Introduction", component: "IntroPage" }
		];
	}

	initializeApp() {
		console.log("initializeApp");
		this.platform.ready().then(() => {
			console.log(this.platform);

			this.statusBar.styleDefault();
			this.splashScreen.hide();
			this.getVersionNumber();

			// ===== clear all data for browser ======
			let clearBrowserData = localStorage.getItem('clearBrowserData');
			if (!this.config.clearBrowserData || this.config.clearBrowserData != clearBrowserData) {
				this.config.clearAllDataBrowser();
				let alert: any = this.alertCtrl.create({
					title: "We updated your App",
					message: "You may have to login again, apologies for any inconvenience",
					buttons: [
						{
							text: "OK",
							handler: () => {
								this.nav.setRoot("LoginPage");
								localStorage.setItem('clearBrowserData', this.config.clearBrowserData);
							}
						}
					]
				});
				alert.present();
			}
			// Call an event to display messags in the modal controller
			this.events.subscribe("message:displayMessage", data => {
				this.displayMessages(data);
			});

			// Adding Classes to sidemenu
			this.events.subscribe("user:login", data => {
				setTimeout(() => {
					this.appMsg.checkDemo(data);
				}, 1000);
				// this.appMsg.checkLoginDataForMessages(data);
				this.getClasses();
			});

			// Change mode Subscription
			this.events.subscribe("change:mode", mode => {
				console.log("app-change:mode=>" + mode);
				this.mode = mode;
				if (this.mode == "parent") {
					this.pages = [{ title: "Support", component: "SupportPage" }];
				} else {
					this.pages = [
						{ title: "Settings", component: "SettingsPage" },
						{ title: "Support", component: "SupportPage" },
						{ title: "Create Class", component: "CreateClassPage" },
						{ title: "Introduction", component: "IntroPage" }
					];
				}
			});

			// Getting Updated Listed of Classes when classes are updated
			this.events.subscribe("update:classes", () => {
				this.getClasses();
			});
			//current class title
			this.events.subscribe("change:class", classID => {
				this.classService.getClass(classID).subscribe(data => {
					this.classTitle = data.class.title;
				});
			});

			//Listen for logout event
			this.events.subscribe("change:logout", () => {
				this.logout();
			});
			let blogin = localStorage.getItem("blogin"); console.log(blogin);
			let mode = localStorage.getItem("mode");
			if (mode == 'home') mode = 'parent';
			this.config.mode = mode;
			if (blogin == "1") {
				// Detecting Previous Login
				this.storage.get("teacher").then(val => {
					if (val == null || val == "") {
						this.rootPage = "LoginPage";
						return;
					}
					let teacherInfo = JSON.parse(val);
					if (teacherInfo) {
						console.log("teacherInfo", teacherInfo);
						this.config.setConfig(teacherInfo);
						console.log(
							"AAA - Performance ==== /account/current === initializeApp on app.component"
						);
						this.auth.getCurrent().subscribe(data => {
							console.log("current -->", data);
							if (!data.success) {
								this.config.goLogin();
								this.rootPage = "LoginPage";
								return;
							}

							let profileParams: any = {};
							profileParams.user = {};
							profileParams.user.data = {};
							profileParams.user.data.title = data.data.title;
							profileParams.user.data.email = data.data.email;
							profileParams.user.data.avatar = "./assets/images/user.png";
							this.config.setSelectedProfile(profileParams.user);

							var updatedTeacherInfo = teacherInfo;
							updatedTeacherInfo.classrooms = data.classrooms;
							updatedTeacherInfo.license = data.license;
							updatedTeacherInfo.info = data.info;
							this.config.setConfig(updatedTeacherInfo);
							this.classrooms = data.classrooms;
							this.config.isFirsTimeLogin = false;
							this.events.publish("user:login", teacherInfo);

							let email = data.data.email;
							this.storage.get(email).then(val => {
								let class_id: any;
								class_id = JSON.parse(val);
								class_id = this.config.getClassIdInStart(
									data.classrooms,
									class_id
								);
								this.config.class_id = class_id;
								console.log("initial => class_id = " + class_id);
								//this.classService.getClass(class_id)
								//.subscribe(data => {
								//  this.classTitle = data.class.title;
								//});
							});
							if (!this.classService.classData)
								this.classService.classData = JSON.parse(localStorage.getItem('classdata'));
							if (!this.studentService.studentData)
								this.studentService.studentData = JSON.parse(localStorage.getItem('studentdata'));
							console.log("studentData===>", this.studentService.studentData);
						});

						//this.classrooms = teacherInfo['classrooms'];

						// Firing Login Event which makes Menu Content Appear
						//this.events.publish("user:login", teacherInfo);

						// Firing Mode Event
						this.config.getMode().then(mode => {
							console.log("component getMode == " + mode);
							this.config.setMode(mode);
							this.events.publish("change:mode", mode);
							this.mode = mode;
							if (this.mode == "parent") {
								this.pages = [{ title: "Support", component: "SupportPage" }];
							} else {
								this.pages = [
									{ title: "Settings", component: "SettingsPage" },
									{ title: "Support", component: "SupportPage" },
									{ title: "Create Class", component: "CreateClassPage" },
									{ title: "Introduction", component: "IntroPage" }
								];
							}
							this.rootPage = "TabsPage";
						});
						/*
            this.auth.getLicense()
              .subscribe(data => {
                if(data.license.enableCreateClass == true) {
                    this.pages = [
                      { title: 'Settings', component: SettingsPage },
                      { title: 'Support', component: SupportPage },
                      { title: 'Create Class', component: CreateClassPage }
                    ];
                } else {
                    this.pages = [
                      { title: 'Settings', component: SettingsPage },
                      { title: 'Support', component: SupportPage }
                    ];
                }
              })
            */
					} else {
						this.rootPage = "LoginPage";
					}
				});
			} else {
				this.rootPage = "LoginPage";
			}

			if (!(this.platform.is('ios') || this.platform.is('android'))) {
				this.loadWebScanner();
			}
		});
	}

	loadWebScanner() {
		console.log('XXX - loadWebScanner');
		// ===== new key =====
		var mytestkey =
			"AZILiTClKzWICPhn0AV8HI4cjgXiFkKnsUdzP4l4lwnRRqlzlVGLqNFytq/hbJex4GJT+WRzGCcoQS4+bE/pUah9hX3ZNZvEv0+OR5lMMsPqde739QN6hMBYEB3qKcdHF352S8lSdQPIYT4LdxqntWVDrseuI6SRXbZm5PjRYgHICy/+glAtLqTTYq8V6xeLZsb4VtSlG9nF9CtYUP6uoQD40EyzoU1uSwoI9kKFTMNb7qhuTb9wSOPOg2wVvxO9WGtAVweAgaXpHXW+2nAlHJcY6u9WPN8sL5w+e93wWDSvjKVL/p8u7tdBDcBYOOmx0ZgK4+4zPDKYTrDLWYGAHBtaedMKweKDnb4TtnZwt1ugNE6H7RWZa1bjDjntMjbnRbXiVWF2VeZDlLqvJremLKEuL1Ak2OOeZd1Lleyshr67XkuS+6kdgoev/DXYeDY+E/AimpwAuD9Clw00JsNzmdyd52OuvJSVTAzNKHh28dMTLGUo6P7KTL6JdyqoHPDJ6rKvLtrsdNZKuRHZLxdnR6ctxdyRTDBpeVqUv2g36pzbPcrwVPW3OoGjczzsk2Krfx5C8xWG//GG7HHvlHhw0hapS8sCwq/99ru4sK+z69aBFDTCxg5tuASKtSyrdkQaRKwoZoW9OJYarKRXOjzhmlHjm2g4mCO3J4ZvtdjALWtOVZqCHOtihRYYEPlgXsIaPZylJH6Jv9rNzMK3Q7rFFzo8yXbtfdLIPD+AWzMbeF1+INyk4mXLzuvLD7hXKM55tOzRFLoQlnT2ez0v4A+FB9h8wb2d8zm/gzTeWDEFRZbc/zFpZP5eOiSryOlAzWc=";

		var self = this;
		this.scannerSettings = new ScanditSDK.ScanSettings({
			codeCachingDuration: -1,
			enabledSymbologies: [
				"ean13",
				"upca",
				"ean8",
				"five-digit-add-on",
				"two-digit-add-on"
			],
			codeDuplicateFilter: 0,
			maxNumberOfCodesPerFrame: 2
		});
		ScanditSDK.configure(mytestkey, {
			engineLocation: "assets/scandit-sdk"
		});
		ScanditSDK.BarcodePicker.create(document.getElementById("barcodeReader1"), {
			playSoundOnScan: true,
			vibrateOnScan: true
		})
			.then(function (barcodePicker) {
				console.log("scandit load done");
				self.config.barcodePicker = barcodePicker;
				self.config.barcodePicker.applyScanSettings(self.scannerSettings);
				self.config.barcodePicker.scanner.engineSDKWorker.postMessage({ type: "enable-blurry-decoding" });
				setTimeout(() => {
					self.config.barcodePicker.stopCamera();
					self.config.scannerLoaded = true;
				}, 1000);
			})
			.catch(function (error) {
				console.log("error : " + error.message);
			});
	}

	async getVersionNumber() {
		if (this.platform.is("cordova")) {
			let versionNumber = (await this.app.getVersionNumber()) as string;
			this.config.appFullVersion = versionNumber;
			this.config.appVersion = Number(versionNumber.replace(/\./g, ""));
		}
		console.log("this.appVersion : " + this.config.appVersion);
	}

	openPage(page) {
		console.log(page)
		if (this.mode == "parent") {
			this.nav.push(page.component);
		} else {
			if (page.title == 'Introduction') {
				this.nav.push(page.component);
			} else {
				this.nav.setRoot(page.component);
			}
		}
	}

	changeClass(classID, classTitle) {
		let email: string;
		console.log(
			"AAA - Performance ==== /account/current === changeClass on app.component"
		);
		this.classTitle = classTitle;
		this.auth.getCurrent().subscribe(data => {
			email = data.data.email;
			this.storage.set(email, classID);
			this.storage.set("class_id", classID);
			this.config.class_id = classID;
		});
		let name = this.nav.getActive().name;
		if (name !== "TabsPage") {
			this.nav.setRoot("TabsPage", { class_id: classID }).then(() => {
				//this.events.publish("change:class", classID);
			});
		} else {
			this.events.publish("change:class", classID);
		}
	}

	displayMessages(messages) {
		var modelController = this.modalCtrl.create("IntroPage", {
			messages: messages
		});
		modelController.present();
		// var modelController = this.modalCtrl.create(AppMessagesComponent, {
		// 	messages: messages
		// });
		// modelController.onDidDismiss(data => {
		// 	if (data) {
		// 	}
		// });
		// modelController.present();
	}

	logout() {
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.auth.logout().subscribe(() => {
			localStorage.setItem("blogin", "0");
			this.storage.set("teacher", "");
			this.storage.remove("teacher");
			let classID = this.config.class_id;
			this.storage.set("class_id", classID);
			this.storage.set("classObject", "");
			this.storage.remove("classObject");
			localStorage.setItem("classObject", "0");
			this.config.clearConfig();
			//this.myApp.getRootNav().setRoot(LoginPage);
			$('#barcodeReader1').hide();
			this.nav.setRoot("LoginPage");
			//window.location.reload();
		});

		this.unsubscribeAllEvents();
		setTimeout(() => {
			loader.dismiss();
		}, 1500);
	}

	unsubscribeAllEvents() {
		this.events.unsubscribe("toggle:tab", null);
		this.events.unsubscribe("toggle:tab:flex", null);
		this.events.unsubscribe("toggle:tab:none", null);
		this.events.unsubscribe("change:mode", null);
		this.events.unsubscribe("change:class", null);
		this.events.unsubscribe("functionCall:tabSelected", null);
	}

	changeMode(mode) {
		let name = this.nav.getActive().name;
		console.log("active page --- " + name);
		this.config.isRefresh = false;
		this.mode = mode;
		if (mode && mode === "class") {
			let loader = this.loading.create({
				content: ""
			});
			this.config.setMode("class");
			this.auth.changeMode({ mode: "class" }).subscribe(
				data => {
					loader.dismiss();
					if (data.success) {
						if (name !== "TabsPage") {
							let classID = this.config.class_id;
							this.nav.setRoot("TabsPage", { class_id: classID });
						} else {
							this.events.publish("change:mode", mode);
						}
					}
				},
				err => {
					loader.dismiss();
				}
			);
		} else if (mode === "teacher") {
			this.pinMode = "teacherPin";
			this.config.pinModal = this.modalCtrl.create("PinPage", {
				pinMode: this.pinMode,
				studentData: this.studentService.studentData
			});
			this.config.pinModal.present();
		}
	}

	menuOpened() {
		if (this.mode === "teacher") {
			if (this.classTitle == null || this.classTitle == "") {
				console.log(
					"AAA - Performance ==== /account/current === menuOpened on app.component"
				);
				this.auth.getCurrent().subscribe(data => {
					let email = data.data.email;
					this.storage.get(email).then(val => {
						let class_id: any;
						class_id = JSON.parse(val);
						console.log("menu open => class_id = " + class_id);
						class_id = this.config.getClassIdInStart(data.classrooms, class_id);
						try {
							this.classTitle = this.classService.classOptions.title;
						} catch (err) {
							console.log(err);
						}
						//this.classService.getClass(class_id)
						//.subscribe(data => {
						//  this.ngZone.run(()=>{
						//    this.classTitle = data.class.title;
						//  });
						//});
					});
				});
			}
			this.getClasses();
		}
	}

	getClasses() {
		this.classService.getClasses().subscribe(data => {
			console.log(data);
			this.config.classData = data;
			this.ngZone.run(() => {
				this.classes = data.class;
				for (let i = 0; i < this.classes.length; i++) {
					if (this.classes[i].title == this.classTitle) {
						this.config.addLibrary = this.classes[i].addlibrary;
					}
				}
				console.log(this.classes);
			});
		});
	}

	switchToRoot() {
		this.events.publish("change:tab", "homeRoot");
	}

	ionViewDidLoad() { }

	public ionViewWillEnter(): void { }
}
