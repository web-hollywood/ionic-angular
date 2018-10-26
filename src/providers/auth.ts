import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import { Config } from "../providers/config";
import "rxjs/add/operator/map";

@Injectable()
export class Auth {
	constructor(public http: Http, public config: Config) {}

	login(credentials) {
		return this.config.getAPIURL().flatMap(apiurl => {
			console.log("LLL ========= Login process ===> ", apiurl, credentials);
			let url = `${apiurl}/account/login`;
			return this.http
				.post(url, credentials)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	register(credentials) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/account/register`;
			return this.http
				.post(url, credentials)
				.timeout(90000)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	logout() {
		return this.config.getAPIURL().flatMap(apiurl => {
			let headers = this.config.getHeaders();
			let url = `${apiurl}/account/logout`;
			return this.http.get(url, { headers: headers });
		});
	}

	changeMode(request) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/account/mode`;
			let headers = this.config.getHeaders();
			return this.http
				.post(url, request, { headers: headers })
				.map((data: Response) => JSON.parse(data["_body"]));
		});
	}

	getHome() {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/home`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getCurrent() {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/account/current`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.map(data => JSON.parse(data["_body"]));
		});
	}

	updatePin(value) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/account/update`;
			let headers = this.config.getHeaders();
			return this.http
				.post(url, value, { headers: headers })
				.map(data => JSON.parse(data["_body"]));
		});
	}

	loginWithToken(credentials) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/account/login`;
			return this.http
				.post(url, credentials)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getLicense() {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/account/license`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.map(data => JSON.parse(data["_body"]));
		});
	}
}
