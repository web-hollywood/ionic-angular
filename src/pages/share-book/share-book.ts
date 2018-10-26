import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, ViewController, Slides } from 'ionic-angular';
import { ClassService } from '../../providers/class-service';
import { UtilService } from '../../providers/util-service';
import { Auth } from '../../providers/auth';
import { Config } from '../../providers/config';
import { StudentService } from '../../providers/student-service'
import { AlertController } from 'ionic-angular';
import { EventsService } from '../../providers/events-service';
import { IonicPage } from "ionic-angular";
import { SwiperConfigInterface } from "ngx-swiper-wrapper";

@IonicPage()
@Component({
  selector: 'page-share-book',
  templateUrl: 'share-book.html'
})
export class ShareBookPage {
  data: any;
  classData: any = {};
  studentData: any;
  readingGroups: any;
  studentList = [];
  bookId: any;
  reasonList = [];
  reason: any;
  reason_id: any;
  selectedStudent: any;
  selectedGroup: any;
  second = false;
  cheer = false;

  public config_swiper: SwiperConfigInterface = {
    scrollbar: null,
    direction: "horizontal",
    slidesPerView: 5,
    spaceBetween: 2
  };

  public config_swiper1: SwiperConfigInterface = {
    scrollbar: null,
    direction: "horizontal",
    slidesPerView: 4,
    spaceBetween: 2,
    nextButton: ".swiper-button-next",
    prevButton: ".swiper-button-prev"
  };

  @ViewChild(Slides) slides: Slides;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public config: Config,
    public viewCtrl: ViewController,
    public classService: ClassService,
    public studentService: StudentService,
    public eventsService: EventsService,
    public auth: Auth,
    public alertCtrl: AlertController,
    public utilService: UtilService) {

    this.bookId = navParams.get('book_id');
    this.readingGroups = navParams.get('readinggroups');
    this.data = navParams.get('data');
    this.cheer = navParams.get('cheer');

    this.studentData = this.studentService.studentData;
    this.classData = this.classService.classData;
    this.studentList = this.classService.classData;

    if (this.cheer) {
      this.reasonList = navParams.get('reasonList');
    } else {
      this.eventsService.getReason()
        .subscribe(data => {
          this.reasonList = data.reasons;
        });
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ShareBookPage');
    this.second = false;
    let idx = 0 ;
    for (let i = 0; i < this.readingGroups.length; i++) {
      if (this.studentData && this.readingGroups[i].id == this.studentData.readinggroup.id) {
        this.readingGroups[i]['me'] = '1';
        idx = i;
      } else {
        this.readingGroups[i]['me'] = '0';
      }
    }
    if (idx > 0) {
      let temp = this.readingGroups[0];
      this.readingGroups[0] = this.readingGroups[idx];
      this.readingGroups[idx] = temp;
    }
    window.onresize = e => {
      this.resizeWin();
    };
    this.resizeWin();
  }

  resizeWin() {
    let w = window.innerWidth;
    if (w >= 500) {
      this.config_swiper.slidesPerView = 4;
      this.config_swiper1.slidesPerView = 4;
    } else {
      this.config_swiper.slidesPerView = 3;
      this.config_swiper1.slidesPerView = 2;
    }
  }

  closeModal() {
    this.viewCtrl.dismiss({ reason: "", reason_id: null });
  }

  selectGroup(group) {
    this.selectedStudent = null;
    this.selectedGroup = group;
    this.second = true;
  }

  selectStudent(student) {
    this.selectedStudent = student;
    this.second = true;
  }

  shareBookToGroup() {
    let read_info: any;
    read_info = this.selectedGroup;
    let data = {
      book_id: this.bookId,
      event_type: 'share',
      readinggroup_id: read_info.id,
      reason_id: this.reason_id,
      reason: this.reason
    };
    this.eventsService.createEvent(data)
      .subscribe(data => {
        this.closeModal();
        let message = `Sharing to your reading group. Get extra points by getting somone to read this book`;
        this.utilService.createToast(message);
      });
  }

  shareBookToStudent(student) {
    let data = {
      book_id: this.bookId,
      event_type: 'share',
      student_id: this.config.student_id,
      other_student_id: student.id,
      reason_id: this.reason_id,
      reason: this.reason
    };
    this.eventsService.createEvent(data)
      .subscribe(data => {
        this.closeModal();
        let message = `Sharing to ` + student.title + `. its now in their Selected to read list`;
        this.utilService.createToast(message);
      });
  }

  selectReason(i) {
    this.reason = this.reasonList[i].title;
    this.reason_id = this.reasonList[i].id;
    if (this.cheer) {
      this.cheering();
    } else {
      if (this.selectedStudent) { // share to student
        this.shareBookToStudent(this.selectedStudent);
      } else { // share to group
        this.shareBookToGroup();
      }
    }
  }

  cheering() {
    this.viewCtrl.dismiss({ reason: this.reason, reason_id: this.reason_id });
  }

}
