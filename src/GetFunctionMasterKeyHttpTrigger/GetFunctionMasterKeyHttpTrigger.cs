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
using System.Net;
using System.Text;
//coutesy of https://medium.com/@mandur/get-azure-function-host-key-in-an-arm-deployment-template-1eb7ba03c083
namespace SpeechToTextDemo
{
    public static class GetFunctionMasterKeyHttpTrigger
    {
        [FunctionName("GetFunctionMasterKeyHttpTrigger")]
        public static async System.Threading.Tasks.Task<HttpResponseMessage> RunAsync([HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)]HttpRequest req, ILogger log, ExecutionContext context)
        {
            //get the publishing profile information from function argument
            var queryStrings = req.GetQueryParameterDictionary();
            string publishingUserName = "";
            string publishingPassword = "";
            string hostKey = "";
            queryStrings.TryGetValue("publishingUserName", out publishingUserName);
            queryStrings.TryGetValue("publishingPassword", out publishingPassword);
            //get the JWT token to call the KUDU Api
            var base64Auth = Convert.ToBase64String(Encoding.Default.GetBytes($"{publishingUserName}:{publishingPassword}"));
            var apiUrl = new Uri($"https://{Environment.GetEnvironmentVariable("WEBSITE_CONTENTSHARE")}.scm.azurewebsites.net/api");
            string JWT;
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("Authorization", $"Basic {base64Auth}");
                var result = client.GetAsync($"{apiUrl}/functions/admin/token").Result;
                JWT = result.Content.ReadAsStringAsync().Result.Trim('"'); //get  JWT for call funtion key
            }
            //get the key from KUDU
            var siteUrl = new Uri($"https://{Environment.GetEnvironmentVariable("WEBSITE_CONTENTSHARE")}.azurewebsites.net");
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Add("Authorization", "Bearer " + JWT);
                string jsonResult = client.GetAsync($"{siteUrl}/admin/host/systemkeys/_master").Result.Content.ReadAsStringAsync().Result;
                log.LogInformation(jsonResult);
                dynamic resObject = JsonConvert.DeserializeObject(jsonResult);
                hostKey = resObject.value;
            }
            var template = @"{'$schema': 'https://schema.management.azure.com/schemas/2015-01-01/deploymentTemplate.json#', 'contentVersion': '1.0.0.0', 'parameters': {}, 'variables': {}, 'resources': [],
               'outputs': {
                  'HostKey':{
                        'value': '"+hostKey+"','type' : 'string'}}}";
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new StringContent(template, System.Text.Encoding.UTF8, "application/json");
            return response;
        }

    }
}
