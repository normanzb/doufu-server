/////////////////////////////////
// User Interact and Game Display Architecture of Doufu Framework
/////////////////////////////////
// Computer Screen
//		|
// Display Manager: render every display object which attached to it to the screen
// 		This manager owned a single cycle.
//		|
// PlayGround: Mapping every game object property to corresponding display object.
//
//		Since playground manager is inherited from display object,
//		It will attach itself to display manager while initializing so 
//		that it can be invoked at the first time when a render message
//		was dispatched into display manager.
//
//		Another importance is PlayGround manager also caculating the the displayed 
//		sprite offset in screen with its actual offset in game, for instance, says we
//		have a fake 3d interface at an angle of 45 degree, the player with the actual
//		world offset x = 20, y = 20 should mapped to screen offset x = 20 y = 10,
//		PlayGround manager handling that.
//
//		Playground manager share the same cycle with display manager.
// 
// Operation Retriever: Get operation events from message queue, and invoke 
//		corresponding the method of user controlled character.
// 

////////////////////
// Variables
var scrWidth = 473;
var scrHeight = 268;
var reportDelay = 1000;
var reporting = false;
var oldReportingCube = new doufu.Display.Drawing.Cube();
var syncDelay = 300;
var logger;

// chatting related
var chattingMessages = [];
var growler = new k.Growler();

var EmptyMessage = new doufu.System.Message();
var tmpMsg = new doufu.System.Message();
tmpMsg.Handle = doufu.System.Handle.Constants.BROADCAST;
tmpMsg.Message = doufu.System.MessageConstants.DISPLAY_RENDER;

// 0 - Sprite moving
// 1 - Message typing
var keyboardMode = 1;

// Game looping timeout, decide how fast this game runs.
var loopTimeout = 70;
var sUsername = "";

// main chars
var player = null;

// char array
var sprChars = {};

// specify what to stop main loop
var __Global_MainLoop_Stop = false;

var br = {};
br.Shared = {};

// test functions
// send initialize information to server
function init(user, pass)
{
	doufu.SampleGame.ServiceMapper.Authenticate(user,pass,function(sender, args){
		var tmp = doufu.Http.JSON.Parse(args.ResponseText);
			
		if (tmp.Return == true)
		{
			doufu.System.Logger.Debug("init() - Authenticated...");
			
			doufu.SampleGame.ServiceMapper.Initialize(GeneralPlayGroundManager.Camera(),
				function(sender, args){
					var tmp = doufu.Http.JSON.Parse(args.ResponseText);
					if (tmp.Return == true)
					{
						doufu.System.Logger.Debug("init() - Initialized...");
						
						initUser(user);
						
						initKeyboard();
						
						doufu.SampleGame.ServiceMapper.MoveTo(player,
							function(sender, args){
								var tmp = doufu.Http.JSON.Parse(args.ResponseText);
								if (tmp.Return == true)
								{
									doufu.System.Logger.Debug("init() - Moved...");
									doufu.System.Logger.Debug("init() - Starting looping...");
									startLoops();
								}
							},
							function(sender, args){alert(args.ResponseText)});
					}
				},
				function(sender, args){alert(args.ResponseText)});
		}
		
	}, function(sender, args){});
}

function t_getSync()
{
	doufu.SampleGame.ServiceMapper.SyncWithCallback(function(sender, args)
	{
		if (args.ResponseJSON.Return)
		{
			for(var spr in args.ResponseJSON.Movements)
			{
				doufu.System.Logger.Debug(
					args.ResponseJSON.Movements[spr].X + "\n" +
					args.ResponseJSON.Movements[spr].Y
				);
			}
		}
	});
}

/////////////////
// Initial DOMS and broswer related stuffs

// Enable background cache
doufu.Browser.Helpers.EnableBackgroundCache(true);

doufu.System.Logger.Debug("nscMain looping in.");

// Create a display manager (and its display area)
var GeneralDisplayManager = doufu.Display.Manager.Create(document.body, "__NSC_NONAME_SCREEN", scrWidth, scrHeight);

doufu.System.Logger.Debug("Display area is set");

var GeneralPlayGroundManager = new doufu.Game.PlayGround(GeneralDisplayManager);

/////////////////
// Creating LOOPS
// TODO: Abstract loop
function __nsc_MainLoop(){
	var startTime = new Date().getTime();
	
	if (doufu.System.MessageQueue.Length() > 0)
	{
		// bump out all messages
		while(doufu.System.MessageQueue.Length() > 0)
		{
			doufu.System.Logger.Verbose("__nsc_MainLoop(): Start Looper.");
			doufu.Cycling.Manager.Looper(doufu.System.MessageQueue.Shift());
			doufu.System.Logger.Verbose("__nsc_MainLoop(): Looper Ended.");
		}
	}
	else
	{
		//doufu.Cycling.Manager.Looper(EmptyMessage);
	}
	var lastTimeout = loopTimeout - new Date().getTime() + startTime;
	if (lastTimeout < 10)
	{
		lastTimeout = 10;
	}
	
	if (__Global_MainLoop_Stop == false) setTimeout(__nsc_MainLoop, lastTimeout);
}

function testLoop()
{
	var startTime = new Date().getTime();
	
	doufu.System.MessageQueue.Push(tmpMsg);
	
	var lastTimeout = loopTimeout - new Date().getTime() + startTime;
	if (lastTimeout < 10)
	{
		lastTimeout = 10;
	}
	
	setTimeout(testLoop, lastTimeout);
}
// Report position with a specified interval

function reportLoop()
{
	if (!reporting && 
		(oldReportingCube.X != player.X || oldReportingCube.Y != player.Y))
	{
		reporting = true;
		oldReportingCube.DeepCopy(player);
		doufu.SampleGame.ServiceMapper.MoveTo(player, function(sender, args)
		{
			if (doufu.Http.JSON.Parse(args.ResponseText).Return != true)
			{
				growler.error("Server side error occured!");
				return;
			}
			
			reporting = false;
		}, function()
		{
			growler.error("Failed to connect, please check your network connection!");
		});
	}
	
	setTimeout(reportLoop, reportDelay);
}

function syncHandler(sender, args)
{
	
	if (args.ResponseJSON.Return != true)
	{
		growler.error("Server side error occured!");
		return;
	}
	
	// handle spr
	for (var spr in args.ResponseJSON.Movements)
	{
		var sprTmp;
		
		if (sUsername == spr)
		{
			continue;
		}
		
		var cbTmp = new doufu.Display.Drawing.Cube();
		cbTmp.X = args.ResponseJSON.Movements[spr].X;
		cbTmp.Y = args.ResponseJSON.Movements[spr].Y;
		cbTmp.Z = args.ResponseJSON.Movements[spr].Z;

		// TODO: refactor sprChars, use the events on playground class.
		// add a new doufu.Sample.SpriteReferenceHolder class.
		if (typeof sprChars[spr] == $Undefined)
		{
			
			sprTmp = new doufu.SampleGame.Roles.Naked();
			// disable collision
			sprTmp.EnableCollision = false;
			sprTmp.Name = spr;
			GeneralPlayGroundManager.InsertObject(sprTmp);
			sprChars[spr] = sprTmp;
			
			sprTmp.DeepCopy(cbTmp);
		}
		else
		{
			sprTmp = sprChars[spr];
			
			sprTmp.StartMovingToDest(cbTmp ,sprTmp.WalkSpeed);
		}

	}
	
	// handle message
	if (typeof args.ResponseJSON.ChatLogs != $Undefined &&
		args.ResponseJSON.ChatLogs != null)
	{
		var tmpLogs = args.ResponseJSON.ChatLogs;
		
		for(var i = 0; i < tmpLogs.length; i ++)
		{
			if (tmpLogs[i].Message.trim() != String.empty && sprChars[tmpLogs[i].User] != null)
			{
				var player = sprChars[tmpLogs[i].User];
				var msg = tmpLogs[i].Message;
				logger.Info(player.Name + ": " + msg);
				player.Say(msg);
			}
		}
		
	}
	
}
function syncLoop()
{
	var sMessage = chattingMessages.length > 0?chattingMessages[0].replace(/[\&|#]*/ig, "").replace(/'/ig,"\\'"):"";
	//oPreviousPosi.DeepCopy(player);
	var bResult = doufu.SampleGame.ServiceMapper.SyncWithCallback({
		Cube: player, 
		Message: sMessage
	}, syncHandler);
	
	if (bResult == true)
	{
		chattingMessages.shift();
	}
	
	setTimeout(syncLoop, syncDelay);
}

// Start all loops to start the game.
function startLoops()
{
	// main loop
	__nsc_MainLoop();
	// message loop
	testLoop();
	
	//reportLoop();
	syncLoop();
}

function initUser(name)
{
	
	if (name.toLowerCase() == "debug")
	{
		player = new doufu.SampleGame.Roles.Dot();
	}
	else
	{
		player = new doufu.SampleGame.Roles.Naked();
	}
	
	player.Name = name;
	
	sprChars[name] = player;
	
	player.Z = 0;
	player.LocationX(320);
	player.LocationY(470);
	
	GeneralPlayGroundManager.Camera().Trace(player);
	GeneralPlayGroundManager.InsertObject(player);
}

////////////////////
// Initial map


// TODO: Z index should be generated by something caculator, 
//			Maybe...we need to integrate it into playground? because playground is the interface between
//			Game object and display object. and ... in the pesudo 3d gaming.... the greater x is , the 
//			deeper z is, the z index is denpenden on x index, we can separate the z-index into 3 part:
//				1) Something not display (covered by playground). 0 - 2000
//				2) playground range. 2001 - 4000
//				3) object which standing on ground range. 4001 ~ 8000
//				4) object which flying on the sky range. 8001 ~ 12000

// In the meaning time, the Charas.Move just caculate the x and y because we conside them was standing on
// the ground which is a 2 dimension map, if the character want to fly, just set its z index to the flying
// on the sky range. the movement caculator just ignore the z index.


mapJungle = new doufu.SampleGame.Maps.Training(GeneralPlayGroundManager);
mapJungle.Initialize();

GeneralPlayGroundManager.Camera().SmoothTracing = true;
GeneralPlayGroundManager.Camera().SkipFrame = 0;

//player.StartMoving(new doufu.Game.Direction(16), 49)
//====================

/////////////
// Initialize UI

uiUserPanel = new doufu.SampleGame.UI.UserPanel();
uiUserPanel.OnConfirmed.Attach(new doufu.Event.CallBack(function(sender, args)
{
	if (args.Logger == null)
	{
		throw doufu.System.Exception("Logger cannot be null");
	}
	
	logger = args.Logger;
}, this));
uiLogin = new doufu.SampleGame.UI.Login();
uiLogin.OnConfirmed.Attach(new doufu.Event.CallBack(function(sender, args)
{
	// set current user name
	sUsername = args.User;

	// initialize this user
	init(args.User, args.Pass);
}, this));

uiController = new doufu.SampleGame.UI.Controller();
uiController.Attach(uiUserPanel);
uiController.Attach(new doufu.SampleGame.UI.Welcome());
uiController.Attach(uiLogin);

///////////////
// Initialize keyboard 

function initKeyboard()
{
	keyboardMode = 0;
	var keyLeft = new doufu.Keyboard.Key("a");
	var keyRight = new doufu.Keyboard.Key("d");
	var keyUp = new doufu.Keyboard.Key("w");
	var keyDown = new doufu.Keyboard.Key("s");

	// mapping keys
	var keyUpCallback = new doufu.Event.CallBack(function(sender, args)
	{
		if (!keyDown.IsKeyDown &&
			!keyUp.IsKeyDown &&
			!keyLeft.IsKeyDown &&
			!keyRight.IsKeyDown &&
			 keyboardMode == 0)
		{
			player.StopMoving();
		}
	},this);

	keyLeft.OnKeyDown.Attach(new doufu.Event.CallBack(function(sender, args)
	{
		if (args.StatusChanged && keyboardMode == 0)
		{
			player.WalkWest();
		}
	},keyLeft));
	keyLeft.OnKeyUp.Attach(keyUpCallback);

	keyRight.OnKeyDown.Attach(new doufu.Event.CallBack(function(sender, args)
	{
		if (args.StatusChanged && keyboardMode == 0)
		{
			player.WalkEast();
		}
	},keyRight));
	keyRight.OnKeyUp.Attach(keyUpCallback);

	keyUp.OnKeyDown.Attach(new doufu.Event.CallBack(function(sender, args)
	{
		if (args.StatusChanged && keyboardMode == 0)
		{
			player.WalkNorth();
		}
	},keyUp));
	keyUp.OnKeyUp.Attach(keyUpCallback);

	keyDown.OnKeyDown.Attach(new doufu.Event.CallBack(function(sender, args)
	{
		if (args.StatusChanged && keyboardMode == 0)
		{
			player.WalkSouth();
		}
	},keyDown));
	keyDown.OnKeyUp.Attach(keyUpCallback);
}


// Release when exit
function GlobalDispose()
{
	keyLeft.Dispose();
	keyRight.Dispose();
	keyUp.Dispose();
	keyDown.Dispose();

	uiController.Dispose();
}

//////////////////////
// Entry point
// render the ui
var elmtGlobal = new doufu.Browser.Element(window);

elmtGlobal.OnLoad.Attach(new doufu.Event.CallBack(function(sender, args)
{
	uiController.Render();
}));