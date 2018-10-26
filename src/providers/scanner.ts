import { Injectable } from "@angular/core";
import { Events, Platform } from "ionic-angular";

import { ScannerSettings } from "./scanner-settings";

import { Enums } from "./enums";

@Injectable()
export class Scanner {
	public event: {
		scan: string;
		stateChange: string;
	};

	public state;
	public picker: BarcodePicker;

	public portraitConstraints: Constraints;
	public landscapeConstraints: Constraints;

	private ScannerState;

	constructor(
		private events: Events,
		private settings: ScannerSettings,
		private enums: Enums,
		private platform: Platform
	) {
		this.ScannerState = this.enums.ScannerState;
		this.event = {
			scan: "scanner:scan",
			stateChange: "scanner:stateChange"
		};

		this.events.subscribe(
			this.settings.event.settingsChanged,
			(newScanSettings: ScanSettings, newUiSettings: UiSettings) => {
				if (this.picker) {
					this.picker.applyScanSettings(newScanSettings);
					this.applyUiSettings(newUiSettings, this.picker.getOverlayView());
				}
			}
		);

		this.setAppKey();

		this.createNewPicker();
	}

	public start(): void {
		if (this.isFullscreen()) {
			this.createNewPicker();
		}

		if (this.platform.is("android")) {
			if (this.isStopped()) {
				this.show();
			}
		} else {
			this.show();
		}

		this.startScanning();
	}

	public sstop(): void {
		this.picker.stopScanning();
	}

	public pause(): void {
		this.picker.pauseScanning();
	}

	public resume(): void {
		this.picker.resumeScanning();
	}

	public stop(): void {
		// if (!this.isStopped()) {
			this.picker.cancel();
		// }
	}

	public cancel(): void {
		this.picker.cancel();
	}

	public startScanning(): void {
		this.picker.startScanning();
	}

	public isStopped(): boolean {
		return this.state === this.ScannerState.stopped;
	}

	public clampActiveScanningArea(): void {
		this.settings.clampActiveScanningArea(
			this.portraitConstraints,
			this.landscapeConstraints
		);
	}

	public setConstraints(
		top: Constraint,
		right: Constraint,
		bottom: Constraint,
		left: Constraint,
		animationDuration: number = 0
	): void {
		this.setPortraitConstraints(top, right, bottom, left, animationDuration);
		this.setLandscapeConstraints(top, right, bottom, left, animationDuration);
	}

	public setPortraitConstraints(
		top: Constraint,
		right: Constraint,
		bottom: Constraint,
		left: Constraint,
		animationDuration: number = 0
	): void {
		const newConstraints = new Scandit.Constraints();
		newConstraints.topMargin = top;
		newConstraints.rightMargin = right;
		newConstraints.bottomMargin = bottom;
		newConstraints.leftMargin = left;

		if (
			!this.portraitConstraints ||
			newConstraints.topMargin !== this.portraitConstraints.topMargin ||
			newConstraints.rightMargin !== this.portraitConstraints.rightMargin ||
			newConstraints.bottomMargin !== this.portraitConstraints.bottomMargin ||
			newConstraints.leftMargin !== this.portraitConstraints.leftMargin
		) {
			this.portraitConstraints = newConstraints;
			this.applyConstraints(animationDuration);
		}
	}

	public setLandscapeConstraints(
		top: Constraint,
		right: Constraint,
		bottom: Constraint,
		left: Constraint,
		animationDuration: number = 0
	): void {
		const newConstraints = new Scandit.Constraints();
		newConstraints.topMargin = top;
		newConstraints.rightMargin = right;
		newConstraints.bottomMargin = bottom;
		newConstraints.leftMargin = left;

		if (
			!this.landscapeConstraints ||
			newConstraints.topMargin !== this.landscapeConstraints.topMargin ||
			newConstraints.rightMargin !== this.landscapeConstraints.rightMargin ||
			newConstraints.bottomMargin !== this.landscapeConstraints.bottomMargin ||
			newConstraints.leftMargin !== this.landscapeConstraints.leftMargin
		) {
			this.landscapeConstraints = newConstraints;
			this.applyConstraints(animationDuration);
		}
	}

	private createNewPicker(): void {
		this.picker = new Scandit.BarcodePicker(this.settings.getScanSettings());
		this.picker.continuousMode = true;
		this.state = this.ScannerState.stopped;
	}

	private show(): void {
		this.applyUiSettings(
			this.settings.getUiSettings(),
			this.picker.getOverlayView()
		);
		this.picker.show({
			didScan: this.onScan.bind(this),
			didChangeState: this.onStateChange.bind(this),
			didCancel: this.onCancel.bind(this),
			didManualSearch: this.onManualInput.bind(this)
		});
	}

	private applyUiSettings(uiSettings: UiSettings, overlay): void {
		overlay.setBeepEnabled(uiSettings.feedback.beep);
		overlay.setVibrateEnabled(uiSettings.feedback.vibrate);

		overlay.showSearchBar(uiSettings.searchBar);
		if (uiSettings.searchBar) {
			overlay.setSearchBarPlaceholderText("Manual barcode entry");
		}

		overlay.setTorchEnabled(uiSettings.torch.enabled);
		overlay.setTorchButtonMarginsAndSize(
			uiSettings.torch.offset.left,
			uiSettings.torch.offset.top,
			40,
			40
		);

		overlay.setCameraSwitchVisibility(uiSettings.cameraSwitch.visibility);
		overlay.setCameraSwitchButtonMarginsAndSize(
			uiSettings.cameraSwitch.offset.right,
			uiSettings.cameraSwitch.offset.top,
			40,
			40
		);

		overlay.setGuiStyle(uiSettings.viewfinder.style);
		overlay.setViewfinderDimension(
			uiSettings.viewfinder.portrait.width,
			uiSettings.viewfinder.portrait.height,
			uiSettings.viewfinder.landscape.width,
			uiSettings.viewfinder.landscape.height
		);
	}

	private onScan(session): void {
		this.events.publish(this.event.scan, session);
	}

	private onManualInput(content): void {
		console.log(content);
	}

	private onCancel(error): void {
		// console.log(error);
	}

	private onStateChange(state): void {
		this.changeState(state);
	}

	private changeState(state): void {
		this.state = state;
		this.events.publish(this.event.stateChange, state);
	}

	private applyConstraints(animationDuration: number = 0): void {
		this.picker.setConstraints(
			this.portraitConstraints,
			this.landscapeConstraints,
			animationDuration
		);
	}

	private isFullscreen(): boolean {
		return (
			(this.portraitConstraints.topMargin === 0 ||
				this.portraitConstraints.topMargin === "0%") &&
			(this.portraitConstraints.rightMargin === 0 ||
				this.portraitConstraints.rightMargin === "0%") &&
			(this.portraitConstraints.leftMargin === 0 ||
				this.portraitConstraints.leftMargin === "0%") &&
			(this.portraitConstraints.bottomMargin === 0 ||
				this.portraitConstraints.bottomMargin === "0%") &&
			(this.landscapeConstraints.topMargin === 0 ||
				this.landscapeConstraints.topMargin === "0%") &&
			(this.landscapeConstraints.rightMargin === 0 ||
				this.landscapeConstraints.rightMargin === "0%") &&
			(this.landscapeConstraints.leftMargin === 0 ||
				this.landscapeConstraints.leftMargin === "0%") &&
			(this.landscapeConstraints.bottomMargin === 0 ||
				this.landscapeConstraints.bottomMargin === "0%")
		);
	}

	private setAppKey(): void {
		//Scandit.License.setAppKey("SwC0ESXJTr2+HiavouF3xuKlNzsCMgTN4PC5umQ0tDQ");
		//Scandit.License.setAppKey("AdHaCaiBPH/eHZ5YHyJ9SFcYByoPAj8B2Hx4iaxQAUK0QIIPA2sq73x/xUBiQCFc3GijK4pXi3JZW+oPUSOw6cd5kUwlS4J+QztCcgFsTJNmfLvFqjbid4ZBM0fDanNz02nlnvcEJ65bY2/EUEQ1iZiCN103welT9PyL8d+7XkIA5YYzSOxBdgY1fWkkHflwOfKS3t4L1MPCclFxDwYk/KInxpZ1ZJgZY6OV9VeJNUqiKuB0T41y2B6NIHFd9vZYjjlAWQwX2Y8P2JvN/MSi+M9WkHHCeLR0EUw11X8hyEk5IEspy2tGLQZvUsjaKA1OCoMHJwDy5ArXjGNPVxPICzZGj2cshh0XMv5tBbt2zLPUyUMNy6NzyVHr1hV3n3V7BwFxrdMgrA3TZcxkgLVm3br8HGtsN7/H5v+RYMaKpKN2isV2jE9EoosMV1aTNb6fFdkBiOKsblrA3f6UoDOUyT8LvJhPT6NRrEUdBs18RFqWL0jBnsldZPbs3fZjCsjHlNH+VAC0rcKPNZj309jjZbtkzmyk175+OSJL2YwHFNrrcfKs/N8Wnln9M1nfLgcUbjsP9m7efaeGdodMhLmGBeC6dIolIMIGiw6RN5pNXX6TjQz+bxKFLdZzh0KKs3wu18LV4wmoB89fUXiZk1/6UILVvZYOnLX44ILsAhPByOWZlWcQSLOz99DI8RcDZzeop0PYW/JVEVslOZc1BZYgKZTFzYTC1MFjfqC5lv561pq0N3FFwfNqsQv53MMz3wJHdpvwbkpl6tJQZ+y1IIDInXpj7MlYqfMDymz1qD+Civ4C+rSL4piUow==");
		Scandit.License.setAppKey(
			"AcBqTKOBNxAhNVFARwWVC6oR2srWEvYS5EDUWHBWPbTtbnsRlyzOBG1l9PMHb0ZTqH3//atHpqxkavAbqETpSERUoEUcfMsddz0GcYh3BY8/fDJpSU0R+NNutm65SFmeQGeWBRpGWqV5W8n/tZE0KkcgSfcWAzFSpYkG6GkpJuwYxC4M3MVPokHPJZvhUQXa7V4erSOa/ggSRcFvQo34AsMeBahpIDBnzC1L+KPY/VfQs0ByNXqBfJRR0Lnuij0ByQ4MYmuLCtbFuuuQ0JVOEEAzD6IW1k+/FrYLblmJWoPacS7xPCuBBSsQiHA9SKJhfmI8L1gisMlxqMzDbGxtiH+o3B11yHWqebf/TGAfKJWwadLwuna+XWSyZ1IlDkzLkjZ8Ays3brDJOXudjYaNdpHpuRLLa4prmROxuJXjYS7LZYrWDnQziO65F1OZ7D6W+nGCNizJfSZewlTjbenLSbcqnb10hNMIzmbLPYbFNZTdZiermQ4UU0q47dGgKa43mGVIflLcV68NwzRFE76P6jgant87yg3oyFrUQfnAUj0kQMLG5kNMudV5d47NlvyFfxGxfxC3pDZgwFjAtEQ0Qi7OjojpBojalfB50I+J3HOmf0Cm4bDE5BdPnlLB9aH6YwqMMOz70xf7rr+O8k23g5RuxYxhbRIUG0OBd/QH3JRNH5MoJrqa4iUiaKwvluvDHFH3W5sdyzgA45WDATnWw7oMmy1+EatrUsDrlLJFs/Um055NkDanvXXA0VdJIKcui6SQCYDIR9L8TA5YqzwfZTlwrlJCjoHyq6CWrppzvPEhGCjv3eK3wg=="
		);
	}
}
