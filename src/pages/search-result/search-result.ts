import { Component } from "@angular/core";
import { NavController, NavParams, LoadingController, Platform } from "ionic-angular";
import { Config } from "../../providers/config";
import { ClassService } from "../../providers/class-service";
import { BookService } from "../../providers/book-service";
import { IonicPage } from "ionic-angular";
import { Keyboard } from "@ionic-native/keyboard";
import { UtilService } from "../../providers/util-service";

@IonicPage()
@Component({
	selector: "page-search-result",
	templateUrl: "search-result.html"
})
export class SearchResultPage {
	books: any[];
	keyword: string;

	countAtOnce = 50;
	book_list_items: any;
	book_list_start = 0;
	offset = 0;
	limit = 50;

	public data: any;
	public metadata: any;
	public grade = "";
	public grades: any;
	public graderange: any;
	public value: any;
	public quality: any;
	public message = "";

	searchValue: string = "";
	history_items: any[];
	view_Flag: boolean;
	search_items: any[];
	auto_complete_items: any[];
	search_flag: string;
	autoComplete_show: boolean;

	public timer = null;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public classService: ClassService,
		public loading: LoadingController,
		public bookService: BookService,
		public utilService: UtilService,
		public platform: Platform,
		public keyboard: Keyboard,
		public config: Config
	) {
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

		this.data = this.navParams.get("data");
		this.books = this.navParams.get("books");
		this.keyword = this.navParams.get("keyword");
		this.value = this.navParams.get("value");
		this.searchValue = this.value;
		
		if (!this.data.success) {
			this.utilService.createError(this.data);
			return;
		}

		this.updateMetadata();
	}

	updateMetadata() {
		this.metadata = this.data.metadata;

		this.grade = this.metadata.grade;
		if (this.grade == 'all') this.grade = "";
		this.graderange = this.metadata.graderange;
		this.config.qualityValue = this.metadata.quality;

		this.message = "";
		if (this.metadata.messages.length > 0) {
			this.message = this.metadata.messages[0];
			for (let i = 1; i < this.metadata.messages.length; i++) {
				this.message = this.message + ", " + this.metadata.messages[i];
			}
		}
	}

	clickGrade(item) {
		if (this.view_Flag) return;
		if (item) {
			this.grade = item.grade;
		} else {
			this.grade = 'none';
		}
		this.search();
	}

	changeSlider() {
		if (this.timer) clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			console.log("XXX ==== change slider");
			this.search();
		}, 1000)
	}

	itemClick(book_name: string) {
		this.searchValue = book_name;
		this.value = this.searchValue;
		if (this.autoComplete_show == false) this.view_Flag = false;
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.bookService.searchBook(book_name, this.quality, true).subscribe(
			data => {
				this.books = data.books;
				this.view_Flag = false;
				
				this.book_list_items = [];
				this.book_list_start = 0;
				this.offset = 0;

				this.initBookListItems();
				loader.dismiss();

				this.data = data;
				this.updateMetadata();
			},
			err => {
				this.utilService.createError(err);
				loader.dismiss();
			}
		);
	}

	checkBlur() {
		this.autoComplete_show = false;
	}

	searchBook(value) {
		var nativeElement = document.querySelector(".hideDiv2");
		if (nativeElement != null) {
			nativeElement.className = "autocomplete2";
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

	search(val = null) {
		let isInit = false;
		if (val) {
			this.value = val;
			isInit = true;
		}
		let value = this.value;
		this.quality = this.config.quality;
		this.config.grade = this.grade;

		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.view_Flag = false;
		this.bookService.searchBook(value, this.quality, isInit).subscribe(
			data => {
				this.books = data.books;
				var nativeElement = document.getElementById("autocomplete3");
				if (nativeElement != null) {
					nativeElement.className = "hideDiv2";
				}
				this.book_list_items = [];
				this.book_list_start = 0;
				this.offset = 0;
				this.initBookListItems();
				loader.dismiss();

				this.data = data;
				this.updateMetadata();
			},
			err => {
				this.utilService.createError(err);
				loader.dismiss();
			}
		);
	}

	ionViewDidLoad() {		
		this.book_list_items = [];
		this.book_list_start = 0;
		this.offset = 0;
		this.initBookListItems();

		var tt = this;
		document
			.querySelector("page-search-result")
			.addEventListener("click", function (event) {
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
					console.log("inside");
				} else {
					console.log("outside");
					if (tt.platform.is("cordova")) {
						tt.keyboard.hideKeyboardAccessoryBar(false);
					}
					tt.view_Flag = false;
					var nativeElement = document.getElementById("autocomplete2");
					if (nativeElement != null) nativeElement.className = "hideDiv2";
				}
				return true;
			});
		console.log("ionViewDidLoad SearchBookPage");
	}

	ionViewWillEnter() {
		
	}

	initBookListItems() {
		for (let i = 0; i < this.getMaxCount(this.countAtOnce); i++) {
			this.book_list_items.push(this.books[i]);
		}
	}

	getMaxCount(count) {
		if (this.books.length < count) {
			return this.books.length;
		}
		return count;
	}

	doInfinite_list(infiniteScroll) {
		if (this.offset + this.limit < this.data.total) {
			this.offset += this.countAtOnce;
			setTimeout(() => {
				this.bookService.searchBook(this.searchValue, this.quality, false, this.offset).subscribe(
					data => {
						for (let i = 0; i < data.books.length; i++) {
							this.book_list_items.push(data.books[i]);
						}
						infiniteScroll.complete();
					},
					err => {
						infiniteScroll.complete();
					}
				);
			}, 500);
		} else {
			infiniteScroll.complete();
		}
	}

	openDetail_list(book) {
		if (this.view_Flag) return;
		this.navCtrl.push("BookDetailPage", { book: book });
		//this.navCtrl.push(BookDetailPage, {book:ev.data});
		//this.openTub.emit(book.book);
	}
}
