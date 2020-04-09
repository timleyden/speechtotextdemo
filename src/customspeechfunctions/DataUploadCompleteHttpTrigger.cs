using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Net.Http;
using System.Net.Http.Headers;
using static cut60secondsaudio.DataUploadCompleteHttpTriggerHelper;
using System.Collections.Generic;
using System.Text;
using SpeechToTextDemo;

namespace cut60secondsaudio
{
    public static class DataUploadCompleteHttpTrigger
    {

        private const string HostNameTempalte = "{0}.cris.ai";
        private const int Port = 443;

        private const string EventTypeHeaderName = "X-MicrosoftSpeechServices-Event";
        private const string SignatureHeaderName = "X-MicrosoftSpeechServices-Signature";





        [FunctionName("DataUploadCompleteHttpTrigger")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {

            if (req.Query.ContainsKey("Register") && req.Query["Register"] == "Yes")
            {
                log.LogInformation("Register query param found, attempting webhook registration");
                try
                {
                 //   string SubscriptionKey = System.Environment.GetEnvironmentVariable("SubscriptionKey");
                //    var url = System.Environment.GetEnvironmentVariable("CallbackFunctionUrl");

                  string SubscriptionKey = ServiceDetails.GetServiceDetails().serviceKey;
                  var url = ServiceDetails.GetServiceDetails().CallbackFunctionUrl;




                    log.LogInformation(SubscriptionKey);
                 //   string HostName = string.Format(HostNameTempalte, System.Environment.GetEnvironmentVariable("Region"));
                  string HostName = string.Format(HostNameTempalte,  ServiceDetails.GetServiceDetails().region);
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

            var eventTypeHeader = req.Headers[EventTypeHeaderName];


            string ocpSubKey = ServiceDetails.GetServiceDetails().serviceKey;
            string region = ServiceDetails.GetServiceDetails().region;


           // string ocpSubKey = Environment.GetEnvironmentVariable("SubscriptionKey");
            //string projectUrl = Environment.GetEnvironmentVariable("projectsUrl");
         //   string region = Environment.GetEnvironmentVariable("Region");

            //declare the client 
            HttpClient clientHttp = new HttpClient();
            clientHttp.DefaultRequestHeaders.Accept.Clear();
            clientHttp.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            clientHttp.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", ocpSubKey);


            string body = string.Empty;
            string datasetUplodId = string.Empty;
            string baselineModelID = "";

            try
            {
                using (var streamReader = new StreamReader(req.Body))
                {
                    body = await streamReader.ReadToEndAsync().ConfigureAwait(false);

                    objectResponse objectResp = JsonConvert.DeserializeObject<objectResponse>(body);

                    datasetUplodId = objectResp.id;

                    var arrBaseline = objectResp.description.Split("This data set is created from Speech to Text Accelerator. Basemodel: ");

                    baselineModelID = arrBaseline[1];

                }
            }
            catch (Exception e)
            {
                log.LogError(e.Message);
                log.LogError(e.Message);
            }


            // call to get the project ID
            var response = await clientHttp.GetAsync(new Uri("https://" + region + ".cris.ai/api/speechtotext/v3.0-beta1/datasets/" + datasetUplodId));
            response.EnsureSuccessStatusCode();
            string content = await response.Content.ReadAsStringAsync();
            DataSetobject dataset = JsonConvert.DeserializeObject<DataSetobject>(content);
            string[] projectLinkArr = dataset.project.self.Split("https://"+region+ ".cris.ai/api/speechtotext/v3.0-beta1/projects/");
            string projectID = projectLinkArr[1];


            switch (eventTypeHeader)
            {
                case "DatasetImportCompletion":

                    ProjectModelTraining project = new ProjectModelTraining(projectID, 
                        "https://"+region+".cris.ai/api/speechtotext/v3.0-beta1/projects/"+ projectID);
                    PropertiesModelTraining properties = new PropertiesModelTraining();
                    CustompropertiesModelTraining customProperties = new CustompropertiesModelTraining();

                    DatasetModelTraining dataSet = new DatasetModelTraining(datasetUplodId, 
                        "https://"+region+".cris.ai/api/speechtotext/v3.0-beta1/datasets/" + datasetUplodId);

                    DatasetModelTraining[] add_arr = new DatasetModelTraining[1];
                    add_arr[0] = dataSet;

                    BasemodelModelTraining model = new BasemodelModelTraining(baselineModelID,
                       "https://"+region+ ".cris.ai/api/speechtotext/v3.0-beta1/models/base/" + baselineModelID);
         
                    ModelpropertiesModelTraining modelProperties = new ModelpropertiesModelTraining();

                    ModelTraining modelUpload = new ModelTraining("TrainingFromAccelerator", "TrainingFromAccelerator", "Training uploaded from accelerator", "Language",
                        "en-US", project, properties, customProperties, add_arr, model, modelProperties);

                    var json = JsonConvert.SerializeObject(modelUpload);

                    var data = new StringContent(json, Encoding.UTF8, "application/json");

                    response = await clientHttp.PostAsync("https://"+region+".cris.ai/api/speechtotext/v3.0-beta1/models", data);

                    response.EnsureSuccessStatusCode();

                    await response.Content.ReadAsStringAsync();

                    break;
                default:
                    log.LogInformation(eventTypeHeader);
                    break;
            }

            return (ActionResult)new OkResult();

        }

    }
}
