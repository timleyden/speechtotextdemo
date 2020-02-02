import { Component, OnInit } from '@angular/core';
import { transcripts } from '../../../trancripts';
import { FileService } from '../../../file.service'
import { TranscriptDefinition } from 'src/app/transcript-definition';
import { AccountDetails } from '../../../account-details';
import { TranscriptService } from 'src/app/transcript.service';
import { AccountService } from 'src/app/account.service';
import { MatSnackBar } from '@angular/material';
@Component({
  selector: 'app-trancript-list',
  templateUrl: './trancript-list.component.html',
  styleUrls: ['./trancript-list.component.css']
})
export class TrancriptListComponent implements OnInit {
  transcriptions: any[]
  details: AccountDetails;
  timerHandle
  constructor(fileService: FileService, private transcriptService: TranscriptService, private accountService: AccountService, private _snackbar:MatSnackBar) {
    fileService.getTranscripts("accountname", "sastoken")
    fileService.getAudioFiles("accountname", "sastoken")
    if (this.accountService.Details.Region && this.accountService.Details.ServiceKey) {
      this.ngOnChange(this.accountService.Details);
    }
  }

  ngOnInit() {
  }
  ngOnDestroy() {
    clearInterval(this.timerHandle);
  }
  getTranscriptions() {
    this.transcriptService.GetTranscriptions(this.details.Region, this.details.ServiceKey).subscribe(data => { this.transcriptions = Object.assign([], data) }, error => { console.error(error) });

  }
  ngOnChange(val: AccountDetails) {
    this.details = val;
    this.getTranscriptions();
    this.timerHandle = setInterval(() => {
      this.getTranscriptions();
    }, 30000);
  }
  deleteTranscription(id) {
    this.transcriptService.DeleteTranscription(this.details.Region, this.details.ServiceKey, id).subscribe(() => { this._snackbar.open('transcription deleted','Dismiss',{duration:5000}); this.getTranscriptions(); }, error => { console.error(error) })
  }

}
