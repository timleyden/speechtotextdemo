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



@Component({
  selector: 'app-transcription-detail',
  templateUrl: './transcription-detail.component.html',
  styleUrls: ['./transcription-detail.component.css'],
  providers: [DatePipe]
})
export class TranscriptionDetailComponent implements OnInit {
  transcript;
  transcriptData: any[];
  nextOffset;
  details: AccountDetails;
  redThreshold: number;
  yellowThreshold: number;
  enableHighlighting: boolean;
  showConfidence: boolean;
  showSequence: boolean;
  showOffset: boolean;
  enableEditing: boolean
  availableColumns:string[]=["index","speaker","channel","offset","confidence","text","original","actions"]
  displayedColumns:string[]=["offset","text","actions"]

  constructor(private route: ActivatedRoute, private http: HttpClient, private transcriptService: TranscriptService, private datePipe: DatePipe, private ads: AccountService) {
    this.redThreshold = 82;
    this.yellowThreshold = 88
    this.transcriptData = []
    if (this.ads.Details.Region && this.ads.Details.ServiceKey) {
      this.ngOnChange(this.ads.Details);
    }

  }

  ngOnInit() {
    this.nextOffset = 0;


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
    this.route.paramMap.subscribe(params => {
      //this.transcript = transcripts[+params.get('transcriptId')]
      this.transcriptService.GetTranscription(this.details.Region, this.details.ServiceKey, params.get('transcriptId')).subscribe(data => {
        this.transcript = data;
        this.transcript.recordingsUrl = this.transcript.recordingsUrl.split('?')[0]+this.details.SASToken
        var observables: Observable<object>[] = [];
        for (const key in this.transcript.resultsUrls) {
          if (this.transcript.resultsUrls.hasOwnProperty(key)) {
            const element = this.transcript.resultsUrls[key];
            observables.push(this.http.get(element))

          }
        }
        forkJoin(observables).subscribe((results: []) => {
          results.forEach((element: any) => {
            //normalize results

            this.transcriptData = this.transcriptData.concat(Object.assign([], element.AudioFileResults[0].SegmentResults.map((utterance) => { utterance.ChannelNumber = element.AudioFileResults[0].AudioFileName.split('.')[1]; return utterance })));
          });
          this.transcriptData.sort((n1, n2) => {
            var first = Number(n1.Offset);
            var second = Number(n2.Offset)
            if (first > second) {
              return 1;
            } if (first < second) {
              return -1;
            }
            else return 0;
          })
        })
      });
    });
  }
  jumpTo(event) {
    var offset = event.srcElement.getAttribute("offset");
    var audio = document.getElementsByTagName('audio')[0];
    audio.currentTime = offset;
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
      var u1 = utterances[i]
      var offset = Number(u1.getAttribute("offset"))
      var next = 0;
      if (i + 1 < utterances.length) {
        var u2 = utterances[i + 1]
        next = Number(u2.getAttribute("offset"))
      } else {
        next = offset + 30; //we are at the end of the transcript add 30 seconds to allow for long utterance
      }
      if (audio.currentTime > offset && audio.currentTime < next) {
        utterances[i].classList.add("selected");
        this.nextOffset = next;
      } else {
        utterances[i].classList.remove("selected");
      }
    }
  }
  editButton(id) {
    //window.alert(this.transcriptData[id].Offset);
    if (!this.transcriptData[id].NBest[0].Original) {
      this.transcriptData[id].NBest[0].Original = this.transcriptData[id].NBest[0].Display
    }
    document.getElementById('inputdiv' + id).classList.remove("hideInput")
    document.getElementById('displaydiv' + id).classList.add("hideInput")
  }
  saveButton(id) {

    //this.transcriptData[id].NBest[0].Display = document.getElementById('input' + id).value
    document.getElementById('inputdiv' + id).classList.add("hideInput")
    document.getElementById('displaydiv' + id).classList.remove("hideInput")
  }
  formatOffset(offset) {
    return this.datePipe.transform((new Date(1970, 0, 1).setSeconds(offset / 10000000)), 'HH:mm:ss')
  }
  downloadRawResults() {
    location.href = this.transcript.resultsUrls.channel_0
  }
  processAndCreateFile() {
    var filename = 'transcript.txt'
    const blobparts = this.transcriptData.map((data) => this.formatOffset(data.Offset) + ':\t' + data.NBest[0].Display + '\n')
    var blob = new Blob(blobparts, { type: 'text/plain' });
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      var e: any = document.createEvent('MouseEvents'),
        a = document.createElement('a');
      a.download = filename;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
      e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(e);
      // window.URL.revokeObjectURL(a.href); // clean the url.createObjectURL resource
    }
  }
  submitForTraining() {
    var filename = 'traningdata.json'
    var exportdata = { recordingurl: this.transcript.recordingsUrl, SegmentResults: this.transcriptData }
    var blob = new Blob([(JSON.stringify(exportdata))], { type: 'text/plain' });
    //var blob = new Blob(blobparts, {type: 'text/json'});
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      var e: any = document.createEvent('MouseEvents'),
        a = document.createElement('a');
      a.download = filename;
      a.href = window.URL.createObjectURL(blob);
      a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
      e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      a.dispatchEvent(e);
      // window.URL.revokeObjectURL(a.href); // clean the url.createObjectURL resource
    }
  }
  //only worked in edge
  // audioError(eventData){
  //   window.alert('audio error: check the audio file exists and the SAStoken is valid');
  //   console.log(eventData);
  // }
  audioEmptied(eventData){
    console.log(eventData);
    setTimeout(() => {
      console.log(eventData.srcElement.networkState)
if(eventData.srcElement.networkState == eventData.srcElement.NETWORK_NO_SOURCE){
  window.alert('audio error: recording url is like invalid. check the recording file still exists.')
}
    }, 2000);

  }
}
