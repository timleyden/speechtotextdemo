import { Component, OnInit } from '@angular/core';
import { transcripts } from '../../../trancripts';
import { FileService } from '../../../file.service'
import { TranscriptDefinition } from 'src/app/transcript-definition';
import { AccountDetails } from '../../../account-details';
import { TranscriptService } from 'src/app/transcript.service';
import { AccountService } from 'src/app/account.service';
import { MatSnackBar } from '@angular/material';
import { NavigationService } from 'src/app/navigation.service';
import * as moment from 'moment';

@Component({
  selector: 'app-trancript-list',
  templateUrl: './trancript-list.component.html',
  styleUrls: ['./trancript-list.component.css']
})
export class TrancriptListComponent implements OnInit {
  transcriptions: any[]
  details: AccountDetails;
  displayedColumns: string[] = ["created", "name", "status", "locale","duration", "open", "delete"]
  timerHandle: number;
  detailsValid: boolean = false
  constructor(fileService: FileService, private transcriptService: TranscriptService, public accountService: AccountService, private _snackbar: MatSnackBar, private navService: NavigationService) {
    if (this.accountService.IsSpeechValid.value) {
      this.ngOnChange(this.accountService.Details);
    }
    navService.NavTitle = ' - List'

  }

  ngOnInit() {
    this.navService.MenuIcons = this.navService.MenuIcons.concat([{"icon":"insert_drive_file","toolTip":"Open Transcript from Local Computer","click":()=>{window.alert('method not yet implemented')},"order":50}]);
  }
  ngOnDestroy() {
    window.clearInterval(this.timerHandle);
  }
  getTranscriptions() {
    this.transcriptService.GetTranscriptions().subscribe(data => { this.transcriptions = Object.assign([], data.values); this.detailsValid = true; }, error => { this._snackbar.open('Error connecting to speech to text service. Please check account details. Error message: ' + error.message, 'Dismiss', { duration: 5000 }); console.error(error); clearInterval(this.timerHandle); this.accountService.IsSpeechValid.next(false) });

  }
  humanizeDuration(duration){
    return moment.duration(duration).humanize()
  }
  ngOnChange(val: AccountDetails) {
    this.details = val;
    if(this.timerHandle){
      window.clearInterval(this.timerHandle);
    }
    if (this.accountService.IsSpeechValid.value) {
      this.getTranscriptions();
      this.timerHandle = window.setInterval(() => {
        this.getTranscriptions();
      }, this.accountService.Details.RefreshRate*1000);
    }
  }
  deleteTranscription(id) {
    this.transcriptService.DeleteTranscription(id).subscribe(() => { this._snackbar.open('transcription deleted', 'Dismiss', { duration: 8000 }); this.getTranscriptions(); }, error => { console.error(error) })
  }

}
