import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Config } from "../providers/config";
import "rxjs/add/operator/map";
import "rxjs/add/operator/timeout";
import { Observable } from "rxjs/Observable";
import { Storage } from "@ionic/storage";

@Injectable()
export class ClassService {
	public classData: any;
	public classOptions: any;
	constructor(
		public storage: Storage,
		public http: Http,
		public config: Config
	) {}

	addClassObject(classObj) {
		this.config.classObject = classObj;
		this.storage.set("classObject", JSON.stringify(classObj));
		localStorage.setItem("classObject", "1");
		this.getStudents(classObj.class.id, true).subscribe(data => {
			this.config.classObject = data;
		});
	}

	getStudents(classID, forceAPICall = false) {
		var classObj = null;
		var hasClassId = false;
		classObj = this.config.classObject;
		if (classObj != null && classObj.class.id == classID) {
			hasClassId = true;
		}
		if (classObj != null && !forceAPICall && hasClassId) {
			return Observable.fromPromise(Promise.resolve(classObj));
		} else {
			return this.config.getAPIURL().flatMap(apiurl => {
				let url = `${apiurl}/class/${classID}/student`;
				let headers = this.config.getHeaders();
				return this.http
					.get(url, { headers: headers })
					.timeout(this.config.timeout)
					.map(data => JSON.parse(data["_body"]))
					.map(data => {
						data.students.forEach(student => {
							student.avatar = `${apiurl}/class/${classID}/student/${student.id}/avatar/thumbnail?width=160&${this.config.noCacheImg}`;
							for (let group of data.readinggroups) {
								if (!group.students) {
									group.students = [];
								}
								// Putting Each student in their respective Group
								if (group.id === student.readinggroup_id) {
									group.students.push(student);
									break;
								}
							}
						});

						return data;
					});
			});
		}
	}

	getHomeStudents(homeID) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/home/${homeID}/student`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]))
				.map(data => {
					var result = data;
					result.students.forEach(student => {
						if (student.id == 0) student.avatar = "";
						else
							student.avatar = `${apiurl}/class/${homeID}/student/${
								student.id
							}/avatar`;
					});

					return result;
				});
		});
	}

	getClasses() {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getClass(class_id) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${class_id}`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getFeed(class_id, offset = 0, limit = 20) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/feed/class/${class_id}?offset=${offset}&limit=${limit}`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getClassStats(class_id: number) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${class_id}/stats`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getTubs(class_id: number) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${class_id}/tub`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getClassLibrary(class_id: number) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${class_id}/tub/all`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	updateClass(classID, classData) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${classID}`;
			let headers = this.config.getHeaders();
			return this.http
				.put(url, classData, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	updatePin(pin) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/account/update`;
			let headers = this.config.getHeaders();
			return this.http
				.put(url, pin, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	updateReadingChallenge(classID, cycleID, data) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${classID}/cycle/${cycleID}`;
			let headers = this.config.getHeaders();
			return this.http
				.put(url, data, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	updateReadingGrp(classID, readingGrpID, title) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${classID}/readinggroup/${readingGrpID}`;
			let headers = this.config.getHeaders();
			return this.http
				.put(url, title, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	createReadingGrp(classID, title) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${classID}/readinggroup`;
			let headers = this.config.getHeaders();
			return this.http
				.post(url, title, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	deleteReadingGrp(classID, readingGrpID) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${classID}/readinggroup/${readingGrpID}`;
			let headers = this.config.getHeaders();
			return this.http
				.delete(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	deleteBookFromList(classID, studentID, listName, bookID) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${classID}/student/${studentID}/list/${listName}/book/${bookID}`;
			let headers = this.config.getHeaders();
			return this.http
				.delete(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	reorderReadingGroup(classID, readingGroupList) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${classID}/readinggroup/order`;
			let headers = this.config.getHeaders();
			return this.http
				.post(url, readingGroupList, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	// A general Class Attributes Update function
	updateClassAttr(classID, key, value) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let data = { [key]: value };
			let url = `${apiurl}/class/${classID}`;
			let headers = this.config.getHeaders();
			return this.http
				.put(url, data, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	// Create a New Class for Teacher
	createClass(data) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class`;
			let headers = this.config.getHeaders();
			return this.http
				.post(url, data, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}
}
