using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;

/// <summary>
/// Summary description for Enums
/// </summary>
public class Enums
{
    private Enums()
    {
        
    }

    public struct ChatLog
    {
        public DateTime DateTime;
        public string Sender;
        public string Message;
        
    }
}
