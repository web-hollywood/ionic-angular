import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { Config } from "./config";

@Injectable()
export class HomeService {
	constructor(public http: Http, public config: Config) {
		console.log("Hello HomeService Provider");
	}

	addStudent(id, classCode, studentName) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/home/${id}/student`;
			//let data = {'code': classCode, 'student_name': studentName, 'token': token};
			let data = { token: classCode, student_name: studentName };
			let headers = this.config.getHeaders();
			return this.http
				.post(url, data, { headers: headers })
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getHomeData(id) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/home/${id}/student`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.map(data => JSON.parse(data["_body"]));
		});
	}
}
