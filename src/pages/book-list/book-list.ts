import { Component, ElementRef } from "@angular/core";
import {
	NavController,
	NavParams,
	LoadingController,
	Platform
} from "ionic-angular";
import { Config } from "../../providers/config";
import { ClassService } from "../../providers/class-service";
import { BookService } from "../../providers/book-service";
import { Keyboard } from "@ionic-native/keyboard";
import { IonicPage, PopoverController } from "ionic-angular";

@IonicPage()
@Component({
	selector: "book-list-library",
	templateUrl: "book-list.html"
})
export class BookListPage {
	genre: any;
	elementRef: ElementRef;
	genre_items: any[];
	library: any[];
	quality: boolean;
	searchValue: string = "";
	view_Flag: boolean;
	autoComplete_show: boolean;
	search_flag: string;
	books: any = [];
	auto_complete_items: any[];
	history_items: any[];
	search_items: any[];

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

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public loading: LoadingController,
		public classService: ClassService,
		public bookService: BookService,
		public keyboard: Keyboard,
		public platform: Platform,
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
		this.genre = this.navParams.get("genre_obj");
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.bookService.getGenreBooksList(this.genre.id).subscribe(
			data => { 
				this.data = data;
				// this.metadata = this.data.metadata;
				// this.grade = this.metadata.grade;
				// this.graderange = this.metadata.graderange;
				// this.grades = this.metadata.found.grade;
				// this.grades[""] = "";
				
				this.library = [];
				this.library = data.books;
				this.genre_items = [];
				this.genre_items = this.library;
				this.sort_array();
				loader.dismiss();
			},
			err => {
				loader.dismiss();
			}
		);
	}

	openPopover() {
		let popover = this.popoverCtrl.create('PopoverSearch');
    	popover.present({ev: event});
	}

	sort_array() {
		var sortedArray: any[];
		sortedArray = this.genre_items;
		if (sortedArray && sortedArray != null) {
			sortedArray.sort((obj1, obj2) => {
				if (obj1.title > obj2.title) {
					return 1;
				}

				if (obj1.title < obj2.title) {
					return -1;
				}
				return 0;
			});
			this.genre_items = sortedArray;
		} else {
			this.genre_items = [];
		}
		
		this.book_list_items = [];
		this.book_list_start = 0;

		this.initBookListItems();
	}

	initBookListItems() {
		for (let i = 0; i < this.getMaxCount(this.countAtOnce); i++) {
			this.book_list_items.push(this.genre_items[i]);
		}
	}

	getMaxCount(count) {
		if (this.genre_items.length < count) {
			return this.genre_items.length;
		}
		return count;
	}

	ionViewDidLoad() {
		var tt = this;
		document
			.querySelector("book-list-library")
			.addEventListener("click", function(event) {
				//  var searchBar  =document.querySelector('.searchbar-input');
				//  var clickedComponent = event.currentTarget;
				var inside = false;
				var target = <HTMLElement>event.target;
				var className = target.className;
				console.log(className, "className*!");
				if (
					(className == "label label-md" && target.childElementCount == 0) ||
					className == "searchbar-input" ||
					className == "label label-ios"
				)
					inside = true;
				if (inside) {
					console.log("inside");
				} else {
					if (tt.platform.is("cordova")) {
						tt.keyboard.hideKeyboardAccessoryBar(false);
					}
					tt.view_Flag = false;
					var nativeElement = document.getElementById("autocomplete1");
					console.log(nativeElement, "nativeElement");
					if (nativeElement != null) {
						nativeElement.className = "hideDiv1";
						console.log("outside");
					}
				}
				return true;
			});
	}

	openDetail_list(book) {
		this.navCtrl.push("BookDetailPage", { book: book });
		//this.navCtrl.push(BookDetailPage, {book:ev.data});
		//this.openTub.emit(book.book);
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
				var nativeElement = document.getElementById("autocomplete1");
				if (nativeElement != null) {
					nativeElement.className = "hideDiv1";
				}
				this.searchValue = "";
				loader.dismiss();
				this.navCtrl.push("SearchResultPage", { books: this.books, data: data, value: value, quality: this.quality });
			},
			err => {
				loader.dismiss();
			}
		);
	}

	searchBook(value) {
		var nativeElement = document.querySelector(".hideDiv1");
		if (nativeElement != null) {
			nativeElement.className = "autocomplete1";
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
				this.searchValue = "";
				loader.dismiss();
				this.navCtrl.push("SearchResultPage", { books: this.books, data: data, value: book_name, quality: this.quality });
			},
			err => {
				loader.dismiss();
			}
		);
	}

	checkBlur() {
		this.autoComplete_show = false;
	}

	doInfinite_list(infiniteScroll) {
		if (this.offset + this.limit < this.data.total) {
			setTimeout(() => {
				this.offset += this.countAtOnce;
				this.bookService.getGenreBooksList(this.genre.id, this.offset).subscribe(
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
}
