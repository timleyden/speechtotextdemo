import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranscriptDefinition } from './transcript-definition'
import { stringify } from 'querystring';

@Injectable({
  providedIn: 'root'
})

export class TranscriptService {
  private transcriptionPath:string = ".cris.ai/api/speechtotext/v2.0/transcriptions";
  private modelsPath:string = ".cris.ai/api/speechtotext/v2.0/models"
  private apiKeyHeaderName:string = "Ocp-Apim-Subscription-Key";

  private buildUri(region: string) {
    let hostName = `https://${region}${this.transcriptionPath}`;
    return hostName;
  }
  private buildModelsUri(region: string) {
    let hostName = `https://${region}${this.modelsPath}`;
    return hostName;
  }
  constructor(private httpClient: HttpClient) { }
  PostTranscriptionRequest(request: TranscriptDefinition, region: string, apiKey: string) {
    let headers = new HttpHeaders({
      'Content-Type': "application/json"
    });
    headers = headers.append(this.apiKeyHeaderName, apiKey);
    let options = { headers: headers };
    return this.httpClient.post(this.buildUri(region), JSON.stringify(request), options)
  }
  GetTranscriptions(region: string, apiKey: string) {
    let headers = new HttpHeaders({
      'Content-Type': "application/json"
    });
    headers = headers.append(this.apiKeyHeaderName, apiKey);
    let options = { headers: headers };
    return this.httpClient.get(this.buildUri(region), options);
  }
  DeleteTranscription(region: string, apiKey: string, transcriptionId: string) {
    let headers = new HttpHeaders({
      'Content-Type': "application/json"
    });
    headers = headers.append(this.apiKeyHeaderName, apiKey);
    let options = { headers: headers };
    return this.httpClient.delete(this.buildUri(region) + "/" + transcriptionId, options);
  }
  GetTranscription(region: string, apiKey: string, transcriptionId: string) {
    let headers = new HttpHeaders({
      'Content-Type': "application/json"
    });
    headers = headers.append(this.apiKeyHeaderName, apiKey);
    let options = { headers: headers };
    return this.httpClient.get(this.buildUri(region) + "/" + transcriptionId, options);
  }
  GetModels(region: string, apiKey: string) {
    let headers = new HttpHeaders({
      'Content-Type': "application/json"
    });
    headers = headers.append(this.apiKeyHeaderName, apiKey);
    let options = { headers: headers };
    return this.httpClient.get(this.buildModelsUri(region), options);
  }


}
