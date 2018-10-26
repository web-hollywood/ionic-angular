import { Component, ViewChild, ElementRef } from "@angular/core";
import {
	NavController,
	NavParams,
	ViewController,
	Events,
	AlertController,
	LoadingController,
	Platform
} from "ionic-angular";
import { Config } from "../../providers/config";
import { UtilService } from "../../providers/util-service";
import { EventsService } from "../../providers/events-service";
import { BookService } from "../../providers/book-service";
import { Camera } from "@ionic-native/camera";
import { IonicPage } from "ionic-angular";

import * as $ from "jquery";
declare var JpegCamera: any;

@IonicPage()
@Component({
	selector: "page-review",
	templateUrl: "review.html"
})
export class ReviewPage {
	rating = 0;
	review = "";
	book = null;
	data = null;
	ricon = [];
	reaction = "happy";
	isReaction = false;
	bookEvent = [];
	reviewList = [];
	title = "Write";
	studentId: any;
	eventData: any;

	private istake = false;
	private imageHeight = 400;
	private imageWidth = 300;
	private cameraHeight = 400;
	private cameraWidth = 300;
	private cameraWeb = null;
	private snapshot: any;
	public picture: any;
	public eventId: any;
	public readonly = false;
	image: any;

	istouch = false;
	photoChangeTitle = "Add photo";
	@ViewChild('fileInp') fileInput: ElementRef;

	constructor(
		public navCtrl: NavController,
		public platform: Platform,
		public utilService: UtilService,
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public events: Events,
		public eventsService: EventsService,
		public loading: LoadingController,
		public bookService: BookService,
		public config: Config,
		private alertCtrl: AlertController,
		public camera: Camera
	) {
		this.studentId = navParams.get("studentId");
		this.book = navParams.get("book");
		if (this.config.mode == 'class') {
			this.readonly = navParams.get("readonly");
		}

		if (!this.studentId || this.studentId == undefined) {
			this.studentId = this.config.student_id;
		} 

		console.log(this.studentId);
		console.log(this.book);
		//this.book = this.data.book;

		this.ricon.push({ icon: "happy", text: "Happy" });
		this.ricon.push({ icon: "sad", text: "Sad" });
		//this.ricon.push({icon:'wow', text:'Wow'});
		this.ricon.push({ icon: "bored", text: "Bored" });
		this.ricon.push({ icon: "scared", text: "Scared" });
		this.ricon.push({ icon: "love", text: "Love" });
		this.ricon.push({ icon: "funny", text: "Funny" });
		this.ricon.push({ icon: "angry", text: "Angry" });
		//this.ricon.push({icon:'difficult', text:'Difficult'});
		//this.ricon.push({icon:'easy', text:'Easy'});
	}

	ionViewWillEnter() {
		this.picture = null;

		this.bookService.getBook(this.book.id, this.studentId).subscribe(data => {
			this.bookEvent = data.events;
			this.reviewList = [];
			for (let i in this.bookEvent) {
				if (this.bookEvent[i].event_type == "review" && this.bookEvent[i].student_id == this.studentId) {
					this.reviewList.push(this.bookEvent[i]);
				}
			}
			for (let i=0; i<this.reviewList.length; i++) {
				let re = this.reviewList[i];
				if (re.student_id == this.studentId) {
					this.eventData = re;
					if (re.files && re.files.length > 0) {
						this.image = this.config.defaultApiURL + '/event/' + re.id + '/file/' + re.files[re.files.length-1].filename;
					}
					this.reaction = re.reaction;
					this.rating = re.rating;
					this.review = re.review;
					this.starClicked(this.rating);
					if (this.reaction && this.reaction != "") {
						$("#reaction img").attr(
							"src",
							"assets/images/reaction_" + this.reaction + ".png"
						);
						$("#reaction span").html(this.reaction);
					}

					this.title = "Edit";

					if (re.files && re.files.length > 0) {
						this.photoChangeTitle = "Change photo";
					}
				}
			}
		});
	}

	ionViewDidLoad() {
		var tt = this;
		var istouch = false;
		if (this.platform.is("cordova") && document.getElementById("ritem1")) {
			document.removeEventListener("touchmove", function (e) { });
			document.removeEventListener("touchend", function (e) { });
			document.addEventListener(
				"touchmove",
				function (e) {
					if (e.touches.length == 1) {
						var x = e.changedTouches[0].pageX;
						var y = e.changedTouches[0].pageY;
						if (y > 250 && y < 290) {
							istouch = true;
							var w = $("page-review").width();
							var left = document.getElementById("ritem1").offsetLeft;
							if (w > 320) {
								left = (w - 286) / 2;
							}
							var idx = Math.floor((x - left) / 40);

							tt.reaction = tt.ricon[idx].icon;
							$("#reaction img").attr(
								"src",
								"assets/images/reaction_" + tt.ricon[idx].icon + ".png"
							);
							$("#reaction span").html(tt.ricon[idx].icon);

							$(".reaction_item").removeClass("sel");
							if (idx >= 0 && idx < 7) {
								$("#ritem" + idx).addClass("sel");
							}
						}
						//console.log(left+'--'+idx+':::'+x+'---'+y);
					}
				},
				false
			);
			document.addEventListener("touchend", function (e) {
				if (istouch) {
					istouch = false;
					tt.isReaction = false;
					$(".reaction_item").removeClass("sel");
					$("#div_reaction").fadeOut("fast");
					//tt.reaction = tt.ricon[idx].icon;
				}
			});
		} else {
			setTimeout(() => {
				console.log("review-web");
				// if (!$(".reaction_item").hasClass("web"))
				// 	$(".reaction_item").addClass("web");
			}, 500);
			$('#div_reaction').unbind("mousemove");
			$('#div_reaction').mousemove(function (e) {
				let x = (e.pageX - $(this).offset().left);
				let y = e.pageY - $(this).offset().top;
				var idx = Math.floor((x - 0) / 40);
				$(".reaction_item").removeClass("sel");
				if (y >= 0 && y <= 40) {
					if (idx >= 0 && idx < 7) {
						$("#ritem" + idx).addClass("sel");
					}
				}
			});
		}
	}

	done() {
		this.viewCtrl.dismiss();
	}

	cancel() {
		this.viewCtrl.dismiss({data: "1"});
	}

	starClicked(ev) {
		this.rating = ev;
		$("ul.rating li ion-icon").removeClass("sel");
		for (let i = 1; i <= ev; i++) {
			$("ul.rating li:nth-child(" + i + ")")
				.find("ion-icon")
				.addClass("sel");
		}
	}

	openReaction() {
		if (this.readonly) return;
		this.isReaction = !this.isReaction;
		if (this.platform.is("cordova")) {
		} else {
			/*
            if(this.isReaction) {
                setTimeout(()=> {
                    $('.reaction_item').addClass('web');
                }, 1500);
            }*/
		}
		if (this.isReaction) $("#div_reaction").fadeIn("fast");
		else $("#div_reaction").fadeOut("fast");
	}

	click_reaction(i) {
		this.reaction = this.ricon[i].icon;
		this.isReaction = false;
		$("#div_reaction").fadeOut("fast");
		$("#reaction img").attr(
			"src",
			"assets/images/reaction_" + this.ricon[i].icon + ".png"
		);
		$("#reaction span").html(this.ricon[i].icon);
	}

	addFile() {
		this.fileInput.nativeElement.click();
	}
	setFileImage(event) { 
		var file    = event.srcElement.files[0];
		var reader  = new FileReader();
		var limitFileSize = 2.5 * 1024 * 1024;
		if (file.type == "image/jpeg" || file.type == "image/png") {
			if (file.size > limitFileSize && !this.platform.is('ios') && !this.platform.is('android')) {
				alert("You can select only file less than 2.5MB.");
			} else {
				var tt = this;
				reader.addEventListener("load", function () {
					tt.image = reader.result;
					tt.picture = tt.image;
				}, false);
			
				if (file) {
					reader.readAsDataURL(file);
				}
			}
		} else {
			alert("You can select only image file.");
		}
	}

	removePhoto() {
		let eventId = "";
		if (this.reviewList.length > 0) {
			eventId = this.reviewList[0].id;
			let review = this.reviewList[0];
			let loader = this.loading.create({
				content: ""
			});
			loader.present();
			for (let i=0; i<review.files.length; i++) {
				let filename = review.files[i].filename;
				if (filename) {
					this.eventsService.removeFileFromEvent(eventId, filename).subscribe(
						data => {
							this.image = '';
						},
						err => {
						}
					);
				}
			}
			setTimeout(() => {
				loader.dismiss();
			}, 1000);
		}
	}

	save() {
		let studentId = this.studentId;
		let bookId = this.book.id;
		let eventId = "";
		if (this.reviewList.length > 0) eventId = this.reviewList[0].id;
		
		let loader = this.loading.create({
			content: ""
		});
		loader.present();

		if (eventId == "") {
			let data = {
				event_type: "review",
				student_id: studentId,
				book_id: bookId,
				rating: this.rating,
				reaction: this.reaction,
				review: this.review
			};

			this.eventsService.createEvent(data).subscribe(
				data => {
					let message = "Your review was added in this book.";
					this.utilService.createToast(message);
					this.eventId = data.id;
					this.uploadPicture();
					this.cancel();
					loader.dismiss();
				},
				err => {
					loader.dismiss();
				}
			);
		} else {
			/*  get eventid from log 
            if(eventId == "") {
                for(let i=0; i<this.data.events.length; i++) {
                    if(this.data.events[i].event_type == 'log') {
                        eventId = this.data.events[i].id;
                        break;
                    }
                }
            }
            */
			let data = {
				rating: this.rating,
				reaction: this.reaction,
				review: this.review
			};

			this.eventsService.updateEvent(eventId, data).subscribe(
				data => {
					let message = "Your review was updated in this book.";
					this.utilService.createToast(message);
					this.eventId = eventId;
					this.uploadPicture();
					this.cancel();
					loader.dismiss();
				},
				err => {
					loader.dismiss();
				}
			);
		}
	}

	deleteReview() {
		let alert = this.alertCtrl.create({
			title: "Are you sure to delete this review?",
			message: "",
			enableBackdropDismiss: false,
			buttons: [
				{
					text: "Cancel",
					role: "cancel",
					handler: data => { }
				},
				{
					text: "Yes",
					role: "cancel",
					handler: data => {
						let re = this.reviewList[0];
						let loader = this.loading.create({
							content: ""
						});
						loader.present();
						this.eventsService.deleteEvent(re.id).subscribe(
							data => {
								loader.dismiss();
								this.cancel();
							},
							err => {
								loader.dismiss();
							}
						);
					}
				}
			]
		});
		alert.present();
	}

	addPhoto() {
		if (this.platform.is('ios') || this.platform.is('android')) {
			this.takePhotoMobile();
		} else {
			this.istake = true;
			let myself = this;
			setTimeout(function () {
				myself.createdMoxieCamera();
				myself.startCamera();
			}, 1000);
		}
	}

	takePhotoMobile() {
		var sourceType = this.camera.PictureSourceType.CAMERA;
		var options = {
			quality: 80,
			allowEdit: false,
			destinationType: this.camera.DestinationType.DATA_URL,
			sourceType: sourceType,
			saveToPhotoAlbum: false,
			encodingType: this.camera.EncodingType.JPEG,
			targetWidth: 768,
			targetHeight: 1024
		};
		this.camera.getPicture(options).then(
			imagePath => {
				this.image = "data:image/JPEG;base64," + imagePath;
				this.callbackFnCamera(this.image);
			},
			err => {
				this.utilService.createError(err);
				console.log(err);
			}
		);
	}

	destroyCamera() {
		if (this.cameraWeb != null) {
			this.cameraWeb.stop();
		}
		$("#cameraReader1").html("");
	}

	createdMoxieCamera() {
		let divSelector = "#cameraReader1";
		this.destroyCamera();

		var $div = $("<div>")
			.attr("id", "cameraDiv1")
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
			.addClass("cameraButton1")
			.text("Take Picture")
			.css(buttonCSS);
		$(divSelector).append($div);

		$div = $("<div>")
			.addClass("retakeCameraButton1")
			.text("Re-take Picture")
			.css(buttonCSS)
			.hide();
		$(divSelector).append($div);

		$div = $("<div>")
			.addClass("sendPhotoButton1")
			.text("Send Picture")
			.css(buttonCSS)
			.hide();
		$(divSelector).append($div);
	}

	startCamera() {
		var myself = this;

		this.cameraWeb = new JpegCamera("#cameraDiv1", {
			mirror: false
		})
			.ready(function () {
				$("div.cameraButton1").on("click", function () {
					myself.snapshot = myself.cameraWeb.capture();
					myself.snapshot.show(); // Display the snapshot
					// $("div.sendPhotoButton").click();
					$("div.retakeCameraButton1").show();
					$("div.sendPhotoButton1").show();
					$("div.cameraButton1").hide();
					// myself.checkCreateNew();
				});

				$("div.sendPhotoButton1").on("click", function () {
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
						myself.callbackFnCamera(data);
					};

					myself.snapshot.get_canvas(fn);
				});

				$("div.retakeCameraButton1").on("click", function () {
					myself.snapshot.discard();
					$("div.sendPhotoButton1").hide();
					$("div.retakeCameraButton1").hide();
					$("div.cameraButton1").show();
				});
			})
			.error(function () {
				alert("Camera access was denied");
			});
	}

	callbackFnCamera(result) {
		// console.log(result);
		this.returnTake();

		this.picture = result;
		// this.uploadPicture(result);		
	}

	uploadPicture() {
		if (!this.picture) return;

		let loader = this.loading.create({
			content: "Uploading picture..."
		});
		loader.present();
		var data = new FormData();
		var filename = new Date().getTime() + ".jpg";
		data.append("file", this.dataURLtoFile(this.picture, new Date().getTime()), filename);
		
		this.eventsService.postFileToEvent(this.eventId, data).subscribe(
			data => {
				loader.dismiss();
			},
			err => {
				loader.dismiss();
			}
		);
	}

	returnTake() {
		this.istake = false;
		this.destroyCamera();
	}

	dataURLtoFile(dataurl, filename) {
		var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
		while(n--){
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], filename, {type:mime});
	}
}
