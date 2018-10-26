import { Component } from "@angular/core";
import {
	IonicPage,
    NavController,
    ViewController,
	NavParams
} from "ionic-angular";
import { Config } from "../../providers/config";

@IonicPage()
@Component({
	selector: "page-open-file",
	templateUrl: "open-file.html"
})
export class OpenFilePage {
    public data: any;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public viewCtrl: ViewController,
		public config: Config
	) {
        this.data = navParams.get('data');
    }

    done() {
        this.viewCtrl.dismiss();
    }
}