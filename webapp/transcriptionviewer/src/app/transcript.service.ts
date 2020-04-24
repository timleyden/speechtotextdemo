import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranscriptDefinition } from './transcript-definition'
import { stringify } from 'querystring';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})

export class TranscriptService {
  private baseurl:string = ".cris.ai/api";
  private transcriptionPath:string = "/speechtotext/v3.0-beta1/transcriptions";
  private modelsPath:string = "/speechtotext/v3.0-beta1/models"
  private baseModelsPath:string = "/speechtotext/v3.0-beta1/models/base"
  private apiKeyHeaderName:string = "Ocp-Apim-Subscription-Key";

  private buildUri() {
    if(this.accountService.Details.UseProxy){
      return `${this.accountService.Details.ProxyBaseUrl}${this.transcriptionPath}`;
    }else{
     return`https://${this.accountService.Details.Region}${this.baseurl}${this.transcriptionPath}`;
    }
  }
  private buildModelsUri() {
    if(this.accountService.Details.UseProxy){
      return `${this.accountService.Details.ProxyBaseUrl}${this.modelsPath}`;
    }else{
      return  `https://${this.accountService.Details.Region}${this.baseurl}${this.modelsPath}`;
    }
  }
  constructor(private httpClient: HttpClient, private accountService:AccountService) { }

  private buildBaseModelsUri() {
    let hostName = `https://${this.accountService.Details.Region}${this.baseModelsPath}`;
    return hostName;
  }

  PostTranscriptionRequest(request: TranscriptDefinition) {
    let headers = new HttpHeaders({
      'Content-Type': "application/json"
    });
    headers = headers.append(this.apiKeyHeaderName, this.accountService.Details.ServiceKey);
    let options = { headers: headers };
    return this.httpClient.post(this.buildUri(), JSON.stringify(request), options)
  }
  GetTranscriptions() {
    let headers = new HttpHeaders({
      'Content-Type': "application/json"
    });
    headers = headers.append(this.apiKeyHeaderName, this.accountService.Details.ServiceKey);
    let options = { headers: headers };
    return this.httpClient.get<any>(this.buildUri(), options);
  }
  DeleteTranscription(transcriptionId: string) {
    let headers = new HttpHeaders({
      'Content-Type': "application/json"
    });
    headers = headers.append(this.apiKeyHeaderName, this.accountService.Details.ServiceKey);
    let options = { headers: headers };
    return this.httpClient.delete(this.buildUri() + "/" + transcriptionId, options);
  }
  GetTranscription(url: string) {
    let headers = new HttpHeaders({
      'Content-Type': "application/json"
    });
    headers = headers.append(this.apiKeyHeaderName, this.accountService.Details.ServiceKey);
    let options = { headers: headers };
    return this.httpClient.get(url, options);
  }
  GetModels() {
    let headers = new HttpHeaders({
      'Content-Type': "application/json"
    });
    headers = headers.append(this.apiKeyHeaderName, this.accountService.Details.ServiceKey);
    let options = { headers: headers };
    return this.httpClient.get<any>(this.buildModelsUri(), options);
  }
  GetBaseModels() {
    let headers = new HttpHeaders({
      'Content-Type': "application/json"
    });
    headers = headers.append(this.apiKeyHeaderName, this.accountService.Details.ServiceKey);
    let options = { headers: headers };
    return this.httpClient.get<any>(this.buildBaseModelsUri(), options);
  }

}
