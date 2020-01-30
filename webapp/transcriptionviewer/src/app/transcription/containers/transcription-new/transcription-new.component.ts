import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { KeyValuePipe } from '@angular/common';

import { FileService } from '../../../file.service'
import { TranscriptService } from '../../../transcript.service'
import { TranscriptDefinition, TranscriptProperty, AllProfanityFilterMode, AllPunctuationMode } from '../../../transcript-definition';
import { Locations } from '../../../speechLocations';
import { AccountDetails } from '../../../storageaccount-detail/storageaccount-detail.component';

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
  transcriptions
  transcriptDef = new TranscriptDefinition();
  timerHandle;
  constructor(private formBuilder: FormBuilder, fileService: FileService, private transcriptService: TranscriptService) {
    this.showAdvanced = false;
    this.fileService = fileService;
    this.showAdvancedText = "Advanced";
    this.audioFiles = Array();
    //this.bindAudioFileChoice();
    //this.audioFiles = fileService.getAudioFiles("accountname","sastoken")
    this.newTranscriptForm = this.formBuilder.group({ title: '', description: '', servicekey: '', region: '', locale: '', audiofile: '', diarization: false, addwordleveltimestamps: false, sentiment: false, profanity: '', punctuation: '' });
    this.punctuationOptions = AllPunctuationMode;
    this.profanityOptions = AllProfanityFilterMode;
    this.locationOptions = Locations;

  }

  ngOnInit() {
  }
  private async bindAudioFileChoice() {
    for await (const blob of <any>(this.fileService.getAudioFiles(this.details.AccountName, this.details.SASToken))) {
      this.audioFiles.push(blob)
    }
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
    // if (this.transcriptDef.properties.AddDiarization) {
    //   this.transcriptDef.properties.AddDiarization = "True";
    // }
    // if (this.transcriptDef.properties.AddWordLevelTimestamps) {
    //   this.transcriptDef.properties.AddWordLevelTimestamps = "True"
    // }
    this.transcriptService.PostTranscriptionRequest(this.transcriptDef, this.details.Region, this.details.ServiceKey).subscribe(data => { console.log(data); window.alert('done') })

  }
  getTranscriptions() {
    this.transcriptService.GetTranscriptions(this.details.Region, this.details.ServiceKey).subscribe(data => { this.transcriptions = Object.assign([], data) }, error => { console.warn(error) });

  }
  ngOnChange(val: AccountDetails) {
    this.details = val;

    this.bindAudioFileChoice();
    //enable submit button
    this.getTranscriptions();
    this.timerHandle = setInterval(() => {
      this.getTranscriptions();
    }, 30000);
  }
}
