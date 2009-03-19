/*
 * JSMin
 * Javascript Compressor
 * http://www.crockford.com/
 * http://www.smallsharptools.com/
*/

var doufu=new Object();doufu.OOP=new Object();doufu.OOP._callBacker=function(_m,_c){var method=_m;var context=_c;return function(){return method.apply(context,arguments);}}
doufu.OOP.Class=function(oContext)
{if(typeof oContext.__nsc__OOP_IsClass==typeof undefined)
{oContext.__nsc__OOP_IsClass=true;doufu.OOP.Inherit(oContext,doufu.OOP._baseClassFunctions,[oContext]);}}
doufu.OOP.Inherit=function(obj,baseClass,args)
{var oCurr=obj;while(oCurr.__nsc_OOP_Inherit_Stack!=null)
{if(oCurr.__nsc_OOP_Inherit_Stack.Ref==baseClass)
{return;}
oCurr=oCurr.__nsc_OOP_Inherit_Stack;}
obj.OverrideMethod=function(methodName,fn){var retMethod=this[methodName];this[methodName]=fn;return doufu.OOP._callBacker(retMethod,this);}
var oTemp=new doufu.OOP._inheritance();if(obj.__nsc_OOP_Inherit_Stack!=null)
{oTemp.__nsc_OOP_Inherit_Stack=obj.__nsc_OOP_Inherit_Stack;}
obj.__nsc_OOP_Inherit_Stack=oTemp;obj.__nsc_OOP_Inherit_Stack.Ref=baseClass;if(args!=null)
{baseClass.apply(obj,args);}
else
baseClass.apply(obj);}
doufu.OOP.OverloadMethod=function(object,name,fn){var old=object[name];object[name]=function(){if(fn.length==arguments.length)
return fn.apply(this,arguments);else if(typeof old=='function')
return old.apply(this,arguments);};}
doufu.OOP._propertyRedirector=function(){return function(){return this.call();}}
doufu.OOP.Property=function(sPropertyName,oContext){if(oContext==null)
{if(typeof sPropertyName=="function")
{sPropertyName.toString=doufu.OOP._propertyRedirector();sPropertyName.valueOf=doufu.OOP._propertyRedirector();}
else
{throw doufu.System.Exception("if the oContext is not specified, the sPorpertyName must be a function pointer.");}}
else
{oContext[sPropertyName]=function(value)
{if(value!=null)
{return oContext[sPropertyName].Set.call(oContext,value);}
return oContext[sPropertyName].Get.call(oContext);}
oContext[sPropertyName].Get=function()
{return value;};oContext[sPropertyName].Set=function(value)
{};oContext[sPropertyName].toString=doufu.OOP._propertyRedirector();oContext[sPropertyName].valueOf=doufu.OOP._propertyRedirector();}}
doufu.OOP.InstanceOf=function(rInstance,type)
{if(rInstance instanceof type)
{return true;}
if(rInstance.constructor==type)
{return true;}
var currentInstance;currentInstance=rInstance;while(currentInstance.__nsc_OOP_Inherit_Stack!=null)
{if(currentInstance.__nsc_OOP_Inherit_Stack.Ref==type)
{return true;}
currentInstance=currentInstance.__nsc_OOP_Inherit_Stack;}
var bRet=false;var previousType;var currentType;var StackUp=function(rInstance)
{return rInstance.constructor.prototype;}
currentInstance=rInstance;currentType=currentInstance.constructor;while(previousType!=currentType)
{previousType=currentType;currentInstance=StackUp(currentInstance);currentType=currentInstance.constructor;if(currentType==type)
{bRet=true;break;}}
return bRet;}
doufu.OOP.Implement=function(oContext,oBaseInterface)
{new oBaseInterface();if(typeof oBaseInterface.__nsc_OOP_DeclareArray==typeof undefined)
{throw new Error("doufu.OOP.Implement: "+oBaseInterface+"is not a interface!");}
var IsDeclared=function(func,sPublicMethodName)
{var bFound=false;var rePublicMethod=/\s*this\s*\.\s*([A-Za-z0-9_\$]*)\s*=\s*(?:new)?(?:f|F)unction/g;var execResult=rePublicMethod.exec(Function.prototype.toString.call(func))
if(execResult!=null&&execResult.length>1&&execResult[1].trim()==sPublicMethodName)
{bFound=true;}
return bFound;}
var bFound=false;for(var i=0;i<oBaseInterface.__nsc_OOP_DeclareArray.length;i++)
{if(!IsDeclared(oContext.constructor,oBaseInterface.__nsc_OOP_DeclareArray[i]))
{var currentInstance;currentInstance=oContext;while(currentInstance.__nsc_OOP_Inherit_Stack!=null)
{if(IsDeclared(currentInstance.__nsc_OOP_Inherit_Stack.Ref,oBaseInterface.__nsc_OOP_DeclareArray[i]))
{bFound=true;break;}
currentInstance=currentInstance.__nsc_OOP_Inherit_Stack;}}
else
{bFound=true;};if(bFound)
{break;}
throw new Error("doufu.OOP.Implement: Method "+oBaseInterface.__nsc_OOP_DeclareArray[i]+" must be implemented!");}
if(typeof oContext.__nsc_OOP_BaseInterface==typeof undefined)
{oContext.__nsc_OOP_BaseInterface=new Array();}
oContext.__nsc_OOP_BaseInterface.push(oBaseInterface);}
doufu.OOP.IsImplemented=function(oContext,oBaseInterface)
{for(var i=0;i<oContext.__nsc_OOP_BaseInterface.length;i++)
{if(oContext.__nsc_OOP_BaseInterface[i]==oBaseInterface)
{return true;}}
return false;}
doufu.OOP.Declare=function(sMethodName,oContext)
{if(typeof oContext.constructor.__nsc_OOP_DeclareArray==typeof undefined)
{oContext.constructor.__nsc_OOP_DeclareArray=new Array();}
var bFound=false;for(var i=0;i<oContext.constructor.__nsc_OOP_DeclareArray.length;i++)
{if(oContext.constructor.__nsc_OOP_DeclareArray[i]==sMethodName)
{bFound=true;}}
if(!bFound)
{oContext.constructor.__nsc_OOP_DeclareArray.push(sMethodName);}}
doufu.OOP.Interface=function(oContext)
{doufu.OOP.Inherit(oContext,doufu.OOP._baseInterfaceFunctions,[oContext]);}
doufu.OOP._baseClassFunctions=function(__nsc_OOP_baseClassFunc_oContext)
{this.NewProperty=function(sPropertyName)
{return doufu.OOP.Property(sPropertyName,__nsc_OOP_baseClassFunc_oContext);}
this.Inherit=function(baseClass,args)
{return doufu.OOP.Inherit(__nsc_OOP_baseClassFunc_oContext,baseClass,args);}
this.InstanceOf=function(type)
{return doufu.OOP.InstanceOf(__nsc_OOP_baseClassFunc_oContext,type);}
this.OverloadMethod=function(sMethodName,pFunc)
{return doufu.OOP.OverloadMethod(__nsc_OOP_baseClassFunc_oContext,sMethodName,pFunc)}
this.Implement=function(baseInterface)
{return doufu.OOP.Implement(__nsc_OOP_baseClassFunc_oContext,baseInterface)}
this.IsImplemented=function(baseInterface)
{return doufu.OOP.IsImplemented(__nsc_OOP_baseClassFunc_oContext,baseInterface);}}
doufu.OOP._baseInterfaceFunctions=function(__nsc_OOP_baseInterfaceFunc_oContext)
{this.Declare=function(sMethodName)
{return doufu.OOP.Declare(sMethodName,__nsc_OOP_baseInterfaceFunc_oContext);}}
doufu.OOP._inheritance=function()
{this.Ref=null;this.__nsc_OOP_Inherit_Stack=null;}
$c=doufu.OOP.Class;$i=doufu.OOP.Interface;doufu.System=new Object();doufu.System.Hacks={};doufu.System.Hacks.__isType=function(testObject,typeName)
{return Object.prototype.toString.call(testObject).toLowerCase()==='[object '+typeName.toLowerCase()+']';}
doufu.System.Hacks.Array=new function()
{[].indexOf||(Array.prototype.indexOf=function(v){for(var i=this.length;i--&&this[i]!==v;);return i;});Array.isArray||(Array.isArray=function(testObject){return doufu.System.Hacks.__isType(testObject,"Array");});}
doufu.System.Hacks.Date=new function()
{Date.prototype.addDay||(Date.prototype.addDay=function(iNum)
{this.setTime(this.getTime()+1000*60*60*24*iNum);});Date.prototype.addHour||(Date.prototype.addHour=function(iNum)
{this.setTime(this.getTime()+1000*60*60*iNum);});Date.prototype.addMinute||(Date.prototype.addMinute=function(iNum)
{this.setTime(this.getTime()+1000*60*iNum);});Date.prototype.addSecond||(Date.prototype.addSecond=function(iNum)
{this.setTime(this.getTime()+1000*iNum);});}
doufu.System.Hacks.String=new function()
{String.prototype.trim||(String.prototype.trim=function()
{return this.replace(/(^\s*)|(\s*$)/g,"");});String.format||(String.format=function(text)
{if(arguments.length<=1)
{return text;}
var tokenCount=arguments.length-2;for(var token=0;token<=tokenCount;token++)
{text=text.replace(new RegExp("\\{"+token+"\\}","gi"),arguments[token+1]);}
return text;});String.isString||(String.isString=function(testObject){return doufu.System.Hacks.__isType(testObject,"String");});String.empty||(String.empty="");}
doufu.System.Hacks.Function=new function()
{Function.empty||(Function.empty=function(){});}
doufu.System.Hacks.Error=new function()
{Error.prototype.stackTrace||(Error.prototype.getStackTrace=function()
{var callstack=[];var isCallstackPopulated=false;if(this.stack){var lines=this.stack.split("\n");for(var i=0,len=lines.length;i<len;i++)
{if(lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/))
{callstack.push(lines[i]);}}
callstack.shift();isCallstackPopulated=true;}
else if(window.opera&&this.message)
{var lines=this.message.split("\n");for(var i=0,len=lines.length;i<len;i++)
{if(lines[i].match(/^\s*[A-Za-z0-9\-_\$]+\(/))
{var entry=lines[i];if(lines[i+1])
{entry+=" at "+lines[i+1];i++;}
callstack.push(entry);}}
callstack.shift();isCallstackPopulated=true;}
if(!isCallstackPopulated){var currentFunction=arguments.callee.caller;while(currentFunction){var fn=currentFunction.toString();var fname=fn.substring(fn.indexOf("function")+8,fn.indexOf("("))||"anonymous";callstack.push(fname);currentFunction=currentFunction.caller;}}
return callstack.join("\n\n");});}
doufu.System.Constants=new Object();doufu.System.Constants.TYPE_UNDEFINED=typeof undefined;$Undefined=doufu.System.Constants.TYPE_UNDEFINED;doufu.System.Logger={};doufu.System.Logger.Adapters={};doufu.System.Logger.Adapters.Adaptable=function()
{doufu.OOP.Class(this);this.NewProperty("IsAvailable");this.IsAvailable.Get=function()
{return typeof Logger==doufu.System.Constants.TYPE_UNDEFINED?false:true;};this.Debug=function(sMessage)
{Logger.info(sMessage);}
this.Error=function(sMessage,oError)
{Logger.error(sMessage,oError);}
this.Verbose=function(sMessage)
{Logger.debug(sMessage);}}
doufu.System.Logger.Adapters.Doufu=function()
{doufu.OOP.Class(this);this.Inherit(doufu.System.Logger.Adapters.Adaptable);}
doufu.System.Logger.Adapters.IE8Console=function()
{doufu.OOP.Class(this);this.Inherit(doufu.System.Logger.Adapters.Adaptable);this.IsAvailable.Get=function()
{return typeof console==doufu.System.Constants.TYPE_UNDEFINED?false:true;}
this.NewProperty("ConsoleInstance");this.ConsoleInstance.Get=function()
{if(this.IsAvailable())
{return console;}
else
return null;}
this.OverrideMethod("Debug",function(sMessage)
{this.ConsoleInstance().info(sMessage);});this.OverrideMethod("Error",function(sMessage,oError)
{this.ConsoleInstance().error(sMessage,oError);});this.OverrideMethod("Verbose",function(sMessage)
{this.ConsoleInstance().log(sMessage);});}
doufu.System.Logger=new function()
{doufu.OOP.Class(this);var doufuLogger=new doufu.System.Logger.Adapters.Doufu();var ie8Logger=new doufu.System.Logger.Adapters.IE8Console();var selectedLogger=doufuLogger;__DOUFU_DEBUG=doufuLogger.IsAvailable();if(__DOUFU_DEBUG&&ie8Logger.IsAvailable())
{selectedLogger=ie8Logger;}
this.NewProperty("IsDebug");this.IsDebug.Get=function()
{return __DOUFU_DEBUG;}
this.Debug=function(sMessage)
{if(__DOUFU_DEBUG)
{selectedLogger.Debug(sMessage);}}
this.Error=function(sMessage,oError)
{if(__DOUFU_DEBUG)
{selectedLogger.Error(sMessage,oError);}}
this.Verbose=function(sMessage)
{if(CONFIG_LOGGING_VERBOSE&&__DOUFU_DEBUG)
{selectedLogger.Verbose(sMessage);}}}
doufu.System.Handle=function(iHandleID)
{if(typeof iHandleID==doufu.System.Constants.TYPE_UNDEFINED||iHandleID==null)
{throw doufu.System.Exception("Inputted parameter incorrect.");}
this.ID=iHandleID;}
doufu.System.Handle.Generate=function()
{var TempID
if(true)
{doufu.System.Handle._syncLock=1;doufu.System.Logger.Debug("doufu.System.Handle.Generate: Creating Handle, current LastHandlerID is "+(doufu.System.Handle.LastHandlerID==0?doufu.System.Handle.START_ID:doufu.System.Handle.LastHandlerID));TempID=(doufu.System.Handle.LastHandlerID==0?doufu.System.Handle.Constants.START_ID:doufu.System.Handle.LastHandlerID)+1;doufu.System.Handle.LastHandlerID=TempID;doufu.System.Handle._syncLock==0;}
else
{doufu.Cycling.Block(1);return doufu.System.Handle.Generate();}
return new doufu.System.Handle(TempID);}
doufu.System.Handle.IsMe=function(oHandleOwner,oHandle)
{if(typeof oHandleOwner.InstanceOf==doufu.System.Constants.TYPE_UNDEFINED||!oHandleOwner.InstanceOf(doufu.System.Handle.Handlable))
{throw doufu.System.Exception("oHandleOwner type incorrect!");}
if(oHandle==doufu.System.Handle.Constants.BROADCAST)
{return true;}
if(oHandle==oHandleOwner.Handle)
{return true;}
return false;}
doufu.System.Handle.LastHandlerID=0;doufu.System.Handle._syncLock=0;doufu.System.Handle.Constants=new Object();doufu.System.Handle.Constants.START_ID=0x8000;doufu.System.Handle.Constants.BROADCAST=0x0001;doufu.System.Handle.Handlable=function()
{doufu.OOP.Class(this);this.Handle=0;}
doufu.System.Message=function(oHandle,sMsg,wParam,lParam)
{if(oHandle==null)
this.Handle=new doufu.System.Handle(0);else
this.Handle=oHandle;if(sMsg==null)
this.Message=new Number();else
this.Message=sMsg;if(wParam==null)
this.wParam=new Number();else
this.wParam=wParam;if(lParam==null)
this.lParam=new Number();else
this.lParam=lParam;}
doufu.System.MessageQueue=function()
{return doufu.System.MessageQueue._internalQueue;}
doufu.OOP.Property(doufu.System.MessageQueue);doufu.System.MessageQueue._internalQueue=new Array();doufu.System.MessageQueue.Push=function(oHandleOrMessage,sMsg,wParam,lParam)
{var tmpMsg;if(!(oHandleOrMessage instanceof doufu.System.Message))
{tmpMsg=doufu.System.Message(oHandleOrMessage,sMsg,wParam,lParam);}
else
{tmpMsg=oHandleOrMessage;}
return doufu.System.MessageQueue._internalQueue.push(tmpMsg);}
doufu.System.MessageQueue.Shift=function()
{return doufu.System.MessageQueue._internalQueue.shift();}
doufu.System.MessageQueue.Length=function()
{return doufu.System.MessageQueue._internalQueue.length;}
doufu.System.MessageProcessor=function()
{this.BeforeProcess=function(oMsg)
{if(!(oMsg instanceof doufu.System.Message))
throw doufu.System.Exception("The message dispatched is not derived from doufu.System.Message");this.Process.Reference.call(this.Process.Context,oMsg);}
this.Process=new doufu.Event.CallBack();}
doufu.System.MessageConstants=new Object();doufu.System.MessageConstants.DISPLAY_RENDER=0x8;doufu.System.MessageConstants.IsMessage=function(oMsg,oConst)
{return(oMsg.Message&oConst)==oConst;}
doufu.System.Exception=function(sMessage)
{var sErrMsg=arguments.caller+":"+sMessage;var err=new Error(sErrMsg);if(!err.message)
{err.message=sErrMsg;}
err.name="System Exception";doufu.System.Logger.Error(sErrMsg,err);return err;}
doufu.System.APIs=new Object();doufu.System.APIs.FunctionHooker=function(sFuncName,fnCap,objFuncOwner)
{if(objFuncOwner==null)
{objFuncOwner=window;}
if(objFuncOwner.__nsc_FunctionHooker_Stack==null)
{objFuncOwner.__nsc_FunctionHooker_Stack=new doufu.CustomTypes.Stack();objFuncOwner.__nsc_FunctionHooker_Stack.Push(objFuncOwner[sFuncName]);var temptest=objFuncOwner[sFuncName];objFuncOwner[sFuncName]=function()
{return objFuncOwner.__nsc_FunctionHooker_Stack.Top().RefObject(objFuncOwner,arguments,1);}}
objFuncOwner.__nsc_FunctionHooker_Stack.Push(function(objFuncOwner,newArguments,i)
{fnCap.apply(objFuncOwner,newArguments);if(i<(objFuncOwner.__nsc_FunctionHooker_Stack.Length()-1)&&this.LinkedStackElement.LinkedStackElement!=null)
{return this.LinkedStackElement.RefObject(objFuncOwner,newArguments,i+1);}
else
{if(typeof(this.LinkedStackElement.RefObject.apply)!="unknown"&&this.LinkedStackElement.RefObject.apply!=null)
{return this.LinkedStackElement.RefObject.apply(objFuncOwner,newArguments);}
else
{var sParameters="";for(var i=0;i<newArguments.length;i++)
{sParameters=sParameters+"newArguments["+i.toString()+"]";if((i+1)<newArguments.length)
{sParameters=sParameters+", ";}}
return eval("this.LinkedStackElement.RefObject("+sParameters+")");}}});}
doufu.System.APIs.GetIsNullMacro=function(sObjName)
{return"(function(){if (typeof "+sObjName+" == doufu.System.Constants.TYPE_UNDEFINED || "+sObjName+" == null){return true;}})();";}
doufu.System.APIs.Clone=function(obj,level){var seenObjects=[];var mappingArray=[];var f=function(simpleObject,currentLevel){if(simpleObject==null)
{return null;}
var indexOf=seenObjects.indexOf(simpleObject);if(indexOf==-1){if((typeof simpleObject).toLowerCase()=="object"&&!Array.isArray(simpleObject)){seenObjects.push(simpleObject);var newObject={};mappingArray.push(newObject);for(var p in simpleObject)
{if(p!=null)
{if(currentLevel>0)
{newObject[p]=f(simpleObject[p],currentLevel-1);}
else
{newObject[p]=simpleObject[p];}}}
newObject.constructor=simpleObject.constructor;return newObject;}
else if(Array.isArray(simpleObject))
{seenObjects.push(simpleObject);var newArray=[];mappingArray.push(newArray);for(var i=0,len=simpleObject.length;i<len;i++)
newArray.push(f(simpleObject[i]));return newArray;}
else
{return simpleObject;}}else{return mappingArray[indexOf];}};return f(obj,level==null?0:level);}
doufu.System.APIs.NumberOfType=function(type)
{var iRetCount=0;for(var i=1;i<arguments.length;i++)
{if(arguments[i].InstanceOf(type))
{iRetCount++;}}
return iRetCount;}
doufu.System.Convert=new Object();doufu.System.Convert.ToString=function(obj)
{var sRet=new String("");if(obj.toString)
{sRet=obj.toString();}
else
{sRet=obj+"";}
return sRet;}
doufu.System.Convert.ToInt=function(obj)
{var iRet=new String("");if(obj.valueOf)
{iRet=obj.valueOf();}
else
{iRet=obj*1}
return iRet;}
doufu.Helpers={};doufu.Helpers.Path=function(sPath)
{doufu.OOP.Class(this);var _fileName;this.NewProperty("FileName");this.FileName.Get=function()
{return _fileName;}
var _extension;this.NewProperty("Extension");this.Extension.Get=function()
{return _extension;}
this.NewProperty("FullName");this.FullName.Get=function()
{return this.FileName()+"."+this.Extension();}
var _path;this.NewProperty("Path");this.Path.Get=function()
{return _path;}
this.Ctor=function()
{_path=sPath;_path=_path.replace(/\//g,"\\");var splitterIndex=_path.lastIndexOf(".");var pathSplitterIndex=_path.lastIndexOf("\\");_extension=_path.substr(splitterIndex+1,_path.length-splitterIndex-1);_fileName=_path.substr(pathSplitterIndex+1,splitterIndex-pathSplitterIndex-1);};this.Ctor();}
doufu.DesignPattern={};doufu.DesignPattern.Attachable=function(type)
{doufu.OOP.Class(this);var _collection=new doufu.CustomTypes.Collection(type);this.NewProperty("InnerCollection");this.InnerCollection.Get=function()
{return _collection;}
this.Ctor=function()
{if(typeof type==doufu.System.Constants.TYPE_UNDEFINED)
{doufu.System.ThrowException("type parameter should not be null");}}
this.Attach=function(obj)
{_collection.Add(obj);}
this.Detach=function(obj)
{_collection.Remove(obj);}
this.Ctor();}
doufu.CustomTypes=new Object();doufu.CustomTypes.Collection=function(baseClass)
{doufu.OOP.Class(this);var _innerArray=new Array();this.NewProperty("InnerArray");this.InnerArray.Get=function()
{return _innerArray;}
this.InnerArray.Set=function(value)
{_innerArray=value}
this.NewProperty("Length");this.Length.Get=function()
{return _innerArray.length;}
this.Length.Set=function(value)
{return;}
this.Add=function(obj)
{if(typeof obj.InstanceOf==doufu.System.Constants.TYPE_UNDEFINED||!obj.InstanceOf(baseClass))
{throw doufu.System.Exception("doufu.CustomTypes.Collection::Add(): Specified object type is not allowed.");}
_innerArray.push(obj);return this.Length();}
this.AddArray=function(obj)
{if(typeof obj.length==doufu.System.Constants.TYPE_UNDEFINED||obj.length<=0)
{throw doufu.System.Exception("doufu.CustomTypes.Collection::AddArray(): Specified object is not an array or the array length is 0.");}
for(var i=0;i<obj.length;i++)
{if(typeof obj[i].InstanceOf==doufu.System.Constants.TYPE_UNDEFINED||!obj[i].InstanceOf(baseClass))
{throw doufu.System.Exception("doufu.CustomTypes.Collection::AddArray(): Specified object type is not allowed.");}
_innerArray.push(obj[i]);}
return this.Length();}
this.Remove=function(obj)
{for(var i=0;i<this.Length;i++)
{if(_innerArray[i]==obj)
{break;}}
_innerArray.splice(i,1);return this.Length();}
this.Clear=function()
{this.InnerArray().length=0;}
this.Items=function(index)
{return _innerArray[index];}
this.Contain=function(obj)
{for(var i=0;i<this.Length();i++)
{if(obj===this.Items(i))
{return true;}}
return false;}}
doufu.CustomTypes.Stack=function()
{doufu.OOP.Class(this);var _top;this.NewProperty("Top");this.Top.Get=function()
{return _top;}
var _length=0;this.NewProperty("Length");this.Length.Get=function()
{return _length;}
this.Length.Set=function(value)
{_length=value;}
this.Push=function(obj)
{var tmp=new doufu.CustomTypes.StackElement();tmp.RefObject=obj;tmp.LinkedStackElement=_top;_length++;return _top=tmp;}
this.Pop=function()
{if(_top!=null)
{var tmp=_top;_top=_top.LinkedStackElement;_length--;return tmp.RefObject;}
return null;}}
doufu.CustomTypes.StackElement=function()
{doufu.OOP.Class(this);this.RefObject=null;this.LinkedStackElement=null;}
doufu.Event=new Object();doufu.Event.EventHandler=function(oContext)
{doufu.OOP.Class(this);var oSender=oContext;var pCallBacks=new doufu.CustomTypes.Collection(doufu.Event.CallBack);this.Invoke=function(oEvent,oSenderOverride)
{var tempSender;var lastResult;if(oSenderOverride!=null)
{tempSender=oSenderOverride;}
else
{tempSender=oSender;}
for(var i=0;i<pCallBacks.Length;i++)
{lastResult=pCallBacks.InnerArray()[i].Reference.call(pCallBacks.InnerArray()[i].Context,tempSender,oEvent);}
return lastResult;}
this.Attach=function(pCallback)
{if(!pCallback.InstanceOf(doufu.Event.CallBack))
{throw doufu.System.Exception("pCallback was not derived from doufu.Event.CallBack");}
doufu.System.Logger.Debug("doufu.Event.EventHandler: Add call back "+pCallback);pCallBacks.Add(pCallback);}
this.Detach=function(pCallback)
{pCallBacks.Remove(pCallback);}}
doufu.Event.CallBack=function(pReference,pContext)
{doufu.OOP.Class(this);this.Reference=pReference;if(pContext==null)
{this.Context=doufu.Event.CallBack.caller;}
else
{this.Context=pContext;}}
doufu.Browser=new Object();doufu.Browser.BrowserDetect=new function __nsc_Browser_BrowserDetect()
{this.OSEnum={Windows:"Windows",Mac:"Mac",Linux:"Linux",Unknown:"Unknown"};this.BrowserEnum={OmniWeb:"OmniWeb",Safari:"Safari",Opera:"Opera",iCab:"iCab",Konqueror:"Konqueror",Firefox:"Firefox",Camino:"Camino",Netscape:"Netscape",Explorer:"Explorer",Mozilla:"Mozilla",Netscape:"Netscape",Unknown:"Unknown"};this.dataOS=[{string:navigator.platform,subString:"Win",identity:this.OSEnum.Windows},{string:navigator.platform,subString:"Mac",identity:this.OSEnum.Mac},{string:navigator.platform,subString:"Linux",identity:this.OSEnum.Linux}];this.dataBrowser=[{string:navigator.userAgent,subString:"OmniWeb",versionSearch:"OmniWeb/",identity:this.BrowserEnum.OmniWeb},{string:navigator.vendor,subString:"Apple",identity:this.BrowserEnum.Safari},{prop:window.opera,identity:this.BrowserEnum.Opera},{string:navigator.vendor,subString:"iCab",identity:this.BrowserEnum.iCab},{string:navigator.vendor,subString:"KDE",identity:this.BrowserEnum.Konqueror},{string:navigator.userAgent,subString:"Firefox",identity:this.BrowserEnum.Firefox},{string:navigator.vendor,subString:"Camino",identity:this.BrowserEnum.Camino},{string:navigator.userAgent,subString:"Netscape",identity:this.BrowserEnum.Netscape},{string:navigator.userAgent,subString:"MSIE",identity:this.BrowserEnum.Explorer,versionSearch:"MSIE"},{string:navigator.userAgent,subString:"Gecko",identity:this.BrowserEnum.Mozilla,versionSearch:"rv"},{string:navigator.userAgent,subString:"Mozilla",identity:this.BrowserEnum.Netscape,versionSearch:"Mozilla"}];this.searchString=function(data){for(var i=0;i<data.length;i++){var dataString=data[i].string;var dataProp=data[i].prop;this.versionSearchString=data[i].versionSearch||data[i].identity;if(dataString){if(dataString.indexOf(data[i].subString)!=-1)
return data[i].identity;}
else if(dataProp)
return data[i].identity;}}
this.searchVersion=function(dataString){var index=dataString.indexOf(this.versionSearchString);if(index==-1)return;return parseFloat(dataString.substring(index+this.versionSearchString.length+1));}
this.Ctor=function()
{this.Browser=this.searchString(this.dataBrowser)||this.BrowserEnum.Unknown;this.Version=this.searchVersion(navigator.userAgent)||this.searchVersion(navigator.appVersion)||"Unknown";this.OS=this.searchString(this.dataOS)||this.OSEnum.Unknown;}
this.Ctor();}
doufu.Browser.Helpers=new Object();doufu.Browser.Helpers.SPACE_NAME="doufu.Browser.Helpers";doufu.Browser.Helpers.CreateOverflowHiddenDiv=function(sDivID,elmtParent,iWidth,iHeight)
{var borderWidth=1;if(sDivID==null||elmtParent==null)
{throw doufu.System.Exception("sDivID and elmtParent were required!");}
var retDiv;retDiv=doufu.Browser.DOM.CreateElement("div").Native();retDiv.setAttribute("id",sDivID);retDiv.style.overflow="hidden";retDiv.style.width=iWidth+"px";retDiv.style.height=iHeight+"px";retDiv.style.border=borderWidth+"px solid #000";elmtParent.appendChild(retDiv);if(doufu.Browser.DOM.CompatibleMode()==doufu.Browser.DOM.CompatibleMode.CSS1_COMPAT)
{retDiv.style.position="relative";}
else if(doufu.Browser.DOM.CompatibleMode()==doufu.Browser.DOM.CompatibleMode.BACK_COMPAT)
{}
else
{doufu.System.APIs.FunctionHooker("appendChild",function(obj)
{obj.style.clip="rect(0px "+
doufu.System.Convert.ToString(retDiv.clientLeft+iWidth)+"px "+
iHeight+"px "+retDiv.clientLeft+"px)";obj.style.marginTop="9px";obj.style.marginLeft="8px";},retDiv);}
return retDiv;}
doufu.Browser.Helpers.GetRelativeCoordinates=function(event,reference){var x,y;event=event||window.event;var el=event.target||event.srcElement;if(!window.opera&&typeof event.offsetX!='undefined'){var pos={x:event.offsetX,y:event.offsetY};var e=el;while(e){e.mouseX=pos.x;e.mouseY=pos.y;pos.x+=e.offsetLeft;pos.y+=e.offsetTop;e=e.offsetParent;}
var e=reference;var offset={x:0,y:0}
while(e){if(typeof e.mouseX!='undefined'){x=e.mouseX-offset.x;y=e.mouseY-offset.y;break;}
offset.x+=e.offsetLeft;offset.y+=e.offsetTop;e=e.offsetParent;}
e=el;while(e){e.mouseX=undefined;e.mouseY=undefined;e=e.offsetParent;}}
else{var pos=getAbsolutePosition(reference);x=event.pageX-pos.x;y=event.pageY-pos.y;}
return{x:x,y:y};}
doufu.Browser.Helpers.GetAbsolutePosition=function(element){var r=new doufu.Display.Drawing.Rectangle();r.X=element.offsetLeft;r.Y=element.offsetTop;if(element.offsetParent){var tmp=doufu.Browser.Helpers.GetAbsolutePosition(element.offsetParent);r.X+=tmp.X;r.Y+=tmp.Y;}
return r;}
doufu.Browser.Helpers.EnableBackgroundCache=function(bEnable)
{if(doufu.Browser.BrowserDetect.Browser==doufu.Browser.BrowserDetect.BrowserEnum.Explorer)
{try
{document.execCommand("BackgroundImageCache",false,bEnable);}
catch(ex)
{};}}
doufu.Browser.Helpers.AttachEvent=function(oElement,sEventName,pFunc)
{if(doufu.Browser.BrowserDetect.Browser==doufu.Browser.BrowserDetect.BrowserEnum.Explorer&&typeof document.attachEvent!=doufu.System.Constants.TYPE_UNDEFINED)
{oElement.attachEvent("on"+sEventName.toLowerCase(),pFunc);}
else if(typeof document.addEventListener!=doufu.System.Constants.TYPE_UNDEFINED)
{oElement.addEventListener(sEventName.toLowerCase(),pFunc,false);}
else
{doufu.System.Logger.Debug("doufu.Browser.Helpers.AttachEvent() - Neither attachEvent nor addEventListener available, use element.onEvent directly.");oElement["on"+sEventName]=pFunc;}}
doufu.Browser.Helpers.DetachEvent=function(oElement,sEventName,pFunc)
{if(doufu.Browser.BrowserDetect.Browser==doufu.Browser.BrowserDetect.BrowserEnum.Explorer&&typeof document.detachEvent!=doufu.System.Constants.TYPE_UNDEFINED)
{oElement.detachEvent("on"+sEventName.toLowerCase(),pFunc);}
else if(typeof document.removeEventListener!=doufu.System.Constants.TYPE_UNDEFINED)
{oElement.removeEventListener(sEventName.toLowerCase(),pFunc,false);}
else
{doufu.System.Logger.Debug("doufu.Browser.Helpers.AttachEvent() - Neither detachEvent nor removeEventListener available, use element.onEvent=null directly.");if(oElement["on"+sEventName]==pFunc)
{oElement["on"+sEventName]=null;}}}
doufu.Browser.Element=function(element)
{doufu.OOP.Class(this);var thisElement=this;var _native;var nativeEventArgProcessor=function(pFunc)
{return function(e)
{if(doufu.Browser.BrowserDetect.Browser==doufu.Browser.BrowserDetect.BrowserEnum.Explorer&&typeof event!=doufu.System.Constants.TYPE_UNDEFINED)
{e=event;if(e.target==null)
{e.target=event.srcElement;}}
pFunc(e);};}
this.NewProperty("Native");this.Native.Get=function()
{return _native;}
this.NewProperty("TagName");this.TagName.Get=function()
{return this.Native().tagName.toUpperCase();}
var _onkeydown;this.OnKeyDown=new doufu.Event.EventHandler(this);var _onkeyup;this.OnKeyUp=new doufu.Event.EventHandler(this);var _onfocus;this.OnFocus=new doufu.Event.EventHandler(this);var _onblur;this.OnBlur=new doufu.Event.EventHandler(this);var _onload;this.OnLoad=new doufu.Event.EventHandler(this);var _onclick;this.OnClick=new doufu.Event.EventHandler(this);var _onchange;this.OnChange=new doufu.Event.EventHandler(this);this.AppendChild=function(elmtAppend)
{var elmtActual=elmtAppend;if(typeof elmtAppend.InstanceOf!=$Undefined&&elmtAppend.InstanceOf(doufu.Browser.Element))
{elmtActual=elmtAppend.Native();}
return _native.appendChild(elmtActual);}
this.RemoveChild=function(elmtRemove)
{var elmtActual=elmtRemove;if(typeof elmtRemove.InstanceOf!=$Undefined&&elmtRemove.InstanceOf(doufu.Browser.Element))
{elmtActual=elmtRemove.Native();}
return _native.removeChild(elmtActual);}
this.SetAttribute=function(sName,sValue)
{if(sName.toLowerCase()=="class")
{return _native.className=sValue;}
else
{return _native.setAttribute(sName,sValue);}}
this.$a=this.AppendChild;this.HasChild=function(oElement)
{var elmtSet;var elNative;if(typeof oElement.InstanceOf!=null)
{elmtSet=this.Native().getElementsByTagName(oElement.TagName());elNative=oElement.Native();}
{elmtSet=this.Native().getElementsByTagName(oElement.tagName);elNative=oElement;}
for(i=0;i<elmtSet.length;i++)
{if(elmtSet[i]==elNative)
{return true;}}
return false;}
var _noWrap=false;this.NewProperty("NoWrap");this.NoWrap.Get=function()
{return _noWrap;}
this.NoWrap.Set=function(value)
{_noWrap=value;if(value==true)
{this.Native().style.whiteSpace="nowrap";}
else
{this.Native().style.whiteSpace="normal";}}
var _opacity=100;this.NewProperty("Opacity");this.Opacity.Get=function()
{return _opacity;}
this.Opacity.Set=function(value)
{if(value>100)
{value=100;}
else if(value<0)
{value=0;}
_opacity=value;this.Native().style.opacity=Math.floor(value/10)/10;this.Native().style.filter="alpha(opacity="+value+")";if(value==100)
{this.Native().style.filter="";}}
var comparePropAndStyle=function(prop,styleProp)
{var sRet=String.empty;var sProp=new String(prop).trim().replace(/ /ig,"");var sStyleProp=new String(styleProp.replace("px","")).replace(/ /ig,"");sStyleProp=sStyleProp.trim();if(sProp==sStyleProp&&sStyleProp!=String.empty)
{sRet=sProp;}
else
{sRet=styleProp;}
return sRet;}
this.NewProperty("Height");this.Height.Get=function()
{return comparePropAndStyle(this.Native().height,this.Native().style.height);}
this.Height.Set=function(value)
{this.Native().height=value;var formattedValue=new String(value).trim();if(formattedValue.charAt(formattedValue.length-1)=='%')
{this.Native().style.height=value;}
else
{this.Native().style.height=value+"px";}}
this.NewProperty("Width");this.Width.Get=function()
{return comparePropAndStyle(this.Native().width,this.Native().style.width);}
this.Width.Set=function(value)
{this.Native().width=value;var formattedValue=new String(value).trim();if(formattedValue.charAt(formattedValue.length-1)=='%')
{this.Native().style.width=value;}
else
{this.Native().style.width=value+"px";}}
this.NewProperty("Text");this.Text.Get=function()
{var sRet=null;if(this.TagName()=="INPUT")
{sRet=this.Native().value;}
else
{sRet=this.Native().innerHTML;}
return sRet;}
this.Text.Set=function(value)
{if(this.TagName()=="INPUT")
{this.Native().value=value;}
else
{this.Native().innerHTML=value;}}
this.NewProperty("BackgroundImage");this.BackgroundImage.Get=function()
{var sRet=this.Native().style.backgroundImage.replace(/^url\(\"?/i,"");sRet=sRet.replace(/\"?\)$/i,"");return sRet;}
this.BackgroundImage.Set=function(value)
{this.Native().style.backgroundImage="url("+value+")";}
this.Effects=new function()
{doufu.OOP.Class(this);var thisEffects=this;var fadingDirection=0;this.NewProperty("FadingDirection");this.FadingDirection.Get=function()
{return fadingDirection;}
this.OnFadeIn=new doufu.Event.EventHandler(this);this.OnFadeOut=new doufu.Event.EventHandler(this);var FadeLoop=function(value,diff)
{if(diff<0)
{if(fadingDirection>0)
{return;}
if(thisElement.Opacity()<=0)
{thisEffects.OnFadeOut.Invoke({});return;}}
else if(diff>0)
{if(fadingDirection<0)
{return;}
if(thisElement.Opacity()>=100)
{thisEffects.OnFadeIn.Invoke({});return;}}
thisElement.Opacity(value);value+=diff;setTimeout(doufu.OOP._callBacker(function()
{FadeLoop(value,diff)},this),100);}
this.FadeIn=function(factor)
{if(factor==null||factor<1)
{factor=1;}
else
{facotr=Math.floor(factor);}
if(fadingDirection!=1)
{fadingDirection=1;FadeLoop(thisElement.Opacity(),10*factor);}}
this.FadeOut=function(factor)
{if(factor==null||factor<1)
{factor=1;}
else
{facotr=Math.floor(factor);}
if(fadingDirection!=-1)
{fadingDirection=-1;FadeLoop(thisElement.Opacity(),-10*factor);}}}
this.Dispose=function()
{doufu.Browser.Helpers.DetachEvent(_native,"keydown",_onkeydown);doufu.Browser.Helpers.DetachEvent(_native,"keyup",_onkeyup);doufu.Browser.Helpers.DetachEvent(_native,"load",_onload);if(doufu.Browser.BrowserDetect.Browser==doufu.Browser.BrowserDetect.BrowserEnum.Explorer&&(_native==window||_native==document||_native==document.body))
{doufu.Browser.Helpers.DetachEvent(_native,"focusout",_onblur);}
else
{doufu.Browser.Helpers.DetachEvent(_native,"blur",_onblur);}
doufu.Browser.Helpers.DetachEvent(_native,"focus",_onfocus);_native=null;}
this.Ctor=function()
{if(String.isString(element))
{_native=doufu.Browser.DOM.QuickSelect(element);}
else
{_native=element;}
if(_native==null)
{throw doufu.System.Exception("doufu.Browser.Element::Ctor() - Specified element is null.");}
var bufferElmt=doufu.Browser.Element._elementBuffer.GetBufferElement(_native);if(bufferElmt!=null)
{return bufferElmt;}
else
{_onkeydown=nativeEventArgProcessor(this.OnKeyDown.Invoke);doufu.Browser.Helpers.AttachEvent(_native,"keydown",_onkeydown);_onkeyup=nativeEventArgProcessor(this.OnKeyUp.Invoke);doufu.Browser.Helpers.AttachEvent(_native,"keyup",_onkeyup);_onload=nativeEventArgProcessor(this.OnLoad.Invoke);doufu.Browser.Helpers.AttachEvent(_native,"load",_onload);_onclick=nativeEventArgProcessor(this.OnClick.Invoke);doufu.Browser.Helpers.AttachEvent(_native,"click",_onclick);_onchange=nativeEventArgProcessor(this.OnChange.Invoke);doufu.Browser.Helpers.AttachEvent(_native,"change",_onchange);if(doufu.Browser.BrowserDetect.Browser==doufu.Browser.BrowserDetect.BrowserEnum.Explorer&&(_native==window||_native==document||_native==document.body))
{var self=this;_onblur=nativeEventArgProcessor(function(e)
{if(typeof self.__activeElement==doufu.System.Constants.TYPE_UNDEFINED||self.__activeElement!=document.activeElement)
{self.__activeElement=document.activeElement}
else
{self.OnBlur.Invoke(e);}});doufu.Browser.Helpers.AttachEvent(_native,"focusout",_onblur);}
else
{_onblur=nativeEventArgProcessor(this.OnBlur.Invoke);doufu.Browser.Helpers.AttachEvent(_native,"blur",_onblur);}
_onfocus=nativeEventArgProcessor(this.OnFocus.Invoke);doufu.Browser.Helpers.AttachEvent(_native,"focus",_onfocus);doufu.Browser.Element._elementBuffer.push(this);}}
return this.Ctor();}
doufu.Browser.Element._elementBuffer=[];doufu.Browser.Element._elementBuffer.GetBufferElement=function(_native)
{for(var i=0;i<doufu.Browser.Element._elementBuffer.length;i++)
{if(doufu.Browser.Element._elementBuffer[i].Native()==_native)
{return doufu.Browser.Element._elementBuffer[i];}}
return null;}
doufu.Browser.DOMBase=function(docRef)
{doufu.OOP.Class(this);var _docRef;if(typeof docRef==doufu.System.Constants.TYPE_UNDEFINED||docRef==null)
{_docRef=document;}
else
{_docRef=docRef}
this.NewProperty("DocRef");this.DocRef.Get=function()
{return _docRef;}
this.Inherit(doufu.Browser.Element,[_docRef]);this.CreateElement=function(sElement)
{return new doufu.Browser.Element(this.DocRef().createElement(sElement));}
this.$c=this.CreateElement;this.Select=function(sElementId)
{var elmt=this.QuickSelect(sElementId);if(elmt!=null)
{return new doufu.Browser.Element(elmt);}
return null;}
this.$s=this.Select;this.QuickSelect=function(sElementId)
{var elmt;if(sElementId.substring(0,1)=="$")
{elmt=this.DocRef().getElementsByTagName(sElementId.substring(1,sElementId.length))[0];}
else
{elmt=this.DocRef().getElementById(sElementId);}
return elmt;}
this.$q=this.QuickSelect;this.CompatibleMode=function()
{if(doufu.Browser.BrowserDetect.Browser==doufu.Browser.BrowserDetect.BrowserEnum.Explorer&&doufu.Browser.BrowserDetect.Version<6)
{return doufu.Browser.DOM.CompatibleMode.BACK_COMPAT;}
else if(doufu.Browser.BrowserDetect.Browser==doufu.Browser.BrowserDetect.BrowserEnum.Safari)
{if(this.DocType().publicId==doufu.Browser.DOM.DocType.DTDXHTML1Strict)
{return doufu.Browser.DOM.CompatibleMode.CSS1_COMPAT;}}
else
{return this.DocRef().compatMode;}}
this.DesignMode=function()
{return this.DocRef().designMode;}
this.DocType=function()
{return this.DocRef().doctype;}
this.Charset=function()
{return this.DocRef().defaultCharset;}}
doufu.Browser.DOM=new doufu.Browser.DOMBase();doufu.Browser.GetDOMFromIFrame=function(elmtIFrame)
{return doufu.Browser.GetWindowFromIFrame(elmtIFrame).DOM;}
doufu.Browser.DOM.CompatibleMode.CSS1_COMPAT="CSS1Compat";doufu.Browser.DOM.CompatibleMode.BACK_COMPAT="BackCompat";doufu.Browser.DOM.DocType.DTDXHTML1Strict="-//W3C//DTD XHTML 1.0 Strict//EN";doufu.Browser.WindowBase=function(winRef)
{doufu.OOP.Class(this);var _winRef;if(typeof winRef==doufu.System.Constants.TYPE_UNDEFINED||winRef==null)
{_winRef=window;}
else
{_winRef=winRef}
this.NewProperty("WinRef");this.WinRef.Get=function()
{return _winRef;}
this.DOM=new doufu.Browser.DOMBase(this.WinRef().document);}
doufu.Browser.Window=new doufu.Browser.WindowBase();doufu.Browser.GetWindowFromIFrame=function(elmtIFrame)
{if(typeof elmtIFrame.tagName==doufu.System.Constants.TYPE_UNDEFINED||elmtIFrame.tagName.toLowerCase()!="iframe")
{throw doufu.System.Exception("elmtIFrame was not a iframe reference.");}
return new doufu.Browser.WindowBase(elmtIFrame.contentWindow);}
doufu.Cycling=new Object();doufu.Cycling.Block=function(milliseconds)
{var sleeping=true;var now=new Date();var alarm;var startingMSeconds=now.getTime();while(sleeping)
{alarm=new Date();var alarmMSeconds=alarm.getTime();if(alarmMSeconds-startingMSeconds>milliseconds){sleeping=false;}}}
doufu.Cycling.Pool=new Array();doufu.Cycling.Pool.Length=function()
{return doufu.Cycling.Pool.length;}
doufu.Cycling.Pool.Length.getValue=doufu.Cycling.Pool.Length.toString=doufu.Cycling.Pool.Length;doufu.Cycling.Pool.Add=function(oCycle)
{if(!(oCycle instanceof doufu.Cycling.Cycle))
throw doufu.System.Exception("Must pass in a Cycle.");var bFound=false;for(var i=0;i<doufu.Cycling.Pool.length;i++)
{if(doufu.Cycling.Pool[i]==oCycle)
{bFound=true;break;}}
if(!bFound)
{var iCycle=doufu.Cycling.Pool.push(oCycle);iCycle--;this[iCycle]=doufu.Cycling.Pool[iCycle];}}
doufu.Cycling.Pool.Remove=function(oCycle)
{var i;for(i=0;i<doufu.Cycling.Pool.length;i++)
{if(doufu.Cycling.Pool[i]==oCycle)
{break;}}
doufu.Cycling.Pool.splice(i,1);}
doufu.Cycling.Manager=new function __nsc_Cycling_Manager()
{this.Register=function(oCycle)
{doufu.Cycling.Pool.Add(oCycle);}
this.Unregister=function(oCycle)
{doufu.Cycling.Pool.Remove(oCycle);}
this.Looper=function(oMsg)
{if(!(oMsg instanceof doufu.System.Message))
throw doufu.System.Exception("The message dispatched is not derived from doufu.System.Message");for(var i=0;i<doufu.Cycling.Pool.Length;i++)
{doufu.Cycling.Pool[i].Looper(oMsg);}}}
doufu.Cycling.Cycle=function(pCallback)
{this.Handle=doufu.System.Handle.Generate();this.Halted=true;this.Worker=new doufu.System.MessageProcessor();var suspendMilliSec=0;var suspendStartTime=null;this.Ctor=function()
{if(pCallback!=null&&pCallback.InstanceOf(doufu.Event.CallBack));{this.SetWorkerProcess(pCallback);}}
this.Looper=function(oMsg)
{if(suspendMilliSec<(new Date().getTime()-suspendStartTime)){this.Halted=false;suspendMilliSec=0;suspendStartTime=0;}
if(this.Halted==true)
return;if(!(oMsg instanceof doufu.System.Message))
throw doufu.System.Exception("The message dispatched is not derived from doufu.System.Message");this.Worker.BeforeProcess(oMsg);}
this.SetWorkerProcess=function(pCallback)
{this.Worker.Process=pCallback;}
this.Suspend=function(iMillisecond)
{suspendMilliSec=iMillisecond;suspendStartTime=(new Date()).getTime();this.Halted=true;}
this.Start=function()
{doufu.Cycling.Manager.Register(this);this.Halted=false;}
this.Ctor();}
doufu.Display=new Object();doufu.Display.Drawing={};doufu.Display.Drawing.Drawable=function()
{doufu.OOP.Class(this);this.NewProperty("DeepCopy");this.DeepCopy.Get=function()
{return new doufu.Display.Drawing.Drawable();}
this.DeepCopy.Set=function(obj)
{}}
doufu.Display.Drawing.Point=function(x,y)
{doufu.OOP.Class(this);this.Inherit(doufu.Display.Drawing.Drawable);this.X;this.Y;this.Ctor=function()
{if(x!=null&&typeof x.InstanceOf!=doufu.System.Constants.TYPE_UNDEFINED&&x.InstanceOf(doufu.Display.Drawing.Point))
{this.X=x.X;this.Y=x.Y;}
else
{this.X=x!=null?x:0;this.Y=y!=null?y:0;}}
this.Ctor();}
doufu.Display.Drawing.Vector=function(x,y)
{doufu.OOP.Class(this);this.Inherit(doufu.Display.Drawing.Point,[x,y]);this.NewProperty("Magnitude");this.Magnitude.Get=function()
{return Math.sqrt(this.X*this.X+this.Y*this.Y);}
this.Normalize=function()
{var magnitude=this.Magnitude();this.X=this.X/magnitude;this.Y=this.Y/magnitude;}
this.GetNormalized=function()
{var magnitude=this.Magnitude();return new doufu.Display.Drawing.Vector(this.X/magnitude,this.Y/magnitude);}
this.DotProduct=function(vector)
{return this.X*vector.X+this.Y*vector.Y;}
this.DistanceTo=function(vector){return Math.sqrt(Math.pow(vector.X-this.X,2)+Math.pow(vector.Y-this.Y,2));}}
doufu.Display.Drawing.Vector.Subtract=function(vector1,vector2,outVector)
{var retVector;if(outVector==null)
{retVector=new doufu.Display.Drawing.Vector();}
else
{retVector=outVector;}
retVector.X=vector1.X-vector2.X;retVector.Y=vector1.Y-vector2.Y;return retVector;}
doufu.Display.Drawing.Line=function(x1,y1,x2,y2)
{doufu.OOP.Class(this);this.Inherit(doufu.Display.Drawing.Drawable);this.X1=0;this.Y1=0;this.X2=0;this.Y2=0;this.Ctor=function()
{if(x1!=null&&typeof x1.InstanceOf!=doufu.System.Constants.TYPE_UNDEFINED)
{this.DeepCopy(x1);}
else
{this.X1=x1!=null?x1:0;this.Y1=y1!=null?y1:0;this.X2=x2!=null?x2:0;this.Y2=y2!=null?y2:0;}}
this.NewProperty("DeepCopy");this.DeepCopy.Get=function()
{return new doufu.Display.Drawing.Line(this);}
this.DeepCopy.Set=function(oLine)
{if(!oLine.InstanceOf(doufu.Display.Drawing.Line))
{throw doufu.System.Exception("doufu.Display.Drawing.Line::DeepCopy.Set(): oLine must be an instance of doufu.Display.Drawing.Line or null");}
this.X1=oLine.X1;this.Y1=oLine.Y1;this.X2=oLine.X2;this.Y2=oLine.Y2;}
this.Ctor();}
doufu.Display.Drawing.Rectangle=function(obj)
{doufu.OOP.Class(this);this.Inherit(doufu.Display.Drawing.Point);this.Width=0;this.Height=0;this.NewProperty("DeepCopy");this.DeepCopy.Get=function()
{return new doufu.Display.Drawing.Polygon(this);}
this.DeepCopy.Set=function(oRectangle)
{if(!oRectangle.InstanceOf(doufu.Display.Drawing.Rectangle))
{throw doufu.System.Exception("doufu.Display.Drawing.Rectangle::DeepCopy.Set(): oRectangle must be an instance of doufu.Display.Drawing.Rectangle or null");}
this.X=oRectangle.X;this.Y=oRectangle.Y;this.Width=oRectangle.Width;this.Height=oRectangle.Height;}
this.IsDirectionOf=function(oDirection,oRect)
{var bRet=true;if(oDirection.X()>0)
{var x=oDirection.X()*(oRect.X+oRect.Width-this.X);if(x<=0)
{bRet=false;}}
else if(oDirection.X()<0)
{var x=oDirection.X()*(oRect.X-this.X-this.Width);if(x<=0)
{bRet=false;}}
if(oDirection.Y()>0)
{var y=oDirection.Y()*(oRect.Y+oRect.Height-this.Y);if(y<=0)
{bRet=false;}}
else if(oDirection.Y()<0)
{var y=oDirection.Y()*(oRect.Y-this.Y-this.Height);if(y<=0)
{bRet=false;}}
return bRet;}
this.Ctor=function()
{if(obj!=null)
{this.DeepCopy(obj);}}
this.Ctor();}
doufu.Display.Drawing.Polygon=function(obj)
{doufu.OOP.Class(this);this.Inherit(doufu.Display.Drawing.Drawable);this.Inherit(doufu.CustomTypes.Collection,[doufu.Display.Drawing.Vector]);var edgeBuffer=[];for(var i=0;i<255;i++)
{edgeBuffer.push(new doufu.Display.Drawing.Vector());}
this.Edges=new doufu.CustomTypes.Collection(doufu.Display.Drawing.Vector);this.NewProperty("Center");this.Center.Get=function()
{var totalX=0;var totalY=0;for(var i=0;i<this.Length();i++)
{totalX+=this.Items(i).X;totalY+=this.Items(i).Y;}
return new doufu.Display.Drawing.Vector(totalX/this.Length(),totalY/this.Length());}
this.NewProperty("DeepCopy");this.DeepCopy.Get=function()
{return new doufu.Display.Drawing.Polygon(this);}
this.DeepCopy.Set=function(oPolygon)
{if(!oPolygon.InstanceOf(doufu.Display.Drawing.Polygon))
{throw doufu.System.Exception("doufu.Display.Drawing.Polygon::DeepCopy.Set(): oPolygon must be an instance of doufu.Display.Drawing.Polygon or null");}
this.Clear();for(var i=0;i<oPolygon.Length();i++)
{this.Add(doufu.System.APIs.Clone(oPolygon.Items(i),0));}}
this.BuildEdges=function()
{var p1,p2;this.Edges.Clear();for(var i=0;i<this.Length();i++){p1=this.Items(i);if(i+1>=this.Length()){p2=this.Items(0);}else{p2=this.Items(i+1);}
if(i>=edgeBuffer.length)
{for(var j=edgeBuffer.length;j<=i;j++)
{edgeBuffer.push(new doufu.Display.Drawing.Vector());}}
doufu.Display.Drawing.Vector.Subtract(p2,p1,edgeBuffer[i]);this.Edges.Add(edgeBuffer[i]);}}
this.OverloadMethod("Offset",function(v)
{this.Offset(v.X,v.Y);});this.OverloadMethod("Offset",function(x,y)
{for(var i=0;i<this.Length();i++){var p=this.Items(i);this.InnerArray()[i]=new doufu.Display.Drawing.Vector(p.X+x,p.Y+y);}});var __base_Clear=this.OverrideMethod("Clear",function()
{this.Edges.Clear();__base_Clear.call(this);});this.Ctor=function()
{if(obj!=null&&obj.InstanceOf(doufu.Display.Drawing.Polygon))
{this.DeepCopy(obj);}}
this.Ctor();}
doufu.Display.Drawing.Cube=function(obj)
{doufu.OOP.Class(this);this.Inherit(doufu.Display.Drawing.Rectangle);this.Z=0;this.Depth=0;this.Ctor=function()
{if(obj!=null&&typeof obj.InstanceOf!=doufu.System.Constants.TYPE_UNDEFINED)
{this.DeepCopy(obj);}}
this.NewProperty("DeepCopy");this.DeepCopy.Get=function()
{return new doufu.Display.Drawing.Cube(this);}
this.DeepCopy.Set=function(oCube)
{if(!oCube.InstanceOf(doufu.Display.Drawing.Cube))
{throw doufu.System.Exception("doufu.Display.Drawing.Cube::DeepCopy.Set(): oCube must be an instance of doufu.Display.Drawing.Cube or null");}
this.X=oCube.X;this.Y=oCube.Y;this.Z=oCube.Z;}
this.Ctor();}
doufu.Display.Drawing.ConvertPointsToRectangle=function(oPoint1,oPoint2,oRectangle)
{if(!oPoint1.InstanceOf(doufu.Display.Drawing.Point))
{throw doufu.System.Exception("doufu.Display.Drawing.ConvertPointsToRectangle(): oPoint1 is not a Point.");}
if(!oPoint2.InstanceOf(doufu.Display.Drawing.Point))
{throw doufu.System.Exception("doufu.Display.Drawing.ConvertPointsToRectangle(): oPoint2 is not a Point.");}
var sPointX,sPointY,bPointX,bPointY;var rectRet;if(oPoint1.X<oPoint2.X)
{sPointX=oPoint1.X;bPointX=oPoint2.X;}
else
{sPointX=oPoint2.X;bPointX=oPoint1.X;}
if(oPoint1.Y<oPoint2.Y)
{sPointY=oPoint1.Y;bPointY=oPoint2.Y;}
else
{sPointY=oPoint2.Y;bPointY=oPoint1.Y;}
if(!oRectangle)
{rectRet=new doufu.Display.Drawing.Rectangle();}
else
{rectRet=oRectangle;}
rectRet.X=sPointX;rectRet.Y=sPointY;rectRet.Width=bPointX-sPointX;rectRet.Height=bPointY-sPointY;return rectRet;}
doufu.Display.Drawing.ConvertRectangleToPolygon=function(oRectangle,outPolygon)
{if(!oRectangle.InstanceOf(doufu.Display.Drawing.Rectangle))
{throw doufu.System.Exception("doufu.Display.Drawing.ConvertRectangleToPolygon(): oRectangle is not a rectangle.");}
var retPolygon;if(outPolygon==null)
{retPolygon=new doufu.Display.Drawing.Polygon();}
else
{retPolygon=outPolygon;}
retPolygon.Clear();retPolygon.Add(new doufu.Display.Drawing.Vector(oRectangle.X,oRectangle.Y));retPolygon.Add(new doufu.Display.Drawing.Vector(oRectangle.X+oRectangle.Width,oRectangle.Y));retPolygon.Add(new doufu.Display.Drawing.Vector(oRectangle.X+oRectangle.Width,oRectangle.Y+oRectangle.Height));retPolygon.Add(new doufu.Display.Drawing.Vector(oRectangle.X,oRectangle.Y+oRectangle.Height));return retPolygon;}
doufu.Display.Drawing.ConvertPolygonToRectangle=function(oPolygon,outRectangle)
{if(!oPolygon.InstanceOf(doufu.Display.Drawing.Polygon))
{throw doufu.System.Exception("doufu.Display.Drawing.ConvertRectangleToPolygon(): oPolygon is not a polygon.");}
var retRectangle;if(outRectangle==null)
{retRectangle=new doufu.Display.Drawing.Rectangle();}
else
{retRectangle=outRectangle;}
var sX,sY,bX,bY;sX=oPolygon.Items(0).X;sY=oPolygon.Items(0).Y;bX=oPolygon.Items(0).X;bY=oPolygon.Items(0).Y;for(var i=1;i<oPolygon.Length();i++)
{if(sX>oPolygon.Items(i).X)
{sX=oPolygon.Items(i).X;}
if(sY>oPolygon.Items(i).Y)
{sY=oPolygon.Items(i).Y;}
if(bX<oPolygon.Items(i).X)
{bX=oPolygon.Items(i).X;}
if(bY<oPolygon.Items(i).Y)
{bY=oPolygon.Items(i).Y;}}
retRectangle.X=sX;retRectangle.Y=sY;retRectangle.Width=bX-sX;retRectangle.Height=bY-sY;return retRectangle;}
doufu.Display.BaseObject=function()
{doufu.OOP.Class(this);this.Inherit(doufu.System.Handle.Handlable);this.Inherit(doufu.Display.Drawing.Rectangle);var BACKGROUND_REPEAT_STYLE="no-repeat";var _htmlElement;this.NewProperty("HTMLElement");this.HTMLElement.Get=function()
{return _htmlElement;}
this.HTMLElement.Set=function(value)
{if(typeof value=="string")
{_htmlElement=document.getElementById(value);}
else
{_htmlElement=value;}}
this.Render=new doufu.Event.CallBack(function(oSender,oMsg)
{if(doufu.System.MessageConstants.IsMessage(oMsg,doufu.System.MessageConstants.DISPLAY_RENDER)&&doufu.System.Handle.IsMe(this,oMsg.Handle))
{this.HTMLElement().style.left=this.X+"px";this.HTMLElement().style.top=this.Y+"px";this.HTMLElement().style.zIndex=this.Z;this.HTMLElement().style.width=this.Width+"px";this.HTMLElement().style.height=this.Height+"px";this.HTMLElement().style.backgroundPosition=doufu.System.Convert.ToString(-this.ImageOffset.X)+"px "+doufu.System.Convert.ToString(-this.ImageOffset.Y)+"px";this.HTMLElement().style.backgroundRepeat=BACKGROUND_REPEAT_STYLE;var backgroundImage="url("+this.ImagePath+")";if(backgroundImage!=this.HTMLElement().style.backgroundImage)
{this.HTMLElement().style.backgroundImage=backgroundImage;}
doufu.System.Logger.Verbose("doufu.Display.BaseObject: Message="+oMsg.Message+"; Handle="+oMsg.Handle);}},this);this.ImageOffset=new doufu.Display.Drawing.Rectangle();this.ImagePath=new String();this.Z=0;this.IsInView=false;this.Handle=doufu.System.Handle.Generate();this.Ctor=function()
{var elDHtml=doufu.Browser.DOM.CreateElement("div");this.HTMLElement(elDHtml.Native());this.HTMLElement().style.position="absolute";elDHtml.Dispose();doufu.System.Logger.Debug("doufu.Display.BaseObject::Ctor(): Initialized");}
this.Ctor();}
doufu.Display.Manager=function(oHTMLElement)
{doufu.OOP.Class(this);var _renderingCycle;var _displayObjects=new Array();var _htmlElement;this.NewProperty("HTMLElement");this.HTMLElement.Get=function()
{return _htmlElement;}
this.HTMLElement.Set=function(value)
{if(typeof value=="string")
{doufu.System.Logger.Debug("doufu.Display.Manager: Set html element by id \""+value+"\"");_htmlElement=document.getElementById(value);doufu.System.Logger.Debug("doufu.Display.Manager: Html element was set");}
else
{_htmlElement=value;}}
this.NewProperty("Width");this.Width.Get=function()
{return this.HTMLElement().clientWidth;}
this.NewProperty("Height");this.Height.Get=function()
{return this.HTMLElement().clientHeight;}
this.OnRender=new doufu.Event.EventHandler(this);this.Looper=function(oMsg)
{if(doufu.System.MessageConstants.IsMessage(oMsg,doufu.System.MessageConstants.DISPLAY_RENDER))
{doufu.System.Logger.Verbose("doufu.Display.Manager: Sending message: message="+oMsg.Message);this.OnRender.Invoke(oMsg);doufu.System.Logger.Verbose("doufu.Display.Manager: Message was sent.");}}
this.InsertObject=function(obj)
{if(!obj.InstanceOf(doufu.Display.BaseObject))
{throw doufu.System.Exception("obj is not a instance of doufu.Display.BaseObject!");}
doufu.System.Logger.Debug("doufu.Display.Manager: Insert Object - "+obj);if(typeof obj.InstanceOf!=doufu.System.Constants.TYPE_UNDEFINED&&obj.InstanceOf(doufu.Display.BaseObject))
{doufu.System.Logger.Debug("doufu.Display.Manager: Insert Object - Object is type safed.");this.HTMLElement().appendChild(obj.HTMLElement());doufu.System.Logger.Debug("doufu.Display.Manager: The render function is "+obj.Render);this.OnRender.Attach(obj.Render);obj.IsInView=true;doufu.System.Logger.Debug("doufu.Display.Manager: Insert Object - Object Inserted.");}}
this.RemoveObject=function(obj)
{if(!obj.InstanceOf(doufu.Display.BaseObject))
{throw doufu.System.Exception("obj is not a instance of doufu.Display.BaseObject!");}
doufu.System.Logger.Debug("doufu.Display.Manager: Remove Object - "+obj);if(typeof obj.InstanceOf!=doufu.System.Constants.TYPE_UNDEFINED&&obj.InstanceOf(doufu.Display.BaseObject))
{doufu.System.Logger.Debug("doufu.Display.Manager: Remove Object - Object is type safed.");this.HTMLElement().removeChild(obj.HTMLElement());doufu.System.Logger.Debug("doufu.Display.Manager: The render function is "+obj.Render);this.OnRender.Detach(obj.Render);obj.IsInView=false;doufu.System.Logger.Debug("doufu.Display.Manager: Remove Object - Object Removed.");}}
this.Ctor=function()
{_renderingCycleCallback=new doufu.Event.CallBack(this.Looper,this);_renderingCycle=new doufu.Cycling.Cycle();_renderingCycle.SetWorkerProcess(_renderingCycleCallback);_renderingCycle.Start();if(oHTMLElement!=null)
{this.HTMLElement(oHTMLElement);}};this.Ctor();}
doufu.Display.Manager.Create=function(elmtParent,elmtID,iWidth,iHeight)
{var tmpDiv=doufu.Browser.Helpers.CreateOverflowHiddenDiv(elmtID,elmtParent,iWidth,iHeight);return new doufu.Display.Manager(tmpDiv);}
doufu.BenchMark=function()
{doufu.OOP.Class(this);var dtStarts=new doufu.CustomTypes.Stack();var iResults=[];var enable=doufu.System.Logger.IsDebug();this.Record=function(sName,signal)
{if(enable)
{if(signal!=null&&!signal.IsSet())
{return;}
var elmt=new doufu.BenchMark.Element();elmt.Name=sName;elmt.StartTime=new Date().getTime();dtStarts.Push(elmt);}}
this.End=function(sName,signal)
{if(enable)
{if(signal!=null&&!signal.IsSet())
{return;}
var elmt=dtStarts.Pop();if(elmt!=null)
{if(sName!=null)
{elmt.Name+="/"+sName;}
elmt.EndTime=(new Date().getTime());elmt.Cost=elmt.EndTime-elmt.StartTime;iResults.push(elmt);}}}
this.ListToConsole=function()
{enable=false;var iResultsNotDone=[];for(var i=0;i<iResults.length;i++)
{if(iResults[i].EndTime!=0)
{doufu.System.Logger.Debug("doufu.BenchMark::ListToConsole() - Name: "+iResults[i].Name+" StartTime: "+
iResults[i].StartTime+" Cost: "+iResults[i].Cost);}
else
{iResultsNotDone.push(iResults[i]);}}
iResults=iResultsNotDone;enable=true;}}
doufu.BenchMark.Element=function()
{this.Name="";this.StartTime=0;this.EndTime=0;this.Cost=0;}
doufu.BenchMark.Signal=function()
{var value=false;this.IsSet=function()
{return value;}
this.Set=function()
{value=true;}
this.Release=function()
{value=false;}}
doufu.BenchMark.Instance=new doufu.BenchMark();doufu.Game={};doufu.Game.Helpers={};doufu.Game.Helpers.IsCollided=function(obj1,obj2,oDirection)
{if(doufu.System.APIs.NumberOfType(doufu.Display.Drawing.Rectangle,obj1,obj2)==2)
{return doufu.Game.Helpers.IsRectangleCollided(obj1,obj2);}
else if(doufu.System.APIs.NumberOfType(doufu.Display.Drawing.Polygon,obj1,obj2)==2)
{return doufu.Game.Helpers.IsPolygonCollided(obj1,obj2,oDirection);}
else if(doufu.System.APIs.NumberOfType(doufu.Display.Drawing.Rectangle,obj1,obj2)==1&&doufu.System.APIs.NumberOfType(doufu.Display.Drawing.Polygon,obj1,obj2)==1)
{if(obj1.InstanceOf(doufu.Display.Drawing.Rectangle))
{doufu.Display.Drawing.ConvertRectangleToPolygon(obj1,doufu.Game.Helpers.IsCollided.__poly);return doufu.Game.Helpers.IsPolygonCollided(doufu.Game.Helpers.IsCollided.__poly,obj2);}
else if(obj2.InstanceOf(doufu.Display.Drawing.Rectangle))
{doufu.Display.Drawing.ConvertRectangleToPolygon(obj2,doufu.Game.Helpers.IsCollided.__poly);return doufu.Game.Helpers.IsPolygonCollided(doufu.Game.Helpers.IsCollided.__poly,obj1);}}}
doufu.Game.Helpers.IsCollided.__poly=new doufu.Display.Drawing.Polygon();doufu.Game.Helpers.IsCollided.__rect=new doufu.Display.Drawing.Rectangle();doufu.Game.Helpers.IsRectangleCollided=function(oRectangle1,oRectangle2)
{if(!oRectangle1.InstanceOf(doufu.Display.Drawing.Rectangle))
{throw doufu.System.Exception("doufu.Game.Helpers.IsCollided(): oRectangle1 is not a rectangle.");}
if(!oRectangle2.InstanceOf(doufu.Display.Drawing.Rectangle))
{throw doufu.System.Exception("doufu.Game.Helpers.IsCollided(): oRectangle2 is not a rectangle.");}
if(oRectangle1.X>(oRectangle2.X+oRectangle2.Width)||(oRectangle1.X+oRectangle1.Width)<oRectangle2.X)
{return false;}
if(oRectangle1.Y>(oRectangle2.Y+oRectangle2.Height)||(oRectangle1.Y+oRectangle1.Height)<oRectangle2.Y)
{return false;}
return true;}
doufu.Game.Helpers.__intervalDistance=function(minA,maxA,minB,maxB)
{if(minA<minB){return minB-maxA;}else{return minA-maxB;}}
doufu.Game.Helpers.ProjectPolygon=function(axis,polygon,min,max)
{var d=axis.DotProduct(polygon.Items(0));min.value=d;max.value=d;for(var i=0;i<polygon.Length();i++){d=polygon.Items(i).DotProduct(axis);if(d<min.value){min.value=d;}else{if(d>max.value){max.value=d;}}}}
doufu.Game.Helpers.IsPolygonCollided=function(polygonA,polygonB,oDirection)
{doufu.Display.Drawing.ConvertPolygonToRectangle(polygonA,doufu.Game.Helpers.IsPolygonCollided.__rect1);doufu.Display.Drawing.ConvertPolygonToRectangle(polygonB,doufu.Game.Helpers.IsPolygonCollided.__rect2);if(oDirection!=null)
{if(!doufu.Game.Helpers.IsPolygonCollided.__rect1.IsDirectionOf(oDirection,doufu.Game.Helpers.IsPolygonCollided.__rect2))
{return false;}}
if(!doufu.Game.Helpers.IsRectangleCollided(doufu.Game.Helpers.IsPolygonCollided.__rect1,doufu.Game.Helpers.IsPolygonCollided.__rect2))
{return false;}
if(polygonA.Edges==null||polygonA.Edges.Length()==0)
{polygonA.BuildEdges();}
if(polygonB.Edges==null||polygonB.Edges.Length()==0)
{polygonB.BuildEdges();}
var edgeCountA=polygonA.Edges.Length();var edgeCountB=polygonB.Edges.Length();var edge;for(var edgeIndex=0;edgeIndex<edgeCountA+edgeCountB;edgeIndex++)
{if(edgeIndex<edgeCountA){edge=polygonA.Edges.Items(edgeIndex);}else{edge=polygonB.Edges.Items(edgeIndex-edgeCountA);}
var axis=doufu.Game.Helpers.IsPolygonCollided.__axis;axis.X=-edge.Y;axis.Y=edge.X;axis.Normalize();var minA=new Object();var minB=new Object();var maxA=new Object();var maxB=new Object();doufu.Game.Helpers.ProjectPolygon(axis,polygonA,minA,maxA);doufu.Game.Helpers.ProjectPolygon(axis,polygonB,minB,maxB);if(doufu.Game.Helpers.__intervalDistance(minA.value,maxA.value,minB.value,maxB.value)>0)
{return false;}}
return true;}
doufu.Game.Helpers.IsPolygonCollided.__axis=new doufu.Display.Drawing.Vector();doufu.Game.Helpers.IsPolygonCollided.__rect1=new doufu.Display.Drawing.Rectangle();doufu.Game.Helpers.IsPolygonCollided.__rect2=new doufu.Display.Drawing.Rectangle();doufu.Game.PlayGround=function(oDisplayManager)
{doufu.OOP.Class(this);this.Inherit(doufu.Display.BaseObject);var _currentMap;this.NewProperty("CurrentMap");this.CurrentMap.Get=function()
{return _currentMap;}
this.CurrentMap.Set=function(value)
{_currentMap=value;}
var linkedDisplayMgr=null;this.NewProperty("LinkedDisplayManager");this.LinkedDisplayManager.Get=function()
{return linkedDisplayMgr;}
var displayBufferOffset=new doufu.Display.Drawing.Rectangle();var _gameObjects=new doufu.CustomTypes.Collection(doufu.Game.BaseObject);this.NewProperty("GameObjects");this.GameObjects.Get=function()
{return _gameObjects;}
this.GameObjects.Set=function(value)
{_gameObjects=value;}
var _camera=new doufu.Game.PlayGround.Camera();this.NewProperty("Camera");this.Camera.Get=function()
{return _camera;}
this.Camera.Set=function(value)
{_camera=value;}
this.OnInsertObject=new doufu.Event.EventHandler(this);var MovableConfirm=new doufu.Event.CallBack(function(sender,obj)
{if(this.CurrentMap()!=null)
{return this.CurrentMap().ConfirmMovable(obj);}
return true;},this);var AddMovableConfirm=new doufu.Event.CallBack(function(sender,obj)
{if(obj.InstanceOf(doufu.Game.Sprites.Sprite)&&typeof obj.Sharp!=doufu.System.Constants.TYPE_UNDEFINED)
{obj.OnConfirmMovable.Attach(MovableConfirm);}},this)
this.InsertObject=function(obj)
{this.OnInsertObject.Invoke(obj);_gameObjects.Add(obj);if(obj.Children.Length()!=0)
{for(var i=0;i<obj.Children.Length();i++)
{(obj.Children.Items(i).IsFixed||this.InsertObject(obj.Children.Items(i)));}}}
this.RemoveObject=function(obj)
{linkedDisplayMgr.RemoveObject(obj.LinkedDisplayObject());_gameObjects.Remove(obj);}
this._base_RenderRefer=this.Render.Reference;this.Render.Reference=function(oSender,oEvent)
{this.ImageOffset.X=this.Camera().X;this.ImageOffset.Y=this.Camera().Y;for(var i=0;i<_gameObjects.Length();i++)
{displayBufferOffset.Width=_gameObjects.InnerArray()[i].Width;displayBufferOffset.Height=_gameObjects.InnerArray()[i].Height;displayBufferOffset.X=_gameObjects.InnerArray()[i].X;displayBufferOffset.Y=doufu.Game.PlayGround.Helpers.RealYToScreenY(_gameObjects.InnerArray()[i].LocationY(),true)-_gameObjects.InnerArray()[i].StandingOffset.Y;if(doufu.Game.Helpers.IsCollided(displayBufferOffset,this.Camera()))
{_gameObjects.InnerArray()[i].LinkedDisplayObject().X=displayBufferOffset.X-this.Camera().X;_gameObjects.InnerArray()[i].LinkedDisplayObject().Y=Math.round(displayBufferOffset.Y-this.Camera().Y);_gameObjects.InnerArray()[i].LinkedDisplayObject().Z=Math.round((_gameObjects.InnerArray()[i].Z+1)*4000+_gameObjects.InnerArray()[i].LocationY());_gameObjects.InnerArray()[i].LinkedDisplayObject().Width=_gameObjects.InnerArray()[i].Width;_gameObjects.InnerArray()[i].LinkedDisplayObject().Height=_gameObjects.InnerArray()[i].Height;_gameObjects.InnerArray()[i].LinkedDisplayObject().ImageOffset=_gameObjects.InnerArray()[i].ImageOffset;_gameObjects.InnerArray()[i].LinkedDisplayObject().ImagePath=_gameObjects.InnerArray()[i].ImagePath;if(_gameObjects.InnerArray()[i].LinkedDisplayObject().IsInView==false)
{linkedDisplayMgr.InsertObject(_gameObjects.InnerArray()[i].LinkedDisplayObject());}}
else
{if(_gameObjects.InnerArray()[i].LinkedDisplayObject().IsInView==true)
{linkedDisplayMgr.RemoveObject(_gameObjects.InnerArray()[i].LinkedDisplayObject());}}}
this._base_RenderRefer(oSender,oEvent);}
this.Ctor=function()
{if(!oDisplayManager.InstanceOf(doufu.Display.Manager))
{throw doufu.System.Exception("doufu.Game.PlayGround::Ctor(): Must specified a display manager.");}
doufu.System.Logger.Debug("doufu.Game.PlayGround::Ctor(): Loopped in.");linkedDisplayMgr=oDisplayManager;doufu.System.Logger.Debug("doufu.Game.PlayGround::Ctor(): created play ground temporary html element.");doufu.System.Logger.Debug("doufu.Game.PlayGround::Ctor(): Insert playground to display manager");linkedDisplayMgr.InsertObject(this);this.Z=2001;this.Camera().Width=oDisplayManager.HTMLElement().clientWidth;this.Camera().Height=oDisplayManager.HTMLElement().clientHeight;this.OnInsertObject.Attach(AddMovableConfirm);};this.Ctor();}
doufu.Game.PlayGround.Helpers={};doufu.Game.PlayGround.Helpers.RealYToScreenY=function(iRealY,bAccuracy)
{if(bAccuracy==null)
{bAccuracy=false;}
var oCndtAccuracy={};oCndtAccuracy[true]=function()
{return iRealY/1.5;}
oCndtAccuracy[false]=function()
{return Math.round(iRealY/1.5);}
return oCndtAccuracy[bAccuracy]();}
doufu.Game.PlayGround.Helpers.ScreenYToRealY=function(iScreenY)
{return iScreenY*1.5;}
doufu.Game.PlayGround.Camera=function()
{doufu.OOP.Class(this);this.Inherit(doufu.Display.Drawing.Rectangle);var skipFrameCount=0;var callbackOffsetCaculation=new doufu.Event.CallBack(function()
{doufu.System.Logger.Verbose("doufu.Game.PlayGround.Camera::callbackOffsetCaculation(): Invoked.");if(this.IsTracing)
{if(!this.SmoothTracing)
{this.X=this.TracedObject.X+this.TracedObject.Width/2-this.Width/2;this.Y=doufu.Game.PlayGround.Helpers.RealYToScreenY(this.TracedObject.Y+this.TracedObject.Height/2,true)-this.Height/2;}
else if(skipFrameCount%(this.SkipFrame+1)==0)
{var destX=this.TracedObject.X+this.TracedObject.Width/2-this.Width/2;var destY=doufu.Game.PlayGround.Helpers.RealYToScreenY(this.TracedObject.Y+this.TracedObject.Height/2,true)-this.Height/2;this.X+=Math.ceil((destX-this.X)/2);this.Y+=Math.ceil((destY-this.Y)/2);}
skipFrameCount++;if(skipFrameCount==10000000)
{skipFrameCount=0;}}},this)
this.IsTracing=false;this.SmoothTracing=false;this.SkipFrame=0;this.TracedObject=null;this.Trace=function(gameObj)
{if(this.IsTracing)
{this.StopTrace();}
doufu.System.Logger.Debug("doufu.Game.PlayGround.Camera::Trace(): Attach OnPaceControlCompleted event.");doufu.Game.PaceController.OnPaceControlCompleted.Attach(callbackOffsetCaculation);this.IsTracing=true;this.TracedObject=gameObj;}
this.StopTrace=function()
{doufu.Game.PaceController.OnPaceControlCompleted.Detach(callbackOffsetCaculation);this.IsTracing=false;this.TracedObject=null;}
this.Ctor=function()
{doufu.Game.PaceController.Detach(this);}
this.Ctor();}
doufu.Game.Animation=function(oGameObj)
{doufu.OOP.Class(this);this.RefToGameObj;this.AnimationInfo;var frameCursor=0;var frameSkipCount=0;var repeatCount=0;var backwardPlay=false;var _isPlaying=false;this.NewProperty("IsPlaying");this.IsPlaying.Get=function()
{return _isPlaying;}
this.IsPlaying.Set=function(value)
{if(value==true)
{frameCursor=0;repeatCount=0;frameSkipCount=this.AnimationInfo.FrameSkip;backwardPlay=false;}
_isPlaying=value;}
this.Play=function(oAnimationInfo)
{if(!oAnimationInfo.InstanceOf(doufu.Game.Animation.Info))
{throw doufu.System.Exception("doufu.Game.Animation::Play(): oAnimationInfo must be an instance of doufu.Game.Animation.Info.");}
doufu.System.Logger.Verbose("doufu.Game.Animation::Play(): Was invoked with following parameters, oAnimationInfo.Row = "+oAnimationInfo.Row.toString());if(this.IsPlaying()==true)
{this.Stop();}
this.AnimationInfo=oAnimationInfo;this.IsPlaying(true);}
this.Stop=function()
{this.IsPlaying(false);}
this.Pacer=function(oMsg)
{if(this.IsPlaying()!=true||(this.AnimationInfo.RepeatNumber!=-1&&repeatCount>this.AnimationInfo.RepeatNumber))
{if(this.IsPlaying()==true)
{this.IsPlaying(false);}
return;}
if(this.AnimationInfo.FrameSkip==frameSkipCount)
{frameSkipCount=0;}
else
{frameSkipCount++;return;}
doufu.System.Logger.Verbose("doufu.Game.Animation::Pacer():");doufu.System.Logger.Verbose("\tColumn: "+this.AnimationInfo.Column.toString());doufu.System.Logger.Verbose("\tRefToGameObj.Width: "+this.RefToGameObj.Width.toString());doufu.System.Logger.Verbose("\tframeCursor: "+frameCursor.toString());this.RefToGameObj.ImageOffset.X=this.AnimationInfo.Column*this.RefToGameObj.Width+this.RefToGameObj.Width*frameCursor;this.RefToGameObj.ImageOffset.Y=this.AnimationInfo.Row*this.RefToGameObj.Height;if(frameCursor==0)
{repeatCount++;}
if(!backwardPlay)
{frameCursor++;}
else
{frameCursor--;}
if(frameCursor>=this.AnimationInfo.FrameNumber)
{if(!this.AnimationInfo.PlayReboundly)
{frameCursor=0;}
else
{backwardPlay=true;frameCursor-=2;}}
if(frameCursor<=0&&this.AnimationInfo.PlayReboundly)
{backwardPlay=false;}}
this.Ctor=function()
{if(!oGameObj.InstanceOf(doufu.Game.BaseObject))
{throw doufu.System.Exception("doufu.Game.Animation::Ctor(): oGameObj must be a instance of doufu.Game.BaseObject.");}
this.RefToGameObj=oGameObj;}
this.Ctor();}
doufu.Game.Animation.Info=function()
{doufu.OOP.Class(this);this.Column;this.Row;this.FrameNumber;this.RepeatNumber;this.FrameSkip=0;this.PlayReboundly=false;}
doufu.Game.BaseObject=function(){doufu.OOP.Class(this);this.Inherit(doufu.Display.Drawing.Cube);this.Inherit(doufu.System.Handle.Handlable);this.ImageOffset=new doufu.Display.Drawing.Point();this.StandingOffset=new doufu.Display.Drawing.Point();this.NewProperty("LocationX");this.LocationX.Get=function()
{return this.X+this.StandingOffset.X;}
this.LocationX.Set=function(value)
{this.X=value-this.StandingOffset.X;}
this.NewProperty("LocationY");this.LocationY.Get=function()
{return this.Y+this.StandingOffset.Y;}
this.LocationY.Set=function(value)
{this.Y=value-this.StandingOffset.Y;}
this.FollowerOffset=new doufu.Display.Drawing.Point();this.ImagePath=new String();this.Animation=new doufu.Game.Animation(this);var _linkedDisplayObject=new doufu.Display.BaseObject();this.NewProperty("LinkedDisplayObject");this.LinkedDisplayObject.Get=function()
{return _linkedDisplayObject;}
this.LinkedDisplayObject.Set=function(value)
{_linkedDisplayObject=value;}
this.IsFixed=false;this.IsFollower=false;this.Children=new doufu.CustomTypes.Collection(doufu.Game.BaseObject);this.Pacer=function(oMsg)
{doufu.System.Logger.Verbose("doufu.Game.BaseObject::Pacer(): Pacer Invoked.");this.Animation.Pacer(oMsg);for(var i=0;i<this.Children.Length();i++)
{var tmpObj=this.Children.Items(i);tmpObj.X=this.X+tmpObj.FollowerOffset.X;tmpObj.Y=this.Y+tmpObj.FollowerOffset.Y;}}
this.Ctor=function()
{this.Handle=doufu.System.Handle.Generate();doufu.System.Logger.Debug("doufu.Game.BaseObject::Ctor(): Attach self to pace controller");doufu.Game.PaceController.Attach(this);}
this.Ctor();}
doufu.Game.Direction=function(iDirectionValue)
{doufu.OOP.Class(this);this.Ctor=function()
{if(typeof iDirectionValue==doufu.System.Constants.TYPE_UNDEFINED)
{iDirectionValue=0;}
if(iDirectionValue<0||iDirectionValue>0x3F)
{throw doufu.System.Exception("iDirection is not a valid format.");}
_xAxis=(iDirectionValue&0x30)>>4;_yAxis=(iDirectionValue&0x0C)>>2;_zAxis=iDirectionValue&0x03;}
var _xAxis;this.NewProperty("XAxis");this.XAxis.Get=function()
{return _xAxis;}
this.NewProperty("X");this.X.Get=function()
{var sign=1;if((this.XAxis()>>1)==1)
{sign=-1;}
return sign*(this.XAxis()%2);}
this.X.Set=function(value)
{if(value>1||value<-1)
{throw doufu.System.Exception("Inputted value should between -1 and 1.");}
_xAxis=value*value|((value<0?1:0)<<1);}
var _yAxis;this.NewProperty("YAxis");this.YAxis.Get=function()
{return _yAxis;}
this.NewProperty("Y");this.Y.Get=function()
{var sign=1;if((this.YAxis()>>1)==1)
{sign=-1;}
return sign*(this.YAxis()%2);}
this.Y.Set=function(value)
{if(value>1||value<-1)
{throw doufu.System.Exception("Inputted value should between -1 and 1.");}
_yAxis=value*value|((value<0?1:0)<<1);}
var _zAxis;this.NewProperty("ZAxis");this.ZAxis.Get=function()
{return _zAxis;}
this.NewProperty("Z");this.Z.Get=function()
{var sign=1;if((this.ZAxis()>>1)==1)
{sign=-1;}
return sign*(this.ZAxis()%2);}
this.Z.Set=function(value)
{if(value>1||value<-1)
{throw doufu.System.Exception("Inputted value should between -1 and 1.");}
_zAxis=value*value|((value<0?1:0)<<1);}
this.toString=function()
{return((_xAxis&0x1)?((_xAxis&0x2)?"Left":"Right"):"")+
((_yAxis&0x1)?((_yAxis&0x2)?"Up":"Down"):"")+
((_zAxis&0x1)?((_zAxis&0x2)?"Ascend":"Descend"):"");}
this.Ctor();}
doufu.Game.PaceController=new function()
{doufu.OOP.Class(this);this.Inherit(doufu.DesignPattern.Attachable,[doufu.Game.BaseObject]);this.Cycle;this.OnPaceControlCompleted=new doufu.Event.EventHandler(this);this.WorkerCallback=new doufu.Event.CallBack(function(oMsg)
{doufu.System.Logger.Verbose("doufu.Game.PaceController::WorkerCallback(): Start calling pacers. Length: "+this.InnerCollection().Length());var i;for(i=0;i<this.InnerCollection().Length();i++)
{this.InnerCollection().Items(i).Pacer.call(this.InnerCollection().Items(i),oMsg);}
this.OnPaceControlCompleted.Invoke();doufu.System.Logger.Verbose("doufu.Game.PaceController::WorkerCallback(): Pacer calling end.");},this);this.Ctor=function()
{this.Cycle=new doufu.Cycling.Cycle(this.WorkerCallback);this.Cycle.Start();}
this.Ctor();}
doufu.Game.Sprites=new Object();doufu.Game.Sprites.Sprite=function()
{doufu.OOP.Class(this);this.Inherit(doufu.Game.BaseObject);var cycleSkip;var stepLength;var frameCounter=0;var isMovingDest=false;var tmpSpeed=new doufu.Game.Sprites.Sprite.Speed();var tmpVector=new doufu.Display.Drawing.Vector();var tmpClearCube=new doufu.Display.Drawing.Cube();var cubeNextStep=new doufu.Display.Drawing.Cube();var cubeDestination=new doufu.Display.Drawing.Cube();this.IsMoving=false;this.EnableCollision=true;this.Direction=new doufu.Game.Direction();this.Sharp=null;this.InRangeSharp=new doufu.Display.Drawing.Drawable();this.OnConfirmMovable=new doufu.Event.EventHandler(this);this.OnTriggerEvent=new doufu.Event.EventHandler(this);this.MoveTo=function(oDirection,iLength)
{if(oDirection==null)
{throw doufu.System.Exception("oDirection should not be null!");}
if(!oDirection.InstanceOf(doufu.Game.Direction))
{throw doufu.System.Exception("oDirection should be a instance of doufu.Game.Direction!");}
var lastConfirmResult=false;cubeNextStep.DeepCopy(tmpClearCube);cubeNextStep.X=this.X+oDirection.X()*iLength;cubeNextStep.Y=this.Y+oDirection.Y()*iLength;cubeNextStep.Z=this.Z+oDirection.Z()*iLength;if(this.Sharp!=null&&this.EnableCollision==true)
{tmpVector.X=oDirection.X()*iLength;tmpVector.Y=oDirection.Y()*iLength;lastConfirmResult=this.OnConfirmMovable.Invoke({Cube:cubeNextStep,Sharp:this.Sharp,Velocity:tmpVector,Direction:oDirection});}
else
{lastConfirmResult=true;}
if(lastConfirmResult==false)
{return;}
this.OnTriggerEvent.Invoke({Cube:this,Who:this});this.X=cubeNextStep.X;this.Y=cubeNextStep.Y;this.Z=cubeNextStep.Z;}
this.MoveToDest=function()
{var drcDest=new doufu.Game.Direction();var x=cubeDestination.X-this.X;var y=cubeDestination.Y-this.Y;var z=cubeDestination.Z-this.Z;var absX=x<0?~x+1:x;var absY=y<0?~y+1:y;var absZ=z<0?~z+1:z;if(absX<stepLength&&absY<stepLength&&z==0)
{this.StopMoving();return false;}
drcDest.X(absX>=stepLength?x/absX:0);drcDest.Y(absY>=stepLength?y/absY:0);drcDest.Z(z/absZ);this.Direction=drcDest;return true;}
this.StartMovingToDest=function(cubeDest,iSpeed)
{cubeDestination.DeepCopy(cubeDest);if(iSpeed!=null)
{doufu.Game.Sprites.Sprite.Speed.CaculateFromInteger(iSpeed,tmpSpeed);cycleSkip=tmpSpeed.CycleSkip;stepLength=tmpSpeed.StepLength;}
if(this.MoveToDest())
{this.IsMoving=true;isMovingDest=true;return true;}
return false;}
this.StartMoving=function(oDirection,iSpeed)
{this.Direction=oDirection;doufu.Game.Sprites.Sprite.Speed.CaculateFromInteger(iSpeed,tmpSpeed);cycleSkip=tmpSpeed.CycleSkip;stepLength=tmpSpeed.StepLength;if(this.IsMoving==false)
{this.IsMoving=true;}}
this.StopMoving=function()
{if(this.IsMoving==true)
{this.IsMoving=false;}
isMovingDest=false;}
var _base_Pacer=this.OverrideMethod("Pacer",function(oMsg)
{if(this.IsMoving)
{frameCounter++;if(frameCounter%(cycleSkip+1)==0)
{this.MoveTo(this.Direction,stepLength);if(isMovingDest)
{this.MoveToDest();}}}
_base_Pacer(oMsg);});}
doufu.Game.Sprites.Sprite.Speed=function(iSpeed)
{doufu.OOP.Class(this);this.CycleSkip;this.StepLength;this.Ctor=function()
{if(typeof iSpeed!=doufu.System.Constants.TYPE_UNDEFINED&&iSpeed!=null)
{var tmpSpeed=doufu.Game.Sprites.Sprite.Speed.CaculateFromInteger(iSpeed);this.CycleSkip=tmpSpeed.CycleSkip;this.StepLength=tmpSpeed.StepLength;delete tmpSpeed;}}
this.Ctor();}
doufu.Game.Sprites.Sprite.Speed.CaculateFromInteger=function(iSpeed,outSpeed)
{var oRet;if(outSpeed==null)
{oRet=new doufu.Game.Sprites.Sprite.Speed();}
else
{oRet=outSpeed;}
oRet.CycleSkip=49-iSpeed%50;oRet.StepLength=Math.floor(iSpeed/50)+1;return oRet;}
doufu.Game.Sprites.FourDirectionSprite=function(oInfoSet)
{doufu.OOP.Class(this);this.Inherit(doufu.Game.Sprites.Sprite);var aniDirection=null;this.AnimationInfos={};var startToPlay=function()
{if(aniDirection.X()==-1&&this.Animation.AnimationInfo!=this.AnimationInfos.MoveLeft)
{this.Animation.Play(this.AnimationInfos.MoveLeft);}
else if(aniDirection.X()==1&&this.Animation.AnimationInfo!=this.AnimationInfos.MoveRight)
{this.Animation.Play(this.AnimationInfos.MoveRight);}
else if(aniDirection.Y()==1&&this.Animation.AnimationInfo!=this.AnimationInfos.MoveDown)
{this.Animation.Play(this.AnimationInfos.MoveDown);}
else if(aniDirection.Y()==-1&&this.Animation.AnimationInfo!=this.AnimationInfos.MoveUp)
{this.Animation.Play(this.AnimationInfos.MoveUp);}}
var _base_MoveToDest=this.OverrideMethod("MoveToDest",function()
{var bRet=_base_MoveToDest();if(aniDirection!=null&&aniDirection.XAxis()!=this.Direction.XAxis()&&aniDirection.YAxis()!=this.Direction.YAxis())
{startToPlay.call(this);}
return bRet;});var _base_StartMoving=this.OverrideMethod("StartMoving",function(oDirection,iSpeed)
{doufu.System.Logger.Verbose("doufu.Game.Sprites.FourDirectionSprite::StartMoving(): Was invoked with following parameters, oDirection = "+oDirection.toString());aniDirection=oDirection;startToPlay.call(this);_base_StartMoving(oDirection,iSpeed);});var _base_StartMovingToDest=this.OverrideMethod("StartMovingToDest",function(cubeDest,iSpeed)
{if(_base_StartMovingToDest(cubeDest,iSpeed))
{aniDirection=this.Direction;if(iSpeed!=null)
{startToPlay.call(this);}
return true;}
return false;});var _base_StopMoving=this.OverrideMethod("StopMoving",function()
{if(this.Direction.X()==-1&&this.AnimationInfos.StopLeft!=null)
{this.Animation.Play(this.AnimationInfos.StopLeft);}
else if(this.Direction.X()==1&&this.AnimationInfos.StopRight!=null)
{this.Animation.Play(this.AnimationInfos.StopRight);}
else if(this.Direction.Y()==1&&this.AnimationInfos.StopDown!=null)
{this.Animation.Play(this.AnimationInfos.StopDown);}
else if(this.Direction.Y()==-1&&this.AnimationInfos.StopUp!=null)
{this.Animation.Play(this.AnimationInfos.StopUp);}
_base_StopMoving();});this.Ctor=function()
{if(oInfoSet!=null)
{if(!oInfoSet.InstanceOf(doufu.Game.Sprites.FourDirectionSprite.InfoSet))
{throw doufu.System.Exception("doufu.Game.Sprites.FourDirectionSprite::Ctor(): oInfoSet must be an instance of doufu.Game.Sprites.FourDirectionSprite.InfoSet.");}
this.ImagePath=oInfoSet.ImagePath;this.ImageOffset=oInfoSet.ImageOffset;this.AnimationInfos=oInfoSet.AnimationInfos;this.Animation.Play(this.AnimationInfos.Init);}}
this.Ctor();}
doufu.Game.Sprites.FourDirectionSprite.InfoSet=function(){doufu.OOP.Class(this);ImagePath="";ImageOffset=new doufu.Display.Drawing.Point();AnimationInfos={Init:new doufu.Game.Animation.Info(),MoveUp:new doufu.Game.Animation.Info(),MoveDown:new doufu.Game.Animation.Info(),MoveLeft:new doufu.Game.Animation.Info(),MoveRight:new doufu.Game.Animation.Info(),StopUp:new doufu.Game.Animation.Info(),StopDown:new doufu.Game.Animation.Info(),StopLeft:new doufu.Game.Animation.Info(),StopRight:new doufu.Game.Animation.Info()}}
doufu.Game.Sprites.IsometricSprite=function(oInfoSet)
{doufu.OOP.Class(this);this.Inherit(doufu.Game.Sprites.Sprite);var aniDirection=null;this.AnimationInfos={};var startToPlay=function()
{if(aniDirection.X()==-1&&aniDirection.Y()==-1&&this.Animation.AnimationInfo!=this.AnimationInfos.MoveLeft)
{this.Animation.Play(this.AnimationInfos.MoveLeft);}
else if(aniDirection.X()==1&&aniDirection.Y()==1&&this.Animation.AnimationInfo!=this.AnimationInfos.MoveRight)
{this.Animation.Play(this.AnimationInfos.MoveRight);}
else if(aniDirection.Y()==1&&aniDirection.X()==-1&&this.Animation.AnimationInfo!=this.AnimationInfos.MoveDown)
{this.Animation.Play(this.AnimationInfos.MoveDown);}
else if(aniDirection.Y()==-1&&aniDirection.X()==1&&this.Animation.AnimationInfo!=this.AnimationInfos.MoveUp)
{this.Animation.Play(this.AnimationInfos.MoveUp);}}
var _base_MoveToDest=this.OverrideMethod("MoveToDest",function()
{var bRet=_base_MoveToDest();if(aniDirection!=null&&aniDirection.XAxis()!=this.Direction.XAxis()&&aniDirection.YAxis()!=this.Direction.YAxis())
{startToPlay.call(this);}
return bRet;});var _base_StartMoving=this.OverrideMethod("StartMoving",function(oDirection,iSpeed)
{doufu.System.Logger.Verbose("doufu.Game.Sprites.FourDirectionSprite::StartMoving(): Was invoked with following parameters, oDirection = "+oDirection.toString());aniDirection=oDirection;startToPlay.call(this);_base_StartMoving(oDirection,iSpeed);});var _base_StartMovingToDest=this.OverrideMethod("StartMovingToDest",function(cubeDest,iSpeed)
{if(_base_StartMovingToDest(cubeDest,iSpeed))
{aniDirection=this.Direction;if(iSpeed!=null)
{startToPlay.call(this);}
return true;}
return false;});var _base_StopMoving=this.OverrideMethod("StopMoving",function()
{if(this.Direction.X()==-1&&this.Direction.Y()==-1&&this.AnimationInfos.StopLeft!=null)
{this.Animation.Play(this.AnimationInfos.StopLeft);}
else if(this.Direction.X()==1&&this.Direction.Y()==1&&this.AnimationInfos.StopRight!=null)
{this.Animation.Play(this.AnimationInfos.StopRight);}
else if(this.Direction.Y()==1&&this.Direction.X()==-1&&this.AnimationInfos.StopDown!=null)
{this.Animation.Play(this.AnimationInfos.StopDown);}
else if(this.Direction.Y()==-1&&this.Direction.X()==1&&this.AnimationInfos.StopUp!=null)
{this.Animation.Play(this.AnimationInfos.StopUp);}
_base_StopMoving();});this.Ctor=function()
{if(oInfoSet!=null)
{if(!oInfoSet.InstanceOf(doufu.Game.Sprites.IsometricSprite.InfoSet))
{throw doufu.System.Exception("doufu.Game.Sprites.IsometricSprite::Ctor(): oInfoSet must be an instance of doufu.Game.Sprites.IsometricSprite.InfoSet.");}
this.ImagePath=oInfoSet.ImagePath;this.ImageOffset=oInfoSet.ImageOffset;this.AnimationInfos=oInfoSet.AnimationInfos;this.Animation.Play(this.AnimationInfos.Init);}}
this.Ctor();}
doufu.Game.Sprites.IsometricSprite.InfoSet=function(){doufu.OOP.Class(this);ImagePath="";ImageOffset=new doufu.Display.Drawing.Point();AnimationInfos={Init:new doufu.Game.Animation.Info(),MoveUp:new doufu.Game.Animation.Info(),MoveDown:new doufu.Game.Animation.Info(),MoveLeft:new doufu.Game.Animation.Info(),MoveRight:new doufu.Game.Animation.Info(),StopUp:new doufu.Game.Animation.Info(),StopDown:new doufu.Game.Animation.Info(),StopLeft:new doufu.Game.Animation.Info(),StopRight:new doufu.Game.Animation.Info()}}
doufu.Game.EventTrigger=function()
{doufu.OOP.Class(this);var monitoredSprites=new doufu.CustomTypes.Collection(doufu.Game.Sprites.Sprite);var activatedForSprites={};var activated=true;this.OnCheckCondition=new doufu.Event.EventHandler(this);this.OnTrigger=new doufu.Event.EventHandler(this);this.Trigger=function(sender,args)
{if(!this.IsActivated())
{return;}
if(!this.IsSpriteActivate(args.Who))
{if(this.AutoReactivate())
{if(this.Where()!=null)
{if(this.Where().Z!=args.Cube.Z||!doufu.Game.Helpers.IsRectangleCollided(args.Cube,this.Where()))
{this.Activate(args.Who);}
else
{return;}}
else
{this.Activate(args.Who);}}
else
{return;}}
if(this.Who().Contain(args.Who))
{var atLeastOne=false;if(this.When()!=null)
{atLeastOne=true;var time=(new Date()).getTime()-this.When().getTime();if(!(time>0&&time<500))
{return;}}
if(this.Where()!=null)
{atLeastOne=true;if(this.Where().Z!=args.Cube.Z||!doufu.Game.Helpers.IsRectangleCollided(args.Cube,this.Where()))
{return;}}
var lastResult=this.OnCheckCondition.Invoke();if(lastResult!=null)
{atLeastOne=true;if(lastResult==false)
{return;}}
if(atLeastOne==true)
{this.OnTrigger.Invoke(args);if(this.AutoReactivate())
{this.Inactivate(args.Who);}
else
{this.Inactivate();}}}}
var triggerCallback=new doufu.Event.CallBack(this.Trigger,this);this.Monitor=function(obj)
{if(obj.InstanceOf(doufu.Game.Sprites.Sprite))
{obj.OnTriggerEvent.Attach(triggerCallback,this);this.Who(obj);}
else if(obj.InstanceOf(doufu.Game.Map))
{}}
this.Activate=function(who)
{if(who!=null)
{activatedForSprites[who.Handle.ID]=true;}
else
{activated=true;}}
this.Inactivate=function(who)
{if(who!=null)
{activatedForSprites[who.Handle.ID]=false;}
else
{activated=false}}
this.IsSpriteActivate=function(who)
{return activatedForSprites[who.Handle.ID];}
this.NewProperty("Who");this.Who.Get=function()
{return monitoredSprites;}
this.Who.Set=function(value)
{if(!monitoredSprites.Contain(value))
{monitoredSprites.Add(value);activatedForSprites[value]=true;}}
var when;this.NewProperty("When");this.When.Get=function()
{return when;}
this.When.Set=function(value)
{when=value;}
var where;this.NewProperty("Where");this.Where.Get=function()
{return where;}
this.Where.Set=function(value)
{where=value;}
this.NewProperty("IsActivated");this.IsActivated.Get=function()
{return activated;}
var autoReactivate=true;this.NewProperty("AutoReactivate");this.AutoReactivate.Get=function()
{return autoReactivate;}
this.AutoReactivate.Set=function(value)
{autoReactivate=value;}}
doufu.Game.Map=function(oPlayGround)
{doufu.OOP.Class(this);var tmpPolygon1=new doufu.Display.Drawing.Polygon();var tmpPolygon2=new doufu.Display.Drawing.Polygon();var tmpRectangle1=new doufu.Display.Drawing.Rectangle();var tmpRectangle2=new doufu.Display.Drawing.Rectangle();var tmpCube=new doufu.Display.Drawing.Cube();var tmpVector1=new doufu.Display.Drawing.Vector();var tmpVector2=new doufu.Display.Drawing.Vector();this.LinkedPlayGround;this.ImagePath;this.NewProperty("BackgroundImagePath");this.BackgroundImagePath.Get=function()
{return this.LinkedPlayGround.LinkedDisplayManager().HTMLElement().style.backgroundImage;}
this.BackgroundImagePath.Set=function(value)
{this.LinkedPlayGround.LinkedDisplayManager().HTMLElement().style.backgroundPosition="0px 0px";this.BackgroundRepeat(false);this.LinkedPlayGround.LinkedDisplayManager().HTMLElement().style.backgroundImage="url(\""+value+"\")";}
this.NewProperty("BackgroundRepeat");this.BackgroundRepeat.Get=function()
{return _backgroundRepeat=false;}
this.BackgroundRepeat.Set=function(value)
{if(value==true)
{this.LinkedPlayGround.LinkedDisplayManager().HTMLElement().style.backgroundRepeat="repeat";}
else
{this.LinkedPlayGround.LinkedDisplayManager().HTMLElement().style.backgroundRepeat="no-repeat";}
_backgroundRepeat=value;}
this.Width;this.Height;this.Sharps=new doufu.CustomTypes.Collection(doufu.Display.Drawing.Polygon);this.UsePointCollision=true;var _camera=new doufu.Game.PlayGround.Camera();this.NewProperty("Camera");this.Camera.Get=function()
{return _camera;}
this.InitSprites=new doufu.CustomTypes.Collection(doufu.Game.Sprites.Sprite);this.ConfirmMovable=function(obj)
{if(obj.Sharp==this.Sharp)
{return true;}
var tmpColideDrawable1,tmpColideDrawable2;if(obj.Sharp.InstanceOf(doufu.Display.Drawing.Rectangle))
{tmpRectangle1.DeepCopy(obj.Sharp);tmpRectangle1.X+=obj.Cube.X;tmpRectangle1.Y+=obj.Cube.Y;tmpColideDrawable1=tmpRectangle1;}
else if(obj.Sharp.InstanceOf(doufu.Display.Drawing.Polygon))
{tmpPolygon1.DeepCopy(obj.Sharp);for(var j=0;i<tmpPolygon1.Length();i++)
{tmpPolygon1.Items(j).X+=obj.Cube.X;tmpPolygon1.Items(j).Y+=obj.Cube.Y;}
tmpColideDrawable1=tmpPolygon1;}
if(this.Sharps.Length()>0)
{for(var k=0;k<this.Sharps.Length();k++)
{if(this.UsePointCollision==true&&obj.Sharp.InstanceOf(doufu.Display.Drawing.Rectangle))
{var x=Math.round(tmpColideDrawable1.Width/2)+tmpColideDrawable1.X;var y=Math.round(tmpColideDrawable1.Height/2)+tmpColideDrawable1.Y;tmpVector1.X=x-obj.Velocity.X;tmpVector1.Y=y-obj.Velocity.Y;tmpVector2.X=obj.Velocity.X+x;tmpVector2.Y=obj.Velocity.Y+y;tmpPolygon1.Clear();tmpPolygon1.Add(tmpVector1);tmpPolygon1.Add(tmpVector2);if(doufu.Game.Helpers.IsCollided(tmpPolygon1,this.Sharps.Items(k),obj.Direction))
{return false;}}
else if(doufu.Game.Helpers.IsCollided(tmpColideDrawable1,this.Sharps.Items(k),obj.Direction))
{return false;}}}
for(var i=0;i<this.LinkedPlayGround.GameObjects().Length();i++)
{if(this.LinkedPlayGround.GameObjects().Items(i).InstanceOf(doufu.Game.Sprites.Sprite)&&this.LinkedPlayGround.GameObjects().Items(i).Sharp!=null)
{if(obj.Sharp!=this.LinkedPlayGround.GameObjects().Items(i).Sharp)
{tmpCube.DeepCopy(this.LinkedPlayGround.GameObjects().Items(i));if(this.LinkedPlayGround.GameObjects().Items(i).Sharp.InstanceOf(doufu.Display.Drawing.Rectangle))
{tmpRectangle2.DeepCopy(this.LinkedPlayGround.GameObjects().Items(i).Sharp);tmpRectangle2.X+=tmpCube.X;tmpRectangle2.Y+=tmpCube.Y;tmpColideDrawable2=tmpRectangle2;}
else if(this.LinkedPlayGround.GameObjects().Items(i).Sharp.InstanceOf(doufu.Display.Drawing.Polygon))
{tmpPolygon2.DeepCopy(this.LinkedPlayGround.GameObjects().Items(i).Sharp);for(var j=0;i<tmpPolygon2.Length();i++)
{tmpPolygon2.Items(j).X+=tmpCube.X;tmpPolygon2.Items(j).Y+=tmpCube.Y;}
tmpColideDrawable2=tmpPolygon2;}
if(tmpCube.Z==obj.Cube.Z&&doufu.Game.Helpers.IsCollided(tmpColideDrawable1,tmpColideDrawable2))
{return false;}}}}
return true;};this.Initialize=function()
{this.LinkedPlayGround.ImagePath=this.ImagePath;this.LinkedPlayGround.Width=this.Width;this.LinkedPlayGround.Height=this.Height;if(this.Camera().X!=0)
{this.LinkedPlayGround.Camera().X=this.Camera().X;}
if(this.Camera().Y!=0)
{this.LinkedPlayGround.Camera().Y=this.Camera().Y;}
if(this.Camera().Width!=0)
{this.LinkedPlayGround.Camera().Width=this.Camera().Width;}
if(this.Camera().Height!=0)
{this.LinkedPlayGround.Camera().Height=this.Camera().Height;}
this.Camera(this.LinkedPlayGround.Camera());for(var i=0;i<this.InitSprites.Length();i++)
{this.LinkedPlayGround.InsertObject(this.InitSprites.Items(i));}}
this.Ctor=function()
{if(oPlayGround==null||!oPlayGround.InstanceOf(doufu.Game.PlayGround))
{throw doufu.System.Exception("doufu.Game.Map::Ctor(): oPlayGround must be an instance of doufu.Game.PlayGround.");}
this.LinkedPlayGround=oPlayGround;this.LinkedPlayGround.CurrentMap(this);}
this.Ctor();}
doufu.SpeechBubbles={};doufu.SpeechBubbles.BaseBubble=function()
{doufu.OOP.Class(this);this.Inherit(doufu.Display.Drawing.Rectangle);this.Style="default";this.StickyTime=7*1000;this.StickyFactor=200;this.BaseTextLength=50;this.MaxWidth=110;this.MinWidth=55;this.NewProperty("Text");this.NewProperty("Width");this.NewProperty("Height");this.GetClassName=function(subfix)
{var mainPrefix="doufu_SpeechBubbles_";return mainPrefix+this.Style+"_"+subfix;}
this.Popup=function(x,y,msg,style)
{}
this.Show=function()
{}
this.Hide=function()
{}}
doufu.SpeechBubbles.GameBubble=function(goContainer)
{doufu.OOP.Class(this);var goBorder=new doufu.Game.BaseObject();var goBorderElmt=goBorder.LinkedDisplayObject().HTMLElement();this.Inherit(doufu.SpeechBubbles.BrowserBubble,[goBorderElmt]);var _base_Popup=this.OverrideMethod("Popup",function(x,y,msg)
{goBorder.IsFollower=false;goBorder.X=x;goBorder.Y=y;_base_Popup(0,0,msg);});this.OverloadMethod("Popup",function(msg)
{goBorder.IsFollower=true;goBorder.FollowerOffset.X=goContainer.Width/2;goBorder.FollowerOffset.Y=-10;this.Popup(0,0,msg);});this.Ctor=function()
{goBorder.Z=2;goContainer.Children.Add(goBorder);}
this.Ctor();}
doufu.SpeechBubbles.BrowserBubble=function(container)
{doufu.OOP.Class(this);this.Inherit(doufu.SpeechBubbles.BaseBubble);var self=this;var elmtContainer;var elmtBorder;var elmtLeftCorner;var elmtRightCorner;var elmtMessageBody;var elmtTextBody;var elmtTipHandler;var stickyTimer;var idDisplaying=false;var firstShow=true;this.NewProperty("HTMLBorder");this.HTMLBorder.Get=function()
{return elmtBorder.Native();}
var _base_GetClassName=this.OverrideMethod("GetClassName",function(subfix)
{var privatePrefix="doufu_SpeechBubbles_BrowserBubble_";return _base_GetClassName(subfix)+" "+privatePrefix+this.Style+"_"+subfix;});this.Text.Get=function()
{return elmtTextBody.Native().innerHTML;}
this.Text.Set=function(value)
{elmtTextBody.Native().innerHTML=value;}
this.Width.Get=function()
{return elmtBorder.Native().clientWidth;}
this.Width.Set=function(value)
{elmtBorder.Native().style.width=value+"px";}
this.Height.Get=function()
{return elmtBorder.Native().clientHeight;}
this.Height.Set=function(value)
{elmtBorder.Native().style.height=value+"px";}
var _base_Popup=this.OverrideMethod("Popup",function(x,y,msg)
{this.Text(msg);elmtBorder.Native().style.left=x+"px";elmtBorder.Native().style.top=y+"px";this.Show();if(this.StickyTime!=0)
{var stickyTime=this.StickyTime;if(msg.length>this.BaseTextLength)
{stickyTime=msg.length*this.StickyFactor;}
if(idDisplaying==true&&stickyTimer!=null)
{clearInterval(stickyTimer);}
stickyTimer=setInterval(this.Hide,stickyTime);idDisplaying=true;}
_base_Popup(x,y,msg);});var _base_Show=this.OverrideMethod("Show",function()
{elmtBorder.NoWrap(true);elmtBorder.Native().style.display="block";elmtBorder.Native().style.width="auto";if(firstShow)
{elmtBorder.Opacity(10);firstShow=false;}
var actualWidth=elmtBorder.Native().offsetWidth;if(actualWidth>this.MaxWidth)
{elmtBorder.NoWrap(false);elmtBorder.Native().style.width=this.MaxWidth+"px";}
else if(actualWidth<this.MinWidth)
{elmtBorder.NoWrap(false);elmtBorder.Native().style.width=this.MinWidth+"px";}
else
{elmtBorder.Native().style.width="auto";}
elmtBorder.Native().style.left=(elmtBorder.Native().offsetLeft-elmtTipHandler.Native().offsetLeft-Math.floor(elmtTipHandler.Native().offsetWidth/2))+"px";elmtBorder.Native().style.top=(elmtBorder.Native().offsetTop-elmtBorder.Native().offsetHeight)+"px";elmtBorder.Effects.FadeIn(3);});var _base_Hide=this.OverrideMethod("Hide",function()
{clearInterval(stickyTimer);elmtBorder.Effects.FadeOut(2);});this.Ctor=function()
{elmtContainer=new doufu.Browser.Element(container);elmtBorder=doufu.Browser.DOM.CreateElement("div");elmtBorder.Native().className=this.GetClassName("border");elmtBorder.Native().style.position="absolute";elmtBorder.Effects.OnFadeOut.Attach(new doufu.Event.CallBack(function()
{elmtBorder.Native().style.display="none";},this));elmtLeftCorner=doufu.Browser.DOM.CreateElement("div");elmtLeftCorner.Native().className=this.GetClassName("leftCorner");elmtRightCorner=doufu.Browser.DOM.CreateElement("div");elmtRightCorner.Native().className=this.GetClassName("rightCorner");elmtMessageBody=doufu.Browser.DOM.CreateElement("div");elmtMessageBody.Native().className=this.GetClassName("messageBody");elmtTextBody=doufu.Browser.DOM.CreateElement("div");elmtTextBody.Native().className=this.GetClassName("textBody");elmtTipHandler=doufu.Browser.DOM.CreateElement("div");elmtTipHandler.Native().className=this.GetClassName("tipHandler");elmtMessageBody.AppendChild(elmtTextBody);elmtBorder.AppendChild(elmtLeftCorner);elmtBorder.AppendChild(elmtMessageBody);elmtBorder.AppendChild(elmtRightCorner);elmtBorder.AppendChild(elmtTipHandler);elmtBorder.Native().style.display="none";this.Hide();elmtContainer.AppendChild(elmtBorder);}
this.Ctor();}
doufu.Http={}
doufu.Http.CreateTimeStamp=function()
{return(new Date()).getTime();}
doufu.Http.AddParameterToUrl=function(sUrl,sParameterName,sValue)
{if(sUrl.lastIndexOf("?")+1==sUrl.length)
{sUrl=sUrl+sValue;}
else if(sUrl.lastIndexOf("?")!=-1)
{sUrl=sUrl+"&"+sParameterName+"="+sValue;}
else
{sUrl=sUrl+"?"+sParameterName+"="+sValue;}
return sUrl;}
doufu.Http.AddStampToUrl=function(sUrl)
{return doufu.Http.AddParameterToUrl(sUrl,"DoufuUrlTimeStamp",doufu.Http.CreateTimeStamp());}
doufu.Http.Request=function()
{doufu.OOP.Class(this);var nativeRequest;var _disableCache=true;var _timeout;this.OnSuccess=new doufu.Event.EventHandler(this);this.OnFail=new doufu.Event.EventHandler(this);this.OnOpened=new doufu.Event.EventHandler(this);this.OnSend=new doufu.Event.EventHandler(this);this.NewProperty("NativeRequest");this.NativeRequest.Get=function()
{return nativeRequest;}
this.NewProperty("Timeout");this.Timeout.Get=function()
{return _timeout;}
this.Timeout.Set=function(value)
{_timeout=value;}
this.NewProperty("DisableCache");this.DisableCache.Get=function()
{return _disableCache;}
this.DisableCache.Set=function(value)
{_disableCache=value;}
this.NewProperty("ResponseText");this.ResponseText.Get=function()
{return nativeRequest.responseText;}
this.NewProperty("ResponseXML");this.ResponseXML.Get=function()
{return nativeRequest.responseXML;}
var GetNativeRequestObj=function()
{if(window.XMLHttpRequest)
{nativeRequest=new XMLHttpRequest();}
else if(window.ActiveXObject)
{try
{nativeRequest=new ActiveXObject("Msxml2.XMLHTTP");}
catch(e)
{try
{nativeRequest=new ActiveXObject("Microsoft.XMLHTTP");}
catch(e)
{}}}
if(!nativeRequest)
{alert('native XmlhttpRequest object could not be created. This may caused by not using a modern browser.');return false;}
return true;}
this.SetRequestHeader=function(sName,sValue)
{nativeRequest.setRequestHeader(sName,sValue);}
this.GetResponseHeader=function(sName)
{return nativeRequest.getResponseHeader(sName);}
this.GetAllResponseHeaders=function()
{return nativeRequest.getAllResponseHeaders();}
this.Open=function(sMethod,sUrl,bAsync,sUser,sPassword)
{var sActualUrl=sUrl;if(this.DisableCache()&&sMethod=="GET")
{sActualUrl=doufu.Http.AddStampToUrl(sUrl);}
nativeRequest.open(sMethod,sActualUrl,bAsync,sUser,sPassword);if(!(doufu.Browser.BrowserDetect.Browser==doufu.Browser.BrowserDetect.BrowserEnum.Explorer&&doufu.Browser.BrowserDetect.Version<=6))
{nativeRequest.timeout=_timeout;}
this.OnOpened.Invoke();}
this.Abort=function()
{nativeRequest.abort();}
this.Close=function()
{this.Abort();delete nativeRequest;}
this.Send=function(sPostBody)
{var sActualBody="";if(String.isString(sPostBody))
{sActualBody=sPostBody;}
else
{var bFirstParam=true;for(var o in sPostBody)
{if(!bFirstParam)
{sActualBody+='&';}
sActualBody+=o;sActualBody+="=";if(String.isString(sPostBody[o]))
{sActualBody+=sPostBody[o];}
else
{sActualBody+=doufu.Http.JSON.Stringify(sPostBody[o]);}
bFirstParam=false;}
this.SetRequestHeader("Content-Type","application/x-www-form-urlencoded");}
this.OnSend.Invoke();nativeRequest.send(sActualBody);}
this.Ctor=function()
{if(!GetNativeRequestObj())
{throw doufu.System.Exception("doufu.Http.Request::Ctor() - Could not create native xmlhttprequest.");}
this.Timeout(50000);this.OnSend.Attach(new doufu.Event.CallBack(function(sender,args)
{var self=this;setTimeout(function()
{self.Abort();},this.Timeout());},this));var self=this;nativeRequest.onreadystatechange=function()
{if(nativeRequest.readyState==4)
{if(nativeRequest.status==200||nativeRequest.status==0)
{self.OnSuccess.Invoke({Native:nativeRequest,ResponseXML:nativeRequest.responseXML,ResponseText:nativeRequest.responseText});}
else
{self.OnFail.Invoke({Native:nativeRequest,ResponseXML:nativeRequest.responseXML,ResponseText:nativeRequest.responseText});}}}}
this.Ctor();}
doufu.Http.Comet=function()
{doufu.OOP.Class(this);this.Inherit(doufu.Http.Request);var bCheckResponse=false;this.ResponseCheckInterval=1000;this.OnMessageArrive=new doufu.Event.EventHandler(this);var checkResponse=function()
{if(bCheckResponse)
{setTimeout(checkResponse,this.ResponseCheckInterval);}}
var _base_Close=this.OverrideMethod("Close",function()
{bCheckResponse=false;_base_Close.call(this);});var _base_Send=this.OverrideMethod("Send",function()
{_base_Send.call(this);bCheckResponse=true;checkResponse();});}
doufu.Http.JSON=function()
{doufu.OOP.Class(this);this.Inherit(doufu.System.Handle.Handlable);this.Handle=doufu.System.Handle.Generate();var CONTAINER_ID='doufu_Http_JSON_Container';var _url;var _callbackParameterName;var sGCallbackFunc;var timerCancel;this.ReadyState=0;this.NewProperty("Url");this.Url.Get=function()
{return _url;}
this.NewProperty("CallbackParameterName");this.CallbackParameterName.Get=function()
{return _callbackParameterName;}
var script;this.NewProperty("ScriptElement");this.ScriptElement.Get=function()
{return script;}
var timeout=60*1000;this.NewProperty("Timeout");this.Timeout.Get=function()
{return timeout;}
this.Timeout.Set=function(value)
{timeout=value;}
var responseJSON;this.NewProperty("ResponseJSON");this.ResponseJSON.Get=function()
{return responseJSON;}
this.ResponseJSON.Set=function(value)
{responseJSON=value;}
this.NewProperty("ResponseText");this.ResponseText.Get=function()
{return this.ScriptElement().innerHTML;}
this.OnSuccess=new doufu.Event.EventHandler(this);this.OnCancel=new doufu.Event.EventHandler(this);this.Open=function(sUrl,sCallbackParameterName)
{if(this.ReadyState==0||this.ReadyState==5)
{_url=sUrl;_callbackParameterName=sCallbackParameterName;sGCallbackFunc=doufu.Http.JSON.CallbackManager.Register(this);this.ReadyState=1;}
else
{throw doufu.System.Exception("Failed to open json request.");}}
this.Send=function(data)
{if(this.ReadyState!=1)
{throw doufu.System.Exception('doufu.Http.JSON::Send() - Conneciton was not opened.');}
this.ReadyState=2;var sActualData="";if(String.isString(data))
{sActualData=data;}
else
{var bFirstParam=true;for(var o in data)
{if(!bFirstParam)
{sActualData+='&';}
sActualData+=o;sActualData+="=";if(String.isString(data[o]))
{sActualData+=data[o];}
else
{sActualData+=doufu.Http.JSON.Stringify(data[o]);}
bFirstParam=false;}}
if(_callbackParameterName!=null)
{var container=document.getElementById(CONTAINER_ID);if(!container)
{container=document.createElement('div');container.setAttribute('id',CONTAINER_ID);document.body.appendChild(container);}
var tmpUrl=doufu.Http.AddStampToUrl(doufu.Http.AddParameterToUrl(this.Url(),_callbackParameterName,sGCallbackFunc));doufu.System.Logger.Verbose("doufu.Http.JSON::Send(): Actual url is "+tmpUrl);if(sActualData!=null)
{tmpUrl=tmpUrl+"&"+encodeURI(sActualData);}
script=document.createElement('script');script.setAttribute("defer","defer");script.setAttribute("id",CONTAINER_ID+"_script_"+this.Handle.ID)
script.setAttribute("type","text/javascript");script.setAttribute("charset","utf-8");script.src=tmpUrl;container.appendChild(script);}
else
{var rq=new doufu.Http.Request();rq.OnSuccess.Attach(new doufu.Event.CallBack(function(sender,args)
{this.OnSuccess.Invoke({"ResponseJSON":doufu.Http.JSON.Parse(args.ResponseText)});},this));rq.Open('GET',this.Url(),true);rq.Send(data);}
if(this.ReadyState<4)
{this.ReadyState=3;}
if(this.Timeout()>0)
{timerCancel=setTimeout(doufu.OOP._callBacker(function(){if(this.ReadyState==3)
{sGCallbackFunc=doufu.Http.JSON.CallbackManager.Unregister(this);this.ReadyState=5;this.OnCancel.Invoke();}},this),this.Timeout());}}
this.Dispose=function()
{this.Close();container=null;script=null
delete container;delete script}
this.Close=function()
{if(_callbackParameterName!=null)
{doufu.Http.JSON.CallbackManager.Unregister(this);}
if(this.ReadyState==2)
{var self=this;doufu.System.Logger.Error("doufu.Http.JSON::Close(): ReadyState = 2; Please report this error to homyu.shinn@gmail.com .");setTimeout(function()
{this.Close.call(self);},500);}
var container=document.getElementById(CONTAINER_ID);if(doufu.Browser.BrowserDetect.Browser==doufu.Browser.BrowserDetect.BrowserEnum.Explorer&&doufu.Browser.BrowserDetect.Version<8)
{var myScript=script;var paramName=_callbackParameterName;setTimeout(function()
{if(container!=null&&paramName!=null)
{container.removeChild(myScript);}},5000);}
else
{if(container!=null&&_callbackParameterName!=null)
{container.removeChild(script);}}
this.ReadyState=5;}
this.Ctor=function()
{this.OnSuccess.Attach(new doufu.Event.CallBack(function()
{try
{clearTimeout(timerCancel);}
catch(ex)
{doufu.System.Logger.Error("doufu.Http.JSON::Ctor(): Clear timeout error: "+ex.toString()+ex.message);}
if(this.ReadyState!=5)
{this.ReadyState=4;}},this));}
this.Ctor();};doufu.Http.JSON.Parse=function(sJSONStr)
{var tmpobj=null;if(doufu.Browser.BrowserDetect.Browser==doufu.Browser.BrowserDetect.BrowserEnum.Explorer&&doufu.Browser.BrowserDetect.Version>=8)
{tmpobj=JSON.parse(sJSONStr);}
else
{eval("tmpobj = "+sJSONStr);}
return tmpobj;}
doufu.Http.JSON.Stringify=function(oJSON)
{if(doufu.Browser.BrowserDetect.Browser==doufu.Browser.BrowserDetect.BrowserEnum.Explorer&&doufu.Browser.BrowserDetect.Version>=8)
{return JSON.stringify(oJSON);}
else
{return oJSON.toString();}}
doufu.Http.JSON.CallbackManager=new function()
{doufu.OOP.Class(this);this.Callbacks={};this.Register=function(oJSONRequst)
{if(!oJSONRequst.InstanceOf(doufu.Http.JSON))
{throw doufu.System.Exception("doufu.Http.JSON.CallbackManager::Register() - The object specified was not a json request object.");}
this.Callbacks[oJSONRequst.Handle.ID]=function(oJData)
{if(oJSONRequst.ReadyState==2||oJSONRequst.ReadyState==3)
{oJSONRequst.OnSuccess.Invoke({"ResponseJSON":oJData,"ResponseText":doufu.Http.JSON.Stringify(oJData)});oJSONRequst.ResponseJSON(oJData);}
else
{doufu.System.Logger.Error(String.format("doufu.Http.JSON.CallbackManager:Register(): request handle id = {0}; ready state = {1}",oJSONRequst.Handle.ID,oJSONRequst.ReadyState));}}
return"doufu.Http.JSON.CallbackManager.Callbacks["+oJSONRequst.Handle.ID+"]";}
this.Unregister=function(oJSONRequst)
{if(!oJSONRequst.InstanceOf(doufu.Http.JSON))
{throw doufu.System.Exception("doufu.Http.JSON.CallbackManager::Unregister() - The object specified was not a json request object.");}
this.Callbacks[oJSONRequst.Handle.ID]=null;}}
doufu.Keyboard={};doufu.Keyboard.Key=function(sKey)
{doufu.OOP.Class(this);this.IsKeyDown=false;this.OnKeyDown=new doufu.Event.EventHandler(this);this.OnKeyUp=new doufu.Event.EventHandler(this);this.Dispose=function()
{g.Dispose();}
this.Ctor=function()
{var re=/[a-zA-Z]/;if(sKey.length!=1||!re.test(sKey))
{throw doufu.System.Exception("Key: "+sKey+"was not supported.");return false;}
var g=new doufu.Browser.Element(doufu.Browser.BrowserDetect.Browser==doufu.Browser.BrowserDetect.BrowserEnum.Explorer?document.body:window);var releaseKey=function()
{var statusChanged=false;if(this.IsKeyDown)
{statusChanged=true;}
this.IsKeyDown=false;this.OnKeyUp.Invoke({StatusChanged:statusChanged});}
g.OnKeyUp.Attach(new doufu.Event.CallBack(function(sender,args)
{if(args.keyCode==sKey.toUpperCase().charCodeAt())
{releaseKey.call(this);}},this));g.OnBlur.Attach(new doufu.Event.CallBack(releaseKey,this));g.OnKeyDown.Attach(new doufu.Event.CallBack(function(sender,args)
{if(args.keyCode==sKey.toUpperCase().charCodeAt())
{var statusChanged=false;if(!this.IsKeyDown)
{statusChanged=true;}
this.IsKeyDown=true;this.OnKeyDown.Invoke({StatusChanged:statusChanged});}},this));}
this.Ctor();}
; 
doufu.__version = "0.0.0.2"; 
