using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Microsoft.Azure.WebJobs.Extensions.Storage;
using SpeechToTextDemo;

namespace cut60secondsaudio
{
    public static class uploadForCustomSpeech
    {
        public class blob
        {
            public blob(string blobName, string blobUrl, string saskey)
            {
                this.blobName = blobName;
                this.blobUrl = blobUrl;
                this.SASkeyForBlob = saskey;
            }
            public string blobName { get; set; }
            public string blobUrl { get; set; }
            public string SASkeyForBlob { get; set; }

        }

        public class project
        {

            public project()
            {
                name = "CustomSpeechProject";
                displayName = "CustomSpeechProject";
                description = "CustomSpeechProject created using accelerator";
                projectKind = "SpeechToText";
                locale = "en-US";
            }

            public project(string Name, string DisplayName, string Description, string ProjectKind, string Locale)
            {
                name = Name;
                displayName = DisplayName;
                description = Description;
                projectKind = ProjectKind;
                locale = Locale;
            }

            public string name { get; }
            public string displayName { get; }
            public string description { get; }
            public string projectKind { get; }
            public string locale { get; }

        }

        public class dataset
        {

            public dataset(string Name, string DisplayName, string Description, string DataImportKind, string DataUrl, string SourceUrl, string Locale, string Id,
                projectSelf Project, properties Properties, customProperties CustomProperties, datasetProperties DatasetProperties)
            {
                name = Name;
                displayName = DisplayName;
                description = Description;
                dataImportKind = DataImportKind;
                dataUrl = DataUrl;
                sourceUrl = SourceUrl;
                locale = Locale;
                project = Project;
                id = Id;
                properties = Properties;
                customProperties = CustomProperties;
                datasetProperties = DatasetProperties;
            }
            public string name { get; }
            public string displayName { get; }
            public string description { get; }
            public string dataImportKind { get; }
            public string dataUrl { get; }
            public string sourceUrl { get; }

            public string locale { get; }

            public string id { get; }

            public projectSelf project { get; }
            public properties properties { get; }

            public customProperties customProperties { get; }

            public datasetProperties datasetProperties { get; }

        }



        public class projectSelf
        {
            public projectSelf(string Id, string Self)
            {
                this.id = Id;
                this.self = Self;
            }
            public string id { get; }
            public string self { get; }
        }



        public class datasetProperties
        {
            public datasetProperties() { email = null; }

            public datasetProperties(string Email)
            {
                Email = email;
            }
            public string email { get; }
        }

        public class customProperties
        {
            public customProperties() { PortalAPIVersion = "3"; }

            public customProperties(string portalAPIVersion)
            {
                PortalAPIVersion = portalAPIVersion;
            }
            public string PortalAPIVersion { get; }
        }



        public class properties
        {
            public properties() { this.PortalAPIVersion = "3"; this.trainingMethod = "Unified"; }
            public properties(string PortalAPIVersion, string trainingMethod)
            {
                this.PortalAPIVersion = PortalAPIVersion;
                this.trainingMethod = trainingMethod;
            }
            public string PortalAPIVersion { get; }
            public string trainingMethod { get; }
        }


        [FunctionName("uploadForCustomSpeech")]
        public static async Task Run([BlobTrigger("cutaudio/{name}", Connection = "StorageConnectionString")]Stream myBlob, string name, IDictionary<string, string> metaData, ILogger log,string blobTrigger)
        {


            log.LogInformation($"C# Blob trigger function Processed blob\n Name:{name} \n Size: {myBlob.Length} Bytes, path:{blobTrigger}");



            string ocpSubKey = ServiceDetails.GetServiceDetails().serviceKey;
            string storrageUrl = blobTrigger;
            string saskey = ServiceDetails.GetServiceDetails().sASTokenReadOnly;
            string region = ServiceDetails.GetServiceDetails().region;
            


            blob blobFile = new blob(name, storrageUrl, saskey);

            string baselineModelId = metaData["baseModelId"];


            //declare the client 
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", ocpSubKey);

            // Check if any project exists
            var response = await client.GetAsync(new Uri("https://"+ region + ".cris.ai/api/speechtotext/v3.0-beta1/projects/"));

            response.EnsureSuccessStatusCode();

            string content = await response.Content.ReadAsStringAsync();

            getProjectsCalss projects = JsonConvert.DeserializeObject<getProjectsCalss>(content);

            //if no projects found, create a new one
            if (projects.values.Length == 0)
            {
                var newSpeechproject = new project();
                var json = JsonConvert.SerializeObject(newSpeechproject);
                var data = new StringContent(json, Encoding.UTF8, "application/json");
                response = await client.PostAsync("https://" + region + ".cris.ai/api/speechtotext/v3.0-beta1/projects/", data);
                response.EnsureSuccessStatusCode();
                await response.Content.ReadAsStringAsync();

                string localProjectPath = response.Headers.Location.LocalPath;
                string[] projectIDarray = localProjectPath.Split("/api/speechtotext/v3.0-beta1/projects/");
                string projectId = projectIDarray[1];

                await createDataSetAsync(projectId, client, blobFile, "https://" + region + ".cris.ai/api/speechtotext/v3.0-beta1/projects/", baselineModelId);

            }
            else
            //if project is found just use first one to upload the data
            {
                string[] projectIDarray = projects.values[0].self.Split("https://" + region + ".cris.ai/api/speechtotext/v3.0-beta1/projects/");
                string projectID = projectIDarray[1];

                await createDataSetAsync(projectID, client, blobFile, "https://" + region + ".cris.ai/api/speechtotext/v3.0-beta1/projects/", baselineModelId);

            }
        }

        public static async Task createDataSetAsync(string projectID, HttpClient client, blob blobFile, string projectUrl, string baselineModelId)
        {
            var project = new projectSelf(projectID, projectUrl + projectID);

            var properties = new properties();

            var customProperties = new customProperties();

            var datasetProperties = new datasetProperties();

            var dataSetfromBlob = new dataset(
                "dataSet" + blobFile.blobName,
                "dataSet" + blobFile.blobName,
                "This data set is created from Speech to Text Accelerator. Basemodel: " + baselineModelId,
                "Acoustic",
                blobFile.blobUrl + blobFile.SASkeyForBlob,
                blobFile.blobUrl + blobFile.SASkeyForBlob,
                 "en-US",
                 null,
                 project,
                 properties,
                 customProperties,
                 datasetProperties
                );

            var json = JsonConvert.SerializeObject(dataSetfromBlob);

            var data = new StringContent(json, Encoding.UTF8, "application/json");

            string region = ServiceDetails.GetServiceDetails().region;

            var response = await client.PostAsync("https://"+region+".cris.ai/api/speechtotext/v3.0-beta1/datasets", data);

            response.EnsureSuccessStatusCode();

            await response.Content.ReadAsStringAsync();
        }
    }
}
