import { Component, OnInit } from '@angular/core';
import {FileService} from '../file.service'
import { FormBuilder } from '@angular/forms';
import { AccountDetails } from '../storageaccount-detail/storageaccount-detail.component';

@Component({
  selector: 'app-upload-audio',
  templateUrl: './upload-audio.component.html',
  styleUrls: ['./upload-audio.component.css']
})
export class UploadAudioComponent implements OnInit {
uploadForm;
file;
accountDetail:AccountDetails
  constructor(private fileService: FileService, private formBuilder: FormBuilder) {
    this.uploadForm = this.formBuilder.group({accountName:'',key:'',name:[null]});
   }

  ngOnInit() {
  }
  onSubmit(customerData) {
    // Process checkout data here
    console.warn('Your order has been submitted', customerData);
    this.fileService.uploadAudioFile(this.accountDetail.AccountName,this.accountDetail.SASToken,this.file)
    this.uploadForm.reset();
  }
  getFile(event){
    this.file = (event.target as HTMLInputElement).files[0];
    this.uploadForm.patchValue({
      avatar: this.file
    });
  }
ngOnChange(val:AccountDetails){
  this.accountDetail = val;
}
}
