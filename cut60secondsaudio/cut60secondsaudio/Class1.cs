using System;
using System.Collections.Generic;
using System.Text;

namespace cut60secondsaudio
{


        public class Class1
        {
            public string recordingurl { get; set; }
            public Segmentresult[] SegmentResults { get; set; }
        }

        public class Segmentresult
        {
            public string RecognitionStatus { get; set; }
            public string ChannelNumber { get; set; }
            public string SpeakerId { get; set; }
            public long Offset { get; set; }
            public int Duration { get; set; }
            public float OffsetInSeconds { get; set; }
            public float DurationInSeconds { get; set; }
            public Nbest[] NBest { get; set; }
        }

        public class Nbest
        {
            public float Confidence { get; set; }
            public string Lexical { get; set; }
            public string ITN { get; set; }
            public string MaskedITN { get; set; }
            public string Display { get; set; }
            public object Sentiment { get; set; }
            public Word[] Words { get; set; }
            public string Original { get; set; }
        }

        public class Word
        {
            public string Words { get; set; }
            public long Offset { get; set; }
            public int Duration { get; set; }
            public float OffsetInSeconds { get; set; }
            public int DurationInSeconds { get; set; }
            public float Confidence { get; set; }
        }

    
}
