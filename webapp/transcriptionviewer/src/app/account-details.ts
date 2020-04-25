import { Observable, BehaviorSubject } from 'rxjs';

export class AccountDetails {
  AccountName: string;
  SASToken: string;
  SASTokenReadOnly: string;
  Region: string;
  ServiceKey: string;
  RefreshRate:number = 30;
  TrainUrl:string;
  UseProxy:boolean
  ProxyBaseUrl:string
}
export interface AccountDetailsBE {
  storageAccountName: string;
  sASToken: string;
  sASTokenReadOnly: string;
  audioStorageContainerName: string;
  transcriptStorageContainerName: string;
  trainUrl: string;
  proxyBaseUrl:string
}
