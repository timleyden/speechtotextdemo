import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import {FileService} from '../file.service'
import {TranscriptService} from '../transcript.service'
import { TranscriptDefinition, TranscriptProperty, AllProfanityFilterMode, AllPunctuationMode } from '../transcript-definition';
import { Locations } from '../speechLocations';

@Component({
  selector: 'app-transcription-new',
  templateUrl: './transcription-new.component.html',
  styleUrls: ['./transcription-new.component.css']
})
export class TranscriptionNewComponent implements OnInit {
  showAdvanced;
  showAdvancedText;
  audioFiles : Array;
  newTranscriptForm;
  fileService :FileService;
  punctuationOptions;
  profanityOptions;
  locationOptions;
  transcriptDef= new TranscriptDefinition();
  constructor(private formBuilder: FormBuilder,fileService:FileService, private transcriptService:TranscriptService) {
    this.showAdvanced = false;
    this.fileService = fileService;
    this.showAdvancedText = "Advanced";
    this.audioFiles = Array();
    this.bindAudioFileChoice();
    //this.audioFiles = fileService.getAudioFiles("accountname","sastoken")
    this.newTranscriptForm = this.formBuilder.group({title:'',description:'',servicekey:'',region:'',locale:'',audiofile:'',diarization:false,addwordleveltimestamps:false,sentiment:false,profanity:'',punctuation:''});
    this.punctuationOptions = AllPunctuationMode;
    this.profanityOptions = AllProfanityFilterMode;
    this.locationOptions = Locations;
  }

  ngOnInit() {
  }
 private async bindAudioFileChoice(){
    for await (const blob of this.fileService.getAudioFiles("accountname","sastoken")){
      this.audioFiles.push(blob)
      }
   }
 toggleAdvanced(event){
    this.showAdvanced = !this.showAdvanced

    if(this.showAdvanced == true){
      this.showAdvancedText = "Hide Advanced"
    }
    else{
      this.showAdvancedText = "Advanced"
    }
  }
  onSubmit(formData){
this.transcriptDef.recordingsUrl = this.fileService.getRecordingUrl("accountname","sastoken",this.transcriptDef.recordingsUrl);
console.info(JSON.stringify(this.transcriptDef));
this.transcriptService.PostTranscriptionRequest(this.transcriptDef,formData.region,formData.servicekey).subscribe(data=>{console.log(data);window.alert('done')})

  }
}
