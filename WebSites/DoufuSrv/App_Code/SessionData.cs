using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using Doufu.Display.Drawing;

/// <summary>
/// Session data mapper
/// </summary>
public class SessionData
{
    private const string KEY_USER = "user";
    private const string KEY_CAMERA = "camera";
    
    public static SessionData Instance = new SessionData();

    private SessionData()
    {
        //
        // TODO: Add constructor logic here
        //
    }

    public System.Web.SessionState.HttpSessionState Session
    {
        get
        {
            return System.Web.HttpContext.Current.Session;
        }
    }

    public string User
    {
        get
        {
            string user = (string)this.Session[KEY_USER];
            if (user == null || user.Trim() == string.Empty)
            {
                return string.Empty;
            }
            else
            {
                return user;
            }

        }
        set
        {
            this.Session[KEY_USER] = value;
        }
    }

    public Rectangle Camera
    {
        get
        {
            if (this.Session[KEY_CAMERA] == null)
            {
                this.Session[KEY_CAMERA] = new Rectangle();
            }

            return (Rectangle)this.Session[KEY_CAMERA];
        }
    }

    
}

