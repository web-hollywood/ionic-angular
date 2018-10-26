import { Component } from "@angular/core";
import { NavController, NavParams } from "ionic-angular";
import { IonicPage } from "ionic-angular";

/*
  Generated class for the AddStudent page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@IonicPage()
@Component({
	selector: "page-add-student",
	templateUrl: "add-student.html"
})
export class AddStudentPage {
	constructor(public navCtrl: NavController, public navParams: NavParams) {}

	ionViewDidLoad() {
		console.log("ionViewDidLoad AddStudentPage");
	}
}
