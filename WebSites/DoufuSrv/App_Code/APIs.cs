using System;
using System.Web;
using System.Collections;
using System.Web.Services;
using System.Web.Services.Protocols;
using Doufu.JSON;


/// <summary>
/// Summary description for APIs
/// </summary>
[WebService(Namespace = "http://doufu.eroman.org/APIs")]
[WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
public class APIs : System.Web.Services.WebService
{
    private const string KEY_RETURN = "Return";
    private const string KEY_MOVEMENTS = "Movements";
    private const string KEY_MESSAGE = "Message";
    private const string KEY_CHATLOG = "ChatLogs";
    private const string KEY_MESSAGE_USER = "User";
    private const string KEY_MESSAGE_DATATIME = "DateTime";
    // TODO: make timeout configurable
    private const int TIMEOUT = 60000 * 5;

    // json responder
    private Helpers.JSONResponder jr = new Helpers.JSONResponder();

    public APIs()
    {

        //Uncomment the following line if using designed components 
        //InitializeComponent(); 
    }

    [WebMethod(EnableSession = true)]
    public void Authenticate(string sUser, string sPassword)
    {
        JObject jRoot = new JObject();

        // TODO: check username and password
        SessionData.Instance.User = sUser;

        jRoot.Items.Add("Name", new JString(SessionData.Instance.User));
        jRoot.Items.Add(KEY_RETURN, new JBoolean(true));

        jr.RespondJSON(jRoot);

    }

    /// <summary>
    /// Asking server to initialize synchronization connection
    /// </summary>
    [WebMethod(EnableSession = true)]
    public void Initialize(int iCameraX, int iCameraY, int iCameraWidth, int iCameraHeight)
    {
        AppData.Instance.UserLastActivity = DateTime.Now;

        JObject jRoot = new JObject();

        SessionData.Instance.Camera.X = iCameraX;
        SessionData.Instance.Camera.Y = iCameraY;
        SessionData.Instance.Camera.Width = iCameraWidth;
        SessionData.Instance.Camera.Height = iCameraHeight;

        jRoot.Items.Add(KEY_RETURN, new JBoolean(true));
        jr.RespondJSON(jRoot);

    }

    [WebMethod(EnableSession = true)]
    private bool SavePosition(long x, long y, long z)
    {
        bool bRet;

        // record the last activity time
        //AppData.Instance.UserLastActivity = DateTime.Now;

        if (SessionData.Instance.User.Trim() != string.Empty &&
            AppData.Instance.UserCoordinates != null)
        {
            AppData.Instance.UserCoordinates.X = x;
            AppData.Instance.UserCoordinates.Y = y;
            AppData.Instance.UserCoordinates.Z = z;
            bRet = true;
        }
        else
        {
            bRet = false;
        }

        return bRet;
    }

    [WebMethod(EnableSession = true)]
    public void MoveTo(int x, int y, int z)
    {
        JObject jRoot = new JObject();

        bool bRet = SavePosition(x, y, z);

        jRoot.Items.Add(KEY_RETURN, new JBoolean(bRet));
        jr.RespondJSON(jRoot);
    }

    [WebMethod(EnableSession = true)]
    public void Say(string sMessage)
    {
        JObject jRoot = new JObject();
        jRoot.Items.Add(KEY_RETURN, new JBoolean(true));
        jr.RespondJSON(jRoot);

    }

    [WebMethod(EnableSession = true)]
    public void Sync()
    {
        this.SyncWithCallback(null, null);
    }

    /// <summary>
    /// 
    /// </summary>
    [WebMethod(EnableSession = true)]
    public void SyncWithCallback(string sCallbackMethod, string sStatusJSONString)
    {
        //// adding test data
        //for (int i = 0; i < 20; i++)
        //{
        //    Enums.ChatLog tmp;
        //    tmp.DateTime = DateTime.Now;
        //    tmp.Message = i.ToJSON() + "testsets";
        //    tmp.Sender = "norm";

        //    AppData.Instance.PublicChannel.Add(tmp);
        //}


        JObject jRoot,jMovement,jStatus,jStatusMovement;
        JString jStatusMessage;
        JString jUser;

        bool bExited = false;

        // Process data which user posted
        if (sStatusJSONString != null && sStatusJSONString.Trim() != string.Empty)
        {
            jStatus = (JObject)Helpers.Parse(sStatusJSONString);

            jStatusMovement = ((JObject)(jStatus.Items[KEY_MOVEMENTS]));

            jUser = ((JString)jStatus.Items[KEY_MESSAGE_USER]);

            // if movement status is not null, then save char pos
            if (jStatusMovement != null)
            {
                this.SavePosition((int)((JNumber)(jStatusMovement.Items["X"])).Value,
                    (int)((JNumber)jStatusMovement.Items["Y"]).Value,
                    (int)((JNumber)jStatusMovement.Items["Z"]).Value);
            }

            // if the user said something
            if (jStatus.Items.ContainsKey(KEY_MESSAGE))
            {
                jStatusMessage = ((JString)(jStatus.Items[KEY_MESSAGE]));
                
                if (jStatusMessage != null)
                {
                    Enums.ChatLog chatLog = new Enums.ChatLog();
                    chatLog.DateTime = DateTime.Now;
                    chatLog.Message = jStatusMessage.Value;
                    chatLog.Sender = jUser.Value;

                    AppData.Instance.PublicChannel.Add(chatLog);
                }
            }
        }

        // Process and send data to user.
        while (!bExited)
        {
            DateTime userLastActivity = AppData.Instance.UserLastActivity;
            jRoot = new JObject();
            jMovement = new JObject();

            jRoot.Items.Add(KEY_MOVEMENTS, jMovement);

            foreach (System.Collections.Generic.KeyValuePair<string, Doufu.Display.Drawing.Cube> kv in AppData.Instance.Coordinates)
            {
                JObject jCube = new JObject();

                jCube.Items.Add("X", new JNumber(kv.Value.X));
                jCube.Items.Add("Y", new JNumber(kv.Value.Y));
                jCube.Items.Add("Z", new JNumber(kv.Value.Z));

                jMovement.Items.Add(kv.Key, jCube);
            }

            // add message if has
            if (AppData.Instance.PublicChannel.Count > 0)
            {
                JArray chatLogs = new JArray();

                for (int i = 0; i < AppData.Instance.PublicChannel.Count; i++)
                {
                    if (AppData.Instance.PublicChannel[i].DateTime > userLastActivity)
                    {
                        JObject chatLog = new JObject();
                        chatLog.Items.Add(KEY_MESSAGE_USER, new JString(AppData.Instance.PublicChannel[i].Sender));
                        chatLog.Items.Add(KEY_MESSAGE_DATATIME,new JString(AppData.Instance.PublicChannel[i].DateTime.ToUniversalTime().ToString("o")));
                        chatLog.Items.Add(KEY_MESSAGE, new JString(AppData.Instance.PublicChannel[i].Message));
                        chatLogs.Value.Add(chatLog);
                    }
                }

                jRoot.Items.Add(KEY_CHATLOG, chatLogs);

                // clear some logs
                while (AppData.Instance.PublicChannel.Count - 500 > 0)
                {
                    AppData.Instance.PublicChannel.RemoveAt(0);
                }

            }

            jRoot.Items.Add(KEY_RETURN, new JBoolean(true));

            // record the last activity time
            AppData.Instance.UserLastActivity = DateTime.Now;

            // if call back method name is specified
            if (sCallbackMethod != null)
            {
                jr.RespondJSON(jRoot, sCallbackMethod);

                // only single sync if the callback is specified.
                return;
            }
            else
            {
                jr.RespondComet(jRoot);
            }

            System.Threading.Thread.Sleep(1000);

            bExited = ((TimeSpan)(DateTime.Now - AppData.Instance.UserLastActivity)).TotalMilliseconds > TIMEOUT?true:false;
        }
    }

}

