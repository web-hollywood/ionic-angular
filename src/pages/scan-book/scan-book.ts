import { Component, NgZone, ViewChild } from "@angular/core";
import {
	Content,
	Events,
	NavController,
	Platform,
	ViewController,
	ModalController,
	AlertController,
	LoadingController,
	NavParams
} from "ionic-angular";

import { Scanner } from "../../providers/scanner";
import { Enums } from "../../providers/enums";

import { Camera } from "@ionic-native/camera";
import { ScanService } from "../../providers/scan-service";
import { UtilService } from "../../providers/util-service";
import { BookService } from "../../providers/book-service";
import { Config } from "../../providers/config";

import { IonicPage } from "ionic-angular";

@IonicPage()
@Component({
	selector: "page-scan-book",
	templateUrl: "scan-book.html"
})
export class ScanBookPage {
	@ViewChild(Content) content: Content;

	public isScanning: boolean;
	public scannedCodes;

	public scannerPlaceholderHeight = "200px";

	private onScanHandler: Function;
	private onStateChangeHandler: Function;

	private shouldBeScanning: boolean;

	private ScannerState;

	private image: string;
	private mt = "-10px";

	private codes = [];
	private homeData: any;

	private mytimer: any; //== timer for alert
	private mytimer1: any; //== timer for restartScanner
	private mytimer2: any; //== timer for search

	private missingCode;

	bookCreate_condition = 0; // 0 : createnew+coverURL, 1: createnew + no coverURL, 2: no createNew
	searchData: any;
	isCreate = false;

	constructor(
		private zone: NgZone,
		private platform: Platform,
		private events: Events,
		private nav: NavController,
		private view: ViewController,
		public loading: LoadingController,
		private scanner: Scanner,
		public config: Config,
		private enums: Enums,
		private scanService: ScanService,
		private modalCtrl: ModalController,
		public utilService: UtilService,
		public navParams: NavParams,
		private alertCtrl: AlertController,
		public bookService: BookService,
		public camera: Camera
	) {
		this.homeData = navParams.get("homeData");

		this.ScannerState = this.enums.ScannerState;
		this.onScanHandler = session => {
			this.handleScan(session);
		};

		this.onStateChangeHandler = state => {
			this.handleStateChange(state);
		};

		this.isScanning = false;

		if (platform.is("ios")) {
			this.mt = "0px";
		}
	}

	public ionViewWillEnter(): void {
		console.log("Scan - ionViewWillEnter");
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		setTimeout(() => {
			loader.dismiss();
		}, 1500);
		this.subscribe();
		if (this.config.mode === "teacher" || this.config.mode === "class") {
			//this.nav.pop(BookDetailPage);
		}
	}

	public ionViewDidEnter(): void {
		console.log("Scan - ionViewDidEnter");
		this.shouldBeScanning = true;
		this.startScanner();
		this.setScannerConstraints();
		this.codes = [];
	}

	public ionViewWillLeave(): void {
		console.log("scan - ionViewWillLeave");
		this.shouldBeScanning = false;
		this.unsubscribe();
		this.scanner.stop();
		this.scanner.cancel();
	}

	cancel() {
		this.ionViewWillLeave();
		setTimeout(() => {
			this.view.dismiss();
		}, 1000);
	}

	public continueScanning(): void {
		this.setScannedCodes(undefined);
		this.scanner.resume();
	}

	private subscribe(): void {
		this.events.subscribe(this.scanner.event.scan, this.onScanHandler);
		this.events.subscribe(
			this.scanner.event.stateChange,
			this.onStateChangeHandler
		);
	}

	private unsubscribe(): void {
		this.events.unsubscribe(this.scanner.event.scan, this.onScanHandler);
		this.events.unsubscribe(
			this.scanner.event.stateChange,
			this.onStateChangeHandler
		);
	}

	private startScanner(): void {
		const checkScannerIsActive = () => {
			setTimeout(() => {
				console.log(this.shouldBeScanning + "---" + this.scanner.isStopped());
				if (this.shouldBeScanning && this.scanner.isStopped()) {
					if (this.platform.is("android")) {
					} else {
						// this.startScanner();
					}
					console.log(
						"expected scanner state to be active, starting scanner again..."
					);
					// this could happen e.g. when when stop/start is called quickly after each other, such as when changing tabs quickly
				}
			}, 1000);
		};

		this.setScannedCodes(undefined);
		this.setScannerConstraints();

		this.scanner.start();

		checkScannerIsActive();
	}

	private setScannerConstraints(): void {
		const top = this.content.contentTop;
		if (top === undefined) {
			setTimeout(this.setScannerConstraints.bind(this), 500);
		}

		const topConstraint = top || 0;
		const rightConstraint = 0;
		const bottomConstraint = "50%";
		const leftConstraint = 0;

		this.scannerPlaceholderHeight = `calc(50vh - ${top}px)`;

		this.scanner.setConstraints(
			topConstraint,
			rightConstraint,
			bottomConstraint,
			leftConstraint
		);
		this.scanner.clampActiveScanningArea();
	}

	private handleScan(session): void {
		this.setScannedCodes(session.newlyRecognizedCodes);
		//this.scanner.sstop();
	}

	private setScannedCodes(codes: any[]): void {
		this.scanner.stop();
		this.zone.run(() => {
			// this.scanner.pause();
			this.scannedCodes = codes;
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
			//result = otherCode + addOnCode;
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
					console.log("XXX==== searchBook()===UPCA3");
					this.searchBook("UPCA", result, 3);
				}
				if (count == 6) {
					console.log("XXX==== searchBook()===UPCA6");
					this.searchBook("UPCA", result, 6);
					this.codes = this.codes.filter(function (a) {
						return a != result;
					});
				}
			}

			if (result != "" && !oneupc) {
				if (findBook) {
					console.log("XXX==== searchBook()===normal");
					this.searchBook("", result);
				} else {
					console.log("XXX==== searchBook()===UPCA0");
					this.searchBook("UPCA", result, 0);
				}
			} else {
				if (count != 3 && count != 6) {
					this.scanner.resume();
					this.restartScanner();
				}
			}
		});
	}

	private restartScanner() {
		let tt = this;
		clearTimeout(this.mytimer1);
		this.mytimer1 = setTimeout(() => {
			tt.scanner.start();
		}, 500);
	}

	private searchBook(pre, code, upcCount = 0) {
		this.scanner.stop();
		console.log("fired - search book");
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
								tt.restartScanner();
							}
						}
					]
				});
			} else if (upcCount >= 6) {
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
			clearTimeout(this.mytimer2);
			this.mytimer2 = setTimeout(() => {
				tt.searchBookByCode(code);
			}, 500);
		}
		//================= UPCA barcode detection END =================


	}

	createBook() {
		this.isCreate = true;
		this.missingCode = "";
		this.scanner.stop();
		let alert = this.alertCtrl.create({
			title: "Take Picture",
			message: "Please enter ISBN.",
			enableBackdropDismiss: false,
			inputs: [
				{
					name: 'code',
					type: 'tel',
					placeholder: 'ISBN'
				}
			],
			buttons: [
				{
					text: "Cancel",
					role: "cancel",
					handler: data => {
						this.restartScanner();
					}
				},
				{
					text: "Take picture",
					handler: data => {
						this.takeBookPicture(data.code);
					}
				}
			]
		});
		alert.present();
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
								this.restartScanner();
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
						this.alertCtrl.create({
							title: "Found book",
							message: "Take a picture the whole book cover, so it fills the picture.",
							enableBackdropDismiss: false,
							buttons: [
								{
									text: 'Ok',
									handler: () => {
										this.takeBookPicture(code);
									}
								}
							]
						}).present();
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

	searchBookByCode(code, pre='') {
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
				// this.missingBarcode(code);
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
		this.scanner.stop();

		let alert = this.alertCtrl.create({
			title: "Add Cover Photo!",
			message:
			"We don't have this book yet! Take a photo of the front cover and we will try to add it to the MoxieReader database.",
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
						this.scanner.start();
					}
				},
				{
					text: "Take Cover Photo",
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

	private handleStateChange(state): void {
		this.zone.run(() => {
			this.isScanning = state === this.ScannerState.active;
		});
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
						this.searchBookByCode(code);
					}
				},
				{
					text: "Look Up",
					handler: data => {
						if (data.digits.length == 5) {
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

	private takeBookPicture(code) {
		this.missingCode = code;
		if (!this.scanService.isValidISBN(code)) {
			this.alertCtrl.create({
				title: "Oops, there are some problems with your barcode",
				message: "The barcode you scanned is not Valid ISBN barcode.",
				enableBackdropDismiss: false,
				buttons: [
					{
						text: 'Ok',
						handler: () => {
							this.restartScanner();
						}
					}
				]
			}).present();
			return;
		}
		var sourceType = this.camera.PictureSourceType.CAMERA;
		var options = {
			quality: 80,
			allowEdit: false,
			destinationType: this.camera.DestinationType.DATA_URL,
			sourceType: sourceType,
			saveToPhotoAlbum: false,
			encodingType: this.camera.EncodingType.JPEG,
			targetWidth: 300,
			targetHeight: 400
		};
		this.camera.getPicture(options).then(
			imagePath => {
				this.image = "data:image/JPEG;base64," + imagePath;
				if (this.isCreate) {
					this.callbackFnCamera1(this.image);
				} else {
					this.callbackFnCamera(this.image);
				}
			},
			err => {
				// this.utilService.createError(err);
				this.restartScanner();
				console.log(err);
			}
		);
	}

	callbackFnCamera1(result) {
		var code = this.missingCode;
		if (this.isCreate) {
			var code = this.missingCode;
			this.scanService.searchBook(code).subscribe(data => {
				this.searchData = data;
				let books = data.books;
				if (books.length > 0) {
					this.alertCtrl.create({
						title: "Good news",
						message: "We found your ISBN, scan or print a barcode for this book.",
						enableBackdropDismiss: false,
						buttons: [
							{
								text: 'Ok',
								handler: () => {
									this.restartScanner();
									// this.nav.push("BookDetailPage", { book: books[0] });
								}
							}
						]
					}).present();
				} else {
					this.callbackFnCamera(result);
				}
			});
		}
	}
	callbackFnCamera(result) {
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
				this.restartScanner();
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
	}

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
				// this.utilService.createError(err);
				loader.dismiss();
				this.restartScanner();
			}
		);
	}

	// private postBookNormal(code) {
	// 	var sourceType = this.camera.PictureSourceType.CAMERA;
	// 	var options = {
	// 		quality: 80,
	// 		allowEdit: false,
	// 		destinationType: this.camera.DestinationType.DATA_URL,
	// 		sourceType: sourceType,
	// 		saveToPhotoAlbum: false,
	// 		encodingType: this.camera.EncodingType.JPEG,
	// 		targetWidth: 300,
	// 		targetHeight: 400
	// 	};

	// 	// Get the data of an image
	// 	this.camera.getPicture(options).then(
	// 		imagePath => {
	// 			this.image = "data:image/JPEG;base64," + imagePath;
	// 			let title = "";
	// 			let author = "";
	// 			let pages = "";
	// 			let data = this.searchData;

	// 			if (this.bookCreate_condition == 1) {
	// 				title = this.searchData.createnew.title;
	// 				author = this.searchData.createnew.author;
	// 				pages = this.searchData.createnew.pages;
	// 			}
	// 			let modal = this.modalCtrl.create('CreateNewPage', {
	// 				title: title,
	// 				coverUrl: this.image,
	// 				author: author,
	// 				pages: pages,
	// 				data: data
	// 			});
	// 			modal.onDidDismiss(data => {
	// 				if (data == 'cancel') {
	// 					this.restartScanner();
	// 				} else {
	// 					this.postBook(data.title, null, data.pages, data.author, data.gener);
	// 				}
	// 			});
	// 			modal.present();
	// 			// this.postBook(this.postBookData.title, null, this.postBookData.pages, this.postBookData.author);
	// 		},
	// 		err => {
	// 			this.utilService.createError(err);
	// 			console.log(err);
	// 		}
	// 	);

	// 	//this.scanner.start();
	// }

	// private postCoverToMatch(code) {
	// 	console.log(code);

	// 	this.sendEmail(code);
	// 	/*let img = this.image;
    // this.scanService.postCoverToMatch(code, img)
  	// .subscribe(data => { console.log(data);
    //   if(data.success) {
    //     if(data.total == "0") {
    //       // no matched 
    //       this.sendEmail(code);
    //     } else {
    //       // matched 
    //       this.nav.push(MatchBookPage, {
    //         books: data.books, 
    //         image: img, 
    //         isbn: code
    //       });
    //     }
    //   }
    // });*/
	// }

	// private sendEmail(code) {
	// 	let loader = this.loading.create({
	// 		content: ""
	// 	});
	// 	loader.present();
	// 	this.scanService.sendBookPicture(code, this.image).subscribe(
	// 		data => {
	// 			loader.dismiss();
	// 			if (data.success) {
	// 				this.goBookDetail(code);
	// 			}
	// 		},
	// 		err => {
	// 			this.utilService.createError(err);
	// 			loader.dismiss();
	// 		}
	// 	);
	// }

	goBookDetailById(bookId) {
		this.bookService.getBookById(bookId).subscribe(data => {
			let book = data.book;
			this.nav.push("BookDetailPage", { book: book });
		});
	}

	goBookDetail(code) {
		let tt = this;
		this.scanService.searchBook(code).subscribe(data => {
			let books = data.books;
			if (books.length > 0) {
				if (this.config.mode === "teacher" || this.config.mode === "class") {
					this.nav.push("BookDetailPage", { book: books[0] });
				} else {
					let modal;
					modal = this.modalCtrl.create("BookDetailPage", { book: books[0] });
					tt.view.dismiss();
					modal.present();
				}
			} else {
				this.utilService.createAlert(
					"opps, Lost my place",
					"We hasd a problem displaying this book."
				);
				this.restartScanner();
			}
		},
			err => {
				this.utilService.createError(err);
			});
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

	//=========== button click functions =========
	reset() {
		//this.startScanner();
		this.codes = [];
		this.scanner.stop();
		this.startScanner();
	}
	gosearch() {
		this.nav.push("SearchBookPage");
	}
	//=========== ====================== =========
}
