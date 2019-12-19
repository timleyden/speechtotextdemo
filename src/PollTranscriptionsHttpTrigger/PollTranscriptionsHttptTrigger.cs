using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Text;
using System.Security.Cryptography;
using System.Linq;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;


namespace SpeechToTextDemo
{
    public static class PollTranscriptionHttpTrigger
    {
        private const string HostNameTempalte = "{0}.cris.ai";
        private const int Port = 443;

        [FunctionName("PollTranscriptionsHttpTrigger")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("Function started");
            string SubscriptionKey = System.Environment.GetEnvironmentVariable("SubscriptionKey");
            string storageUrl = System.Environment.GetEnvironmentVariable("TranscriptStorageContainerUrl");
            string SASToken = System.Environment.GetEnvironmentVariable("SASToken");
            log.LogInformation(SubscriptionKey);
            string HostName = string.Format(HostNameTempalte, System.Environment.GetEnvironmentVariable("Region"));
            log.LogInformation(HostName);
            var client = BatchClient.CreateApiV2Client(SubscriptionKey, HostName, Port);
            var Transcriptionresult = await client.GetTranscriptionsAsync();
            foreach (Transcription transcription in Transcriptionresult)
            {
                if(transcription.Status == "Succeeded"){
                    log.LogInformation($"found succeeded transciprtions for file {transcription.RecordingsUrl}, saving transcipt back to storage");
                foreach (string channel in transcription.ResultsUrls.Keys)
                {
                    log.LogInformation(channel);
                    CloudBlockBlob recording = new CloudBlockBlob(transcription.RecordingsUrl);
                    string url = transcription.ResultsUrls[channel];
                    log.LogInformation(url);
                    CloudBlockBlob sourceblob = new CloudBlockBlob(new Uri(url));
                    string filename = recording.Name.Remove(recording.Name.LastIndexOf('.'));
                    string transcripturl = storageUrl + "/" + filename + channel + "-transcript.json" + SASToken;
                    log.LogInformation(transcripturl);
                    CloudBlockBlob targetblob = new CloudBlockBlob(new Uri(transcripturl));
                    var resutl = await targetblob.StartCopyAsync(sourceblob);
                    log.LogInformation(resutl);
                     while (targetblob.CopyState.Status == CopyStatus.Pending)
                                    {
                                        log.LogInformation($"copy status:{targetblob.CopyState.Status} sleeping for 1 second.");
                                        await Task.Delay(1000);
                                        await targetblob.FetchAttributesAsync();
                                    }
                    log.LogInformation($"copy status:{targetblob.CopyState.Status}");
                }
                await client.DeleteTranscriptionAsync(transcription.Id);
                }else{
                        log.LogWarning($"found transcription for file {transcription.RecordingsUrl} not in a succeeded state, dumping object");
                        log.LogInformation(Newtonsoft.Json.JsonConvert.SerializeObject(transcription));
                }
            }
              return (ActionResult)new OkResult();
        }
    }
}