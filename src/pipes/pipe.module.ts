import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../app/shared.module";
import { LimitCharacterPipe } from "./limit-character.pipe";

@NgModule({
	declarations: [LimitCharacterPipe],
	imports: [CommonModule, SharedModule],
	exports: [LimitCharacterPipe]
})
export class PipeModule {}
