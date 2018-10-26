import { Component } from '@angular/core';
import { IonicPage, 
    NavController, 
    NavParams, 
    App, 
    ViewController 
} from 'ionic-angular';
import { Config } from "../../providers/config";

@IonicPage()
@Component({
    selector: 'popover-search',
    templateUrl: 'popover-search.html',
})
export class PopoverSearch {
  
    public title_text;
    public list = [];

    constructor(
        public navCtrl: NavController, 
        public navParams: NavParams,
        public app: App,
        public viewCtrl: ViewController,
        public config: Config
    ) {
        this.title_text = "";//"Showing All books for All grades";
    }

    ionViewDidLoad() { 
        let classData = this.config.classObject;
        this.list = [];
        this.list.push('none');
        this.list.push(classData.class.grade);
    }

    close() {
        this.viewCtrl.dismiss();
    }

}
