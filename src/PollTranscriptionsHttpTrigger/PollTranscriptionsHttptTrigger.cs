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

        private const string EventTypeHeaderName = "X-MicrosoftSpeechServices-Event";
        private const string SignatureHeaderName = "X-MicrosoftSpeechServices-Signature";
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
            var client = BatchClient.CreateApiV2Client(SubscriptionKey, HostName, Port, log, "2.1");
            var Transcriptionresult = await client.GetTranscriptionsAsync();
            foreach (Transcription transcription in Transcriptionresult)
            {

                if (transcription.Status == "Succeeded")
                {
                    foreach (Result result in transcription.Results)
                    {
                        log.LogInformation($"found succeeded transciprtions for file {result.RecordingsUrl}, saving transcipt back to storage");
                        foreach (ResultUrl resultUrls in result.ResultsUrls)
                        {
                            log.LogInformation(resultUrls.FileName);
                            CloudBlockBlob recording = new CloudBlockBlob(result.RecordingsUrl);
                            Uri url = resultUrls.ResultsUrl;
                            log.LogInformation(url.ToString());
                            CloudBlockBlob sourceblob = new CloudBlockBlob(url);
                            string filename = recording.Name.Remove(recording.Name.LastIndexOf('.'));
                            string transcripturl = storageUrl + "/" + filename + resultUrls.FileName + "-transcript.json" + SASToken;
                            log.LogInformation(transcripturl);
                            CloudBlockBlob targetblob = new CloudBlockBlob(new Uri(transcripturl));
                            var resutl = await targetblob.StartCopyAsync(sourceblob);
                            log.LogInformation(resutl);
                        }
                    }
                    await client.DeleteTranscriptionAsync(transcription.Id);
                }
                else
                {
                    log.LogWarning($"found transcription for file {transcription.Results.First().RecordingsUrl} not in a succeeded state, dumping object");
                    log.LogInformation(Newtonsoft.Json.JsonConvert.SerializeObject(transcription));
                }
            }
            return (ActionResult)new OkResult();
        }
    }
}