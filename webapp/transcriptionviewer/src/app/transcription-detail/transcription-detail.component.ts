import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { transcripts} from '../trancripts';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-transcription-detail',
  templateUrl: './transcription-detail.component.html',
  styleUrls: ['./transcription-detail.component.css']
})
export class TranscriptionDetailComponent implements OnInit {
transcript;
transcriptData;
nextOffset;
  constructor(private route:ActivatedRoute, private http: HttpClient) { }

  ngOnInit() {
    this.nextOffset = 0;
this.route.paramMap.subscribe( params => {
  this.transcript = transcripts[+params.get('transcriptId')]
   this.http.get(this.transcript.transcript).subscribe((data:{})=>{
   this.transcriptData = data
   this.transcriptData = this.transcriptData.AudioFileResults[0].SegmentResults.sort((n1,n2)=>{
     var first = Number(n1.Offset);
     var second =  Number(n2.Offset)
     if(first > second){
       return 1;
     }if ( first < second){
       return -1;
     }
     else return 0;
    })
   })
});
}
jumpTo(event){
  var offset = event.srcElement.getAttribute("offset");
  var audio = document.getElementsByTagName('audio')[0];
  audio.currentTime = offset;
  audio.play();
}
highlightUtterance(event){
  var audio = event.srcElement;
  if(audio.currentTime < this.nextOffset){
    return; // we are still inside the utterance dont bother looking for the next one
  }
  var utterances = document.getElementsByClassName('utterance')
  console.log(audio.currentTime)
for(var i=0; i < utterances.length; i++){
  var u1 = utterances[i]
  var offset = Number(u1.getAttribute("offset"))
  var next = 0;
  if (i+1 < utterances.length){
    var u2 = utterances[i+1]
   next = Number(u2.getAttribute("offset"))
  }else{
   next= offset+30; //we are at the end of the transcript add 30 seconds to allow for long utterance
  }
  if(audio.currentTime > offset && audio.currentTime < next ){
    utterances[i].classList.add("selected");
    this.nextOffset = next;
  }else{
    utterances[i].classList.remove("selected");
  }
}
}
}
