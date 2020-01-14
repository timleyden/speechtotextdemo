export class TranscriptDefinition{
  name:string;
  description:string;
  recordingsUrl:string;
  locale:string;
  models:[ModelIdentity];
  properties:TranscriptProperty
  public constructor(){
    //set defaults
    this.properties = new TranscriptProperty();
    this.locale = "en-US"
    this.properties.ProfanityFilterMode = "Masked"
    this.properties.PunctuationMode = "DictatedAndAutomatic"
  }
}
export class ModelIdentity{
  Id:string
}
export class TranscriptProperty{
  private _addDiarization:boolean = false
  private _addWordLevelTimestamps = false;
ProfanityFilterMode:ProfanityFilterMode;
PunctuationMode:PunctuationMode;
get AddWordLevelTimestamps():boolean{
  return this._addWordLevelTimestamps;
}
set AddWordLevelTimestamps(value:boolean){
  this._addWordLevelTimestamps = value;
  if(!value){
    this.AddDiarization = false;
  }
}
AddSentiment:boolean;
get AddDiarization():boolean{
 return this._addDiarization;
}
set AddDiarization(value:boolean){
  this._addDiarization = value;
  if(value){
    this.AddWordLevelTimestamps = true;
  }
}
TranscriptionResultsContainerUrl:string
}
export type PunctuationMode = "DictatedAndAutomatic"|"Automatic"|"Dictated"|"None"

export type ProfanityFilterMode = "Masked"|"None"|"Removed"|"Tagged"

export const AllPunctuationMode = ["DictatedAndAutomatic","Automatic","Dictated","None"]
export const AllProfanityFilterMode = ["Masked","None","Removed","Tagged"]
