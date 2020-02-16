import { Injectable } from '@angular/core';
import { AccountDetails } from './account-details'
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  Details: AccountDetails;
  IsStorageValid: BehaviorSubject<boolean> = new BehaviorSubject(false);
  IsSpeechValid: BehaviorSubject<boolean> = new BehaviorSubject(false);
  constructor() {
    let detailsFromStorage = JSON.parse(localStorage.getItem('accountDetails')) as AccountDetails;
    if (detailsFromStorage != null) {
      this.Details = detailsFromStorage;
    } else {
      this.Details = new AccountDetails();
    }
    this.validateDetails();
  }
  save() {
    localStorage.setItem('accountDetails', JSON.stringify(this.Details));
    this.validateDetails();
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
  }
}
