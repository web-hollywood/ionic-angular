import { Component } from "@angular/core";
import { NavController, IonicPage, Platform, ViewController } from "ionic-angular";
import { SwiperConfigInterface } from "ngx-swiper-wrapper";

@IonicPage()
@Component({
	selector: "page-intro",
	templateUrl: "intro.html"
})
export class IntroPage {
    
	public config_swiper: SwiperConfigInterface = {
		scrollbar: null,
		direction: "horizontal",
		slidesPerView: 1,
		scrollbarHide: false,
		keyboardControl: false,
		mousewheelControl: false,
		scrollbarDraggable: true,
        scrollbarSnapOnRelease: true,
        pagination: '.swiper-pagination',
		nextButton: ".swiper-button-next",
		prevButton: ".swiper-button-prev"
    };
    public intro;
    
    constructor(
        public platform: Platform,
        public viewCtrl: ViewController,
        public navCtrl: NavController
	) {
        this.intro = [
            {title: 'MoxieReader', description: 'Find, choose, record, recommend & review books.For students to track & hit their reading goals', image: 'intro_0.png', description2: ''},

            {title: 'MoxieReader App has two modes', description: 'Teacher View has a green background', image: 'intro_1.png', description2: ''},

            {title: 'MoxieReader App has two modes', description: 'Student View has a blue background', image: 'intro_2.png', description2: ''},

            {title: 'Quickly switch between Teacher and Student View', description: 'Click on the top left menu bar and select your view', image: 'intro_3.png', description2: ''},

            {title: 'For Teachers', description: 'View a snapshot of student reading goals, progress, books completed, and books selected to read.', image: 'intro_4.png', description2: ''},

            {title: 'For Students', description: 'Track their personal reading goals, gauge their progress, and engage with classmates over books.', image: 'intro_5.png', description2: ''},

            {title: 'Empower student book choice', description: "Scan any book's ISBN to access the book information and record reading progress.", image: 'intro_6.png', description2: ''},

            {title: 'Engage Readers', description: 'Students can share book recommendations, select books to read later, and write reviews to share with their peers.', image: 'intro_7.png', description2: ''},

            {title: 'Your Reading Community', description: 'View your class newsfeed and see social activity around books, including shares and reviews.', image: 'intro_8.png', description2: ''},

            {title: 'MoxieReader ', description: "When you're ready to use MoxieReader in your classroom, head to your Teacher Dashboard <br/><a href='https://dashboard.moxiereader.com'>dashboard.moxiereader.com</a><br/>to subscribe for a free trial and add your students and classes.", image: 'intro_9.png', description2: ''}
        ];

        if (this.platform.is("ios") || this.platform.is("android")) {}
        else {
            for (let i=0; i<this.intro.length; i++) {
                this.intro[i].image = this.intro[i].image.replace(".png", "_b.png");    
            }
        }

        window.onresize = e => {
			this.resizeWin();
		};
    }

    resizeWin() {
		if (this.platform.width() < 1024) {
            this.config_swiper.slidesPerView = 1;
        } else {
            this.config_swiper.slidesPerView = 2;
        }
	}
}