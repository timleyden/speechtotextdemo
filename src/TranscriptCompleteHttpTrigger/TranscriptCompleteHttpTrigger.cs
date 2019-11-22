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
    public static class TranscriptCompleteHttpTrigger
    {
        private const string HostNameTempalte = "{0}.cris.ai";
        private const int Port = 443;

        private const string EventTypeHeaderName = "X-MicrosoftSpeechServices-Event";
        private const string SignatureHeaderName = "X-MicrosoftSpeechServices-Signature";
        [FunctionName("TranscriptCompleteHttpTrigger")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("Function started");
            if (req.Query.ContainsKey("Register") && req.Query["Register"] == "Yes")
            {
                log.LogInformation("Register query param found, attempting webhook registration");
                try
                {
                    string SubscriptionKey = System.Environment.GetEnvironmentVariable("SubscriptionKey");
                    var url = System.Environment.GetEnvironmentVariable("CallbackFunctionUrl");
                    log.LogInformation(SubscriptionKey);
                    string HostName = string.Format(HostNameTempalte, System.Environment.GetEnvironmentVariable("Region"));
                    log.LogInformation(HostName);
                    var client = BatchClient.CreateApiV2Client(SubscriptionKey, HostName, Port, log, "2.1");
                    var result = await client.CreateWebHook(url, "<my_secret>");
                    if (result != null) { log.LogInformation(result.AbsoluteUri); }
                    var template = @"{'$schema': 'https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#', 'contentVersion': '1.0.0.0', 'parameters': {}, 'variables': {}, 'resources': [],'outputs': {}}";
                    var contentResult = new ContentResult();
                    contentResult.Content = template;
                    contentResult.ContentType = "applicaition/json";
                    return (ActionResult)contentResult;


                }
                catch (Exception e)
                {
                    log.LogError(e.Message);
                    log.LogError(e.StackTrace);
                    return (ActionResult)new BadRequestResult();
                }
            }
            else
            {
                var eventTypeHeader = req.Headers[EventTypeHeaderName];
                var signature = req.Headers[SignatureHeaderName];
                log.LogInformation("C# HTTP trigger function processed a request.");
                log.LogInformation("Validating request");
                string body = string.Empty;
                try
                {
                    using (var streamReader = new StreamReader(req.Body))
                    {
                        body = await streamReader.ReadToEndAsync().ConfigureAwait(false);
                        log.LogInformation(body);
                        var secretBytes = Encoding.UTF8.GetBytes("<my_secret>");

                        using (var hmacsha256 = new HMACSHA256(secretBytes))
                        {

                            var contentBytes = Encoding.UTF8.GetBytes(body);
                            var contentHash = hmacsha256.ComputeHash(contentBytes);
                            var storedHash = Convert.FromBase64String(signature);
                            var validated = contentHash.SequenceEqual(storedHash);

                            if (!validated)
                            {
                                return (ActionResult)new BadRequestResult();
                            }

                        }
                    }
                }
                catch (Exception e)
                {
                    log.LogError(e.Message);
                    log.LogError(e.Message);
                    return (ActionResult)new BadRequestResult();
                }

                switch (eventTypeHeader)
                {
                    case "Ping":
                        // Do your ping event related stuff here (or ignore this event)
                        log.LogInformation("ping happened");
                        break;
                    case "TranscriptionCompletion":
                        log.LogInformation("Transcript complete event happened");
                        //log.LogInformation(body);
                        dynamic eventData = JObject.Parse(body);


                        string status = eventData.status;
                        string id = eventData.id;

                        if (status == "Succeeded")
                        {
                            string SubscriptionKey = System.Environment.GetEnvironmentVariable("SubscriptionKey");
                            string storageUrl = System.Environment.GetEnvironmentVariable("TranscriptStorageContainerUrl");
                            string SASToken = System.Environment.GetEnvironmentVariable("SASToken");
                            log.LogInformation(SubscriptionKey);
                            string HostName = string.Format(HostNameTempalte, System.Environment.GetEnvironmentVariable("Region"));
                            log.LogInformation(HostName);
                            var client = BatchClient.CreateApiV2Client(SubscriptionKey, HostName, Port, log, "2.1");
                            var Transcriptionresult = await client.GetTranscriptionAsync(new Guid(id));
                            foreach (Result result in Transcriptionresult.Results)
                            {
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
                                    while (targetblob.CopyState.Status == CopyStatus.Pending)
                                    {
                                        log.LogInformation($"copy status:{targetblob.CopyState.Status} sleeping for 1 second.");
                                        await Task.Delay(1000);
                                        await targetblob.FetchAttributesAsync();
                                    }
                                     log.LogInformation($"copy status:{targetblob.CopyState.Status}");
                                    log.LogInformation(resutl);
                                }
                            }


                            await client.DeleteTranscriptionAsync(new Guid(id));

                        }
                        else
                        {
                            log.LogWarning("Transcription not succesful");
                            string statusMessage = eventData.statusMessage;
                            log.LogWarning(statusMessage);
                        }

                        break;
                    default:
                        log.LogInformation(eventTypeHeader);
                        log.LogInformation(body);
                        break;
                }
                return (ActionResult)new OkResult();
            }
        }
    }
}
