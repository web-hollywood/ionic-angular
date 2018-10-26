import { Component, NgZone } from "@angular/core";
import {
	Events,
	NavController,
	Platform,
	ViewController,
	ModalController,
	AlertController,
	LoadingController,
	NavParams,
	ToastController
} from "ionic-angular";

import { ScanService } from "../../providers/scan-service";
import { Config } from "../../providers/config";
import { BookService } from "../../providers/book-service";
import { IonicPage } from "ionic-angular";
import { UtilService } from "../../providers/util-service";

import * as $ from "jquery";
//import ScanditSDK from "scandit-sdk";

declare var JpegCamera: any;
declare var ScanditSDK: any;

@IonicPage()
@Component({
	selector: "page-scan-book-web",
	templateUrl: "scan-book-web.html"
})
export class ScanBookWebPage {
	public scannedCodes;
	private image: string;
	private istake = false;
	private iscovermatch = false;
	private missingCode: string;
	private matchList = [];
	private takenBookId = null;
	private newBookId = null;

	// private callbackFn: Function;
	//private callbackFnCamera: Function;

	private imageHeight = 400;
	private imageWidth = 300;
	private cameraHeight = 400;
	private cameraWidth = 300;
	// private scannerWidth = 640;
	// private scannerHeight = 480;
	private camera = null;
	private mytimer: any;
	private mytimer1: any;
	// private timer = 120; //seconds

	// private barcodes = "EAN";
	private pachsize = "medium";
	private workers = "2";
	private locate = true;
	private drawBoundingBox = false;
	private frequency = "10";
	private halfsample = false;
	private barcode_reader: any;
	private inputStream = "Live";

	private sconfig = "option1";

	private issetting = false;
	private homeData: any;

	//=== barcode detection variables ===
	private aryCode = [];
	// private targetNumber = '1';
	private codeCounts = {};
	// private nums = 10;
	// private maxDetectNumber = 10;
	private detectCount = 0;
	private codes = [];

	//--- search box ---
	searchValue: string = "";
	quality: boolean;
	view_Flag: boolean;
	autoComplete_show: boolean;
	books: any = [];
	search_items: any[];
	auto_complete_items: any[];
	history_items: any[];
	search_flag: string;

	barcodePicker: any;
	scannerSettings: any;
	startCount: any;
	startCountStr: any;
	holdstr = "hold book steady";

	mytimer2 = null;
	loader = null;
	firstScannerLoad = true;
	snapshot: any;

	bookCreate_condition = 0; // 0 : createnew+coverURL, 1: createnew + no coverURL, 2: no createNew
	searchData: any;
	isCreate = false;
	isLoaded = true;

	constructor(
		private zone: NgZone,
		private platform: Platform,
		private events: Events,
		private nav: NavController,
		private view: ViewController,
		private scanService: ScanService,
		private modalCtrl: ModalController,
		private alertCtrl: AlertController,
		public toastCtrl: ToastController,
		public loading: LoadingController,
		public bookService: BookService,
		public navParams: NavParams,
		public utilService: UtilService,
		public config: Config
	) {
		this.homeData = navParams.get("homeData");
		//======== search item init =========
		this.history_items = [];
		this.search_items = [];
		this.auto_complete_items = [];
		this.view_Flag = false;
		this.bookService.getHistoryList().subscribe(data => {
			this.history_items = data.data;
			let temp_items = [];
			for (let item of this.history_items) {
				if (
					item.data.q != undefined &&
					item.data.q != "" &&
					item.data.q != "[object Object]"
				) {
					temp_items.push(item);
				}
			}
			this.history_items = temp_items;
		});
	}

	getSearchBook(value) {
		this.quality = false;
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.bookService.searchBook(value, this.quality, true).subscribe(
			data => {
				this.books = data.books;
				this.view_Flag = false;
				var nativeElement = document.getElementById("autocomplete");
				if (nativeElement != null) {
					nativeElement.className = "hideDiv";
				}
				this.searchValue = "";
				loader.dismiss();
				this.nav.push("SearchResultPage", {
					books: this.books,
					keyword: value, data: data, value: value, quality: this.quality
				});
			},
			err => {
				this.utilService.createError(err);
				loader.dismiss();
			}
		);
	}

	searchBookBySearchbox(value) {
		var nativeElement = document.querySelector(".hideDiv");
		if (nativeElement != null) {
			nativeElement.className = "autocomplete";
		}
		this.autoComplete_show = true;
		if (value == undefined) {
			this.view_Flag = false;
		}
		if (value != undefined) {
			if (value.length < 1) {
				this.search_items = this.history_items;
				this.search_flag = "history";
				this.view_Flag = true;
			}
			if (value.length >= 1 && value.length < 4) {
				this.view_Flag = false;
			}
			if (value.length >= 4) {
				this.bookService.getAutoCompleteList(value).subscribe(data => {
					this.auto_complete_items = data.data;
					this.search_flag = "auto_complete";
					this.view_Flag = true;
				});
			}
		}
	}

	checkBlur() {
		this.autoComplete_show = false;
		//this.view_Flag = false;
	}

	itemClick(book_name: string) {
		this.searchValue = book_name;
		this.quality = true;
		if (this.autoComplete_show == false) this.view_Flag = false;
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.bookService.searchBook(book_name, this.quality, true).subscribe(
			data => {
				this.books = data.books;
				this.view_Flag = false;
				loader.dismiss();
				this.nav.push("SearchResultPage", { books: this.books, data: data, value: book_name, quality: this.quality });
			},
			err => {
				this.utilService.createError(err);
				loader.dismiss();
			}
		);
	}

	ionViewDidLoad() {
		console.log('Scan-book-web ionViewDidLoad');
		var tt = this;
		document
			.querySelector("page-scan-book-web")
			.addEventListener("click", function (event) {
				var nativeElement = document.getElementById("autocomplete");
				//  var searchBar  =document.querySelector('.searchbar-input');
				//  var clickedComponent = event.currentTarget;
				var inside = false;
				var target = <HTMLElement>event.target;
				var className = target.className;
				if (
					(className == "label label-md" && target.childElementCount == 0) ||
					className == "searchbar-input" ||
					className == "label label-ios"
				)
					inside = true;
				if (inside) {
				} else {
					//Keyboard.hideKeyboardAccessoryBar(false);
					tt.view_Flag = false;
					if (nativeElement != null) nativeElement.className = "hideDiv";
				}
			});
	}

	showScanAlert(code, code_most) {
		var title = "Oops!";
		var msg =
			"The light is causing me some difficult, make sure the light is not behind you.\n " +
			code_most;
		if (code != "") {
			title = code;
			msg = "";
		}
		let alert = this.alertCtrl.create({
			title: title,
			message: msg,
			enableBackdropDismiss: false,
			buttons: [
				{
					text: "Continue",
					handler: () => {
						this.reset();
					}
				}
			]
		});
		if (code != "") {
			this.searchBook("", code);
		} else {
			alert.present();
		}
	}

	//=========================================

	public ionViewDidEnter(): void {
		console.log("scanner-ionViewDidEnter");

		if (this.mytimer1) clearTimeout(this.mytimer1);
		this.mytimer1 = setTimeout(() => {
			this.checkScanner();
		});

		// ---------- test code ---------
		// $("#barcodeReader1").css("display", "none");
		// //this.config.barcodePicker.pauseScanning();
		// this.missingCode = "9781742612386";
		// this.checkCreateNew()
		// ------------------------------
		// this.searchBookByCode("9781776570041");
	}

	checkScanner() { console.log("check Scanner ===", this.config.scannerLoaded, this.config.scannerLoaded1, (new Date()).getTime());
		if (this.config.scannerLoaded) {
			if (!this.config.scannerLoaded1) {
				// ===== new key =====
				var mytestkey =
				"AZILiTClKzWICPhn0AV8HI4cjgXiFkKnsUdzP4l4lwnRRqlzlVGLqNFytq/hbJex4GJT+WRzGCcoQS4+bE/pUah9hX3ZNZvEv0+OR5lMMsPqde739QN6hMBYEB3qKcdHF352S8lSdQPIYT4LdxqntWVDrseuI6SRXbZm5PjRYgHICy/+glAtLqTTYq8V6xeLZsb4VtSlG9nF9CtYUP6uoQD40EyzoU1uSwoI9kKFTMNb7qhuTb9wSOPOg2wVvxO9WGtAVweAgaXpHXW+2nAlHJcY6u9WPN8sL5w+e93wWDSvjKVL/p8u7tdBDcBYOOmx0ZgK4+4zPDKYTrDLWYGAHBtaedMKweKDnb4TtnZwt1ugNE6H7RWZa1bjDjntMjbnRbXiVWF2VeZDlLqvJremLKEuL1Ak2OOeZd1Lleyshr67XkuS+6kdgoev/DXYeDY+E/AimpwAuD9Clw00JsNzmdyd52OuvJSVTAzNKHh28dMTLGUo6P7KTL6JdyqoHPDJ6rKvLtrsdNZKuRHZLxdnR6ctxdyRTDBpeVqUv2g36pzbPcrwVPW3OoGjczzsk2Krfx5C8xWG//GG7HHvlHhw0hapS8sCwq/99ru4sK+z69aBFDTCxg5tuASKtSyrdkQaRKwoZoW9OJYarKRXOjzhmlHjm2g4mCO3J4ZvtdjALWtOVZqCHOtihRYYEPlgXsIaPZylJH6Jv9rNzMK3Q7rFFzo8yXbtfdLIPD+AWzMbeF1+INyk4mXLzuvLD7hXKM55tOzRFLoQlnT2ez0v4A+FB9h8wb2d8zm/gzTeWDEFRZbc/zFpZP5eOiSryOlAzWc=";
				this.scannerSettings = new ScanditSDK.ScanSettings({
					codeCachingDuration: -1,
					enabledSymbologies: [
						"ean13",
						"upca",
						"ean8",
						"ean",
						"five-digit-add-on",
						"two-digit-add-on"
					],
					codeDuplicateFilter: 0,
					maxNumberOfCodesPerFrame: 2
				});
				ScanditSDK.configure(mytestkey, {
					engineLocation: "assets/scandit-sdk"
				});
				this.startScan();
			}
			this.config.scannerLoaded1 = true;
		} else {
			this.mytimer1 = setTimeout(() => {
				this.checkScanner();
			}, 500)
		}
	}

	startScan() {
		console.log(this.config.barcodePicker);
		this.istake = false;

		var self = this;
		// $('#barcodeReader1').html("");

		// this.loader = this.loading.create({
		// 	content: ""
		// });
		// this.loader.present();
		if (this.firstScannerLoad)
			self.checkScannerLoaded();

		if (self.config.barcodePicker) {
			$("#barcodeReader1").css("display", "block");
			self.config.barcodePicker.resumeCamera();
			self.config.barcodePicker.resumeScanning();

			self.config.barcodePicker.applyScanSettings(self.scannerSettings);
			self.config.barcodePicker.onScan(function (scanResult) {
				console.log("XXX=========== detect code from onScan of barcodePicker", scanResult);
				self.scannedCodes = scanResult.barcodes;
				self.detectCode();
			}, true);
			self.config.barcodePicker.onScanError(function (error) {
				alert("error1 : " + error.message);
				clearTimeout(self.mytimer2);
				self.loader.dismiss();
			}, true);
		}
	}

	checkScannerLoaded() {
		var tt = this;
		//if($('.scandit-hidden-opacity').css('opacity') == '1') {
		clearTimeout(tt.mytimer2);
		if (tt.loader) tt.loader.dismiss();

		tt.startCount = 299;
		$(".barpro div").css("width", "100%");
		$("#start_overlay").css("display", "block");
		$(".barpro").css("display", "block");
		tt.loadCountdown();
		// } else {
		//   tt.mytimer2 = setTimeout(() => {
		//     tt.checkScannerLoaded();
		//   }, 10);
		// }
	}

	loadCountdown() {
		var tt = this;
		$(".barpro div").css("width", tt.startCount * 100 / 300 + "%");
		tt.startCountStr = Math.floor(tt.startCount / 100) + 1;
		if (tt.startCount > 0) {
			tt.startCount--;
			setTimeout(() => {
				tt.loadCountdown();
			}, 10);
		} else {
			tt.goLoader();
		}
	}

	goLoader() {
		if (this.startCountStr == 1) this.startCountStr = "Go";
		setTimeout(() => {
			$("#start_overlay").fadeOut();
		}, 500);
	}

	detectCode() {
		$("#barcodeReader1").css("display", "none");
		this.config.barcodePicker.pauseScanning();
		$("#detectCode").html("");
		for (let index in this.scannedCodes) {
			let code = this.scannedCodes[index].data;
			$("#detectCode").append(
				"<div>" + code + " " + this.scannedCodes[index].symbology + "</div>"
			);
		}
		//=========== scan code =============
		var result = "";
		var findBook = false;
		var oneupc = false;
		for (let index in this.scannedCodes) {
			let scannedCode = this.scannedCodes[index];
			let pre = scannedCode.symbology.toUpperCase();
			if (pre == "UPCA") oneupc = true;
		}
		if (oneupc && this.scannedCodes.length > 1) oneupc = false;
		for (let index in this.scannedCodes) {
			let scannedCode = this.scannedCodes[index];
			let pre = scannedCode.symbology.toUpperCase();
			let code = scannedCode.data;
			let i = parseInt(index);
			if (i > 0) {
				if (
					pre == "UPCA" ||
					pre == "EAN13" ||
					pre == "FIVE-DIGIT-ADD-ON" ||
					pre == "TWO-DIGIT-ADD-ON"
				) {
					if (
						(this.scannedCodes[0].symbology.toUpperCase() == "UPCA" &&
						this.scannedCodes[1].symbology.toUpperCase() ==
						"FIVE-DIGIT-ADD-ON") ||
						(this.scannedCodes[1].symbology.toUpperCase() == "UPCA" &&
						this.scannedCodes[0].symbology.toUpperCase() ==
						"FIVE-DIGIT-ADD-ON")
					) {
						if (
							this.scannedCodes[0].symbology.toUpperCase() ==
							"FIVE-DIGIT-ADD-ON" ||
							this.scannedCodes[0].symbology.toUpperCase() == "TWO-DIGIT-ADD-ON"
						) {
							var swapFiveDigit = result;
							result = code;
							result += swapFiveDigit;
							findBook = true;
						} else {
							result += code;
							findBook = true;
						}
					} else {
						if (this.scannedCodes[0].symbology.toUpperCase() == "EAN13") {
							result = this.scannedCodes[0].data;
						} else if (this.scannedCodes[1].symbology.toUpperCase() == "EAN13"){
							result = this.scannedCodes[1].data;
						}
						findBook = true;
					}
				} else if (pre == "EAN13") {
					result = code;
					findBook = true;
				}
			} else {
				if (pre != "FIVE-DIGIT-ADD-ON" && pre != "TWO-DIGIT-ADD-ON") {
					result = code;
				}
				findBook = true;
				if (pre == "UPCA") {
					findBook = false;
				}
			}
		}
		let count = 0;
		if (result != "" && oneupc) {
			this.codes.push(result);
			for (let i = 0; i < this.codes.length; i++) {
				if (this.codes[i] == result) {
					count++;
				}
			}
			if (count == 1) {
				this.searchBook("UPCA", result, 1);
			}
			if (count == 3) {
				this.searchBook("UPCA", result, 3);
			}
			if (count == 6) {
				this.searchBook("UPCA", result, 6);
				//this.codes = this.codes.filter(function(a){return a != result});
			}
			if (count > 6) {
				this.searchBook("UPCA", result, 7);
				this.codes = this.codes.filter(function (a) {
					return a != result;
				});
			}
		}

		if (result != "" && !oneupc) {
			if (findBook) {
				this.searchBook("", result);
			} else {
				this.searchBook("UPCA", result, 0);
			}
		} else {
			if (count != 3 && count != 6) {
				this.resumeScan();
			}
		}

		//self.showScanAlert(code, "");
	}

	destoryScan() {
		if (this.config.barcodePicker) {
			this.config.barcodePicker.sstop();
			//this.config.barcodePicker.destroy();
			//$('#barcodeReader1').html("");
		}
	}

	public ionViewWillEnter(): void {

	}

	public ionViewWillLeave(): void {
		console.log("scanner-ionViewWillLeave");
		$("#start_overlay").css("display", "none");
		$("#barcodeReader1").css("display", "none");
		this.destoryScan();
		this.destroyCamera();
		clearTimeout(this.mytimer);
		clearTimeout(this.mytimer1);
		$("#barcodeResults").html("");
		$("#detectCode").html("");
		$("#div_range_value").css("width", "0px");
		this.aryCode = [];
		this.codeCounts = {};
		this.detectCount = 0;
		this.config.scannerLoaded1 = false;
		/*
    setTimeout(() => {
      this.destoryScan();
      this.destroyCamera();
    }, 10000);*/
	}

	//================ MoxieScan =========================

	createdMoxieCamera() {
		/*
    MoxieCamera.createMoxieCameraInstance('#cameraReader', this.callbackFnCamera, {
      imageHeight: 400,
      imageWidth: 400,
      cameraHeight: 460,
      cameraWidth: 460
    });*/
		let divSelector = "#cameraReader";
		this.destroyCamera();

		var $div = $("<div>")
			.attr("id", "cameraDiv")
			.height(this.cameraHeight + "px")
			.width(this.cameraWidth + "px");
		$(divSelector).append($div);

		var buttonCSS = {
			"background-color": "#92CA2F",
			width: "150px",
			height: "40px",
			"text-align": "center",
			color: "white",
			"font-family": '"Alegreya Sans", sans-serif',
			"line-height": "40px",
			"font-size": "16px",
			pointer: "cursor",
			display: "inline-block",
			margin: "6px",
			"margin-left": "0"
		};

		// Buttons for controlling the camera
		$div = $("<div>")
			.addClass("cameraButton")
			.text("Take Picture")
			.css(buttonCSS);
		$(divSelector).append($div);
		$(divSelector).append("<div class='camera_countdown'><div id='ctimer'></div></div>");

		$div = $("<div>")
			.addClass("retakeCameraButton")
			.text("Re-take Picture")
			.css(buttonCSS)
			.hide();
		$(divSelector).append($div);

		$div = $("<div>")
			.addClass("sendPhotoButton")
			.text("Send Picture")
			.css(buttonCSS)
			.hide();
		$(divSelector).append($div);
	}

	// ===== check createnew =====

	checkCreateNew(data) {
		var code = this.missingCode;
		// this.scanService.searchBook(code).subscribe(data => {
			this.searchData = data;
			if (data.books.length == 0) {
				if (data.createnew) { // if createnew
					this.bookCreate_condition = 0;
					if (data.createnew.cover_url) { // if cover_url
						let modal = this.modalCtrl.create('CreateNewPage', {
							title: data.createnew.title,
							coverUrl: data.createnew.cover_url,
							author: data.createnew.author,
							pages: data.createnew.pages,
							data: data,
							isCreate: true
						});
						modal.onDidDismiss(data => {
							if (data == 'cancel') {
								this.returnTake();
							} else {
								let desc = "";
								try {
									desc = this.searchData.createnew.summary;
								} catch (err) {
									console.log(err);
								}
								this.postBook(data.title, data.coverUrl, data.pages, data.author, data.gener, desc);
							}
						});
						modal.present();
					} else { // if no cover_url
						this.bookCreate_condition = 1;
						this.isCreate = false;
						this.takeBookPicture(code);
					}
				} else { // if no createnew
					this.bookCreate_condition = 2;
					this.isCreate = false;
					this.takeBookPicture(code);
				}
			}
		// }, err => {
		// 	this.utilService.createError(err);
		// });
	}
	countDown(i) {
		var myself = this;
		var int = setInterval(function () {
			if (i == -1) {
				clearInterval(int);
				myself.snapshot = myself.camera.capture();
				myself.snapshot.show();
				$("#ctimer").removeClass('flash');
				$("#ctimer").fadeOut(function(){
					$("div.retakeCameraButton").show();
					$("div.sendPhotoButton").show();
				});
			} else {
				if (i == 0) {
					$("#ctimer").addClass('flash');
					$("#ctimer").html("<img src='assets/images/camera.png'/>");
				} else {
					$("#ctimer").html(i);
				}
				i--;
			}
		}, 1000);
	}

	startCamera() {
		var myself = this;

		this.camera = new JpegCamera("#cameraDiv", {
			mirror: false
		})
			.ready(function () {
				$("div.cameraButton").on("click", function () {
					// Display the snapshot
					// $("div.sendPhotoButton").click();

					$("div.cameraButton").hide();
					$("#ctimer").html("3");
					$("#ctimer").show();
					myself.countDown(2);
				});

				$("div.sendPhotoButton").on("click", function () {
					var fn = function (canvas) {
						var ratio = 0; // Used for aspect ratio
						var currentWidth = canvas.width; // Current image width
						var currentHeight = canvas.height; // Current image height

						// Check if the current width is larger than the max
						if (currentWidth > this.imageWidth) {
							ratio = myself.imageWidth / currentWidth; // get ratio for scaling image

							currentHeight = currentHeight * ratio; // Reset height to match scaled image
							currentWidth = currentWidth * ratio; // Reset width to match scaled image
						}

						// Check if current height is larger than max
						if (currentHeight > myself.imageHeight) {
							ratio = myself.imageHeight / currentHeight; // get ratio for scaling image

							currentWidth = currentWidth * ratio; // Reset width to match scaled image
							currentHeight = currentHeight * ratio; // Reset height to match scaled image
						}

						// Now actually resize our image
						var resizedCanvas = document.createElement("canvas");
						var resizedContext = resizedCanvas.getContext("2d");

						resizedCanvas.height = currentHeight;
						resizedCanvas.width = currentWidth;

						//var context = canvas.getContext("2d");  //-- for clear lint --
						resizedContext.drawImage(canvas, 0, 0, currentWidth, currentHeight);

						// Turn our canvas into a base64 jpeg and return via callback
						var data = resizedCanvas.toDataURL("image/jpeg");
						myself.image = data;
						if (myself.isCreate) {
							myself.callbackFnCamera1(data);
						} else {
							myself.callbackFnCamera(data);
						}
					};

					myself.snapshot.get_canvas(fn);
				});

				$("div.retakeCameraButton").on("click", function () {
					myself.snapshot.discard();
					$("div.sendPhotoButton").hide();
					$("div.retakeCameraButton").hide();
					$("div.cameraButton").show();
				});
			})
			.error(function () {
				alert("Camera access was denied");
			});
	}
	/**
	 * Destroys the camera
	 */
	destroyCamera() {
		if (this.camera != null) {
			this.camera.stop();
		}
		$("#cameraReader").html("");
	}

	callbackFnCamera1(result) {
		var code = this.missingCode;
		if (!this.scanService.isValidISBN(code)) {
			this.alertCtrl.create({
				title: "Oops, there are some problems with your barcode",
				message: "The barcode you scanned is not Valid ISBN barcode.",
				enableBackdropDismiss: false,
				buttons: [{ text: 'Ok' }]
			}).present();
			return;
		}
		if (this.isCreate) {
			var code = this.missingCode;
			let loader = this.loading.create({
				content: ""
			});
			loader.present();
			this.scanService.searchBook(code).subscribe(data => {
				loader.dismiss();
				this.searchData = data;
				let books = data.books;
				if (books.length > 0) {
					this.utilService.createToast("Good news : We found your ISBN, scan or print a barcode for this book");
					this.nav.push("BookDetailPage", { book: books[0] });
				} else {
					this.callbackFnCamera(result);
				}
			}, err => {
				loader.dismiss();
			});
		}
	}

	callbackFnCamera(result) {
		//console.log(result);
		let title = "";
		let author = "";
		let pages = "";
		let data = this.searchData;
		let isCreate = this.isCreate;

		if (this.bookCreate_condition == 1) {
			title = this.searchData.createnew.title;
			author = this.searchData.createnew.author;
			pages = this.searchData.createnew.pages;
		}

		if (this.bookCreate_condition == 2) {
			isCreate = true;
		}

		var code = this.missingCode;
		if (!this.scanService.isValidISBN(code)) {
			this.alertCtrl.create({
				title: "Oops, there are some problems with your barcode",
				message: "The barcode you scanned is not Valid ISBN barcode.",
				enableBackdropDismiss: false,
				buttons: [{ text: 'Ok' }]
			}).present();
			return;
		}

		this.image = result;
		let modal = this.modalCtrl.create('CreateNewPage', {
			title: title,
			coverUrl: this.image,
			author: author,
			pages: pages,
			data: data,
			isCreate: isCreate
		});
		modal.onDidDismiss(data => {
			if (data == 'cancel') {
				this.returnTake();
			} else {
				let desc = "";
				try {
					desc = this.searchData.createnew.summary;
				} catch (err) {
					console.log(err);
				}
				this.postBook(data.title, null, data.pages, data.author, data.gener, desc);
			}
		});
		modal.present();
		// this.sendEmail(this.missingCode);
		//this.postCoverToMatch(this.missingCode);
	}

	// private postCoverToMatch(code) {
	//   let img = this.image;
	//   this.scanService.postCoverToMatch(code, img)
	// 	.subscribe(data => {
	//     if(data.success) {
	//       if(data.total == "0") {
	//         // no matched
	//         this.sendEmail(code);
	//       } else {
	//         // matched
	//         this.nav.push('MatchBookPage', {
	//           books: data.books,
	//           image: img,
	//           isbn: code
	//         });
	//       }
	//     }
	//   });
	// }

	postBook(title, coverUrl, pages, author, gener, description = "") {
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		var code = this.missingCode;
		this.scanService.sendBookPicture1(code, this.image, title, coverUrl, pages, author, gener, description).subscribe(
			data => {
				loader.dismiss();
				this.goBookDetailById(data.id);
			},
			err => {
				this.utilService.createError(err);
				loader.dismiss();
				this.resumeScan();
			}
		);
	}

	// private sendEmail(code) {
	// 	let loader = this.loading.create({
	// 		content: ""
	// 	});
	// 	loader.present();
	// 	this.scanService.sendBookPicture(code, this.image).subscribe(
	// 		data => {
	// 			loader.dismiss();
	// 			console.log(data);
	// 			if (data.success) {
	// 				this.takenBookId = data.id;
	// 				if (data.metadata) {
	// 					if (data.metadata.alternatives.length > 0) {
	// 						this.matchList = data.metadata.alternatives;
	// 						this.orderMatchList();
	// 						this.istake = false;
	// 						this.iscovermatch = true;
	// 					} else {
	// 						this.goBookDetailById(data.id);
	// 					}
	// 				} else {
	// 					let alert = this.alertCtrl.create({
	// 						title: data.title,
	// 						message: "",
	// 						buttons: [
	// 							{
	// 								text: "Ok",
	// 								role: "cancel"
	// 							}
	// 						]
	// 					});
	// 					alert.present();
	// 				}
	// 			} else {
	// 				let alert = this.alertCtrl.create({
	// 					title: "Unknow Error",
	// 					message: "",
	// 					buttons: [
	// 						{
	// 							text: "Ok",
	// 							role: "cancel"
	// 						}
	// 					]
	// 				});
	// 				alert.present();
	// 			}
	// 		},
	// 		err => {
	// 			this.utilService.createError(err);
	// 			loader.dismiss();
	// 		}
	// 	);
	// }

	selectBook(i, newId) {
		this.newBookId = newId;
		$("#popup_covermatch ion-item").removeClass("selbook");
		if (newId == 0) $("#item__0").addClass("selbook");
		else $("#item_" + i).addClass("selbook");
	}

	goTakePicture() {
		this.iscovermatch = false;
		this.istake = true;
		let myself = this;
		setTimeout(function () {
			myself.createdMoxieCamera();
			myself.startCamera();
		}, 1000);
	}

	continue() {
		var newId = this.newBookId;
		if (newId == 0) {
			this.returnTake();
			this.goBookDetailById(this.takenBookId);
			return;
		}
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.bookService.setNewBookId(this.takenBookId, newId).subscribe(
			data => {
				loader.dismiss();
				console.log(data);
				if (data.success) {
					this.returnTake();
					this.goBookDetailById(this.newBookId);
				}
			},
			err => {
				this.utilService.createError(err);
				loader.dismiss();
			}
		);
	}

	goBookDetailById(bookId) {
		this.bookService.getBookById(bookId).subscribe(data => {
			let book = data.book;
			this.nav.push("BookDetailPage", { book: book });
		});
	}

	orderMatchList() {
		var temp: any;
		for (let i = 0; i < this.matchList.length - 1; i++) {
			for (let j = i + 1; j < this.matchList.length; j++) {
				if (this.matchList[i].score < this.matchList[j].score) {
					temp = this.matchList[i].score;
					this.matchList[i].score = this.matchList[j].score;
					this.matchList[j].score = temp;
				}
			}
		}
	}

	clickoption() {
		if (this.sconfig == "option1") {
			this.locate = false;
			this.drawBoundingBox = true;
			this.frequency = "20";
			this.workers = "2";
			this.halfsample = false;
			this.pachsize = "medium";
			this.barcode_reader = this.getReaderArray(1);
			this.inputStream = "Live";
		} else {
			this.locate = true;
			this.drawBoundingBox = false;
			this.frequency = "10";
			this.workers = "2";
			this.halfsample = false;
			this.pachsize = "large";
			this.barcode_reader = this.getReaderArray(2);
			this.inputStream = "Live";
		}
		this.reset();
	}

	getReaderArray(opt) {
		if (opt == 2) {
			return [
				{
					format: "ean_reader",
					config: {
						supplements: ["ean_5_reader", "ean_2_reader"]
					}
				},
				"ean_reader",
				"upc_reader"
			];
		} else {
			return [
				{
					format: "ean_reader",
					config: {
						supplements: ["ean_5_reader", "ean_2_reader"]
					}
				},
				"ean_reader"
			];
		}
	}

	show5digitsInput(code) {
		let alert = this.alertCtrl.create({
			title: "",
			message:
			"I can't find the second\nTry searching for the title or \n<img src='assets/images/upc-5digits.png'/>\nenter the 5 digits above the smaller right side bar code,\nShow the short code.",
			enableBackdropDismiss: false,
			inputs: [
				{
					name: 'digits',
					type: 'tel',
					placeholder: 'Enter 5 digits'
				}
			],
			buttons: [
				{
					text: "Search",
					role: "cancel",
					handler: data => {
						console.log("XXX ================ searchBook-ISBN === search without 5 digits");
						this.searchBookByCode(code);
					}
				},
				{
					text: "Look Up",
					handler: data => {
						if (data.digits.length == 5) {
							console.log("XXX ================ searchBook-ISBN === search with 5 digits");
							this.searchBookByCode(code + data.digits);
						} else {
							return false;
						}
					}
				}
			]
		});
		alert.present();
	}

	createBook() {
		$("#barcodeReader1").css("display", "none");
		if (this.config.barcodePicker)
			this.config.barcodePicker.pauseScanning();
		this.isCreate = true;
		this.missingCode = "";
		this.takeBookPicture("");
	}

	showOneMore() {
		let alert = this.alertCtrl.create({
			title: "Trying one more time...",
			message: "",
			enableBackdropDismiss: false,
			buttons: [
				{
					text: "Ok",
					handler: data => {
						this.resumeScan();
					}
				}
			]
		});
		clearTimeout(this.mytimer);
		this.mytimer = setTimeout(() => {
			alert.present();
		}, 500);
		/*
    let toast = this.toastCtrl.create({
      message: "Trying one more time...",
      duration: 3000,
      position: 'middle'
    })
    toast.onDidDismiss(() => {
      tt.config.barcodePicker.resumeScanning();
    })
    toast.present();
    */
	}

	private searchBook(pre, code, upcCount = 0) {
		$("#barcodeReader1").css("display", "none");
		// this.config.barcodePicker.pauseScanning();
		var tt = this;
		//================= UPCA barcode detection BEGIN =================
		if (pre == "UPCA") {
			let alert = null;
			if (upcCount == 1) {
				tt.searchBookByCode(code, pre);
			} else if (upcCount == 3) {
				//===== first 3 times detection
				alert = this.alertCtrl.create({
					title: "Older Barcode Detected!",
					message: "Move camera closer to your book and scan again.",
					enableBackdropDismiss: false,
					buttons: [
						{
							text: "Ok",
							role: "cancel",
							handler: data => {
								this.resumeScan();
							}
						}
					]
				});
			} else if (upcCount == 6) {
				//===== second 3times detection
				alert = this.alertCtrl.create({
					title: "What type of bar code",
					message:
					"Does your barcode look like this?",
					enableBackdropDismiss: false,
					buttons: [
						{
							text: "One barcode",
							role: "cancel",
							handler: data => {
								console.log("XXX ================ searchBook-ISBN === when click One barcode");
								tt.searchBookByCode(code);
							}
						},
						{
							text: "Two barcodes",
							role: "cancel",
							handler: data => {
								// tt.showOneMore();
								tt.show5digitsInput(code);
							}
						}
					]
				});
			} else if (upcCount > 6) {
				alert = null;
				console.log("XXX ================ searchBook-ISBN === upc code");
				tt.searchBookByCode(code);
			}
			if (alert != null) {
				clearTimeout(this.mytimer);
				this.mytimer = setTimeout(() => {
					alert.present();
				}, 500);
				return;
			}
		} else {
			console.log("XXX ================ searchBook-ISBN === not upc code");
			tt.searchBookByCode(code);
		}
		/*
    if(!(this.scanService.isValidISBN(code))){
      let alert = this.alertCtrl.create({
        title: "Oops, there are some problems with your barcode",
        message: "The barcode you scanned is not Valid ISBN barcode.",
        enableBackdropDismiss: false,
        buttons: [{
          text: 'Ok',
          handler:()=>{
            this.config.barcodePicker.resumeScanning();
          }}
        ]
      });
      alert.present();
      return;
    }

    let loader = this.loading.create({
      content: '',
    });
    loader.present();
    this.scanService.searchBook(code)
  	.subscribe(data => {
      loader.dismiss();
  	  let books = data.books;
  	  if(books.length > 0) {
        this.nav.push(BookDetailPage, {book: books[0]});
      } else {
        let alert = this.alertCtrl.create({
          title: "The hamsters are stumped!",
          message: "We don't have this copy of your book yet! If you take a photo of the cover for us, we will try to add it to the MoxieReader database.",
          enableBackdropDismiss: false,
          inputs: [
            {
              name: 'code',
              placeholder: 'Enter ISBN',
              type: 'tel',
              value: code
            }
          ],
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
              handler: data => {
                this.config.barcodePicker.resumeScanning();
              }
            },
            {
            text: 'Take Photo',
            handler: data => {
              this.takeBookPicture(data.code);
            }}
          ]
        });
        alert.present();
      }
  	}, err => {
      loader.dismiss();
    });
    */
	}

	searchBookByCode(code, pre='') {
		console.log("XXX=========== searchBook by ISBN in function --- actually call ---", code);
		//============== search book from API BEGIN ==============
		var tt = this;
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.scanService.searchBook(code).subscribe(data => {
			loader.dismiss();
			let books = data.books;
			if (books.length > 0) {
				if (this.config.mode === "teacher" || this.config.mode === "class") {
					this.nav.push("BookDetailPage", { book: books[0] });
				} else {
					let modal;
					let cbook = this.checkCurrentReadingBook(books[0]);
					console.log("============================");
					console.log(books[0]);
					console.log("============================cbook=====");
					console.log(cbook);
					if (cbook != null) {
						modal = this.modalCtrl.create("BookLoggingPage", {
							bookid: cbook.book.id,
							book: cbook,
							isCurrentReading: true
						});
					} else {
						modal = this.modalCtrl.create("BookDetailPage", { book: books[0] });
					}
					tt.view.dismiss();
					modal.present();
				}
			} else {
				if (pre != "UPCA") {
					this.missingCode = code;
					this.checkCreateNew(data);
				}
			}
		},
		err => {
			loader.dismiss();
			// this.utilService.createError(err);
		});
		//============== search book from API END ==============
	}

	missingBarcode(code) {
		let alert = this.alertCtrl.create({
			title: "hamsters are stumped!",
			message:
			"We don't have this copy of your book yet! If you take a photo of the cover for us, we will try to add it to the MoxieReader database.",
			enableBackdropDismiss: false,
			inputs: [
				{
					name: "code",
					placeholder: "Enter ISBN",
					type: "tel",
					value: code
				}
			],
			buttons: [
				{
					text: "Cancel",
					role: "cancel",
					handler: data => {
						this.resumeScan();
					}
				},
				{
					text: "Take Photo",
					handler: data => {
						//this.scanner.start();
						this.takeBookPicture(data.code);
					}
				}
			]
		});

		clearTimeout(this.mytimer);
		this.mytimer = setTimeout(() => {
			alert.present();
		}, 500);
	}

	resumeScan() {
		$("#barcodeReader1").css("display", "block");
		this.firstScannerLoad = false;
		// this.ionViewDidEnter();
		setTimeout(() => {
			this.startScan();
		}, 1000);
	}

	checkCurrentReadingBook(book) {
		console.log("=========== homedata ==========");
		console.log(this.homeData);
		for (let i = 0; i < this.homeData.students.length; i++) {
			let data = this.homeData.students[i];
			if (data.currentBooks != null) {
				for (let j = 0; j < data.currentBooks.length; j++) {
					let bookid = data.currentBooks[j].book_id;
					if (bookid == book.id) {
						return data.currentBooks[j];
					}
				}
			}
		}
		return null;
	}

	takeBookPicture(code) {
		this.missingCode = code;
		this.istake = true;
		let myself = this;
		setTimeout(function () {
			myself.createdMoxieCamera();
			myself.startCamera();
		}, 1000);
	}

	returnTake() {
		this.istake = false;
		this.iscovermatch = false;
		this.destroyCamera();
		$("#barcodeReader1").css("display", "block");
		this.resumeScan();
	}

	//=========== button click functions =========
	reset() {
		$("#barcodeResults").html("");
		$("#detectCode").html("");
		$("#div_range_value").css("width", "0px");
		this.aryCode = [];
		this.codeCounts = {};
		this.detectCount = 0;

		clearTimeout(this.mytimer);

		this.destoryScan();

		setTimeout(() => {
			this.startScan();
		}, 1000);

		this.issetting = false;
	}
	gosearch() {
		this.destoryScan();
		this.nav.push("SearchBookPage");
	}
	onsetting() {
		if (this.issetting) this.issetting = false;
		else this.issetting = true;
	}
	onmatchbook() {
		//this.matchList = [{id: '11817908-2cc2-4ca2-9bcf-a143486596cc', 'score': 700}, {id: '2bf29024-a25d-4d09-a747-ff5df6a35292', 'score': 800}];
		this.istake = true;
		this.missingCode = "";
		this.istake = true;
		let myself = this;
		$("#barcodeReader1").css("display", "none");
		this.config.barcodePicker.pauseScanning();
		setTimeout(function () {
			myself.createdMoxieCamera();
			myself.startCamera();
		}, 1000);
		/*
    let alert = this.alertCtrl.create({
      title: "Coming soon",
      message: "",
      enableBackdropDismiss: false,
      buttons: [{
        text: 'Ok',
        handler:()=>{

        }}
      ]
    });
    alert.present();
    */
	}
	//=========== ====================== =========
}
