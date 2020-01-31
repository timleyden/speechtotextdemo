import { Injectable } from '@angular/core';
import { AccountDetails } from './account-details'
@Injectable({
  providedIn: 'root'
})
export class AccountService {
Details:AccountDetails;
  constructor() {
    this.Details = new AccountDetails();
   }
}
