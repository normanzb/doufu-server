/*
	Namespace: doufu.SampleGame.UI
*/
doufu.SampleGame.UI = {};

doufu.SampleGame.UI.Base = function()
{
	$c(this);
	
	/*
		Event: OnConfirmed
	*/
	this.OnConfirmed = new doufu.Event.EventHandler(this);	
	
	/*
		Event: OnCancelled
	*/
	this.OnCancelled = new doufu.Event.EventHandler(this);
	
	this.Render = function()
	{
		
	}
	
	this.Ctor = function()
	{
		if (typeof doufu.SampleGame.UI._initialized == $Undefined)
		{
			
			doufu.SampleGame.UI._initialized = true;
		}
	}
	
	this.Ctor();
}

doufu.SampleGame.UI.Controller = function()
{
	$c(this);
	
	this.Inherit(doufu.DesignPattern.Attachable, [doufu.SampleGame.UI.Base]);
	
	this.Render = function()
	{
		for(var i = 0; i < this.InnerCollection().Length() - 1; i++)
		{
			this.InnerCollection().Items(i).OnConfirmed.Attach(new doufu.Event.CallBack((function(index)
			{
				return function()
				{
					this.InnerCollection().Items(index).Render();
				}
			})(i+1), this));
		}
		
		this.InnerCollection().Items(0).Render();
	}
}

doufu.SampleGame.UI.Welcome = function()
{
	$c(this);
	
	this.Inherit(doufu.SampleGame.UI.Base);
	
	var _base_Render = this.OverrideMethod("Render", function()
	{
		
		var self = this;
		Dialog.alert(
			"<pre>\t\tWelcome to " + doufu.SampleGame.Name + "\n" + 
			"This is a prove of concept of doufu framework " + "\n" + 
			"(Http://doufu.googlecode.com). Doufu framework is a open sourced" + "\n" + 
			"game develop framework which dedicated to building pure javascript" + "\n" + 
			"game." + "\n" + 
			"This prove of concept will containing demostration of following"  + "\n" + 
			"features:" + "\n" + 
			"\t1. Sprite moving." + "\n" +
			"\t2. Collision detection." + "\n" +
			"\t3. Event Trigger." + "\n" +
			"\t4. Sprite tracing." + "\n" +
			"\t5. Multi player." + "\n" +
			"</pre>",
			{
				className: "alphacube",
				width:600,
				height:300,
				okLabel: "OK",
				ok: function(win)
				{
					setTimeout(self.OnConfirmed.Invoke, 1000);
					return true;
				}
			}
		);
	});
}

doufu.SampleGame.UI.Login = function()
{
	$c(this);
	
	this.Inherit(doufu.SampleGame.UI.Base);
	
	var _base_Render = this.OverrideMethod("Render", function()
	{
		var self = this;
		
		Dialog.alert(
			"Username: <input id='idUsername' /><br />" + 
			"Password: <input id='idPassword' /><br />",
			{
				className: "alphacube",
				width:400,
				height:200,
				okLabel: "OK",
				ok: function(win)
				{
					var elUser = document.getElementById("idUsername");
					var elPass = document.getElementById("idPassword");
					
					var username = elUser.value.trim();
					var password = elPass.value.trim();
					
					if (username != "" &&
						password != "")
					{
						setTimeout(function()
						{
							self.OnConfirmed.Invoke({User: username, Pass: password});
						}, 100);
						return true;
					}
					
					return false;
				}
			}
		);
		
	});
}