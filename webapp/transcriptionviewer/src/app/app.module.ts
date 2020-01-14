import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';

import { TrancriptListComponent } from './trancript-list/trancript-list.component';
import { TranscriptionDetailComponent } from './transcription-detail/transcription-detail.component';
import { UploadAudioComponent } from './upload-audio/upload-audio.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranscriptionNewComponent } from './transcription-new/transcription-new.component';

@NgModule({
  declarations: [
    AppComponent,
    TrancriptListComponent,
    TranscriptionDetailComponent,
    UploadAudioComponent,
    TranscriptionNewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
