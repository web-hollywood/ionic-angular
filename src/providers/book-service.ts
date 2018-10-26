import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { Config } from "./config";

@Injectable()
export class BookService {
	constructor(public http: Http, public config: Config) { }

	getBookCover(bookId) {
		// XXX NOTE: This is defaultApiUrl should be mainURL !!!
		return this.config.mainURL + "/book/" + bookId + "/cover";
	}

	postNewBookPage(bookId, newpages) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/bookdata/${bookId} `;
			var data = {data: { pages: newpages }};
			let headers = this.config.getHeaders();
			return this.http
				.put(url, data, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	setNewBookId(oldId, newId) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let url = `${apiurl}/book/${oldId}`;
			var data = { new_book_id: newId };
			let headers = this.config.getHeaders();
			return this.http
				.put(url, data, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getBookByClass(bookID) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let class_id = this.config.class_id;
			let headers = this.config.getHeaders();
			let url = `${apiurl}/class/${class_id}/book/${bookID}`;
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getBookById(bookID) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let headers = this.config.getHeaders();
			let url = `${apiurl}/book/${bookID}`;
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getBook(bookID, studentId, isTeacher = true) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let class_id = this.config.class_id;
			let headers = this.config.getHeaders();
			let url = `${apiurl}/class/${class_id}/book/${bookID}`;
			if (this.config.mode == 'class')
				url = url + `/student/${studentId}`;
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getBookDetail(classId, studentId, bookID, mode) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let headers = this.config.getHeaders();
			let url = `${apiurl}/class/${classId}/book/${bookID}`;
			if (mode == "class") {
				url =
					`${apiurl}/class/${classId}/book/${bookID}` + "/student/" + studentId;
			}
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getBookDetailEstimate(classId, studentId, bookID) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let headers = this.config.getHeaders();
			let url = `${apiurl}/class/${classId}/book/${bookID}/estimate`;
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	searchBook(keyword, quality, isInit = false, offset=0, limit=50) {
		let qq = 'none';
		let gg = '&grade=default';
		if (isInit) {
			this.config.grade = "";
			this.config.qualityValue = 0;
			qq = "&quality=0";
		} else {
			qq = "&quality=" + this.config.qualityValue;
		}
		if (this.config.grade != "") {
			gg = '&grade=' + this.config.grade;
		} else {
			gg = '&grade=none';
		}

		return this.config.getAPIURL().flatMap(apiurl => {
			keyword = encodeURIComponent(keyword);
			let headers = this.config.getHeaders();
			let url: string;
			// if(this.config.quality) {
			// 	url = `${apiurl}/book/?q=${keyword}&quality=${qq}`;
			// } else {
			// 	url = `${apiurl}/book/?q=${keyword}`;
			// }
			url = `${apiurl}/book/?q=${keyword}` + qq;
			url = url + gg;
			url = url + `&offset=${offset}&limit=${limit}`;
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getSimilarBooks(bookID) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let headers = this.config.getHeaders();
			let url = `${apiurl}/book/${bookID}/similar`;
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getGenreList() {
		return this.config.getAPIURL().flatMap(apiurl => {
			let headers = this.config.getHeaders();
			let url = `${apiurl}/genre`;
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}
	getFictionGenreList() {
		let arr_fiction_list = [
			{
				id: "G20",
				title: "Realistic Fiction",
				count: 142295
			},
			{
				id: "G24",
				title: "Classics",
				count: 3799
			},
			{
				id: "G27",
				title: "Emerging Readers",
				count: 23709
			},
			{
				id: "G25",
				title: "Holidays & Occasions",
				count: 17669
			},
			{
				id: "G06",
				title: "Poetry",
				count: 3618
			},
			{
				id: "G17",
				title: "Fantasy",
				count: 20765
			},
			{
				id: "G01",
				title: "Adventure",
				count: 21496
			},
			{
				id: "G16",
				title: "Fables & Myths",
				count: 8972
			},
			{
				id: "G03",
				title: "Comics & Graphic Books",
				count: 12865
			},
			{
				id: "G08",
				title: "Arts & Expression",
				count: 10938
			},
			{
				id: "G02",
				title: "Funny",
				count: 18133
			},
			{
				id: "G19",
				title: "Mystery & Suspense",
				count: 10483
			},
			{
				id: "G09",
				title: "Nature & Animals",
				count: 15530
			},
			{
				id: "G07",
				title: "Sports",
				count: 8473
			},
			{
				id: "G21",
				title: "Science Fiction",
				count: 5928
			},
			{
				id: "G18",
				title: "Historical Fiction",
				count: 6851
			},
			{
				id: "G05",
				title: "Games, Movies & TV",
				count: 6938
			},
			{
				id: "G22",
				title: "Scary",
				count: 1150
			},
			{
				id: "G04",
				title: "Diaries & Journals",
				count: 15
			},
			{
				id: "G10",
				title: "Romance",
				count: 0
			}
		];
		return arr_fiction_list;
	}
	getNonFictionGenreList() {
		let arr_non_fiction_list = [
			{
				id: "G27",
				title: "Emerging Readers",
				count: 23709
			},
			{
				id: "G25",
				title: "Holidays & Occasions",
				count: 17669
			},
			{
				id: "G06",
				title: "Poetry",
				count: 3618
			},
			{
				id: "G14",
				title: "STEM",
				count: 22668
			},
			{
				id: "G01",
				title: "Adventure",
				count: 21496
			},
			{
				id: "G28",
				title: "General Nonfiction",
				count: 21677
			},
			{
				id: "G03",
				title: "Comics & Graphic Books",
				count: 12865
			},
			{
				id: "G08",
				title: "Arts & Expression",
				count: 10938
			},
			{
				id: "G02",
				title: "Funny",
				count: 18133
			},
			{
				id: "G13",
				title: "Study & How-To",
				count: 11110
			},
			{
				id: "G15",
				title: "How People Live",
				count: 17122
			},
			{
				id: "G12",
				title: "History & World",
				count: 22953
			},
			{
				id: "G09",
				title: "Nature & Animals",
				count: 15530
			},
			{
				id: "G07",
				title: "Sports",
				count: 8473
			},
			{
				id: "G05",
				title: "Games, Movies & TV",
				count: 6938
			},
			{
				id: "G26",
				title: "Essays & Speeches",
				count: 171
			},
			{
				id: "G11",
				title: "Advice & Self-Help",
				count: 1536
			},
			{
				id: "G04",
				title: "Diaries & Journals",
				count: 15
			},
			{
				id: "G30",
				title: "Biography",
				counts: 0
			}
		];
		return arr_non_fiction_list;
	}
	getGenreBooksList(genre, offset=0, limit=50) {
		return this.config.getAPIURL().flatMap(apiurl => {
			let headers = this.config.getHeaders();
			let url = `${apiurl}/book/?genre=${genre}&quality=default&offset=${offset}&limit=${limit}`;
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getHistoryList() {
		return this.config.getAPIURL().flatMap(apiurl => {
			let headers = this.config.getHeaders();
			let url = `${apiurl}/search/history`;
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	getAutoCompleteList(value) {
		console.log("value is= ->>>>>>>>>>>>>>>>>>", value);
		return this.config.getAPIURL().flatMap(apiurl => {
			let headers = this.config.getHeaders();
			let url = `${apiurl}/search/autocomplete?q=${value}`;
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}
}
