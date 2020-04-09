using System;


namespace cut60secondsaudio
{
    public class getProjectsCalss
    {
        public Value[] values { get; set; }
    }

    public class Value
    {
        public string self { get; set; }
        public string projectKind { get; set; }
        public Links links { get; set; }
        public DateTime createdDateTime { get; set; }
        public string locale { get; set; }
        public string displayName { get; set; }
        public string description { get; set; }
        public Properties properties { get; set; }
    }

    public class Links
    {
        public string accuracyTests { get; set; }
        public string datasets { get; set; }
        public string models { get; set; }
        public string endpoints { get; set; }
        public string transcriptions { get; set; }
    }

    public class Properties
    {
        public string Datasets { get; set; }
        public string Tests { get; set; }
        public string Models { get; set; }
        public string Transcriptions { get; set; }
        public string Endpoints { get; set; }
        public string DataCollections { get; set; }
    }
}
