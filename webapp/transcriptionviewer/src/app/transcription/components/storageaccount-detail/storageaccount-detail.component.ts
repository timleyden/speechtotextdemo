import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Locations } from '../../../speechLocations';
import { AccountService } from '../../../account.service';
import { AccountDetails } from '../../../account-details';


@Component({
  selector: 'app-storageaccount-detail',
  templateUrl: './storageaccount-detail.component.html',
  styleUrls: ['./storageaccount-detail.component.css']
})
export class StorageaccountDetailComponent implements OnInit {
  @Output() updated = new EventEmitter<AccountDetails>();
  accountDetails: AccountDetails;
  //accountDetails:AccountDetails;
  locationOptions;
  constructor(private accountDetailsService: AccountService) {
    this.locationOptions = Locations;
    this.accountDetails = accountDetailsService.Details
  }

  ngOnInit() {
  }
  refresh() {
    this.updated.emit(this.accountDetails);
  }

}

