import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Platform } from "ionic-angular";
import { Config } from "../../providers/config";
import { SwiperConfigInterface } from "ngx-swiper-wrapper";

@Component({
	selector: "student-book-list",
	templateUrl: "student-book-list.html"
})
export class StudentBookListComponent {
	@Input() list: any;
	@Input() type: string;
	@Output() selectStudent = new EventEmitter();
	@Output() selectBook = new EventEmitter();
	@Output() addEvent = new EventEmitter();
	@Output() editClass = new EventEmitter();
	@Output() goScan = new EventEmitter();

	public options: any;
	public maxWidth: number;
	public mode: any;
	public showArrowButton = true;

	public config_swiper: SwiperConfigInterface = {
		scrollbar: null,
		direction: "horizontal",
		slidesPerView: 2,
		spaceBetween: 2,
		nextButton: ".swiper-button-next",
		prevButton: ".swiper-button-prev"
	};

	constructor(public platform: Platform, public config: Config) {
		this.mode = this.config.mode;
	}

	nextSlide() {}

	ngOnInit() {}

	addCurrentBook(student) {
		this.goScan.emit(student);
	}

	ngOnChanges(changes: any) {
		if (changes.list) {
			let changeList = changes.list.currentValue;
			if (this.mode == "parent") {
				if (this.platform.width() < 800) {
					this.config_swiper.slidesPerView = 1;
				} else {
					this.config_swiper.slidesPerView = 2;
				}
			}
			this.list = changeList;
			console.log(this.list);
		}
		if (changes.type) {
			this.type = changes.type.currentValue;
		}
	}

	ngAfterViewInit() {}

	select(student) {
		this.selectStudent.emit(student);
	}

	add(group) {
		this.addEvent.emit(group);
	}

	openDetail(book) {
		console.log(book);
		this.selectBook.emit(book);
	}

	edit() {
		console.log("edit button clicked");
		this.editClass.emit(this.list);
	}

	getMaxLength(list) {
		var max = 1;
		console.log(list);
		if (list == null || list.length == 0) return max;
		max = list[0].students.length;
		for (var i = 0; i < list.length - 1; i++) {
			for (var j = i + 1; j < list.length; j++) {
				if (list[i].students.length < list[j].students.length) {
					max = list[j].students.length;
				}
			}
		}
		console.log("max length: ", max);
		return max;
	}
}
