import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranscriptDefinition } from './transcript-definition'
import { stringify } from 'querystring';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})

export class TranscriptService {
  private baseurl:string = ".api.cognitive.microsoft.com";
  private transcriptionPath:string = "/speechtotext/v3.0/transcriptions";
  private modelsPath:string = "/speechtotext/v3.0/models"
  private baseModelsPath:string = "/speechtotext/v3.0/models/base"
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
    if(this.accountService.Details.UseProxy){
      return `${this.accountService.Details.ProxyBaseUrl}${this.baseModelsPath}`;
    }else{
      return  `https://${this.accountService.Details.Region}${this.baseurl}${this.baseModelsPath}`;
    }
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
  DeleteTranscription(url: string) {
    let headers = new HttpHeaders({
      'Content-Type': "application/json"
    });
    headers = headers.append(this.apiKeyHeaderName, this.accountService.Details.ServiceKey);
    let options = { headers: headers };
    if(this.accountService.Details.UseProxy){
      url = this.accountService.Details.ProxyBaseUrl + url.split(this.baseurl)[1]
    }
    return this.httpClient.delete(url, options);
  }
  GetTranscription(url: string):any {
    let headers = new HttpHeaders({
      'Content-Type': "application/json"
    });
    headers = headers.append(this.apiKeyHeaderName, this.accountService.Details.ServiceKey);
    let options = { headers: headers };
    if(this.accountService.Details.UseProxy){
      url = this.accountService.Details.ProxyBaseUrl + url.split(this.baseurl)[1]
    }
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
