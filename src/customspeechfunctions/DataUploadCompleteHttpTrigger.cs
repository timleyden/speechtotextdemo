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
            string body;
            using (var streamReader = new StreamReader(req.Body))
                {
                    body = await streamReader.ReadToEndAsync().ConfigureAwait(false);
                    log.LogInformation(body);                  
                }
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
                    var client = BatchClient.CreateApiClient(SubscriptionKey, HostName, Port, log, "3.0");
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
            } else if (req.Query.ContainsKey("validationToken")) {

                string ValidToken = req.Query["validationToken"];
                
                log.LogInformation(ValidToken);

                return ValidToken!= null
                    ?(ActionResult)new OkObjectResult ($"{ValidToken}")
                    : new BadRequestObjectResult ("no validation token");

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


                      
            string baselineModelID = "";
            string dataseturi = "";
             objectResponse objectResp = JsonConvert.DeserializeObject<objectResponse>(body);
             dataseturi = objectResp.self;

            // call to get the project ID
            log.LogInformation(dataseturi);
            var response = await clientHttp.GetAsync(dataseturi);
            response.EnsureSuccessStatusCode();
            string content = await response.Content.ReadAsStringAsync();
            log.LogInformation(content);
            DataSetobject dataset = JsonConvert.DeserializeObject<DataSetobject>(content);
             var arrBaseline = dataset.description.Split("This data set is created from Speech to Text Accelerator. Basemodel: ");
             baselineModelID = arrBaseline[1];
            log.LogInformation(baselineModelID);


            switch (eventTypeHeader)
            {
                case "DatasetCompletion":

                    ProjectModelTraining project = new ProjectModelTraining( 
                        dataset.project.self);
                    PropertiesModelTraining properties = new PropertiesModelTraining();
                    CustompropertiesModelTraining customProperties = new CustompropertiesModelTraining();

                    DatasetModelTraining dataSet = new DatasetModelTraining(
                        dataset.self);

                    DatasetModelTraining[] add_arr = new DatasetModelTraining[1];
                    add_arr[0] = dataSet;

                    BasemodelModelTraining model = new BasemodelModelTraining(
                       "https://"+region+ ".cris.ai/api/speechtotext/v3.0/models/base/" + baselineModelID);
         
                    ModelpropertiesModelTraining modelProperties = new ModelpropertiesModelTraining();

                    ModelTraining modelUpload = new ModelTraining("TrainingFromAccelerator", "TrainingFromAccelerator", "Training uploaded from accelerator",
                        "en-US", project, properties, customProperties, add_arr, model, modelProperties);

                    var json = JsonConvert.SerializeObject(modelUpload);
                    log.LogInformation(json);
                    var data = new StringContent(json, Encoding.UTF8, "application/json");

                    response = await clientHttp.PostAsync("https://"+region+".cris.ai/api/speechtotext/v3.0/models", data);
                    string responseString = await response.Content.ReadAsStringAsync();
                    if(!response.IsSuccessStatusCode){
                        log.LogError(responseString);
                        response.EnsureSuccessStatusCode();
                        }
                        else{
                            log.LogInformation(responseString);
                        }

                    break;
                default:
                    log.LogInformation(eventTypeHeader);
                    break;
            }

            return (ActionResult)new OkResult();

        }

    }
}
