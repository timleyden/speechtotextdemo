import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-transcription-save-bottomsheet',
  templateUrl: './transcription-save-bottomsheet.component.html',
  styleUrls: ['./transcription-save-bottomsheet.component.css'],
  providers:[DatePipe]
})
export class TranscriptionSaveBottomsheetComponent implements OnInit {

  constructor(private _bottomSheetRef: MatBottomSheetRef<TranscriptionSaveBottomsheetComponent>,@Inject(MAT_BOTTOM_SHEET_DATA) public inData: any, private datePipe: DatePipe) {}

  ngOnInit() {
  }
  downloadRawResults() {
    location.href = this.inData.transcript.resultsUrls.channel_0
  }
  formatOffset(offset) {
    return this.datePipe.transform((new Date(1970, 0, 1).setSeconds(offset / 10000000)), 'HH:mm:ss')
  }
  processAndCreateFile() {
    var filename = 'transcript.txt'
    const blobparts = this.inData.transcriptData.map((data) => this.formatOffset(data.Offset) + ':\t' + data.NBest[0].Display + '\n')
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
      this._bottomSheetRef.dismiss();
    }

  }
  downloadModifiedResults(){
    var filename = 'traningdata.json'
    var exportdata = this.inData;
    var blob = new Blob([(JSON.stringify(exportdata,null,1))], { type: 'text/plain' });
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
      this._bottomSheetRef.dismiss();
    }
  }
}
