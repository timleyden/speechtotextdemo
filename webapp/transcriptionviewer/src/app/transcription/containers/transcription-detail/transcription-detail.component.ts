import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { transcripts } from '../../../trancripts';
import { HttpClient } from '@angular/common/http';
import { TranscriptService } from '../../../transcript.service';
import { runInThisContext } from 'vm';
import { DatePipe, KeyValuePipe } from '@angular/common';
import { Observable, forkJoin } from 'rxjs';
import { AccountDetails } from '../../../account-details';
import { AccountService } from 'src/app/account.service';
import { NavigationService } from 'src/app/navigation.service';
import { MatBottomSheet, MatSnackBar } from '@angular/material';
import { TranscriptionSaveBottomsheetComponent } from '../../components/transcription-save-bottomsheet/transcription-save-bottomsheet.component';
import { AppConfigService } from 'src/app/app-config.service';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import * as moment from 'moment';


@Component({
  selector: 'app-transcription-detail',
  templateUrl: './transcription-detail.component.html',
  styleUrls: ['./transcription-detail.component.css'],
  providers: [DatePipe]
})
export class TranscriptionDetailComponent implements OnInit {
  transcript;
  files
  selectedFile
  transcriptData: any[];
  nextOffset;
  details: AccountDetails;
  redThreshold: number;
  yellowThreshold: number;
  enableHighlighting: boolean = false;
  autoScroll:boolean = false;
  playbackRate: number;
  availableColumns: SelectItem[] = [{ "Value": "index", "Display": "Index", "Tooltip": "gives each utterance a line number to help reference" },
  { "Value": "speaker", "Display": "Speaker", "Tooltip": "If Diarization enabled, shows the identified speaker id" },
  { "Value": "channel", "Display": "Channel", "Tooltip": "if multi channel audio shows the channel number" },
  { "Value": "offset", "Display": "Offset", "Tooltip": "shows the time in seconds since the start of the audio" },
  { "Value": "confidence", "Display": "Confidence", "Tooltip": "confidence of the model for this utterance" },
  { "Value": "text", "Display": "Utterance", "Tooltip": "the transcribed text (utterance)" },
  { "Value": "original", "Display": "Original", "Tooltip": "If the transcript has been modified, this column shows the original generated text" },
  //{ "Value": "sentiment", "Display": "Sentiment", "Tooltip": "If sentiment enabled, show sentiment in the format of Negative, Neutral, Positive" },
  { "Value": "edit", "Display": "Edit Controls", "Tooltip": "Display the Edit and Save buttons for editing transcript" }
  ];
  displayedColumns: string[] = ["offset", "text", "edit"]

  constructor(private route: ActivatedRoute, private http: HttpClient, private transcriptService: TranscriptService, private datePipe: DatePipe, private ads: AccountService, private navService: NavigationService, private _bottomSheet: MatBottomSheet, private _snackbar: MatSnackBar) {
    this.redThreshold = 82;
    this.yellowThreshold = 88
    this.transcriptData = []
    this.playbackRate = 1;
    if (this.ads.Details.Region && this.ads.Details.ServiceKey) {
      this.ngOnChange(this.ads.Details);
    }

  }

  ngOnInit() {
    this.nextOffset = 0;
    this.navService.MenuIcons = this.navService.MenuIcons.concat([{ "icon": "delete", "toolTip": "Delete Transcription", "order": 50, "click": () => { this.transcriptService.DeleteTranscription(this.transcript.self).subscribe(data => { this._snackbar.open('transcription deleted', 'Dismiss', { duration: 8000 }); this.transcriptData = null; this.transcript = null; }) } }, { "icon": "save", "toolTip": "Save modified Transcript", "click": (icon) => { this._bottomSheet.open(TranscriptionSaveBottomsheetComponent, { data: { "transcript": this.transcript, "transcriptData": this.transcriptData } }) }, "order": 60 }, { "icon": "train", "toolTip": "Submit for model training", "click": (icon) => { this.submitForTraining() }, "order": 70 }]);


  }
  getColor(confidence) {
    var result = "white"
    if (this.enableHighlighting) {
      confidence = confidence * 100;
      result = 'lightgreen';
      if (confidence < this.redThreshold) {
        result = "salmon"
      } else if (confidence < this.yellowThreshold) {
        result = "palegoldenrod"
      }
    }
    return result;

  }
  ngOnChange(val: AccountDetails) {
    this.details = val;
    this.transcriptData = [];
    this.route.paramMap.subscribe(params => {
      //this.transcript = transcripts[+params.get('transcriptId')]
      var files$ = this.transcriptService.GetTranscription((params.get('transcriptId')+'/files'));
      var transcript$ = this.transcriptService.GetTranscription(params.get('transcriptId'));
      forkJoin<any,any>(files$,transcript$).subscribe(([data2,data1]) => {
        this.transcript = data1;
        this.files = data2.values.filter(val=>{return val.kind == "Transcription"});
        this.navService.NavTitle = " - View: " + this.transcript.displayName
        this.selectedFile = this.files[0].links.contentUrl;
        //this.transcript.recordingsUrl = this.transcript.recordingsUrl.split('?')[0] + this.details.SASTokenReadOnly
        var observables: Observable<object>[] = [];
        this.getTransciptData();

      });
    });
  }
test(){
  this.getTransciptData();
}
  getTransciptData(){

   this.http.get(this.selectedFile).subscribe((element:any) => {

        //normalize results
        this.transcript.recordingsUrl = element.source;//.split('?')[0] + this.details.SASTokenReadOnly
        var audio = document.getElementsByTagName('audio')[0];

        //looks like we no longer need to infer channel number form file name as its now a property and in a single file
        this.transcriptData = element.recognizedPhrases
        this.transcriptData.sort((n1, n2) => {
          var first = Number(n1.offsetInTicks);
          var second = Number(n2.offsetInTicks)
          if (first > second) {
            return 1;
          } if (first < second) {
            return -1;
          }
          else return 0;
        })
        audio.load();
      });



  }
  humanizeDuration(duration){
    return moment.duration(duration).humanize()
  }
  jumpTo(event) {
    var offset = event.srcElement.getAttribute("offset");
    var audio = document.getElementsByTagName('audio')[0];
    audio.currentTime = (offset/10000000);
    audio.play();
  }
  highlightUtterance(event) {
    var audio = event.srcElement;
    if (audio.currentTime < this.nextOffset) {
      return; // we are still inside the utterance dont bother looking for the next one
    }
    var utterances = document.getElementsByClassName('utterance')
    console.log(audio.currentTime)
    for (var i = 0; i < utterances.length; i++) {
      const u1 = utterances[i];
      const offset = Number(u1.getAttribute("offset"))/10000000;
      let next = 0;
      if (i + 1 < utterances.length) {
        const u2 = utterances[i + 1];
        next = Number(u2.getAttribute("offset"))/10000000;
      } else {
        next = offset + 30; //we are at the end of the transcript add 30 seconds to allow for long utterance
      }
      if (audio.currentTime > offset && audio.currentTime < next) {
        utterances[i].classList.add("selected");
        if(this.autoScroll){
         utterances[i].scrollIntoView({block:"center"})
        }
        this.nextOffset = next;
      } else {
        utterances[i].classList.remove("selected");
      }
    }
  }
  editButton(eventData, id) {
    //window.alert(this.transcriptData[id].Offset);
    if (!this.transcriptData[id].nBest[0].Original) {
      this.transcriptData[id].nBest[0].Original = this.transcriptData[id].nBest[0].Display
    }
    this.transcriptData[id].nBest[0].isEditable = true;
  }
  saveButton(eventData, id) {

    this.transcriptData[id].nBest[0].isEditable = false;
  }
  formatOffset(offset) {
    return this.datePipe.transform((new Date(1970, 0, 1).setSeconds(offset / 10000000)), 'HH:mm:ss')
  }

  submitForTraining() {

    var exportdata = { recordingurl: this.transcript.recordingsUrl,modelid: this.transcript.model.self, SegmentResults: this.transcriptData }
    this.http.post(this.details.TrainUrl,exportdata).subscribe(
      data=>{
      var sbr = this._snackbar.open('transcription submitted for training, View Progress at the custom speech portal', 'Open', { duration: 8000 });
      sbr.onAction().subscribe(()=>{
          window.open("https://speech.microsoft.com/portal?noredirect=true","_blank");
      });
    },
    error=>{
      this._snackbar.open('training submission failed', 'Dismiss', { duration: 8000 })
    });
  }
  //only worked in edge
  // audioError(eventData){
  //   window.alert('audio error: check the audio file exists and the SAStoken is valid');
  //   console.log(eventData);
  // }
  //for some reason audio control does not fire error event when network request returns a 404, used this as a work around to detect bad link
  audioEmptied(eventData) {
    setTimeout(() => {
      console.log(eventData.srcElement.networkState)
      if (eventData.srcElement.networkState == eventData.srcElement.NETWORK_NO_SOURCE) {
        window.alert('audio error: recording url is like invalid. check the recording file still exists.')
      }
    }, 2000);

  }
}
export class SelectItem {
  Display: string;
  Value: string;
  Tooltip: string
}
