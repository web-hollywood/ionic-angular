import { Component, ViewChild } from "@angular/core";
import {
	Events,
	Tabs,
	NavParams,
	NavController,
	Platform,
	IonicPage
} from "ionic-angular";
import { Auth } from "../../providers/auth";
import { Config } from "../../providers/config";
import { StudentService } from "../../providers/student-service";
import { Storage } from "@ionic/storage";
import {
	NativePageTransitions,
	NativeTransitionOptions
} from "@ionic-native/native-page-transitions";
import * as $ from "jquery";

@IonicPage()
@Component({
	templateUrl: "tabs.html"
})
export class TabsPage {
	// this tells the tabs component which Pages
	// should be each tab's root Page
	showPane: boolean;
	mode: string;
	tab1Root: any = "HomePage";
	tab2Root: any = "ScanBookPage";
	tab3Root: any = "LibraryPage";
	tab4Root: any = "MyProfilePage"; // 'ProfilePage';
	tab11Root: any = "HomeParentPage";
	tab12Root: any = "StudentProfilePage";

	enabled: boolean = true;
	hidden: boolean = true;
	classParams: any = {};
	profileParams: any = {};
	studentParams: any = {};
	loaded: boolean = false;
	tabIndex: number = 0;
	hideTab: boolean = false;

	prevIndex = -1;

	@ViewChild("myTabs") tabRef: Tabs;
	constructor(
		public storage: Storage,
		public events: Events,
		public navParams: NavParams,
		public studentService: StudentService,
		public config: Config,
		public auth: Auth,
		public navCtrl: NavController,
		private platform: Platform,
		private nativePageTransitions: NativePageTransitions
	) {
		console.log("XXX ====== SET Tab page ======");

		if (platform.is("ios") || platform.is("android")) {
		} else {
			this.tab2Root = "ScanBookWebPage";
		}
		/*
    this.auth.getCurrent()
     .subscribe(data => { console.log("AAA - Performance ==== /account/current === constructor on tab.ts");
      this.profileParams.user = {};
      this.profileParams.user.data = {}
      this.profileParams.user.data.title = data.data.title;
      this.profileParams.user.data.email = data.data.email;
      this.profileParams.user.data.avatar = './assets/images/user.png';
      this.config.setSelectedProfile(this.profileParams.user);
      this.studentParams = {};
      let url="<img class = 'profile-image' src='./assets/images/user.png'>";
      if(this.config.mode !== 'parent') {
        document.querySelector('ion-tabs a:nth-child(4) ion-icon').innerHTML = url;
      }
    })
    */
		setTimeout(() => {
			try {
				let url =
					"<img class = 'profile-image' src='./assets/images/user.png'>";
				if (this.config.mode !== "parent") {
					document.querySelector(
						"ion-tabs a:nth-child(4) ion-icon"
					).innerHTML = url;
				}
			} catch (err) {
				console.log(err);
			}
		}, 1500);
		this.tabIndex = 0;
		this.profileParams.user = {};
		this.events.subscribe("change:mode", mode => {
			console.log("change:mode ==> tabPage == " + mode);
			if (mode === "teacher") {
				this.enabled = true;
				this.tab4Root = "MyProfilePage";
			} else {
				this.enabled = false;
				this.tab4Root = "StudentProfilePage";
			}
			this.mode = mode;
			if (!this.config.isRefresh)
				this.switchToHome();
		});
		if (this.config.mode === "teacher") {
			this.enabled = true;
			this.tab4Root = "MyProfilePage";
		} else {
			this.enabled = false;
			this.tab4Root = "StudentProfilePage";
		}

		this.events.subscribe("change:class", () => {
			this.switchToHome();
		});

		this.events.subscribe("toggle:tab", this.toggleTap.bind(this));

		this.events.subscribe("toggle:tab:flex", () => {
			console.log("TTT-toggle:tab:flex");
			this.toggleTap('flex');
		});

		this.events.subscribe("toggle:tab:none", () => {
			console.log("TTT-toggle:tab:none");
			this.toggleTap('none');
		});
		/*
    this.config.getMode().then(mode => { console.log("tab-getmode==>"+mode);
      this.mode = mode;
      if(this.config && this.config.config && this.config.config.mode && this.config.config.mode.class_id && this.mode=='class') {
        this.config.class_id = this.config.config.mode.class_id; 
      } else {
        let email: string;
        this.auth.getCurrent()
        .subscribe(data=> { console.log("AAA - Performance ==== /account/current === constructor on tab.ts");
          email = data.data.email;
          this.storage.get(email)
          .then(val=> {
            let class_id:any;
            class_id = JSON.parse(val);
            this.config.class_id = class_id;
          })
        })
      }
    });
    */
	}

	toggleTap(value) {
		console.log("YYY====toggleTap", this.config.goscan, value);
		// let tabbar: any = document.querySelector(".tabbar"); 
		// if (!tabbar) {
		// 	return;
		// } 
		// tabbar.style.display = value;
		$(".tabbar").css('display', value);
		if (value != "none") {
			this.hideTab = false;
			if (this.config.goscan) {
				let url =
					"<img src='" +
					this.config.mainURL +
					"/class/" +
					this.config.class_id +
					"/student/" +
					this.config.student_id +
					"/avatar/thumbnail?width=160&" + 
					this.config.noCacheImg + 
					"'" +
					">";
					$(".tabbar a:nth-child(4) ion-icon").html(url);
			}
			if (this.enabled || this.config.goscan) {
				let url = "<img class = 'profile-image' src='assets/images/user.png'>";
				if (this.config.mode == "teacher") {
					$(".tabbar a:nth-child(4) ion-icon").html(url);
				}
			} else { 
				try {
					let url =
						"<img src='" +
						this.config.mainURL +
						"/class/" +
						this.config.class_id +
						"/student/" +
						this.config.student_id +
						"/avatar/thumbnail?width=160&" + 
						this.config.noCacheImg + 
						"'" +
						">";
					$(".tabbar a:nth-child(4) ion-icon").html(url);
					this.studentParams = {};
					this.studentParams.studentID = this.config.getClass_id();
					this.studentParams.classID = this.config.getStudent_id();
					setTimeout(() => {
						try {
							this.tabRef.select(3);
						} catch (err) {
							console.log(err);
						}
					}, 100);
				} catch (err) {
					console.log(err);
				}
			}
		} else {
			this.hideTab = true;
		}
	}

	switchToHome() {
		try {
			if (this.tabRef.getSelected()) {
				let tabIndex = this.tabRef.getSelected().index;

				if (tabIndex !== 0) {
					if (this.tabRef.getByIndex(0).getViews()) {
						this.tabRef.select(0);
						let viewLength = this.tabRef.getByIndex(0).getViews().length;
						if (viewLength > 1) {
							this.tabRef.getByIndex(0).remove(1, viewLength - 1);
						}
					}
				}
			}
		} catch (err) {
			console.log(err);
		}
	}

	getTitle(): string {
		let ret_str: string = "";
		if (this.enabled) {
			ret_str = "My Class";
		} else {
			ret_str = "Finish";
			ret_str = "My Class";
		}
		return ret_str;
	}

	getAnimationDirection(index): string {
		var currentIndex = this.tabIndex;
		this.tabIndex = index;
		switch (true) {
			case currentIndex < index:
				return "left";
			case currentIndex > index:
				return "right";
		}
	}
	transition(e): void {
		console.log("tabindex" + "-------" + e.index + "=====" + this.config.mode);
		if (this.mode == 'class' && e.index == 0) {
			this.toggleTap('none');
			try {
				let viewLength = this.tabRef.getByIndex(3).getViews().length;
				if (viewLength > 1) {
					this.tabRef.getByIndex(3).remove(1, viewLength - 1);
				}
			} catch (err) {
				console.log(err);
			}
		}
		if (this.config.mode == "parent") {
			this.events.publish("change:mode", "parent");
			this.events.publish("toggle:tab", "none");
			this.tabIndex = 0;
			if (e.index == 0 && this.prevIndex == 1) {
				$("#tabpanel-t0-0").css("left", "0");
				$("#tabpanel-t0-0").css("z-index", "9");
				$("#tabpanel-t0-0").css("display", "block");
				//$('#tabpanel-t0-1').css('display', 'block');
				setTimeout(() => {
					//$('#tabpanel-t0-1').css('display', 'none');
				}, 500);
			}
			return;
		}

		// console.log(this.tabRef);
		// let viewLength = this.tabRef.getByIndex(2).getViews().length;
		// if(viewLength > 1) {
		//   this.tabRef.getByIndex(2).remove(1, viewLength-1);
		// }
		//============================================================
		if (this.tabRef.getSelected() && this.config.loginMode != "parent") {
			try {
				let tabIndex = this.tabRef.getSelected().index;

				if (tabIndex == 1) {
					let viewLength = this.tabRef.getByIndex(1).getViews().length;
					if (viewLength > 1) {
						this.tabRef.getByIndex(1).remove(1, viewLength - 1);
					}
				}
			} catch (err) {
				console.log(err);
			}
		}
		if (e.index == 1) {
			try {
				let viewLength = this.tabRef.getByIndex(1).getViews().length;
				if (viewLength > 1) {
					this.tabRef.getByIndex(1).remove(1, viewLength - 1);
				}
			} catch (err) {
				console.log(err);
			}
		}
		if (e.index == 2) {
			try {
				let viewLength = this.tabRef.getByIndex(2).getViews().length;
				if (viewLength > 1) {
					this.tabRef.getByIndex(2).remove(1, viewLength - 1);
				}
			} catch (err) {
				console.log(err);
			}
		}
		if (1 || this.config.mode !== "parent") {
			let viewLength = this.tabRef.getByIndex(3).getViews().length;
			if (viewLength > 1) {
				//this.tabRef.getByIndex(3).pop(); // remove(1, viewLength-1);
			}
		} else {
			//this.events.publish('functionCall:finish');
		}

		// $('#tabpanel-t0-0').css('left', '0');
		// $('#tabpanel-t0-0').css('z-index', '0');
		// if(this.config.mode == 'class') {
		//   if(e.index == 1) {
		//     $('#tabpanel-t0-0').css('left', '100%');
		//     $('#tabpanel-t0-0').css('display', 'block');
		//   }
		//   if(e.index == 0 && this.prevIndex == 1) {
		//     $('#tabpanel-t0-0').css('left', '0');
		//     $('#tabpanel-t0-0').css('z-index', '9');
		//     $('#tabpanel-t0-0').css('display', 'block');
		//     //$('#tabpanel-t0-1').css('display', 'block');
		//     setTimeout(() => {
		//       //$('#tabpanel-t0-1').css('display', 'none');
		//     }, 500);
		//   }
		// }

		this.prevIndex = e.index;

		let options: NativeTransitionOptions = {
			direction: this.getAnimationDirection(e.index),
			duration: 250,
			slowdownfactor: -1,
			slidePixels: 0,
			iosdelay: 20,
			androiddelay: 0,
			fixedPixelsTop: 0,
			fixedPixelsBottom: 48
		};
		if (!this.loaded) {
			this.loaded = true;
			return;
		}

		if (this.config.mode == "class" && !this.platform.is('ios') && !this.platform.is('android')) {
			try {
				if (this.prevIndex != 1 && (e.index == 0 || e.index == 3)) {
					this.nativePageTransitions.slide(options);
				}
			} catch (err) {
				console.log(err);
			}
		}
	}

	ionViewWillEnter() { console.log("ionViewWillEnter");
		this.events.subscribe("functionCall:tabSelected", eventData => {
			if (this.config.UpdatePIN == false) {
				try {
					let url =
						"<img src='" +
						this.config.mainURL +
						"/class/" +
						this.config.class_id +
						"/student/" +
						this.config.student_id +
						"/avatar/thumbnail?width=160&" + 
						this.config.noCacheImg + 
						"'" +
						">";
					if (this.config.mode !== "parent") {
						document.querySelector(
							"ion-tabs a:nth-child(4) ion-icon"
						).innerHTML = url;
					}
					this.config.UpdatePIN = true;
					this.events.publish("change:mode", "class");
					this.events.publish("toggle:tab", "flex");
					this.tabIndex = 3;
					if (this.tabRef) this.tabRef.select(3);
				} catch (err) {
					console.log(err);
				}
			}
		});
	}

	ionViewDidLoad() { console.log(this.config.UpdatePIN);
		if (this.config.UpdatePIN == false) {
			let url =
				"<img src='" +
				this.config.mainURL +
				"/class/" +
				this.config.class_id +
				"/student/" +
				this.config.student_id +
				"/avatar/thumbnail?width=160&" + 
				this.config.noCacheImg + 
				"'" +
				">";
			if (this.config.mode !== "parent") {
				document.querySelector(
					"ion-tabs a:nth-child(4) ion-icon"
				).innerHTML = url;
			}
			this.config.UpdatePIN = true;
			this.events.publish("change:mode", "class");
			this.events.publish("toggle:tab", "flex");
			// this.tabIndex = 3;
		}
	}

	unsubscribeAllEvents() {
		this.events.unsubscribe("toggle:tab", null);
		this.events.unsubscribe("toggle:tab:flex", null);
		this.events.unsubscribe("toggle:tab:none", null);
		this.events.unsubscribe("change:mode", null);
		this.events.unsubscribe("change:class", null);
		this.events.unsubscribe("functionCall:tabSelected", null);
	}

	ionViewWillLeave() {}

	ngOnDestroy() {
		console.log("ngOnDestroy --- tab page");
		// this.unsubscribeAllEvents();
	}
}
