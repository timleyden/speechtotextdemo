import { Component, OnInit } from '@angular/core';
import { transcripts } from '../../../trancripts';
import { FileService } from '../../../file.service'
import { TranscriptDefinition } from 'src/app/transcript-definition';
import { AccountDetails } from '../../../account-details';
import { TranscriptService } from 'src/app/transcript.service';
import { AccountService } from 'src/app/account.service';
import { MatSnackBar } from '@angular/material';
import { NavigationService } from 'src/app/navigation.service';
@Component({
  selector: 'app-trancript-list',
  templateUrl: './trancript-list.component.html',
  styleUrls: ['./trancript-list.component.css']
})
export class TrancriptListComponent implements OnInit {
  transcriptions: any[]
  details: AccountDetails;
  displayedColumns: string[] = ["created", "name", "status", "locale", "open", "delete"]
  timerHandle: any;
  detailsValid: boolean = false
  constructor(fileService: FileService, private transcriptService: TranscriptService, private accountService: AccountService, private _snackbar: MatSnackBar, private navService: NavigationService) {
    if (this.accountService.IsSpeechValid.value) {
      this.ngOnChange(this.accountService.Details);
    }
    navService.NavTitle = navService.DefaultTitle + ' List'
  }

  ngOnInit() {
  }
  ngOnDestroy() {
    clearInterval(this.timerHandle);
  }
  getTranscriptions() {
    this.transcriptService.GetTranscriptions(this.details.Region, this.details.ServiceKey).subscribe(data => { this.transcriptions = Object.assign([], data); this.detailsValid = true; }, error => { this._snackbar.open('Error connecting to speech to text service. Please check account details. Error message: ' + error.message, 'Dismiss', { duration: 5000 }); console.error(error); clearInterval(this.timerHandle); this.accountService.IsSpeechValid.next(false) });

  }
  ngOnChange(val: AccountDetails) {
    this.details = val;
    if (this.accountService.IsSpeechValid.value) {
      this.getTranscriptions();
      this.timerHandle = setInterval(() => {
        this.getTranscriptions();
      }, 30000);
    }
  }
  deleteTranscription(id) {
    this.transcriptService.DeleteTranscription(this.details.Region, this.details.ServiceKey, id).subscribe(() => { this._snackbar.open('transcription deleted', 'Dismiss', { duration: 8000 }); this.getTranscriptions(); }, error => { console.error(error) })
  }

}
