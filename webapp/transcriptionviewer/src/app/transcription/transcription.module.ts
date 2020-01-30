import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TrancriptListComponent } from './containers/trancript-list/trancript-list.component';
import { TranscriptionDetailComponent } from './containers/transcription-detail/transcription-detail.component';
import { UploadAudioComponent } from './containers/upload-audio/upload-audio.component';
import { TranscriptionNewComponent } from './containers/transcription-new/transcription-new.component';
import { StorageaccountDetailComponent } from './components/storageaccount-detail/storageaccount-detail.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [
    TrancriptListComponent,
    TranscriptionDetailComponent,
    UploadAudioComponent,
    TranscriptionNewComponent,
    StorageaccountDetailComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    FlexLayoutModule,
    RouterModule.forChild([
      { path: '', component: TrancriptListComponent },
      { path: 'transcripts/:transcriptId', component: TranscriptionDetailComponent },
      { path: 'newtranscripts', component: TranscriptionNewComponent },
      { path: 'upload', component: UploadAudioComponent }
    ])
  ]
})
export class TranscriptionModule { }
