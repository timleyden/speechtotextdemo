using System;
using System.Collections.Generic;
using System.Text;

namespace cut60secondsaudio
{
    using Newtonsoft.Json;
    using System;
    using System.Collections.Generic;
    //updating OM to support 2.1
    public sealed class Result
    {
        [JsonConstructor]
        private Result(Uri recordingsUrl, IEnumerable<ResultUrl> resultUrls)
        {
            this.RecordingsUrl = recordingsUrl;
            this.ResultsUrls = resultUrls;
        }
        /// <inheritdoc />
        public Uri RecordingsUrl { get; set; }

        /// <inheritdoc />
        public IEnumerable<ResultUrl> ResultsUrls { get; set; }
    }
    public sealed class ResultUrl
    {
        [JsonConstructor]
        private ResultUrl(string fileName, Uri resultUrl)
        {
            this.FileName = fileName;
            this.ResultsUrl = resultUrl;
        }
        public string FileName { get; set; }
        public Uri ResultsUrl { get; set; }
    }
    public sealed class Transcription
    {
        [JsonConstructor]
        private Transcription(Guid id, string name, string description, string locale, DateTime createdDateTime, DateTime lastActionDateTime, string status, IEnumerable<Result> results)
        {
            this.Id = id;
            this.Name = name;
            this.Description = description;
            this.CreatedDateTime = createdDateTime;
            this.LastActionDateTime = lastActionDateTime;
            this.Status = status;
            this.Locale = locale;
            this.Results = results;

        }

        /// <inheritdoc />
        public string Name { get; set; }

        /// <inheritdoc />
        public string Description { get; set; }

        /// <inheritdoc />
        public string Locale { get; set; }

        public IEnumerable<Result> Results { get; set; }

        public Guid Id { get; set; }

        /// <inheritdoc />
        public DateTime CreatedDateTime { get; set; }

        /// <inheritdoc />
        public DateTime LastActionDateTime { get; set; }

        /// <inheritdoc />
        public string Status { get; set; }

        public string StatusMessage { get; set; }
    }
}
