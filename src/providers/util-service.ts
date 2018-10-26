import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { ToastController, AlertController } from "ionic-angular";

import * as $ from "jquery";
@Injectable()
export class UtilService {
	constructor(
		public http: Http,
		public toastCtrl: ToastController,
		public alertCtrl: AlertController
	) {
		console.log("Hello UtilService Provider");
	}

	createToast(message, position = "top", duration = 5000) {
		this.toastCtrl
			.create({
				message: message,
				position: position,
				cssClass: "green-toast-with-white-text animated bounceInRight",
				duration: duration
			})
			.present();
		setTimeout(function() {
			let n = Math.floor(Math.random() * 6);
			console.log(n);
			$(".toast-message").addClass("toast-message-" + n);
		}, 10);
	}

	createAlert(title, message) {
		let alert: any = this.alertCtrl.create({
			title: title,
			message: message,
			buttons: [
				{
					text: "OK",
					handler: () => {
						//alert.dismiss();
					}
				}
			]
		});
		alert.present();
	}
	
	createError(err) {
		this.createAlert("Error", JSON.stringify(err));
	}

	createAlertTimeout(okCallback = null, cancelCallback = null) {
		let alert = this.alertCtrl.create({
			title: "I'm having connection trouble.",
			message: "",
			enableBackdropDismiss: false,
			buttons: [
				{
					text: "Cancel",
					role: "cancel",
					handler: () => {
						if (cancelCallback != null) cancelCallback();
					}
				},
				{
					text: "Try again",
					handler: () => {
						if (okCallback != null) okCallback();
					}
				}
			]
		});
		alert.present();
	}
}
