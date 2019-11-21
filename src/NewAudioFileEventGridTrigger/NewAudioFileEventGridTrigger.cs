using Microsoft.Azure.EventGrid.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.EventGrid;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.Logging;
using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks;



namespace SpeechToTextDemo
{
    public static class NewAudioFileEventGridTriggerCSharp
    {


        // Update with your service region
        private const string HostNameTempalte = "{0}.cris.ai";
        private const int Port = 443;

        // recordings and locale
        private const string Locale = "en-US";
        
         private static Guid[] modelList = new Guid[0];

        // For use of specific acoustic and language models:
        // - comment the previous line
        // - uncomment the next lines to create an array containing the guids of your required model(s)
        // private static Guid AdaptedAcousticId = new Guid("<id of the custom acoustic model>");
        // private static Guid AdaptedLanguageId = new Guid("<id of the custom language model>");
        // private static Guid[] modelList = new[] { AdaptedAcousticId, AdaptedLanguageId };


        private const string Name = "Simple transcription";
        private const string Description = "Simple transcription description";


        [FunctionName("NewAudioFileEventGridTrigger")]
        public static void NewAudioFileEventGridTrigger([EventGridTrigger]EventGridEvent eventGridEvent, ILogger log, ExecutionContext context)
        {
            string SubscriptionKey = System.Environment.GetEnvironmentVariable("SubscriptionKey");
            string SASToken = System.Environment.GetEnvironmentVariable("SASToken");
            string AddDiarizationString = System.Environment.GetEnvironmentVariable("AddDiarization");
            bool AddDiarization = bool.Parse(AddDiarizationString);
            string HostName = string.Format(HostNameTempalte, System.Environment.GetEnvironmentVariable("Region"));
            log.LogInformation(eventGridEvent.Data.ToString());
            var client = BatchClient.CreateApiV2Client(SubscriptionKey, HostName, Port,log,"2.1");
            log.LogInformation("new log value");
            dynamic eventData = JObject.Parse(eventGridEvent.Data.ToString());
            string url = eventData.url;
             log.LogInformation(url);
            Task<Uri> task =   client.PostTranscriptionAsync(Name, Description, Locale, new Uri(url+SASToken),true);
            task.Wait();
            Uri Location = task.Result;
            if(Location != null){
                log.LogInformation(Location.AbsoluteUri);
            }
        }


    }
}