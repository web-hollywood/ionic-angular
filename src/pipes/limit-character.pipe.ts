import { Pipe, PipeTransform } from "@angular/core";
import { Platform } from "ionic-angular";

const STRING_MAX_LENGTH = 60;
const MIN_WIDTH = 415;

@Pipe({ name: "limitCharactersOnSmallDevices" })
export class LimitCharacterPipe implements PipeTransform {
	constructor(public platform: Platform) {}

	transform(value: string): string {
		let width = this.platform.width();
		if (width > MIN_WIDTH || value.length < STRING_MAX_LENGTH) {
			return value;
		}
		return value.substring(0, STRING_MAX_LENGTH) + "...";
	}
}
