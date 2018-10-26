import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Platform } from "ionic-angular";
import { Config } from "../../providers/config";
import { SwiperConfigInterface } from "ngx-swiper-wrapper";

@Component({
	selector: "student-list",
	templateUrl: "student-list.html"
})
export class StudentListComponent {
	@Input() list: any;
	@Input() type: string;
	@Output() selectStudent = new EventEmitter();
	@Output() addEvent = new EventEmitter();
	@Output() editClass = new EventEmitter();

	public options: any;
	public maxWidth: number;
	public mode: any;

	public config_swiper: SwiperConfigInterface = {
		scrollbar: null,
		direction: "horizontal",
		slidesPerView: 6,
		spaceBetween: 2
	};

	constructor(public platform: Platform, public config: Config) {
		this.options = {
			slidesPerView: 6,
			spaceBetween: 10
		};
		this.mode = this.config.mode;

		var tt = this;
		window.onresize = e => {
			if (this.platform.is("ios") || this.platform.is("android")) {
			} else {
				tt.resizeWin(window.innerWidth);
			}
		};
	}

	ngOnInit() {}

	resizeWin(w) {
		if (w > 768) {
			var n = Math.floor((w - 20) / 100);
			if (n < 6) n = 6;
			this.config_swiper.slidesPerView = n;
		} else {
			this.config_swiper.slidesPerView = 6;
		}
	}

	ngOnChanges(changes: any) {
		if (changes.list) {
			let changeList = changes.list.currentValue;
			console.log(this.list.readinggroups);
			if (this.list.readinggroups) {
				if (this.platform.is("ios") || this.platform.is("android")) {
					// let maxLength = this.getMaxLength(this.list.readinggroups);
					if (this.platform.width() < 600) {
						this.config_swiper.slidesPerView = 4;
					} else {
						this.config_swiper.slidesPerView = 6;
					}
				} else {
					this.resizeWin(this.platform.width());
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

	edit() {
		console.log("edit button clicked");
		this.editClass.emit(this.list);
	}

	initializeSwiper(index) {}

	getMaxLength(list) {
		var max = 1;
		console.log(list);
		if (list == null || list.length == 0) return max;

		for (var i = 0; i < list.length; i++) {
			if (list[i].students && list[i].students.length > max) {
				max = list[i].students.length;
			}
		}

		console.log("max length: ", max);
		return max;
	}
}
