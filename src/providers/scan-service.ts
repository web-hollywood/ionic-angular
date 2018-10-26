import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import "rxjs/add/operator/map";
import { ClassService } from "./class-service";
import { Config } from "./config";

@Injectable()
export class ScanService {
	constructor(public http: Http, public config: Config,
		public classService: ClassService, ) { }

	searchBook(bookISBN) {
		return this.config.getAPIURL().flatMap(apiurl => {
			bookISBN = encodeURIComponent(bookISBN);
			let headers = this.config.getHeaders();
			let url = `${apiurl}/book/?isbn=${bookISBN}`;
			return this.http
				.get(url, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	sendBookPicture1(ISBNNo, BookCover, bookTitle, coverUrl, pages, author, gener, description = "") {
		let grade = this.classService.classData.class.grade;
		let grades = { "min": eval(grade) - 1, "max": eval(grade) + 1 }
		return this.config.getAPIURL().flatMap(apiurl => {
			var bookSeries = "";
			// var bookTitle = "We are adding this book to the MR database";
			let url = `${apiurl}/book/`;
			var data;
			if (coverUrl) {
				data = {
					title: bookTitle,
					series: bookSeries,
					isbn: ISBNNo,
					cover_url: coverUrl,
					author: author,
					pages: pages,
					supergenre: gener,
					description: description,
					grade: grades
				};
			} else {
				data = {
					title: bookTitle,
					series: bookSeries,
					isbn: ISBNNo,
					cover: BookCover,
					author: author,
					pages: pages,
					supergenre: gener,
					description: description,
					grade: grades
				};
			}
			let headers = this.config.getHeaders();
			return this.http
				.post(url, data, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	sendBookPicture(ISBNNo, BookCover) {
		return this.config.getAPIURL().flatMap(apiurl => {
			var bookSeries = "Any additional book details will automatically update.";
			var bookTitle = "We are adding this book to the MR database";
			let url = `${apiurl}/book/`;
			var data = {
				title: bookTitle,
				series: bookSeries,
				isbn: ISBNNo,
				cover: BookCover
			};
			let headers = this.config.getHeaders();
			return this.http
				.post(url, data, { headers: headers })
				.timeout(this.config.timeout)
				.map(data => JSON.parse(data["_body"]));
		});
	}

	postCoverToMatch(code, image) {
		var data = '{ "success" : true, "total":"0", "books":[]}';
		return JSON.parse(data);
	}

	//=============== validation ISBN begin ==================
	isValidISBN(isbn) {
		var result = false;

		if (isbn != null) {
			isbn = isbn.replace(/-/g, ""); // remove '-' symbols
			isbn = isbn.replace(/ /g, ""); // remove whiteSpace

			if (isbn.length != 10 && isbn.length != 13 && isbn.length != 17 && isbn.length != 18 && isbn.length != 12) {
				return false;
			}
			if (isbn.length == 17 || isbn.length == 18 || isbn.length == 12) {
				return true;
			}

			switch (isbn.length) {
				case 10:
					result = this.isValidISBN10(isbn);
					break;
				case 13:
					result = this.isValidISBN13(isbn);
					break;
			}
		}

		return result;
	}

	isValidISBN10(isbn) {
		var result = false;

		// ^ - start string
		// \d - digit
		// {9} - nine
		// \d{9} - nine digits
		// (\d|X) - digit or 'X' char
		// (\d|X){1} - one digit or 'X' char
		// $ - end string
		var regex = new RegExp(/^\d{9}(\d|X){1}$/);

		if (regex.test(isbn)) {
			var sum = 0;

			/*
  * result = (isbn[0] * 1 + isbn[1] * 2 + isbn[2] * 3 + isbn[3] * 4 + ... + isbn[9] * 10) mod 11 == 0
  */
			for (var i = 0; i < 9; i++) {
				sum += isbn[i] * (i + 1);
			}
			sum += isbn[9] == "X" ? 10 : isbn[9] * 10;

			result = sum % 11 == 0;
		}

		return result;
	}

	isValidISBN13(isbn) {
		var result = false;

		if (!isNaN(isbn)) {
			// isNaN - is Not a Number, !isNaN - is a number

			var index = 0;
			var sum = 0;

			/*
  * result = (isbn[0] * 1 + isbn[1] * 3 + isbn[2] * 1 + isbn[3] * 3 + ... + isbn[12] * 1) mod 10 == 0
  */
			for (var i = 0; i < isbn.length; i++) {
				sum += isbn[i] * (this.isOddNumber(index++) ? 3 : 1);
			}

			result = sum % 10 == 0;
		}

		return result;
	}

	isOddNumber(value) {
		return value % 2 != 0;
	}
	//=============== validation ISBN end ==================
}
