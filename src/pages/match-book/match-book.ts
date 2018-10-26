import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { Config } from "../../providers/config";
import { ScanService } from "../../providers/scan-service";
import { IonicPage } from "ionic-angular";

@IonicPage()
@Component({
	selector: "page-match-book",
	templateUrl: "match-book.html"
})
export class MatchBookPage {
	books: any[];
	image: string;
	isbn: string;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public scanService: ScanService,
		public config: Config
	) {
		this.books = this.navParams.get("books");
		this.image = this.navParams.get("image");
		this.isbn = this.navParams.get("isbn");
	}

	ionViewDidLoad() {}

	openDetail_list(book) {
		this.navCtrl.push("BookDetailPage", { book: book });
	}

	gopost() {
		let code = this.isbn;
		this.scanService.sendBookPicture(code, this.image).subscribe(data => {
			if (data.success) {
				this.goBookDetail(code);
			}
		});
	}

	goBookDetail(code) {
		this.scanService.searchBook(code).subscribe(data => {
			let books = data.books;
			if (books.length > 0) {
				this.navCtrl.push("BookDetailPage", { book: books[0] });
			}
		});
	}
}
