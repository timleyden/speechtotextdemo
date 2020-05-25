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

            public dataset(string DisplayName, string Description, string DataImportKind, string DatasetKind,string Kind,  string SourceUrl, string ContentUrl, string Locale,
                projectSelf Project, properties Properties, customProperties CustomProperties)
            {
                displayName = DisplayName;
                description = Description;
                dataImportKind = DataImportKind;
                datasetKind = DatasetKind;
                kind = Kind;
                sourceUrl = SourceUrl;
                contentUrl = ContentUrl;
                locale = Locale;
                project = Project;
                properties = Properties;
                customProperties = CustomProperties;
            }
            public string displayName { get; }
            public string description { get; }

            public string dataImportKind { get; }

            public string datasetKind { get; }

            public string kind { get; }
            public string sourceUrl { get; }
            public string contentUrl { get; }

            public string locale { get; }

            public projectSelf project { get; }
            public properties properties { get; }

            public customProperties customProperties { get; }

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

        }


        public class Baselinemodel
        {
            public string self { get; set; }
            public object[] datasets { get; set; }
            public LinksBaseline links { get; set; }
            public PropertiesBaseline properties { get; set; }
            public DateTime lastActionDateTime { get; set; }
            public string status { get; set; }
            public DateTime createdDateTime { get; set; }
            public string locale { get; set; }
            public string displayName { get; set; }
            public string description { get; set; }
            public CustompropertiesBaseline customProperties { get; set; }
        }

        public class LinksBaseline { public string endpointManifest { get; set; } }

        public class PropertiesBaseline { public string deprecatedFeatures { get; set; } }

        public class CustompropertiesBaseline { }





        [FunctionName("uploadForCustomSpeech")]
        public static async Task Run([BlobTrigger("cutaudio/{name}", Connection = "StorageConnectionString")]Stream myBlob, string name, IDictionary<string, string> metaData, ILogger log, string blobTrigger, Uri uri)
        {
            log.LogInformation($"C# Blob trigger function Processed blob\n Name:{name} \n Size: {myBlob.Length} Bytes, path:{blobTrigger}, uri:{uri.ToString()}");
            string ocpSubKey = ServiceDetails.GetServiceDetails().serviceKey;
            string storrageUrl = uri.ToString();
            string saskey = ServiceDetails.GetServiceDetails().sASTokenReadOnly;
            string region = ServiceDetails.GetServiceDetails().region;
            


            blob blobFile = new blob(name, storrageUrl, saskey);

            string baselineModelId = metaData["baseModelId"];


            //declare the client 
            HttpClient client = new HttpClient();
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", ocpSubKey);



            // Query the baseline model ID to get the locale for project

            var response = await client.GetAsync(new Uri("https://"+ region + ".cris.ai/api/speechtotext/v3.0/models/base/" + baselineModelId));
            response.EnsureSuccessStatusCode();
            string content = await response.Content.ReadAsStringAsync();
            Baselinemodel baselineModelDetails = JsonConvert.DeserializeObject<Baselinemodel>(content);
            string locale = baselineModelDetails.locale;
            log.LogInformation($"Basline model is in locale {locale}");



            // Check if any project exists
            response = await client.GetAsync(new Uri("https://"+ region + ".cris.ai/api/speechtotext/v3.0/projects/"));
            response.EnsureSuccessStatusCode();
            content = await response.Content.ReadAsStringAsync();
            getProjectsCalss projects = JsonConvert.DeserializeObject<getProjectsCalss>(content);

            //if no projects found, create a new one in locale of baseline model
            if (projects.values.Length == 0)
            {
                var newSpeechproject = new project("CustomSpeechProject", "CustomSpeechProject","CustomSpeechProject created using accelerator", "SpeechToText", locale);
                var json = JsonConvert.SerializeObject(newSpeechproject);
                var data = new StringContent(json, Encoding.UTF8, "application/json");
                response = await client.PostAsync("https://" + region + ".cris.ai/api/speechtotext/v3.0/projects/", data);
                response.EnsureSuccessStatusCode();
                await response.Content.ReadAsStringAsync();

                string localProjectPath = response.Headers.Location.LocalPath;
                string[] projectIDarray = localProjectPath.Split("/api/speechtotext/v3.0/projects/");
                string projectId = projectIDarray[1];

                await createDataSetAsync(projectId, client, blobFile, "https://" + region + ".cris.ai/api/speechtotext/v3.0/projects/", baselineModelId, log, locale);

            }
            else
            //if project is found just use the one that that has that locale else create a project in the baseline model locale
            {

                bool projectFound = false;
                string projectID = null;

                foreach(Value projectInstance in projects.values) {
                    if (projectInstance.locale == locale) {

                        string[] projectIDarray = projects.values[0].self.Split("https://" + region + ".cris.ai/api/speechtotext/v3.0/projects/");
                        projectID = projectIDarray[1];
                        projectFound = true;
                        break;
                    }
                }

                if (!projectFound) {

                    var newSpeechproject = new project("CustomSpeechProject", "CustomSpeechProject","CustomSpeechProject created using accelerator", "SpeechToText", locale);
                    var json = JsonConvert.SerializeObject(newSpeechproject);
                    var data = new StringContent(json, Encoding.UTF8, "application/json");
                    response = await client.PostAsync("https://" + region + ".cris.ai/api/speechtotext/v3.0/projects/", data);
                    response.EnsureSuccessStatusCode();
                    await response.Content.ReadAsStringAsync();

                    string localProjectPath = response.Headers.Location.LocalPath;
                    string[] projectIDarray = localProjectPath.Split("/api/speechtotext/v3.0/projects/");
                    projectID = projectIDarray[1];
                }

                await createDataSetAsync(projectID, client, blobFile, "https://" + region + ".cris.ai/api/speechtotext/v3.0/projects/", baselineModelId, log, locale);

            }
        }

        public static async Task createDataSetAsync(string projectID, HttpClient client, blob blobFile, string projectUrl, string baselineModelId,ILogger log, string locale)
        {
            var project = new projectSelf(projectID, projectUrl + projectID);

            var properties = new properties();

            var customProperties = new customProperties();

            log.LogInformation($"SAS key for blob: {blobFile.SASkeyForBlob}");



            var dataSetfromBlob = new dataset(
                "dataSet" + blobFile.blobName,
                "This data set is created from Speech to Text Accelerator. Basemodel: " + baselineModelId,
                "Acoustic",
                "Acoustic",
                "Acoustic",
                blobFile.blobUrl + blobFile.SASkeyForBlob,
                blobFile.blobUrl + blobFile.SASkeyForBlob,
                 locale,
                 project,
                 properties,
                 customProperties
                );

            var json = JsonConvert.SerializeObject(dataSetfromBlob);

            var data = new StringContent(json, Encoding.UTF8, "application/json");

            log.LogInformation($"Payload: {json}");

            string region = ServiceDetails.GetServiceDetails().region;

            var response = await client.PostAsync("https://"+region+".cris.ai/api/speechtotext/v3.0/datasets", data);

            response.EnsureSuccessStatusCode();

            await response.Content.ReadAsStringAsync();
        }
    }
}
