import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Config } from "../providers/config";

import "rxjs/add/operator/map";
@Injectable()
export class TubsService {
	constructor(public http: Http, public config: Config) {
		console.log("Hello TubsService Provider");
	}
	getOneTub(class_id, tub_id) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${class_id}/tub/${tub_id}`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.map(data => JSON.parse(data["_body"]));
		});
	}
	getTubsList(class_id) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${class_id}/tub`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.map(data => JSON.parse(data["_body"]));
		});
	}

	createTub(class_id, title) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${class_id}/tub`;
			let data = { title: title };
			let headers = this.config.getHeaders();
			return this.http
				.post(url, data, { headers: headers })
				.map(data => JSON.parse(data["_body"]));
		});
	}

	addToTub(class_id, book_id, tub) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${class_id}/tub/${tub.id}`;
			let data = { book_id: book_id };
			let headers = this.config.getHeaders();
			return this.http
				.post(url, data, { headers: headers })
				.map(data => JSON.parse(data["_body"]));
		});
	}

	addBooksToTub(class_id, tub_id, books) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${class_id}/tub/${tub_id}`;
			let data = { books: books };
			let headers = this.config.getHeaders();
			return this.http
				.post(url, data, { headers: headers })
				.map(data => JSON.parse(data["_body"]));
		});
	}

	addBooksToScanList(bookIds) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/list/scanned`;
			let data = { books: bookIds };
			let headers = this.config.getHeaders();
			return this.http
				.post(url, data, { headers: headers })
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getScannedBooks() {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/list/scanned`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.map(data => JSON.parse(data["_body"]));
		});
	}

	deleteScanBook(bookId) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/list/scanned/book/${bookId}`;
			let headers = this.config.getHeaders();
			return this.http
				.delete(url, { headers: headers })
				.map(data => JSON.parse(data["_body"]));
		});
	}

	deleteAllScanedBook() {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/list/scanned/`;
			let headers = this.config.getHeaders();
			return this.http
				.delete(url, { headers: headers })
				.map(data => JSON.parse(data["_body"]));
		});
	}

	deleteBookFromSpecificTub(classId, tubId, bookId) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${classId}/tub/${tubId}/${bookId}`;
			let headers = this.config.getHeaders();
			return this.http
				.delete(url, { headers: headers })
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getTubsBooks(classId, tubId) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${classId}/tub/${tubId}`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.map(data => JSON.parse(data["_body"]));
		});
	}
}
