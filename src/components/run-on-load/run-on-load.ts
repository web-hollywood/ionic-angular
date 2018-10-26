import { Directive, Output, EventEmitter } from "@angular/core";

@Directive({
	selector: "[runOnLoad]" // Attribute selector
})
export class RunOnLoad {
	@Output() runOnLoad = new EventEmitter();
	constructor() {
		console.log("Hello RunOnLoad Directive");
	}

	ngOnInit() {
		this.runOnLoad.emit({});
	}
}
