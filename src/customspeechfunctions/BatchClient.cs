using System;
using System.Collections.Generic;
using System.Text;

namespace cut60secondsaudio
{

    using Newtonsoft.Json;
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Net;
    using System.Net.Http;
    using System.Net.Http.Headers;
    using System.Threading.Tasks;
    using Microsoft.Extensions.Logging;

//copied from https://github.com/Azure-Samples/cognitive-services-speech-sdk/tree/master/samples/batch/csharp
    public class BatchClient
    {
        private const int MinRetryBackoffInMilliseconds = 10;
        private const int MaxRetryBackoffInMilliseconds = 100;
        private const int MaxNumberOfRetries = 5;
        private const string OneAPIOperationLocationHeaderKey = "Operation-Location";

        private readonly HttpClient client;
        private readonly string speechToTextBasePath;

        private ILogger log;

        private BatchClient(HttpClient client, string apiVersion = "3.0")
        {
            this.client = client;
            speechToTextBasePath = $"api/speechtotext/v{apiVersion}/";
        }

       

        public static BatchClient CreateApiClient(string key, string hostName, int port, ILogger Logger = null, string apiVersion = "3.0")
        {
            var client = new HttpClient();
            client.Timeout = TimeSpan.FromMinutes(25);
            client.BaseAddress = new UriBuilder(Uri.UriSchemeHttps, hostName, port).Uri;

            client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", key);
            BatchClient result = new BatchClient(client, apiVersion);
            if (Logger != null)
            {
                result.log = Logger;
            }
            return result;
        }

        public Task<Uri> CreateWebHook(string CallbackUrl, string secret)
        {
            string jasonpaylod = @"{{
  
    ""url"": ""{0}"",
   
  ,
  ""events"": {{
    ""datasetImportCompletion"":""true""
  }},
  ""active"": true,
  ""displayName"": ""DatasetImportCompletionWebHook"",
  ""description"": ""This is a Webhook created to trigger an HTTP POST request when my dataset import is completed."",
  ""properties"": {{
       ""secret"": ""{1}""
  }}
}}";
            //Webhooks can be created by making a POST request to https://<region>.cris.ai/api/speechtotext/v2.1/transcriptions/hooks.


            //TODO:query hooks to see if this url has been registered previously to add idempotency
            var path = $"{this.speechToTextBasePath}datasets/hooks";
            return this.PostAsJsonAsync(path, string.Format(jasonpaylod, CallbackUrl, secret));
        }
             

        private static async Task<Uri> GetLocationFromPostResponseAsync(HttpResponseMessage response, ILogger log = null)
        {
            var content = await response.Content.ReadAsStringAsync().ConfigureAwait(false);
            if (!response.IsSuccessStatusCode)
            {

                if (log != null) log.LogError(content);
                throw new Exception($"Request failed {response.StatusCode}" + content);
            }
            else
            {
                if (log != null) log.LogInformation(content);
            }

            IEnumerable<string> headerValues;
            if (response.Headers.TryGetValues(OneAPIOperationLocationHeaderKey, out headerValues))
            {
                if (headerValues.Any())
                {
                    return new Uri(headerValues.First());
                }
            }

            return response.Headers.Location;
        }

        private async Task<Uri> PostAsJsonAsync<TPayload>(string path, TPayload payload)
        {
            string res = string.Empty;
            if (typeof(TPayload) == typeof(String))
            {
                res = payload as String;
            }
            else
            {
                res = Newtonsoft.Json.JsonConvert.SerializeObject(payload);
            }
            if (log != null) log.LogInformation(res);
            StringContent content = new StringContent(res);
            content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
            using (var response = await this.client.PostAsync(path, content).ConfigureAwait(false))
            {
                return await GetLocationFromPostResponseAsync(response, log);
            }
        }

        private async Task<TResponse> GetAsync<TResponse>(string path)
        {
            using (var response = await this.client.GetAsync(path).ConfigureAwait(false))
            {
                var contentType = response.Content.Headers.ContentType;

                if (response.IsSuccessStatusCode && string.Equals(contentType.MediaType, "application/json", StringComparison.OrdinalIgnoreCase))
                {
                    var result = await response.Content.ReadAsAsync<TResponse>().ConfigureAwait(false);

                    return result;
                }

                throw new NotImplementedException();
            }
        }
    }
}
