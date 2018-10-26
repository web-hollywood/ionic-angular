import { Component } from "@angular/core";
import { NavController, NavParams, Events, Platform, ViewController } from "ionic-angular";
import { UtilService } from "../../providers/util-service";
import { Config } from "../../providers/config";
import { IonicPage } from "ionic-angular";
import { BookService } from "../../providers/book-service";

@IonicPage()
@Component({
	selector: "page-create-new",
	templateUrl: "create-new.html"
})
export class CreateNewPage {
    public coverUrl;
    public title;
    public author;
    public pages;
    public data;
    public rating;
    public grade = null;
    public all_genre_list = [];
    public gener = "";
    public isCreate = false;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public events: Events,
		public utilService: UtilService,
		public config: Config,
		public viewCtrl: ViewController,
		public bookService: BookService,
		public platform: Platform
	) {
        this.isCreate = navParams.get('isCreate');
        this.coverUrl = navParams.get('coverUrl');
        this.title = navParams.get('title');
        this.author = navParams.get('author');
        this.pages = navParams.get('pages');
        this.data = navParams.get('data');
        if (this.isCreate) {}
        else {
            try {
                this.rating = this.data.metadata.rating;
                if (this.data.metadata.grade)
                    this.grade = "Grade " + this.data.metadata.grade;
            } catch (err) {
                console.log(err);
            }
        }

        this.bookService.getGenreList().subscribe(data => {
			this.all_genre_list = data.genres;
		});
    }

	ionViewDidLoad() {
		console.log("ionViewDidLoad CreateNewPage");
    }

    cancel() {
        this.viewCtrl.dismiss('cancel');
    }

    ok() {
        if (this.title.trim() == "") {
            this.utilService.createToast("Waiting on teacher dashboard for update.");
            return false;
        }
        // if (this.author.trim() == "") {
        //     this.utilService.createToast("Waiting on teacher dashboard for update.");
        //     return false;
        // }
        if (!this.config.isNumeric(this.pages)) {
            this.utilService.createToast("Book length should be a number.");
            return false;
        }
        let data = {
            title: this.title,
            author: this.author,
            pages: this.pages,
            coverUrl: this.coverUrl,
            gener: this.gener
        }
        this.viewCtrl.dismiss(data);
    }

}
