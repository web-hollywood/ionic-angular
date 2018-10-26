import { Component } from "@angular/core";
import { ViewController, NavParams } from "ionic-angular";
@Component({
	selector: "popover",
	templateUrl: "popover.html"
})
export class PopoverComponent {
	text: string;
	itemList = [];

	constructor(private viewCtrl: ViewController, private navParams: NavParams) {
		this.itemList = navParams.get("itemList");
	}

	itemSelected(item) {
		this.viewCtrl.dismiss(item);
	}
}
