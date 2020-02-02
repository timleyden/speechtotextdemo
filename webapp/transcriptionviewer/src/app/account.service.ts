import { Injectable } from '@angular/core';
import { AccountDetails } from './account-details'
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  Details: AccountDetails;
  constructor() {
    let detailsFromStorage = JSON.parse(localStorage.getItem('accountDetails')) as AccountDetails;
    if (detailsFromStorage != null) {
      this.Details = detailsFromStorage;
    } else {
      this.Details = new AccountDetails();
    }
  }
  save() {
    localStorage.setItem('accountDetails', JSON.stringify(this.Details));
  }

}
