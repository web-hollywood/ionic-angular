import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { BookService } from "../../providers/book-service";
import { Config } from "../../providers/config";
import { IonicPage } from "ionic-angular";
@IonicPage()
@Component({
	selector: "page-genre",
	templateUrl: "genre.html"
})
export class GenrePage {
	super_genre: string;
	all_genre_list: any[];
	fic_genre_list: any[];
	non_genre_list: any[];
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public bookService: BookService,
		public config: Config
	) {
		this.super_genre = this.navParams.get("genre");
		//let keywoard = this.navParams.get('keyword');
		// if search comes from home page we fire the search
		this.bookService.getGenreList().subscribe(data => {
			this.all_genre_list = data.genres;
		});

		this.fic_genre_list = this.bookService.getFictionGenreList();
		this.non_genre_list = this.bookService.getNonFictionGenreList();
	}

	ionViewDidLoad() {
		console.log("ionViewDidLoad GenrePage");
	}
	show_GenreBooks(genre_obj) {
		this.navCtrl.push("BookListPage", { genre_obj: genre_obj });
	}
}
