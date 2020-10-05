using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ExportSharePointStructure
{
    public class Record
    {

        [JsonProperty("name")]
        public string Title { get; set; }
        [JsonProperty("lastmodified")]
        public int LastModified { get; set; }
        [JsonProperty("itemcount")]
        public int ItemCount { get; set; }
    }

    public class WebRecord : Record
    {
        [JsonProperty("url")]
        public string Url { get; set; }
        //public List<ListRecord> Lists = new List<ListRecord>();
        [JsonProperty("children")]
        public List<WebRecord> Children = new List<WebRecord>();
        [JsonProperty("parent")]
        public string Parent { get; set; }
        [JsonProperty("administrators")]
        public string Administrators { get; set; }
    }

    public class ListRecord : Record
    {
    }
}
