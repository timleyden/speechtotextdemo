import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { FileService } from '../../../file.service'
import { AccountDetails } from '../../../account-details'
import { AccountService } from 'src/app/account.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

export interface DialogData {
  blobName: string;

}

@Component({
  selector: 'app-upload-audio',
  templateUrl: './upload-audio.component.html',
  styleUrls: ['./upload-audio.component.css']
})
export class UploadAudioComponent  {

  file;
  constructor(private fileService: FileService, private formBuilder: FormBuilder, private accountService: AccountService, public dialogRef: MatDialogRef<UploadAudioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {

  }


  uploadClick() {

    console.info('file', this.file);
    this.fileService.uploadAudioFile(this.accountService.Details.AccountName, this.accountService.Details.SASToken, this.file).then(value=>{this.data.blobName = this.file.name})


  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  getFile(event) {
    this.file = (event.target as HTMLInputElement).files[0];
  }

}
