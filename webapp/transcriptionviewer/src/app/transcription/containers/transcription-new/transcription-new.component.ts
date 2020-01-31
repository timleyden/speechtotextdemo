import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { KeyValuePipe } from '@angular/common';

import { FileService } from '../../../file.service'
import { TranscriptService } from '../../../transcript.service'
import { TranscriptDefinition, TranscriptProperty, AllProfanityFilterMode, AllPunctuationMode } from '../../../transcript-definition';
import { Locations } from '../../../speechLocations';
import { AccountDetails } from 'src/app/account-details';
import { AccountService } from 'src/app/account.service';


@Component({
  selector: 'app-transcription-new',
  templateUrl: './transcription-new.component.html',
  styleUrls: ['./transcription-new.component.css']
})
export class TranscriptionNewComponent implements OnInit {
  showAdvanced;
  showAdvancedText;
  audioFiles: any[];
  newTranscriptForm;
  fileService: FileService;
  punctuationOptions;
  profanityOptions;
  locationOptions;
  details: AccountDetails;
  transcriptDef = new TranscriptDefinition();
  showUpload:boolean;

  constructor(private formBuilder: FormBuilder, fileService: FileService, private transcriptService: TranscriptService, private accountService:AccountService) {
    this.showAdvanced = false;
    this.fileService = fileService;
    this.showAdvancedText = "Advanced";
    this.audioFiles = Array();
    this.showUpload = false;

    this.punctuationOptions = AllPunctuationMode;
    this.profanityOptions = AllProfanityFilterMode;
    this.locationOptions = Locations;
    if(this.accountService.Details.AccountName && this.accountService.Details.SASToken){
      this.ngOnChange(this.accountService.Details);
    }

  }

  ngOnInit() {
  }
  private async bindAudioFileChoice() {
    for await (const blob of <any>(this.fileService.getAudioFiles(this.details.AccountName, this.details.SASToken))) {
      this.audioFiles.push(blob)
    }
  }
  toggleUpload(){
    this.showUpload = !this.showUpload;
  }
  toggleAdvanced(event) {
    this.showAdvanced = !this.showAdvanced

    if (this.showAdvanced == true) {
      this.showAdvancedText = "Hide Advanced"
    }
    else {
      this.showAdvancedText = "Advanced"
    }
  }
  onSubmit() {
    this.transcriptDef.recordingsUrl = this.fileService.getRecordingUrl(this.details.AccountName, this.details.SASToken, this.transcriptDef.recordingsUrl);
    console.info(JSON.stringify(this.transcriptDef));
    this.transcriptService.PostTranscriptionRequest(this.transcriptDef, this.details.Region, this.details.ServiceKey).subscribe(data => { console.log(data); window.alert('done') })

  }

  ngOnChange(val: AccountDetails) {
    this.details = val;

    this.bindAudioFileChoice();
    //enable submit button

  }
}
