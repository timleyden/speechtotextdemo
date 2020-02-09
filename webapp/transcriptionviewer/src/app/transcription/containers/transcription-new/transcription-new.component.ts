import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { KeyValuePipe } from '@angular/common';

import { FileService } from '../../../file.service'
import { TranscriptService } from '../../../transcript.service'
import { TranscriptDefinition, TranscriptProperty, AllProfanityFilterMode, AllPunctuationMode } from '../../../transcript-definition';
import { Locations } from '../../../speechLocations';
import { AccountDetails } from 'src/app/account-details';
import { AccountService } from 'src/app/account.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UploadAudioComponent } from '../upload-audio/upload-audio.component';
import { MatDialog } from '@angular/material';
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
  audioFiles: any[];
  newTranscriptForm;
  fileService: FileService;
  punctuationOptions;
  profanityOptions;
  locationOptions;
  details: AccountDetails;
  transcriptDef = new TranscriptDefinition();
  showUpload: boolean;
  uploadedBlobName: string;

  constructor(private formBuilder: FormBuilder, fileService: FileService, private transcriptService: TranscriptService, private accountService: AccountService, private _snackbar: MatSnackBar, public dialog: MatDialog, private navService: NavigationService) {
    this.showAdvanced = false;
    this.fileService = fileService;
    this.showAdvancedText = "Advanced";
    this.audioFiles = Array();
    this.showUpload = false;

    this.punctuationOptions = AllPunctuationMode;
    this.profanityOptions = AllProfanityFilterMode;
    this.locationOptions = Locations;
    this.navService.NavTitle =" - Create - New Transcription"
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
  toggleUpload() {
    const dialogRef = this.dialog.open(UploadAudioComponent, {
      width: '250px',
      data: { blobName: "" }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
      this.bindAudioFileChoice();
      this.transcriptDef.recordingsUrl = result;
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
  onSubmit() {
    this.transcriptDef.recordingsUrl = this.fileService.getRecordingUrl(this.details.AccountName, this.details.SASToken, this.transcriptDef.recordingsUrl);
    console.info(JSON.stringify(this.transcriptDef));
    this.transcriptService.PostTranscriptionRequest(this.transcriptDef, this.details.Region, this.details.ServiceKey).subscribe(data => { console.log(data); this._snackbar.open("Transcription queued", "Dismiss", { duration: 5000 }) })

  }

  ngOnChange(val: AccountDetails) {
    this.details = val;

    this.bindAudioFileChoice();
    //enable submit button

  }
}
