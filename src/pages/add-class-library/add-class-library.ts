import { Component, NgZone, ViewChild } from "@angular/core";
import {
	Content,
	Events,
	NavController,
	Platform,
	ViewController,
	AlertController,
	ModalController,
	LoadingController
} from "ionic-angular";

import { Scanner } from "../../providers/scanner";
import { Enums } from "../../providers/enums";
import { Config } from "../../providers/config";
import { ClassService } from "../../providers/class-service";
import { TubsService } from "../../providers/tubs-service";

import { ScanService } from "../../providers/scan-service";

import { Camera } from "@ionic-native/camera";
import { IonicPage } from "ionic-angular";

@IonicPage()
@Component({
	selector: "page-add-class-library",
	templateUrl: "add-class-library.html"
})
export class AddClassLibraryPage {
	@ViewChild(Content) content: Content;

	public isScanning: boolean;
	public scannedCodes;

	public scannerPlaceholderHeight = "200px";

	private onScanHandler: Function;
	private onStateChangeHandler: Function;

	private shouldBeScanning: boolean;

	private ScannerState;

	public pending = false;
	public codes = [];
	public bookIds = [];
	public bookList: any;

	private image: string;
	private pt = "0px";
	
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
		private viewCtrl: ViewController,
		public loading: LoadingController,
		private scanner: Scanner,
		private enums: Enums,
		private scanService: ScanService,
		public classService: ClassService,
		public tubsService: TubsService,
		private alertCtrl: AlertController,
		public modalCtrl: ModalController,
		public config: Config,
		public camera: Camera
	) {
		this.ScannerState = this.enums.ScannerState;
		this.onScanHandler = session => {
			this.handleScan(session);
		};

		this.onStateChangeHandler = state => {
			this.handleStateChange(state);
		};

		this.isScanning = false;

		if (platform.is("ios")) {
			this.pt = "10px";
		}
	}

	cancel() {
		this.ionViewWillLeave();
		setTimeout(() => {
			this.viewCtrl.dismiss();
		}, 1000);
	}

	public ionViewWillEnter(): void {
		this.config.gscanner = this.scanner;
		this.subscribe();
		this.getScannedBooks();
	}

	public ionViewDidEnter(): void {
		this.shouldBeScanning = true;
		this.startScanner();
		this.setScannerConstraints();
		this.codes = [];
	}

	public ionViewWillLeave(): void {
		console.log("add my class - ionViewWillLeave");
		this.shouldBeScanning = false;
		this.unsubscribe();
		this.scanner.stop();
		this.scanner.cancel();
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
						this.startScanner();
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

	private handleStateChange(state): void {
		this.zone.run(() => {
			this.isScanning = state === this.ScannerState.active;
		});
	}

	private setScannedCodes(codes: any[]): void {
		this.zone.run(() => {
			this.scanner.stop();
			this.scannedCodes = codes;
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
				if (count == 3) {
					this.searchBook("UPCA", result, 3);
				}
				if (count == 6) {
					this.searchBook("UPCA", result, 6);
					this.codes = this.codes.filter(function(a) {
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
		this.pending = true;
		var tt = this;
		//================= UPCA barcode detection BEGIN =================
		if (pre == "UPCA") {
			let alert = null;
			if (upcCount == 3) {
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

		// let loader = this.loading.create({
		// 	content: ""
		// });
		// loader.present();
		// this.scanService.searchBook(code).subscribe(
		// 	data => {
		// 		this.pending = false;
		// 		let books = data.books;
		// 		if (books.length > 0) {
		// 			let book = books[0];
		// 			if (this.bookIds.indexOf(book.id) < 0) {
		// 				this.bookIds.push(book.id);
		// 				this.addBooksScanList();
		// 			} else {
		// 				tt.restartScanner();
		// 			}
		// 		} else {
		// 			//missing code
		// 			let alert = this.alertCtrl.create({
		// 				title: "hamsters are stumped!",
		// 				message:
		// 					"We don't have this copy of your book yet! If you take a photo of the cover for us, we will try to add it to the MoxieReader database.",
		// 				enableBackdropDismiss: false,
		// 				inputs: [
		// 					{
		// 						name: "code",
		// 						placeholder: "Enter ISBN",
		// 						type: "tel",
		// 						value: code
		// 					}
		// 				],
		// 				buttons: [
		// 					{
		// 						text: "Cancel",
		// 						role: "cancel",
		// 						handler: data => {
		// 							tt.restartScanner();
		// 						}
		// 					},
		// 					{
		// 						text: "Take Photo",
		// 						handler: data => {
		// 							this.takeBookPicture(data.code);
		// 						}
		// 					}
		// 				]
		// 			});
		// 			alert.present();
		// 		}
		// 		loader.dismiss();
		// 	},
		// 	err => {
		// 		loader.dismiss();
		// 	}
		// );
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

	searchBookByCode(code) {
		//============== search book from API BEGIN ==============
		var tt = this;
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.scanService.searchBook(code).subscribe(data => {
			loader.dismiss();
			this.pending = false;
			let books = data.books;
			if (books.length > 0) {
				let book = books[0];
				if (this.bookIds.indexOf(book.id) < 0) {
					this.bookIds.push(book.id);
					this.addBooksScanList();
				} else {
					tt.restartScanner();
				}
			} else {
				// this.missingBarcode(code);
				this.missingCode = code;
				this.checkCreateNew(data);
			}
		},
			err => {
				loader.dismiss();
				// this.utilService.createError(err);
			});
		//============== search book from API END ==============
	}

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

	postBook(title, coverUrl, pages, author, gener, description = "") {
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		var code = this.missingCode;
		this.scanService.sendBookPicture1(code, this.image, title, coverUrl, pages, author, gener, description).subscribe(
			data => {
				loader.dismiss();
				this.goBookDetail(code);
			},
			err => {
				// this.utilService.createError(err);
				loader.dismiss();
				this.restartScanner();
			}
		);
	}

	addBooksScanList() {
		var tt = this;
		this.tubsService.addBooksToScanList(tt.bookIds).subscribe(data => {
			tt.getScannedBooks();
			//tt.bookIds = [];
			//tt.codes = [];
			tt.restartScanner();
		});
	}

	getScannedBooks() {
		this.tubsService.getScannedBooks().subscribe(data => {
			this.bookList = [];
			for (let i = data.books.length - 1; i > -1; i--) {
				let book = data.books[i];
				this.bookList.push(book);
			}
		});
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

	// private takeBookPicture(code) {
	// 	let tt = this;
	// 	let len = code.length;
	// 	if (len == 12 || len == 17) {
	// 	} else {
	// 		if (!this.scanService.isValidISBN(code)) {
	// 			let alert = this.alertCtrl.create({
	// 				title: "Sorry We couldn't find book page",
	// 				message:
	// 					"If you take a photo of the cover for us, we will add this book to the MoxieReader database.",
	// 				enableBackdropDismiss: false,
	// 				buttons: [
	// 					{
	// 						text: "Ok",
	// 						handler: () => {
	// 							tt.restartScanner();
	// 						}
	// 					}
	// 				]
	// 			});
	// 			alert.present();
	// 			return;
	// 		}
	// 	}
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
	// 			this.sendEmail(code);
	// 		},
	// 		err => {
	// 			console.log(err);
	// 		}
	// 	);
	// }

	// private sendEmail(code) {
	// 	let loader = this.loading.create({
	// 		content: ""
	// 	});
	// 	loader.present();
	// 	this.scanService.sendBookPicture(code, this.image).subscribe(
	// 		data => {
	// 			//this.viewCtrl.dismiss();
	// 			loader.dismiss();
	// 			if (data.success) {
	// 				this.goBookDetail(code);
	// 			}
	// 		},
	// 		err => {
	// 			loader.dismiss();
	// 		}
	// 	);
	// }

	goBookDetail(code) {
		var tt = this;
		this.scanService.searchBook(code).subscribe(data => {
			let books = data.books;
			if (books.length > 0) {
				let alert = this.alertCtrl.create({
					title: "Successfully Added",
					message: "",
					enableBackdropDismiss: false,
					buttons: [
						{
							text: "Done",
							role: "cancel",
							handler: () => {
								tt.bookIds.push(books[0].id);
								tt.addBooksScanList();
							}
						},
						{
							text: "Book Detail",
							handler: () => {
								let modal = this.modalCtrl.create("BookDetailPage", {
									book: books[0],
									isDone: true
								});
								modal.onDidDismiss(data => {
									tt.bookIds.push(books[0].id);
									tt.addBooksScanList();
								});
								modal.present();
							}
						}
					]
				});
				alert.present();
				//let modal = this.modalCtrl.create(BookDetailPage, {book: books[0], isDone: true});
				//modal.present();
				//this.nav.push(BookDetailPage, {book: books[0]});
			} else {
				this.restartScanner;
			}
		});
	}

	//=========== button click functions =========
	reset() {
		// this.codes = [];
		this.scanner.stop();
		this.startScanner();
		//this.codes = [];
		//this.bookIds = [];
	}

	onfinished() {
		let class_id = this.classService.classData.class.id;
		let bookIds = [];
		for (let i = 0; i < this.bookList.length; i++) {
			let book = this.bookList[i];
			bookIds.push(book.book_id);
		}

		if (bookIds.length > 0) {
			let modal = this.modalCtrl.create("SelectTubPage", {
				class_id: class_id,
				book_id: "",
				books: bookIds
			});
			this.viewCtrl.dismiss();
			modal.present();
			//this.nav.push(SelectTubPage, {'class_id': class_id, 'book_id': '', 'books': bookIds});
		}
	}

	removeBook(i, bookId) {
		this.scanner.stop();
		let tt = this;
		let alert1 = this.alertCtrl.create({
			title: "Remove book from scanning list",
			message: "Are you sure you want to remove this book?",
			enableBackdropDismiss: false,
			buttons: [
				{
					text: "Cancel",
					role: "cancel",
					handler: data => {
						tt.restartScanner();
					}
				},
				{
					text: "Ok",
					handler: data => {
						tt.restartScanner();
						this.deleteScannedBook(i, bookId);
					}
				}
			]
		});
		alert1.present();
	}

	deleteScannedBook(i, bookId) {
		var tt = this;
		this.tubsService.deleteScanBook(bookId).subscribe(data => {
			tt.codes.splice(i, 1);
			tt.bookIds.splice(i, 1);
			tt.bookList.splice(i, 1);
		});
	}

	//=========== ====================== =========
}
