using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using Webservice.Webs;
using Webservice.Lists;
using System.IO;
using System.Globalization;
using Newtonsoft.Json;
using System.Net;
using System.Security;
using Microsoft.SharePoint.Client;

namespace ExportSharePointStructure
{
    public class Program
    {
        private static string defaultUrl = "";
        private static string defaultTitle = "SP ROOT";
        private static string fileLocation = "";
        // Authenticate On prem (NetworkCredentials)
        private static System.Net.NetworkCredential credential = new System.Net.NetworkCredential("username", "password", "domain");
        // Authenticate SP Online (AuthCoockies)
        private static string onlinePassword = "";
        private static string onlineUsername = "";

        private static CookieContainer GetAuthCookies()
        {
            var securePassword = new SecureString();
            foreach (var c in onlinePassword) { securePassword.AppendChar(c); }
            var credentials = new SharePointOnlineCredentials(onlineUsername, securePassword);
            var authCookie = credentials.GetAuthenticationCookie(new Uri(defaultUrl));
            var cookieContainer = new CookieContainer();
            cookieContainer.SetCookies(new Uri(defaultUrl), authCookie);
            return cookieContainer;
        }

        static void Main(string[] args)
        {
            // Gebruik eerste parameter als url en tweede als titel, optioneel

            WebRecord records = new WebRecord();

            if (args != null)
            {
                if (args.Length < 1) records.Url = defaultUrl;
                if (args.Length < 2) records.Title = defaultTitle;
            }
            else
            {
                records.Url = defaultUrl;
                records.Title = defaultTitle;
            }

            Recursive(records);

            using (StreamWriter fileStream = new StreamWriter(fileLocation))
            {
                string sharepointJSON = Newtonsoft.Json.JsonConvert.SerializeObject(records);
                fileStream.WriteLine(sharepointJSON.ToString() + Environment.NewLine);
            }
        }

        private static void Recursive(WebRecord records)
        {

            Webs webs = new Webs();
            webs.Url = records.Url + "/" + "_vti_bin/webs.asmx";
            webs.Credentials = credential;
            //webs.CookieContainer = GetAuthCookies();
            XmlNode subwebs = webs.GetWebCollection();

            foreach (XmlNode node in subwebs.ChildNodes)
            {
                WebRecord web = new WebRecord()
                {
                    Title = node.Attributes[0].Value,
                    Url = node.Attributes[1].Value,
                    LastModified = DateTime.MinValue.Year
                };

                Lists lists = new Lists();
                lists.Url = web.Url + "/_vti_bin/lists.asmx";
                lists.Credentials = credential;
                //lists.CookieContainer = GetAuthCookies();

                XmlNode list = lists.GetListCollection();

                List<ListRecord> listRecordList = new List<ListRecord>();

                foreach (XmlNode listnode in list.ChildNodes)
                {
                    ListRecord currentList = new ListRecord()
                    {
                        Title = listnode.Attributes[3].Value,
                        LastModified = DateTime.ParseExact(listnode.Attributes[10].Value, "yyyyMMdd HH:mm:ss", CultureInfo.InvariantCulture).Year,
                        ItemCount = int.Parse(listnode.Attributes["ItemCount"].Value)
                    };

                    //web.Lists.Add(currentList);

                    listRecordList.Add(currentList);
                }

                List<string> adminList = new List<string>();
                adminList.AddRange(GetUsersInRole(web, "Administrator")); 
                adminList.AddRange(GetUsersInRole(web, "Admin"));
                adminList.AddRange(GetUsersInRole(web, "Beheerder"));
                adminList = adminList.Distinct().ToList();
                web.Administrators = string.Join(",", adminList);

                if (web.Administrators == string.Empty)
                    web.Administrators = "-";

                Recursive(web);

                web.ItemCount = web.Children.Sum(f => f.ItemCount) + listRecordList.Sum(f => f.ItemCount);

                int listMax = 0;
                int siteMax = 0;

                if (listRecordList.Count > 1)
                    listMax = listRecordList.Max(f => f.LastModified);

                if (web.Children.Count > 1)
                    siteMax = web.Children.Max(f => f.LastModified);

                web.LastModified = Math.Max(listMax, siteMax);
                web.Parent = records.Title;

                records.Children.Add(web);
            }
        }

        private static List<string> GetUsersInRole(WebRecord web, string role)
        {
            List<string> adminList = new List<string>();
            try {
                UserGroup permissionsProxy = new UserGroup();
                permissionsProxy.Url = web.Url + "/_vti_bin/usergroup.asmx";
                permissionsProxy.Credentials = credential;
                //permissionsProxy.CookieContainer = GetAuthCookies();

                XmlNode groups = permissionsProxy.GetGroupCollectionFromRole(role);

                foreach (XmlNode group in groups.ChildNodes[0].ChildNodes)
                {
                    XmlNode users = permissionsProxy.GetUserCollectionFromGroup(group.Attributes["Name"].Value);
                    foreach (XmlNode user in users.ChildNodes[0].ChildNodes)
                        adminList.Add(user.Attributes["Name"].Value);
                }
            }
            catch (Exception ex)
            {
                adminList.Add("Kon data niet inladen voor role: " + role);
            }
            return adminList;
        }
    }
}
