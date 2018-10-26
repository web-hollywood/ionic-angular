import { Component } from "@angular/core";
import {
	NavController,
	NavParams,
	Events,
	LoadingController,
	Platform
} from "ionic-angular";
import { Config } from "../../providers/config";
import { ClassService } from "../../providers/class-service";
import { BookService } from "../../providers/book-service";
import { Keyboard } from "@ionic-native/keyboard";
import { IonicPage } from "ionic-angular";
import { UtilService } from "../../providers/util-service";
import { SwiperConfigInterface } from "ngx-swiper-wrapper";

@IonicPage()
@Component({
	selector: "page-class-library",
	templateUrl: "class-library.html"
})
export class ClassLibraryPage {
	tub_auto_items: any[];
	books_auto_items: any[];
	book_filtered_items: any[];
	tub_filtered_items: any[];
	filtered_tub_items: any[][];

	countAtOnce = 100;
	book_cover_items: any;
	book_cover_start = 0;
	book_list_items: any;
	book_list_start = 0;

	library: any[];
	tubs: any[];
	test = [1, 2, 3, 4, 5, 6];
	viewStyle: string;
	sortBy: string;
	view_Flag: boolean;
	quality: boolean;
	searchValue: string = "";
	search_items: any[];
	search_flag: string;
	books: any = [];
	auto_complete_items: any[];
	history_items: any[];
	autoComplete_show: boolean;

	public maxWidth: number;

	public config_swiper: SwiperConfigInterface = {
		scrollbar: null,
		direction: "horizontal",
		slidesPerView: 1,
		scrollbarHide: false,
		keyboardControl: false,
		mousewheelControl: false,
		scrollbarDraggable: true,
		scrollbarSnapOnRelease: true,
		nextButton: ".swiper-button-next",
		prevButton: ".swiper-button-prev"
	};

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public events: Events,
		public loading: LoadingController,
		public classService: ClassService,
		public bookService: BookService,
		public keyboard: Keyboard,
		public platform: Platform,
		public utilService: UtilService,
		public config: Config
	) {
		this.sortBy = "A";
		this.viewStyle = "tub";
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
		this.onPageWillEnter();
		this.events.subscribe("update:tubs", () => {
			this.onPageWillEnter();
		});

		window.onresize = e => {
			this.resizeWin();
		};
	}

	resizeWin() {
		let w = window.innerWidth;
		if (w >= 768) {
			w = Math.floor(w / 150);
			this.config_swiper.slidesPerView = w;
		} else {
			this.config_swiper.slidesPerView = 3;
		}
	}

	sort_array(viewStyle) {
		var sortedArray: any[];
		if (viewStyle == "tub") {
			sortedArray = this.tub_filtered_items;
			sortedArray.sort((obj1, obj2) => {
				if (this.sortBy == "A") {
					if (obj1.title > obj2.title) {
						return 1;
					}

					if (obj1.title < obj2.title) {
						return -1;
					}
					return 0;
				} else if (this.sortBy == "Z") {
					if (obj1.title < obj2.title) {
						return 1;
					}

					if (obj1.title > obj2.title) {
						return -1;
					}
					return 0;
				} else if (this.sortBy == "R") {
					if (obj1.created_at > obj2.created_at) {
						return 1;
					}

					if (obj1.created_at < obj2.created_at) {
						return -1;
					}
					return 0;
				}
			});

			this.tub_filtered_items = sortedArray;
		} else {
			sortedArray = this.book_filtered_items;
			sortedArray.sort((obj1, obj2) => {
				if (this.sortBy == "A") {
					if (obj1.book.title > obj2.book.title) {
						return 1;
					}

					if (obj1.book.title < obj2.book.title) {
						return -1;
					}
					return 0;
				} else if (this.sortBy == "Z") {
					if (obj1.book.title < obj2.book.title) {
						return 1;
					}

					if (obj1.book.title > obj2.book.title) {
						return -1;
					}
					return 0;
				} else if (this.sortBy == "R") {
					if (obj1.created_at > obj2.created_at) {
						return 1;
					}

					if (obj1.created_at < obj2.created_at) {
						return -1;
					}
					return 0;
				}
			});
			this.book_filtered_items = sortedArray;
			this.initBookCoverItems();
			this.initBookListItems();
		}
	}

	ionViewDidLoad() {
		var tt = this;
		document
			.querySelector("page-class-library")
			.addEventListener("click", function(event) {
				var nativeElement = document.getElementById("autocomplete2");
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
					if (tt.platform.is("cordova")) {
						tt.keyboard.hideKeyboardAccessoryBar(false);
					}
					tt.view_Flag = false;
					if (nativeElement != null) nativeElement.className = "hideDiv2";
				}
			});
	}

	doInfinite_cover(infiniteScroll) {
		setTimeout(() => {
			this.book_cover_start += this.countAtOnce;
			for (
				let i = this.book_cover_start;
				i < this.getMaxCount(this.book_cover_start + this.countAtOnce);
				i++
			) {
				this.book_cover_items.push(this.book_filtered_items[i]);
			}
			infiniteScroll.complete();
		}, 500);
	}

	doInfinite_list(infiniteScroll) {
		setTimeout(() => {
			this.book_list_start += this.countAtOnce;
			for (
				let i = this.book_list_start;
				i < this.getMaxCount(this.book_list_start + this.countAtOnce);
				i++
			) {
				this.book_list_items.push(this.book_filtered_items[i]);
			}
			infiniteScroll.complete();
		}, 500);
	}

	getMaxCount(count) {
		if (this.book_filtered_items.length < count) {
			return this.book_filtered_items.length;
		}
		return count;
	}

	initBookCoverItems() {
		this.book_cover_items = [];
		this.book_cover_start = 0;
		for (let i = 0; i < this.getMaxCount(this.countAtOnce); i++) {
			this.book_cover_items.push(this.book_filtered_items[i]);
		}
	}

	initBookListItems() {
		this.book_list_items = [];
		this.book_list_start = 0;
		for (let i = 0; i < this.getMaxCount(this.countAtOnce); i++) {
			this.book_list_items.push(this.book_filtered_items[i]);
		}
	}

	onPageWillEnter() {
		let class_id = this.config.class_id;
		this.library = [];
		this.books_auto_items = [];
		let loader = this.loading.create({
			content: ""
		});
		loader.present();
		this.classService.getClassLibrary(class_id).subscribe(
			data => {
				this.library = data.books;
				this.books_auto_items = [];
				this.library.forEach(item => {
					if (typeof item.book === "object") {
						if (item.book.title != undefined && item.book.title != null)
							this.books_auto_items.push(item);
					}
				});
				this.book_filtered_items = this.books_auto_items;
				//this.books_auto_items = this.library;
				this.initBookCoverItems();
				this.initBookListItems();
				this.sort_array("book");
				loader.dismiss();
				this.resizeWin();
			},
			err => {
				this.utilService.createError(err);
				loader.dismiss();
				this.resizeWin();
			}
		);

		this.classService.getTubs(class_id).subscribe(data => {
			this.tubs = data.tubs;
			this.tub_auto_items = [];
			this.tubs.forEach(item => {
				if (item.title != null && item.title != undefined) {
					this.tub_auto_items.push(item);
				}
			});

			this.tub_filtered_items = this.tub_auto_items;

			this.sort_array("tub");
		});
	}

	get_tub_books(tub_name: string) {
		let filtered_tub_books: any[];
		filtered_tub_books = [];
		for (var book of this.books_auto_items) {
			if (book.title == tub_name) {
				filtered_tub_books.push(book);
			}
		}
		return filtered_tub_books;
	}

	onSelectChange(value) {
		this.sortBy = value;
		this.sort_array(this.viewStyle);
	}

	openDetail_list(book) {
		this.navCtrl.push("BookDetailPage", { book: book.book });
		//this.navCtrl.push(BookDetailPage, {book:ev.data});
		//this.openTub.emit(book.book);
	}
	openDetail_tub(book) {
		this.navCtrl.push("BookDetailPage", { book: book.book });
		//this.openTub.emit(book.book);
	}
	openDetail_cover(book) {
		this.navCtrl.push("BookDetailPage", { book: book.book });
	}

	openTubContentPage(tub) {
		this.navCtrl.push("TubContentList", {
			tub: tub,
			class_id: this.config.class_id,
			fromMyClassLibrary: true
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

	checkBlur(value) {
		this.autoComplete_show = false;
		//  this.itemClick('');
	}
}
