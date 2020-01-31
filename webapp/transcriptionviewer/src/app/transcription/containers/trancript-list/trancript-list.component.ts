import { Component, OnInit } from '@angular/core';
import {transcripts} from '../../../trancripts';
import {FileService} from '../../../file.service'
import { TranscriptDefinition } from 'src/app/transcript-definition';
import { AccountDetails } from '../../components/storageaccount-detail/storageaccount-detail.component';
import { TranscriptService } from 'src/app/transcript.service';
@Component({
  selector: 'app-trancript-list',
  templateUrl: './trancript-list.component.html',
  styleUrls: ['./trancript-list.component.css']
})
export class TrancriptListComponent implements OnInit {
transcriptions:any[]
details:AccountDetails;
timerHandle
  constructor(fileService:FileService, private transcriptService: TranscriptService) {
     fileService.getTranscripts("accountname","sastoken")
     fileService.getAudioFiles("accountname","sastoken")
   }

  ngOnInit() {
  }
  getTranscriptions() {
    this.transcriptService.GetTranscriptions(this.details.Region, this.details.ServiceKey).subscribe(data => { this.transcriptions = Object.assign([], data) }, error => { console.warn(error) });

  }
  ngOnChange(val: AccountDetails) {
    this.details = val;
    this.getTranscriptions();
    this.timerHandle = setInterval(() => {
      this.getTranscriptions();
    }, 30000);
  }

}
