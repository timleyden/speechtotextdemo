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
import { StorageaccountDetailComponent } from './storageaccount-detail/storageaccount-detail.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule, MatButtonModule } from '@angular/material';
@NgModule({
  declarations: [
    AppComponent,
    TrancriptListComponent,
    TranscriptionDetailComponent,
    UploadAudioComponent,
    TranscriptionNewComponent,
    StorageaccountDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
