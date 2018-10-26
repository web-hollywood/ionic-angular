import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { Config } from "./config";

@Injectable()
export class EventsService {
	constructor(public http: Http, public config: Config) { }

	putEvent(data, feedId) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/event/${feedId}`;
			let headers = this.config.getHeaders();
			return this.http
				.put(url, data, { headers: headers })
				.timeout(this.config.timeout)
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	createEvent(data) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/event`;
			let headers = this.config.getHeaders();
			return this.http
				.post(url, data, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	removeFileFromEvent(id, filename) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/event/${id}/file/${filename}`;
			let headers = this.config.getHeaders();
			return this.http
				.delete(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	postFileToEvent(id, data) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/event/${id}/file`;
			let headers = this.config.getHeaders();
			// headers.append("Content-Type", `multipart/form-data`);
			return this.http
				.post(url, data, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	updateEvent(eventId, data) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/event/${eventId}`;
			let headers = this.config.getHeaders();
			return this.http
				.put(url, data, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	deleteEvent(feedId) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/event/${feedId}`;
			let headers = this.config.getHeaders();
			return this.http
				.delete(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getReason() {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/event/reason`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	deleteFromCurrentList(bookId) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/list/current/book/${bookId}`;
			let headers = this.config.getHeaders();
			return this.http
				.delete(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	setRatings(eventType, bookId, ratings) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/event`;
			let data = { event_type: eventType, book_id: bookId, rating: ratings };
			let headers = this.config.getHeaders();
			return this.http
				.post(url, data, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getEventHistory(bookId) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/book/${bookId}/event`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}
}
