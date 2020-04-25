import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranscriptDefinition } from './transcript-definition'
import { stringify } from 'querystring';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})

export class TranscriptService {
  private  baseurl:string = ".cris.ai/api";
  private transcriptionPath:string = "/speechtotext/v2.0/transcriptions";
  private modelsPath:string = "/speechtotext/v2.0/models"
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
      return `https://${this.accountService.Details.ProxyBaseUrl}${this.modelsPath}`;
    }else{
      return  `https://${this.accountService.Details.Region}${this.baseurl}${this.modelsPath}`;
    }
  }
  constructor(private httpClient: HttpClient, private accountService:AccountService) { }
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

   return this.httpClient.get(this.buildUri(), options);


  }
  DeleteTranscription(transcriptionId: string) {
    let headers = new HttpHeaders({
      'Content-Type': "application/json"
    });
    headers = headers.append(this.apiKeyHeaderName, this.accountService.Details.ServiceKey);
    let options = { headers: headers };
    return this.httpClient.delete(this.buildUri() + "/" + transcriptionId, options);
  }
  GetTranscription(transcriptionId: string) {
    let headers = new HttpHeaders({
      'Content-Type': "application/json"
    });
    headers = headers.append(this.apiKeyHeaderName, this.accountService.Details.ServiceKey);
    let options = { headers: headers };
    return this.httpClient.get(this.buildUri() + "/" + transcriptionId, options);
  }
  GetModels() {
    let headers = new HttpHeaders({
      'Content-Type': "application/json"
    });
    headers = headers.append(this.apiKeyHeaderName, this.accountService.Details.ServiceKey);
    let options = { headers: headers };
    return this.httpClient.get(this.buildModelsUri(), options);
  }


}
