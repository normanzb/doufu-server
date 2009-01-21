doufu.SampleGame.ServiceMapper = {};
doufu.SampleGame.ServiceMapper.PATH_DOUFU_SERVICE = "../APIs.asmx/";
// TODO: share cookie between a domain and c domain
doufu.SampleGame.ServiceMapper.PATH_DOUFU_COMET = "../APIs.asmx/";
doufu.SampleGame.ServiceMapper.RequestFactory = function(rq, sMethodName, fSuccess, fFail)
{
	var sFullPath = doufu.SampleGame.ServiceMapper.PATH_DOUFU_SERVICE + sMethodName;;
	
	if (sMethodName == "Sync")
	{
		sFullPath = doufu.SampleGame.ServiceMapper.PATH_DOUFU_COMET + sMethodName;
	}
	
	rq.OnSuccess.Attach(new doufu.Event.CallBack(fSuccess, this));
	rq.OnFail.Attach(new doufu.Event.CallBack(fFail, this));
	rq.Open("POST", 
		sFullPath,
		true);
	
	
	return rq;
}
doufu.SampleGame.ServiceMapper.Authenticate = function(sUser, sPassword, fSuccess, fFail)
{
	var rq = new doufu.Http.Request();
	doufu.SampleGame.ServiceMapper.RequestFactory(rq, "Authenticate", fSuccess, fFail);
	
	rq.Send(
	{
		sUser: sUser,
		sPassword: sPassword
	});
}

doufu.SampleGame.ServiceMapper.Initialize = function(oCamera, fSuccess, fFail)
{
	var rq = new doufu.Http.Request();
	doufu.SampleGame.ServiceMapper.RequestFactory(rq, "Initialize", fSuccess, fFail);
	
	rq.Send(
	{
		iCameraX: oCamera.X,
		iCameraY: oCamera.Y,
		iCameraWidth: oCamera.Width,
		iCameraHeight: oCamera.Height
	});
}

doufu.SampleGame.ServiceMapper.MoveTo = function(oCube, fSuccess, fFail)
{
	var rq = new doufu.Http.Request();
	doufu.SampleGame.ServiceMapper.RequestFactory(rq, "MoveTo", fSuccess, fFail);
	
	rq.Send(
	{
		x: oCube.X,
		y: oCube.Y,
		z: oCube.Z
	});
}

doufu.SampleGame.ServiceMapper.Sync = function(oCube, fSuccess, fFail)
{
	var rq = new doufu.Http.Request();
	doufu.SampleGame.ServiceMapper.RequestFactory(rq, "Sync", fSuccess, fFail);
	
	rq.Send(
	{
		x: oCube.X,
		y: oCube.Y,
		z: oCube.Z
	});
}

doufu.SampleGame.ServiceMapper.SyncWithCallback = (function()
{
	var rq = new doufu.Http.JSON();
	var _fSuccess;
	
	// set 30 seconds time out
	rq.Timeout(1000 * 30);
	rq.OnSuccess.Attach(new doufu.Event.CallBack(function()
	{
		_fSuccess.apply(this, arguments);
		this.Close();
		
	}, rq));
	
	return function(oArgs, fSuccess)
	{
		if (rq.ReadyState == 0 || rq.ReadyState == 5)
		{
			_fSuccess = fSuccess;
			var bHasMsg = (typeof oArgs.Message == $Undefined ||
				oArgs.Message == null ||
				oArgs.Message.trim() == "")?false: true;
			
			var jUser = "'User':'" + oArgs.Cube.Name + "'";
			var jMovement = "'Movements':{'X':" + oArgs.Cube.X + ",'Y':" + oArgs.Cube.Y + ",'Z':" + oArgs.Cube.Z + "}";
			var jMessage = "'Message': ' " + oArgs.Message + " '"
			var jPost = "sStatusJSONString={" + jUser + "," + jMovement + (bHasMsg?"," + jMessage:"") + "}";
			
			
			//rq.OnFail.Attach(new doufu.Event.CallBack(fFail, this));
			rq.Open(doufu.SampleGame.ServiceMapper.PATH_DOUFU_SERVICE + "SyncWithCallback",
			 "sCallbackMethod");
			rq.Send(jPost);
		}
	}
})();