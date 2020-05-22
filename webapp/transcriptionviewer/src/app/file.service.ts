import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BlobServiceClient, AnonymousCredential} from '@azure/storage-blob'

@Injectable({
  providedIn: 'root'
})
export class FileService {
transcripts
  constructor() { }
  getTranscripts(account:string,key:string){
   return this.getBlobsInContainer(account,key,'transcripts')
  }
   getAudioFiles(account:string,key:string){
   return this.getBlobsInContainer(account,key,'audio')
  }
  private getBlobsInContainer(account:string,sas:string,containername:string){
    const anonymousCredential = new AnonymousCredential();
    const blobServiceClient = new BlobServiceClient(
      `https://${account}.blob.core.windows.net${sas}`,
      anonymousCredential
    );
    const containerClient = blobServiceClient.getContainerClient(containername);
     return containerClient.listBlobsFlat();


  }
   getContainers(account:string,sas:string){
    const anonymousCredential = new AnonymousCredential();
    const blobServiceClient = new BlobServiceClient(
      `https://${account}.blob.core.windows.net${sas}`,
      anonymousCredential
    );

     return blobServiceClient.listContainers();


  }
  getRecordingUrl(account:string,sas:string,blobName:string){
    const anonymousCredential = new AnonymousCredential();
    const blobServiceClient = new BlobServiceClient(
      `https://${account}.blob.core.windows.net${sas}`,
      anonymousCredential
    );
    const containerClient = blobServiceClient.getContainerClient("audio");
    const blobClient = containerClient.getBlobClient(blobName)
    return blobClient.url
  }
  getContainerUrl(account:string,sas:string,containerName:string){
    const anonymousCredential = new AnonymousCredential();
    const blobServiceClient = new BlobServiceClient(
      `https://${account}.blob.core.windows.net${sas}`,
      anonymousCredential
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);

    return containerClient.url;
  }
  uploadAudioFile(account:string,key:string, file :File){
    const anonymousCredential = new AnonymousCredential();
    const blobServiceClient = new BlobServiceClient(
      `https://${account}.blob.core.windows.net${key}`,
      anonymousCredential
    );
    const containerClient = blobServiceClient.getContainerClient('audio');
     const blobClient = containerClient.getBlockBlobClient(file.name);
     return blobClient.uploadBrowserData(file,{blobHTTPHeaders:{blobContentType:file.type}})

  }
}
