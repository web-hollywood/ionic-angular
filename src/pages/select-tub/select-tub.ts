import { Component } from "@angular/core";
import {
	NavController,
	NavParams,
	ViewController,
	ModalController,
	LoadingController
} from "ionic-angular";
import { TubsService } from "../../providers/tubs-service";
import { UtilService } from "../../providers/util-service";
import { Config } from "../../providers/config";
import { IonicPage } from "ionic-angular";
@IonicPage()
@Component({
	selector: "page-select-tub",
	templateUrl: "select-tub.html"
})
export class SelectTubPage {
	class_id;
	tubs: Array<any> = [];
	showAdd: boolean = false;
	tubName: string;
	book_id;
	books = [];
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public tubsService: TubsService,
		public modalCtrl: ModalController,
		public loading: LoadingController,
		public utilServive: UtilService,
		public config: Config
	) {
		this.class_id = this.navParams.get("class_id");
		this.book_id = this.navParams.get("book_id");
		if (this.book_id == "") {
			this.books = this.navParams.get("books");
			//alert(JSON.stringify(this.books));
		}

		this.tubsService.getTubsList(this.class_id).subscribe(data => {
			this.tubs = data.tubs;
			this.sort_array();
		});
	}

	ionViewDidLoad() {
		console.log("ionViewDidLoad SelectTubPage");
	}

	switchAdd(condition) {
		this.showAdd = condition;
		console.log(this.showAdd);
	}

	createTub() {
		if (this.tubName) {
			this.tubsService.createTub(this.class_id, this.tubName).subscribe(
				data => {
					console.log("new tub created", data);
					let message = `${this.tubName} is created`;
					this.utilServive.createToast(message);
					this.tubsService.getOneTub(this.class_id, data.id).subscribe(data => {
						this.addToTub(data.tub);
					});
				},
				err => {
					alert("Error : createTub");
				}
			);
		}
	}

	addToTub(tub) {
		if (this.book_id == "") {
			this.addBooksToTub(tub);
		} else {
			let loader = this.loading.create({
				content: ""
			});
			loader.present();
			this.tubsService.addToTub(this.class_id, this.book_id, tub).subscribe(
				data => {
					let message = `A book(s) is added to ${tub.title} Tub`;
					this.utilServive.createToast(message);
					this.viewCtrl.dismiss();

					let modal = this.modalCtrl.create("TubContentList", {
						tub: tub,
						class_id: this.class_id
					});
					modal.present();
					loader.dismiss();
				},
				err => {
					loader.dismiss();
					alert("Error : addToTub");
				}
			);
		}

		//this.navCtrl.push(TubContentList,{tub:tub,class_id: this.class_id});
	}

	addBooksToTub(tub) {
		console.log(tub);
		console.log(this.class_id);
		console.log(this.books);
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.tubsService.addBooksToTub(this.class_id, tub.id, this.books).subscribe(
			data => {
				let message = `Books are added to ${tub.title} Tub`;
				this.utilServive.createToast(message);
				let tt = this;
				setTimeout(function () {
					tt.viewCtrl.dismiss();
				}, 1000);
				let modal = tt.modalCtrl.create("TubContentList", {
					tub: tub,
					class_id: this.class_id
				});
				modal.present();
				loader.dismiss();
			},
			err => {
				loader.dismiss();
				alert("Error : addBooksToTub");
			}
		);
	}

	sort_array() {
		var sortedArray: any[];
		sortedArray = this.tubs;
		sortedArray.sort((obj1, obj2) => {
			if (obj1.updated_at < obj2.updated_at) {
				return 1;
			}

			if (obj1.updated_at > obj2.updated_at) {
				return -1;
			}
			return 0;
		});

		this.tubs = sortedArray;
	}
}
