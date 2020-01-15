import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { Locations } from '../speechLocations';


@Component({
  selector: 'app-storageaccount-detail',
  templateUrl: './storageaccount-detail.component.html',
  styleUrls: ['./storageaccount-detail.component.css']
})
export class StorageaccountDetailComponent implements OnInit {
  @Output() updated = new EventEmitter<AccountDetails>();
accountDetails:AccountDetails;
locationOptions;
  constructor() {
    this.locationOptions = Locations;
    this.accountDetails = new AccountDetails();
   }

  ngOnInit() {
  }
  refresh(){
    this.updated.emit(this.accountDetails);
  }

}
export class AccountDetails{
  AccountName:string;
  SASToken:string;
  Region:string;
  ServiceKey:string;
}
