import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { KeyValuePipe } from '@angular/common';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material';

import { FileService } from '../../../file.service'
import { TranscriptService } from '../../../transcript.service'
import { TranscriptDefinition, TranscriptProperty, AllProfanityFilterMode, AllPunctuationMode } from '../../../transcript-definition';
import { Locations, Locales } from '../../../speechReferenceData';
import { AccountDetails } from 'src/app/account-details';
import { AccountService } from 'src/app/account.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UploadAudioComponent } from '../upload-audio/upload-audio.component';

import { BlobItem, ContainerListBlobFlatSegmentResponse } from '@azure/storage-blob';
import { NavigationService } from 'src/app/navigation.service';



@Component({
  selector: 'app-transcription-new',
  templateUrl: './transcription-new.component.html',
  styleUrls: ['./transcription-new.component.css']
})
export class TranscriptionNewComponent implements OnInit {
  showAdvanced;
  showAdvancedText;
  selectedModels:string[];
  audioFiles: any[];
  selectedFile:string;
  newTranscriptForm;
  fileService: FileService;
  punctuationOptions;
  profanityOptions;
  locationOptions;
  localeOptions
  details: AccountDetails;
  transcriptDef = new TranscriptDefinition();
  showUpload: boolean;
  uploadedBlobName: string;
  Models:any[];
  public filteredModels:any[];

  constructor(private formBuilder: FormBuilder, fileService: FileService, private transcriptService: TranscriptService, private accountService: AccountService, private _snackbar: MatSnackBar, public dialog: MatDialog, private navService: NavigationService, private router:Router) {
    this.showAdvanced = false;
    this.fileService = fileService;
    this.showAdvancedText = "Advanced";
    this.audioFiles = Array();
    this.showUpload = false;
    this.Models = [];
    this.filteredModels = [];
    this.punctuationOptions = AllPunctuationMode;
    this.profanityOptions = AllProfanityFilterMode;
    this.locationOptions = Locations;
    this.localeOptions =  Locales;
    this.navService.NavTitle = " - Create - New Transcription"
    if (this.accountService.IsStorageValid.value) {
      this.ngOnChange(this.accountService.Details);
    }

  }

  ngOnInit() {
  }
  private async bindAudioFileChoice() {
    try {
      for await (const blob of <any>(this.fileService.getAudioFiles(this.details.AccountName, this.details.SASToken))) {
        this.audioFiles.push(blob)
      }
    } catch (e) {
      this.accountService.IsStorageValid.next(false);
      console.error(e);
      this._snackbar.open("An error occurred loading the blobs from the storage account. Please check storage account details.", "Dismiss", { duration: 8000 })
    }
  }
  private bindModelsChoice(){
    this.transcriptService.GetModels().subscribe(data=>{this.Models = this.Models.concat(<any[]>data.values); this.filterModels();})
    this.transcriptService.GetBaseModels().subscribe(data=>{this.Models = this.Models.concat(<any[]>data.values); this.filterModels();})

  }
  public filterModels(){
    this.filteredModels = this.Models.filter(value=>{return value.locale == this.transcriptDef.locale})
  }
  toggleUpload() {
    const dialogRef = this.dialog.open(UploadAudioComponent, {
      height:'300px',
      width: '400px',

      data: { blobName: "" }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
      this.bindAudioFileChoice();
      this.transcriptDef.sourceUrls = [result];
    });
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
  onSubmit(valid) {
    if(valid){
    this.transcriptDef.sourceUrls = [this.fileService.getRecordingUrl(this.details.AccountName, this.details.SASTokenReadOnly,this.selectedFile)];
    if(this.selectedModels){
      this.transcriptDef.models = this.selectedModels.map(value=>{return {"Id":value}})
    }
    console.info(JSON.stringify(this.transcriptDef));
    this.transcriptService.PostTranscriptionRequest(this.transcriptDef).subscribe(data => { console.log(data); this._snackbar.open("Transcription queued", "Dismiss", { duration: 5000 });this.router.navigate(['/transcription']) }, error => { const errorMsg = (error.error.message)?error.error.message:"Check the console for more information"; this._snackbar.open("Failed to queue transcription. " + errorMsg, "Dismiss", { duration: 5000 });console.log(error) });
  }
  }

  ngOnChange(val: AccountDetails) {
    this.details = val;

    this.bindAudioFileChoice();
    this.bindModelsChoice();
    //enable submit button

  }
}
