import { Observable, BehaviorSubject } from 'rxjs';

export class AccountDetails {
  AccountName: string;
  SASToken: string;
  Region: string;
  ServiceKey: string;
  RefreshRate:number = 30;
}
