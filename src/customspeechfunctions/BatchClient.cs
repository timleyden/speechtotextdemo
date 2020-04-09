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


    public class BatchClient
    {
        private const int MinRetryBackoffInMilliseconds = 10;
        private const int MaxRetryBackoffInMilliseconds = 100;
        private const int MaxNumberOfRetries = 5;
        private const string OneAPIOperationLocationHeaderKey = "Operation-Location";

        private readonly HttpClient client;
        private readonly string speechToTextBasePath;

        private ILogger log;

        private BatchClient(HttpClient client, string apiVersion = "2.0")
        {
            this.client = client;
            speechToTextBasePath = $"api/speechtotext/v{apiVersion}/";
        }

        public static async Task<BatchClient> CreateApiV1ClientAsync(string username, string key, string hostName, int port)
        {
            var client = new HttpClient();
            client.Timeout = TimeSpan.FromMinutes(25);
            client.BaseAddress = new UriBuilder(Uri.UriSchemeHttps, hostName, port).Uri;

            var tokenProviderPath = "/oauth/ctoken";
            var clientToken = await CreateClientTokenAsync(client, hostName, port, tokenProviderPath, username, key).ConfigureAwait(false);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("bearer", clientToken.AccessToken);

            return new BatchClient(client);
        }

        public static BatchClient CreateApiV2Client(string key, string hostName, int port, ILogger Logger = null, string apiVersion = "2.0")
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

        public Task<IEnumerable<Transcription>> GetTranscriptionsAsync()
        {
            var path = $"{this.speechToTextBasePath}Transcriptions";
            return this.GetAsync<IEnumerable<Transcription>>(path);
        }

        public Task<Uri> CreateWebHook(string CallbackUrl, string secret)
        {
            string jasonpaylod = @"{{
  ""configuration"": {{
    ""url"": ""{0}"",
    ""secret"": ""{1}""
  }},
  ""events"": [
    ""DatasetImportCompletion""
  ],
  ""active"": true,
  ""name"": ""DatasetImportCompletionWebHook"",
  ""description"": ""This is a Webhook created to trigger an HTTP POST request when my audio file transcription is completed."",
  ""properties"": {{
      ""Active"" : ""True""
  }}
}}";
            //Webhooks can be created by making a POST request to https://<region>.cris.ai/api/speechtotext/v2.1/transcriptions/hooks.


            //TODO:query hooks to see if this url has been registered previously to add idempotency
            var path = $"{this.speechToTextBasePath}datasets/hooks";
            return this.PostAsJsonAsync(path, string.Format(jasonpaylod, CallbackUrl, secret));
        }

        public Task<Transcription> GetTranscriptionAsync(Guid id)
        {
            var path = $"{this.speechToTextBasePath}Transcriptions/{id}";
            return this.GetAsync<Transcription>(path);
        }

        public Task<Uri> PostTranscriptionAsync(string name, string description, string locale, Uri recordingsUrl, bool AddDiarization)
        {
            var path = $"{this.speechToTextBasePath}transcriptions/";
            IList<Uri> recordingsUrls = new List<Uri>();
            recordingsUrls.Add(recordingsUrl);
            var transcriptionDefinition = TranscriptionDefinition.Create(name, description, locale, recordingsUrls, AddDiarization);

            return this.PostAsJsonAsync<TranscriptionDefinition>(path, transcriptionDefinition);
        }

        public Task<Uri> PostTranscriptionAsync(string name, string description, string locale, Uri recordingsUrl, IEnumerable<Guid> modelIds, bool AddDiarization)
        {
            if (!modelIds.Any())
            {
                return this.PostTranscriptionAsync(name, description, locale, recordingsUrl, AddDiarization);
            }

            var models = modelIds.Select(m => ModelIdentity.Create(m)).ToList();
            var path = $"{this.speechToTextBasePath}transcriptions/";
            IList<Uri> recordingsUrls = new List<Uri>();
            recordingsUrls.Add(recordingsUrl);
            var transcriptionDefinition = TranscriptionDefinition.Create(name, description, locale, recordingsUrls, models, AddDiarization);
            return this.PostAsJsonAsync<TranscriptionDefinition>(path, transcriptionDefinition);
        }

        public Task<Transcription> GetTranscriptionAsync(Uri location)
        {
            if (location == null)
            {
                throw new ArgumentNullException(nameof(location));
            }

            return this.GetAsync<Transcription>(location.AbsolutePath);
        }

        public Task DeleteTranscriptionAsync(Guid id)
        {
            var path = $"{this.speechToTextBasePath}Transcriptions/{id}";
            return this.client.DeleteAsync(path);
        }

        private static async Task<Token> CreateClientTokenAsync(HttpClient client, string hostName, int port, string tokenProviderPath, string username, string key)
        {
            var uriBuilder = new UriBuilder("https", hostName, port, tokenProviderPath);

            var form = new Dictionary<string, string>
                    {
                        { "grant_type", "client_credentials" },
                        { "client_id", "cris" },
                        { "client_secret", key },
                        { "username", username }
                    };

            var rand = new Random();

            for (var retries = 0; retries < MaxNumberOfRetries; retries++)
            {
                HttpResponseMessage response = null;
                try
                {
                    response = await client.PostAsync(uriBuilder.Uri, new FormUrlEncodedContent(form)).ConfigureAwait(false);
                    var token = await response.Content.ReadAsAsync<Token>().ConfigureAwait(false);

                    if (string.IsNullOrEmpty(token.Error))
                    {
                        return token;
                    }
                }
                catch (HttpRequestException)
                {
                    // Didn't work. Too bad. Try again.
                }
                finally
                {
                    response?.Dispose();
                }

                await Task.Delay(TimeSpan.FromMilliseconds(rand.Next(MinRetryBackoffInMilliseconds, MaxRetryBackoffInMilliseconds)))
                    .ConfigureAwait(false);
            }

            throw new InvalidOperationException("Exceeded maximum number of retries for getting a token.");
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
