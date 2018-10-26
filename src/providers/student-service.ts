import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Config } from "../providers/config";
import "rxjs/add/operator/map";
import { Observable } from "rxjs/Observable";

@Injectable()
export class StudentService {
	studentData: any;
	constructor(public http: Http, public config: Config) { }
	getStudentEmail(studentID) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/user/${studentID}`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.map(data => JSON.parse(data["_body"]));
		});
	}

	addStudentObject(studentObj, type, studentId = null, classId = null) {
		var bpush = true;
		if (type == "student") {
			for (let item of this.config.studentObject[type]) {
				if (
					item.student.id == studentObj.student.id &&
					item.classroom.id == studentObj.classroom.id
				) {
					bpush = false;
					break;
				}
			}
		} else if (type == "feed" || type == "currentReading") {
			studentObj["student_id"] = studentId;
			studentObj["class_id"] = classId;
			for (let item of this.config.studentObject[type]) {
				if (item.student_id == studentObj.student_id) {
					bpush = false;
					break;
				}
			}
		}

		if (bpush) {
			this.config.studentObject[type].push(studentObj);
		}

		// XXX PERFORMANCE - Should we be returning here if it is already loaded?

		//if(1) return;
		// set variable from API call
		if (type == "student") {
			this.getStudent(
				studentObj.student.id,
				studentObj.classroom.id,
				true
			).subscribe(data => {
				for (let i = 0; i < this.config.studentObject[type].length; i++) {
					var item = this.config.studentObject[type][i];
					if (
						item.student.id == studentObj.student.id &&
						item.classroom.id == studentObj.classroom.id
					) {
						this.config.studentObject[type][i] = data;
						break;
					}
				}
			});
		} else if (type == "feed") {
			this.getFeed(studentObj.student_id, "grouped", true).subscribe(data => {
				for (let i = 0; i < this.config.studentObject[type].length; i++) {
					var item = this.config.studentObject[type][i];
					if (item.student_id == studentObj.student_id) {
						data["student_id"] = studentId;
						data["class_id"] = classId;
						this.config.studentObject[type][i] = data;
						break;
					}
				}
			});
		} else if (type == "currentReading") {
			this.getCurrentBooks(studentObj.student_id, classId, true).subscribe(
				data => {
					for (let i = 0; i < this.config.studentObject[type].length; i++) {
						var item = this.config.studentObject[type][i];
						if (item.student_id == studentObj.student_id) {
							data["student_id"] = studentId;
							data["class_id"] = classId;
							this.config.studentObject[type][i] = data;
							break;
						}
					}
				}
			);
		}
	}

	getStudentObject(classId, studentId, type) {
		var ret = null;
		if (type == "student") {
			for (let item of this.config.studentObject[type]) {
				if (item.classroom.id == classId && item.student.id == studentId) {
					ret = item;
				}
			}
		} else if (type == "feed" || type == "currentReading") {
			for (let item of this.config.studentObject[type]) {
				if (item.student_id == studentId) {
					ret = item;
				}
			}
		}
		return ret;
	}

	getStudent(studentID, classID, forceAPICall = false) {
		let studentObj = this.getStudentObject(classID, studentID, "student");
		if (studentObj != null && !forceAPICall) {
			return Observable.fromPromise(Promise.resolve(studentObj));
		} else {
			return this.config.getAPIURL().flatMap(apiurl => {
				let url = `${apiurl}/class/${classID}/student/${studentID}`;
				let headers = this.config.getHeaders();
				return this.http
					.get(url, { headers: headers })
					.timeout(this.config.timeout)
					.map(data => JSON.parse(data["_body"]));
			});
		}
	}

	getRecommended(studentID, classID) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${classID}/student/${studentID}/recommend`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getSelectedList(studentID, classID) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${classID}/student/${studentID}/list/select`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getFeed(studentID, type, forceAPICall = false) {
		let studentObj = this.getStudentObject(null, studentID, "feed");
		if (studentObj != null && !forceAPICall) {
			return Observable.fromPromise(Promise.resolve(studentObj));
		} else {
			return this.config.getAPIURL().flatMap(apiurl => {
				let url = `${apiurl}/feed/student/${studentID}/${type}`;
				let headers = this.config.getHeaders();
				return this.http
					.get(url, { headers: headers })
					.timeout(this.config.timeout)
					.map(data => JSON.parse(data["_body"]));
			});
		}
	}

	getFeedReviews(studentId) {
		let url1 = "classcollective";
		if (this.config.mode == 'class') {
			url1 = "studentcollective/" + studentId;
		}
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/feed/${url1}`;
			let headers = this.config.getHeaders();
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getCurrentBooks(studentID, classID, forceAPICall = false) {
		let studentObj = this.getStudentObject(
			classID,
			studentID,
			"currentReading"
		);
		if (studentObj != null && !forceAPICall) {
			return Observable.fromPromise(Promise.resolve(studentObj));
		} else {
			return this.config.getAPIURL().flatMap(apiurl => {
				let url = `${apiurl}/class/${classID}/student/${studentID}/list/current`;
				let headers = this.config.getHeaders();
				return this.http
					.get(url, { headers: headers })
					.timeout(this.config.timeout)
					.map(data => JSON.parse(data["_body"]));
			});
		}
	}
	setStudentPin(studentID, classID, Pin) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/class/${classID}/student/${studentID}`;
			let data = { pin: Pin };
			let headers = this.config.getHeaders();
			return this.http
				.put(url, data, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"])); //, 'setStudentPin->>>>>';
		});
	}
}
