import { Component } from "@angular/core";
import { NavController, IonicPage, Platform, ViewController, NavParams } from "ionic-angular";

@IonicPage()
@Component({
	selector: "page-enlarge-reason",
	templateUrl: "enlarge-reason.html"
})
export class EnlargeReasonPage {
    
    public url;
    
    constructor(
        public platform: Platform,
        public viewCtrl: ViewController,
        public navCtrl: NavController,
        public navParams: NavParams
	) {
        this.url = navParams.get('url');
    }

}