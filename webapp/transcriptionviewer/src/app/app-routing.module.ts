import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TrancriptListComponent } from './trancript-list/trancript-list.component';
import { TranscriptionDetailComponent } from './transcription-detail/transcription-detail.component';
import {UploadAudioComponent} from './upload-audio/upload-audio.component';
import { TranscriptionNewComponent } from './transcription-new/transcription-new.component';


const routes: Routes = [{path: '',component: TrancriptListComponent},
{path: 'transcripts/:transcriptId', component:TranscriptionDetailComponent},
{path:'newtranscripts',component:TranscriptionNewComponent},
{path: 'upload', component:UploadAudioComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
