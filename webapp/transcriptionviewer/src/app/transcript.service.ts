import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranscriptDefinition } from './transcript-definition'
import { stringify } from 'querystring';

@Injectable({
  providedIn: 'root'
})

export class TranscriptService {
  private uriPath = ".cris.ai/api/speechtotext/v2.0/transcriptions";
  private apiKeyHeaderName = "Ocp-Apim-Subscription-Key";

  private buildUri(region: string) {
    let hostName = `https://${region}${this.uriPath}`;
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
  GetTranscription(region: string, apiKey: string, transcriptionId: string) {
    let headers = new HttpHeaders({
      'Content-Type': "application/json"
    });
    headers = headers.append(this.apiKeyHeaderName, apiKey);
    let options = { headers: headers };
    return this.httpClient.get(this.buildUri(region) + "/" + transcriptionId, options);
  }

}
