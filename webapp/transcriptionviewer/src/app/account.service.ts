import { Injectable } from '@angular/core';
import { AccountDetails,AccountDetailsBE } from './account-details'
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfigService } from './app-config.service';
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  Details: AccountDetails;
  IsStorageValid: BehaviorSubject<boolean> = new BehaviorSubject(false);
  IsSpeechValid: BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor(private httpClient: HttpClient) {

    let detailsFromStorage = JSON.parse(localStorage.getItem('accountDetails')) as AccountDetails;
    if (detailsFromStorage != null) {
      this.Details = detailsFromStorage;
    } else {
      this.Details = new AccountDetails();
    }
    this.validateDetails();
    if(AppConfigService.settings.configUrl){
    this.GetAccountDetails(AppConfigService.settings.configUrl).subscribe(data=>{
      this.Details.AccountName = data.storageAccountName;
      this.Details.Region = data.region;
      this.Details.SASToken = data.sASToken;
      this.Details.ServiceKey = data.serviceKey;
      this.Details.SASTokenReadOnly = data.sASTokenReadOnly;
      this.Details.TrainUrl = data.trainUrl
      this.validateDetails();
    })
  }
}
  save() {
    localStorage.setItem('accountDetails', JSON.stringify(this.Details));
    this.validateDetails();
  }
  GetAccountDetails(configUrl:string):Observable<AccountDetailsBE> {
    let headers = new HttpHeaders({
      'Content-Type': "application/json"
    });
    let options = { headers: headers };
    return this.httpClient.get<AccountDetailsBE>(configUrl);
  }
  validateDetails() {
    if(!this.Details.RefreshRate){
      this.Details.RefreshRate = 30;
    }
    if (this.Details.Region && this.Details.ServiceKey) {
      this.IsSpeechValid.next(true);
    } else {
      this.IsSpeechValid.next(false);
    }
    if (this.Details.SASToken && this.Details.AccountName) {
      this.IsStorageValid.next(true);
    } else {
      this.IsStorageValid.next(false);
    }
    if(!this.Details.SASTokenReadOnly)this.Details.SASTokenReadOnly = this.Details.SASToken
  }
}
