import { Component, ViewChild } from "@angular/core";
import { Config } from "../../providers/config";
import { DomSanitizer } from "@angular/platform-browser";
import { ViewController } from "ionic-angular";
import { Auth } from "../../providers/auth";

@Component({
	selector: "user-registration",
	templateUrl: "user-registration.html"
})
export class UserRegistrationComponent {
	@ViewChild("iframe") iframe: any;
	public url: any;
	public loading: boolean = true;
	private timeout: any;
	private showTimeoutError: boolean = false;

	constructor(
		public config: Config,
		private sanitizer: DomSanitizer,
		public viewCtrl: ViewController,
		public auth: Auth
	) {
		this.onLoad = this.onLoad.bind(this);
		this.tokenEventReceived = this.tokenEventReceived.bind(this);
	}

	ngOnInit() {}

	ngAfterViewInit() {
		this.iframe.nativeElement.addEventListener("load", this.onLoad);
		this.config.getRegistrationURL().subscribe(url => {
			this.iframe.nativeElement.src = url;
			this.url = this.sanitizer.bypassSecurityTrustResourceUrl(url);
			this.timeout = setTimeout(() => {
				this.showTimeoutError = true;
			}, 12000);
		});

		window.addEventListener("message", this.tokenEventReceived, false);
	}

	tokenEventReceived(e) {
		if (e.data) {
			let loginData = JSON.parse(e.data);
			this.viewCtrl.dismiss(loginData);
		}
	}

	ngOnDestroy() {
		this.iframe.nativeElement.removeEventListener("load", this.onLoad);
		window.removeEventListener("message", this.tokenEventReceived);
	}

	onLoad(e) {
		clearTimeout(this.timeout);
		this.loading = false;
	}

	closeModal() {
		this.viewCtrl.dismiss();
	}
}
