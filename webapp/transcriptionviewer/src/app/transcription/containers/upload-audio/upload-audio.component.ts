import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import {FileService} from '../../../file.service'
import { AccountDetails } from '../../../account-details'
import { AccountService } from 'src/app/account.service';

@Component({
  selector: 'app-upload-audio',
  templateUrl: './upload-audio.component.html',
  styleUrls: ['./upload-audio.component.css']
})
export class UploadAudioComponent implements OnInit {
uploadForm;
file;
  constructor(private fileService: FileService, private formBuilder: FormBuilder, private accountService:AccountService) {
    this.uploadForm = this.formBuilder.group({accountName:'',key:'',name:[null]});

   }

  ngOnInit() {
  }
  onSubmit(customerData) {
    // Process checkout data here
    console.warn('Your order has been submitted', customerData);
    this.fileService.uploadAudioFile(this.accountService.Details.AccountName,this.accountService.Details.SASToken,this.file)
    this.uploadForm.reset();
  }
  getFile(event){
    this.file = (event.target as HTMLInputElement).files[0];
    this.uploadForm.patchValue({
      avatar: this.file
    });
  }

}
