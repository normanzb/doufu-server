using System;
using System.Web;
using System.Collections;
using System.Web.Services;
using System.Web.Services.Protocols;


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
    private Doufu.JSON.Helpers.JSONResponder jr = new Doufu.JSON.Helpers.JSONResponder();

    public APIs()
    {

        //Uncomment the following line if using designed components 
        //InitializeComponent(); 
    }

    [WebMethod(EnableSession = true)]
    public void Authenticate(string sUser, string sPassword)
    {
        Doufu.JSON.Object<Doufu.JSON.IJSONObject> jRoot = new Doufu.JSON.Object<Doufu.JSON.IJSONObject>();

        // TODO: check username and password
        SessionData.Instance.User = sUser;

        jRoot.Items.Add("Name", new Doufu.JSON.String(SessionData.Instance.User));
        jRoot.Items.Add(KEY_RETURN, new Doufu.JSON.Boolean(true));

        jr.RespondJSON(jRoot);

    }

    /// <summary>
    /// Asking server to initialize synchronization connection
    /// </summary>
    [WebMethod(EnableSession = true)]
    public void Initialize(int iCameraX, int iCameraY, int iCameraWidth, int iCameraHeight)
    {
        AppData.Instance.UserLastActivity = DateTime.Now;

        Doufu.JSON.Object<Doufu.JSON.IJSONObject> jRoot = new Doufu.JSON.Object<Doufu.JSON.IJSONObject>();

        SessionData.Instance.Camera.X = iCameraX;
        SessionData.Instance.Camera.Y = iCameraY;
        SessionData.Instance.Camera.Width = iCameraWidth;
        SessionData.Instance.Camera.Height = iCameraHeight;

        jRoot.Items.Add(KEY_RETURN, new Doufu.JSON.Boolean(true));
        jr.RespondJSON(jRoot);

    }

    [WebMethod(EnableSession = true)]
    private bool SavePosition(int x, int y, int z)
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
        Doufu.JSON.Object<Doufu.JSON.IJSONObject> jRoot = new Doufu.JSON.Object<Doufu.JSON.IJSONObject>();

        bool bRet = SavePosition(x, y, z);

        jRoot.Items.Add(KEY_RETURN, new Doufu.JSON.Boolean(bRet));
        jr.RespondJSON(jRoot);
    }

    [WebMethod(EnableSession = true)]
    public void Say(string sMessage)
    {
        Doufu.JSON.Object<Doufu.JSON.IJSONObject> jRoot = new Doufu.JSON.Object<Doufu.JSON.IJSONObject>();
        jRoot.Items.Add(KEY_RETURN, new Doufu.JSON.Boolean(true));
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
        //    tmp.Message = i.ToString() + "testsets";
        //    tmp.Sender = "norm";

        //    AppData.Instance.PublicChannel.Add(tmp);
        //}


        Doufu.JSON.Object<Doufu.JSON.IJSONObject> jRoot,jMovement,jStatus,jStatusMovement;
        Doufu.JSON.String jStatusMessage;
        Doufu.JSON.String jUser;

        bool bExited = false;

        // Process data which user posted
        if (sStatusJSONString != null && sStatusJSONString.Trim() != string.Empty)
        {
            jStatus = Doufu.JSON.Helpers.Parse(sStatusJSONString);

            jStatusMovement = ((Doufu.JSON.Object<Doufu.JSON.IJSONObject>)(jStatus.Items[KEY_MOVEMENTS]));

            jUser = ((Doufu.JSON.String)jStatus.Items[KEY_MESSAGE_USER]);

            // if movement status is not null, then save char pos
            if (jStatusMovement != null)
            {
                this.SavePosition(((Doufu.JSON.Number)(jStatusMovement.Items["X"])).Value,
                    ((Doufu.JSON.Number)jStatusMovement.Items["Y"]).Value,
                    ((Doufu.JSON.Number)jStatusMovement.Items["Z"]).Value);
            }

            // if the user said something
            if (jStatus.Items.ContainsKey(KEY_MESSAGE))
            {
                jStatusMessage = ((Doufu.JSON.String)(jStatus.Items[KEY_MESSAGE]));
                
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
            jRoot = new Doufu.JSON.Object<Doufu.JSON.IJSONObject>();
            jMovement = new Doufu.JSON.Object<Doufu.JSON.IJSONObject>();

            jRoot.Items.Add(KEY_MOVEMENTS, jMovement);

            foreach (System.Collections.Generic.KeyValuePair<string, Doufu.Display.Drawing.Cube> kv in AppData.Instance.Coordinates)
            {
                Doufu.JSON.Object<Doufu.JSON.IJSONObject> jCube = new Doufu.JSON.Object<Doufu.JSON.IJSONObject>();

                jCube.Items.Add("X", new Doufu.JSON.Number(kv.Value.X));
                jCube.Items.Add("Y", new Doufu.JSON.Number(kv.Value.Y));
                jCube.Items.Add("Z", new Doufu.JSON.Number(kv.Value.Z));

                jMovement.Items.Add(kv.Key, jCube);
            }

            // add message if has
            if (AppData.Instance.PublicChannel.Count > 0)
            {
                Doufu.JSON.Array chatLogs = new Doufu.JSON.Array();

                for (int i = 0; i < AppData.Instance.PublicChannel.Count; i++)
                {
                    if (AppData.Instance.PublicChannel[i].DateTime > userLastActivity)
                    {
                        Doufu.JSON.Object<Doufu.JSON.IJSONObject> chatLog = new Doufu.JSON.Object<Doufu.JSON.IJSONObject>();
                        chatLog.Items.Add(KEY_MESSAGE_USER, new Doufu.JSON.String(AppData.Instance.PublicChannel[i].Sender));
                        chatLog.Items.Add(KEY_MESSAGE_DATATIME,new Doufu.JSON.String(AppData.Instance.PublicChannel[i].DateTime.ToUniversalTime().ToString("o")));
                        chatLog.Items.Add(KEY_MESSAGE, new Doufu.JSON.String(AppData.Instance.PublicChannel[i].Message));
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

            jRoot.Items.Add(KEY_RETURN, new Doufu.JSON.Boolean(true));

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

