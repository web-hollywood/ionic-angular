import { Component } from "@angular/core";
import {
	NavController,
	NavParams,
	LoadingController,
	Platform
} from "ionic-angular";
import { BookService } from "../../providers/book-service";
import { Config } from "../../providers/config";
import { Keyboard } from "@ionic-native/keyboard";
import { IonicPage, PopoverController } from "ionic-angular";
import { UtilService } from "../../providers/util-service";

@IonicPage()
@Component({
	selector: "page-search-book",
	templateUrl: "search-book.html"
})
export class SearchBookPage {
	books: any = [];
	searchValue: string = "";
	history_items: any[];
	view_Flag: boolean;
	search_items: any[];
	quality: boolean;
	auto_complete_items: any[];
	search_flag: string;
	autoComplete_show: boolean;
	search_books: any[];
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public loading: LoadingController,
		public bookService: BookService,
		public keyboard: Keyboard,
		public platform: Platform,
		public utilService: UtilService,
		public popoverCtrl: PopoverController,
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
		let keywoard = this.navParams.get("keyword");
		// if search comes from home page we fire the search
		if (keywoard) {
			this.searchBook(keywoard);
			this.searchValue = keywoard;
		}
	}

	openPopover() {
		let popover = this.popoverCtrl.create('PopoverSearch');
    	popover.present({ev: event});
	}

	ionViewDidLoad() {
		var tt = this;
		document
			.querySelector("page-search-book")
			.addEventListener("click", function(event) {
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

	openDetail(book) {
		this.navCtrl.push("BookDetailPage", { book: book.data });
	}

	openGenre(genre: string) {
		this.navCtrl.push("GenrePage", { genre });
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
				this.navCtrl.push("SearchResultPage", { books: this.books, data: data, value: book_name, quality: this.quality });
			},
			err => {
				this.utilService.createError(err);
				loader.dismiss();
			}
		);
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
				var nativeElement = document.getElementById("autocomplete2");
				if (nativeElement != null) {
					nativeElement.className = "hideDiv2";
				}
				this.searchValue = "";
				loader.dismiss();
				this.navCtrl.push("SearchResultPage", { books: this.books, data: data, value: value, quality: this.quality });
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
}
