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
using System.Collections.Generic;
using System.Collections.ObjectModel;

/// <summary>
/// Summary description for AppData
/// </summary>
public class AppData
{

    private const string KEY_COORDINATES = "coordinates";
    private const string KEY_LAST_ACTIVITY = "lastActivity";
    private object locker = new object();
    public static AppData Instance = new AppData();

    private AppData()
    {
        //
        // TODO: Add constructor logic here
        //
    }

    public HttpApplicationState AppState
    {
        get
        {
            return HttpContext.Current.Application;
        }
    }

    public Cube UserCoordinates
    {
        get
        {
            lock (locker)
            {
                if (!this.Coordinates.ContainsKey(SessionData.Instance.User))
                {
                    this.Coordinates[SessionData.Instance.User] = new Cube();
                }

                return this.Coordinates[SessionData.Instance.User];
            }
        }

    }

    public Dictionary<string, Cube> Coordinates
    {
        get
        {
            lock (locker)
            {
                if (this.AppState[KEY_COORDINATES] == null)
                {
                    this.AppState[KEY_COORDINATES] = new Dictionary<string, Cube>();
                }

                return (Dictionary<string, Cube>)this.AppState[KEY_COORDINATES];
            }
        }
    }

    public DateTime UserLastActivity
    {
        get
        {
            lock (locker)
            {
                if (!this.LastActivity.ContainsKey(SessionData.Instance.User))
                {
                    return DateTime.Now.AddYears(-99);
                }

                return this.LastActivity[SessionData.Instance.User];
            }
        }
        set
        {
            lock (locker)
            {
                this.LastActivity[SessionData.Instance.User] = value;
            }
        }
    }

    public Dictionary<string, DateTime> LastActivity
    {
        get
        {
            lock (locker)
            {
                if (this.AppState[KEY_LAST_ACTIVITY] == null)
                {
                    this.AppState[KEY_LAST_ACTIVITY] = new Dictionary<string, DateTime>();
                }

                return (Dictionary<string, DateTime>)this.AppState[KEY_LAST_ACTIVITY];
            }
        }
    }
}
