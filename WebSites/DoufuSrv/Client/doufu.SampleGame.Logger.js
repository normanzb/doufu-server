doufu.SampleGame.Logger = function(elParent)
{
	$c(this);
	
	var CreateLogContainer = function()
	{
		return document.createElement("div");
	}
	
	this.Info = function(msg)
	{
		var container = CreateLogContainer();
		container.innerHTML = msg;
		elParent.AppendChild(container);
		container.scrollIntoView();
	}
	
	this.Warning = function(msg)
	{
		
	}
	
	this.Error = function(msg)
	{
		
	}
	
	this.Ctor = function()
	{
		if (elParent.InstanceOf == null || !elParent.InstanceOf(doufu.Browser.Element))
		{
			throw doufu.System.Exception("elParent must be an instance of doufu.Browser.Element.");
		}
	}
	
	this.Ctor();
}