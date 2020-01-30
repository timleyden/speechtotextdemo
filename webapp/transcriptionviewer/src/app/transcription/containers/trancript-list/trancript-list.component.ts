import { Component, OnInit } from '@angular/core';
import {transcripts} from '../../../trancripts';
import {FileService} from '../../../file.service'
@Component({
  selector: 'app-trancript-list',
  templateUrl: './trancript-list.component.html',
  styleUrls: ['./trancript-list.component.css']
})
export class TrancriptListComponent implements OnInit {
transcripts = transcripts;
  constructor(fileService:FileService) {
     fileService.getTranscripts("accountname","sastoken")
     fileService.getAudioFiles("accountname","sastoken")
   }

  ngOnInit() {
  }

}
