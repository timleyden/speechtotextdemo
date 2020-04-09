using System;
using System.Collections.Generic;
using System.Text;

namespace cut60secondsaudio
{
    using System;
    using System.Collections.Generic;

    public sealed class TranscriptionDefinition
    {
        private TranscriptionDefinition(string name, string description, string locale, IEnumerable<Uri> recordingsUrls, IEnumerable<ModelIdentity> models, bool AddDiarization)
        {
            this.Name = name;
            this.Description = description;
            this.RecordingsUrls = recordingsUrls;
            this.Locale = locale;
            this.Models = models;
            this.properties = new Dictionary<string, string>();
            this.properties.Add("PunctuationMode", "DictatedAndAutomatic");
            this.properties.Add("ProfanityFilterMode", "Masked");
            this.properties.Add("AddWordLevelTimestamps", "True");
            if (AddDiarization)
            {
                this.properties.Add("AddDiarization", "True");
            }
        }

        /// <inheritdoc />
        public string Name { get; set; }

        /// <inheritdoc />
        public string Description { get; set; }

        /// <inheritdoc />
        public IEnumerable<Uri> RecordingsUrls { get; set; }

        public string Locale { get; set; }

        public IEnumerable<ModelIdentity> Models { get; set; }

        public IDictionary<string, string> properties { get; set; }

        public static TranscriptionDefinition Create(
            string name,
            string description,
            string locale,
            IEnumerable<Uri> recordingsUrls,
            bool AddDiarization)
        {
            return TranscriptionDefinition.Create(name, description, locale, recordingsUrls, null, AddDiarization);
        }

        public static TranscriptionDefinition Create(
            string name,
            string description,
            string locale,
            IEnumerable<Uri> recordingsUrls,
            IEnumerable<ModelIdentity> models,
            bool AddDiarization)
        {
            return new TranscriptionDefinition(name, description, locale, recordingsUrls, models, AddDiarization);
        }
    }
}
