import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { Config } from "../../providers/config";
import { ClassService } from "../../providers/class-service";

import { IonicPage } from "ionic-angular";
declare let moxiechart: any;
@IonicPage()
@Component({
	selector: "page-statistics",
	templateUrl: "statistics.html"
})
export class StatisticsPage {
	mode: string;
	class_id: number;
	stats: any;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		public config: Config,
		public classService: ClassService
	) {
		this.mode = this.config.mode;
		this.class_id = this.config.class_id;

		this.classService.getClassStats(this.class_id).subscribe(data => {
			this.stats = data;
			console.log(data);
		});
	}

	ionViewDidLoad() {
		console.log("ionViewDidLoad StatisticsPage");
	}
}
