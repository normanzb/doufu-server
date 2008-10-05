//CHKBuild Start 
/*  Prototype JavaScript framework, version 1.4.0
 *  (c) 2005 Sam Stephenson <sam@conio.net>
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://prototype.conio.net/
 *
/*--------------------------------------------------------------------------*/

var Prototype = {
  Version: '1.4.0',
  ScriptFragment: '(?:<script.*?>)((\n|\r|.)*?)(?:<\/script>)',

  emptyFunction: function() {},
  K: function(x) {return x}
}

var Class = {
  create: function() {
    return function() {
      this.initialize.apply(this, arguments);
    }
  }
}

var Abstract = new Object();

Object.extend = function(destination, source) {
  for (property in source) {
    destination[property] = source[property];
  }
  return destination;
}

Object.inspect = function(object) {
  try {
    if (object == undefined) return 'undefined';
    if (object == null) return 'null';
    return object.inspect ? object.inspect() : object.toString();
  } catch (e) {
    if (e instanceof RangeError) return '...';
    throw e;
  }
}

Function.prototype.bind = function() {
  var __method = this, args = $A(arguments), object = args.shift();
  return function() {
    return __method.apply(object, args.concat($A(arguments)));
  }
}

Function.prototype.bindAsEventListener = function(object) {
  var __method = this;
  return function(event) {
    return __method.call(object, event || window.event);
  }
}

Object.extend(Number.prototype, {
  toColorPart: function() {
    var digits = this.toString(16);
    if (this < 16) return '0' + digits;
    return digits;
  },

  succ: function() {
    return this + 1;
  },

  times: function(iterator) {
    $R(0, this, true).each(iterator);
    return this;
  }
});

var Try = {
  these: function() {
    var returnValue;

    for (var i = 0; i < arguments.length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) {}
    }

    return returnValue;
  }
}

/*--------------------------------------------------------------------------*/

var PeriodicalExecuter = Class.create();
PeriodicalExecuter.prototype = {
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

  registerCallback: function() {
    setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.callback();
      } finally {
        this.currentlyExecuting = false;
      }
    }
  }
}

/*--------------------------------------------------------------------------*/

function $() {
  var elements = new Array();

  for (var i = 0; i < arguments.length; i++) {
    var element = arguments[i];
    if (typeof element == 'string')
      element = document.getElementById(element);

    if (arguments.length == 1)
      return element;

    elements.push(element);
  }

  return elements;
}
Object.extend(String.prototype, {
  stripTags: function() {
    return this.replace(/<\/?[^>]+>/gi, '');
  },

  stripScripts: function() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  },

  extractScripts: function() {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img');
    var matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  },

  evalScripts: function() {
    return this.extractScripts().map(eval);
  },

  escapeHTML: function() {
    var div = document.createElement('div');
    var text = document.createTextNode(this);
    div.appendChild(text);
    return div.innerHTML;
  },

  unescapeHTML: function() {
    var div = document.createElement('div');
    div.innerHTML = this.stripTags();
    return div.childNodes[0] ? div.childNodes[0].nodeValue : '';
  },

  toQueryParams: function() {
    var pairs = this.match(/^\??(.*)$/)[1].split('&');
    return pairs.inject({}, function(params, pairString) {
      var pair = pairString.split('=');
      params[pair[0]] = pair[1];
      return params;
    });
  },

  toArray: function() {
    return this.split('');
  },

  camelize: function() {
    var oStringList = this.split('-');
    if (oStringList.length == 1) return oStringList[0];

    var camelizedString = this.indexOf('-') == 0
      ? oStringList[0].charAt(0).toUpperCase() + oStringList[0].substring(1)
      : oStringList[0];

    for (var i = 1, len = oStringList.length; i < len; i++) {
      var s = oStringList[i];
      camelizedString += s.charAt(0).toUpperCase() + s.substring(1);
    }

    return camelizedString;
  },

  inspect: function() {
    return "'" + this.replace('\\', '\\\\').replace("'", '\\\'') + "'";
  }
});

String.prototype.parseQuery = String.prototype.toQueryParams;

var $break    = new Object();
var $continue = new Object();

var Enumerable = {
  each: function(iterator) {
    var index = 0;
    try {
      this._each(function(value) {
        try {
          iterator(value, index++);
        } catch (e) {
          if (e != $continue) throw e;
        }
      });
    } catch (e) {
      if (e != $break) throw e;
    }
  },

  all: function(iterator) {
    var result = true;
    this.each(function(value, index) {
      result = result && !!(iterator || Prototype.K)(value, index);
      if (!result) throw $break;
    });
    return result;
  },

  any: function(iterator) {
    var result = true;
    this.each(function(value, index) {
      if (result = !!(iterator || Prototype.K)(value, index))
        throw $break;
    });
    return result;
  },

  collect: function(iterator) {
    var results = [];
    this.each(function(value, index) {
      results.push(iterator(value, index));
    });
    return results;
  },

  detect: function (iterator) {
    var result;
    this.each(function(value, index) {
      if (iterator(value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  },

  findAll: function(iterator) {
    var results = [];
    this.each(function(value, index) {
      if (iterator(value, index))
        results.push(value);
    });
    return results;
  },

  grep: function(pattern, iterator) {
    var results = [];
    this.each(function(value, index) {
      var stringValue = value.toString();
      if (stringValue.match(pattern))
        results.push((iterator || Prototype.K)(value, index));
    })
    return results;
  },

  include: function(object) {
    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  },

  inject: function(memo, iterator) {
    this.each(function(value, index) {
      memo = iterator(memo, value, index);
    });
    return memo;
  },

  invoke: function(method) {
    var args = $A(arguments).slice(1);
    return this.collect(function(value) {
      return value[method].apply(value, args);
    });
  },

  max: function(iterator) {
    var result;
    this.each(function(value, index) {
      value = (iterator || Prototype.K)(value, index);
      if (value >= (result || value))
        result = value;
    });
    return result;
  },

  min: function(iterator) {
    var result;
    this.each(function(value, index) {
      value = (iterator || Prototype.K)(value, index);
      if (value <= (result || value))
        result = value;
    });
    return result;
  },

  partition: function(iterator) {
    var trues = [], falses = [];
    this.each(function(value, index) {
      ((iterator || Prototype.K)(value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  },

  pluck: function(property) {
    var results = [];
    this.each(function(value, index) {
      results.push(value[property]);
    });
    return results;
  },

  reject: function(iterator) {
    var results = [];
    this.each(function(value, index) {
      if (!iterator(value, index))
        results.push(value);
    });
    return results;
  },

  sortBy: function(iterator) {
    return this.collect(function(value, index) {
      return {value: value, criteria: iterator(value, index)};
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  },

  toArray: function() {
    return this.collect(Prototype.K);
  },

  zip: function() {
    var iterator = Prototype.K, args = $A(arguments);
    if (typeof args.last() == 'function')
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      iterator(value = collections.pluck(index));
      return value;
    });
  },

  inspect: function() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }
}

Object.extend(Enumerable, {
  map:     Enumerable.collect,
  find:    Enumerable.detect,
  select:  Enumerable.findAll,
  member:  Enumerable.include,
  entries: Enumerable.toArray
});
var $A = Array.from = function(iterable) {
  if (!iterable) return [];
  if (iterable.toArray) {
    return iterable.toArray();
  } else {
    var results = [];
    for (var i = 0; i < iterable.length; i++)
      results.push(iterable[i]);
    return results;
  }
}

Object.extend(Array.prototype, Enumerable);

Array.prototype._reverse = Array.prototype.reverse;

Object.extend(Array.prototype, {
  _each: function(iterator) {
    for (var i = 0; i < this.length; i++)
      iterator(this[i]);
  },

  clear: function() {
    this.length = 0;
    return this;
  },

  first: function() {
    return this[0];
  },

  last: function() {
    return this[this.length - 1];
  },

  compact: function() {
    return this.select(function(value) {
      return value != undefined || value != null;
    });
  },

  flatten: function() {
    return this.inject([], function(array, value) {
      return array.concat(value.constructor == Array ?
        value.flatten() : [value]);
    });
  },

  without: function() {
    var values = $A(arguments);
    return this.select(function(value) {
      return !values.include(value);
    });
  },

  indexOf: function(object) {
    for (var i = 0; i < this.length; i++)
      if (this[i] == object) return i;
    return -1;
  },

  reverse: function(inline) {
    return (inline !== false ? this : this.toArray())._reverse();
  },

  shift: function() {
    var result = this[0];
    for (var i = 0; i < this.length - 1; i++)
      this[i] = this[i + 1];
    this.length--;
    return result;
  },

  inspect: function() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  }
});
var Hash = {
  _each: function(iterator) {
    for (key in this) {
      var value = this[key];
      if (typeof value == 'function') continue;

      var pair = [key, value];
      pair.key = key;
      pair.value = value;
      iterator(pair);
    }
  },

  keys: function() {
    return this.pluck('key');
  },

  values: function() {
    return this.pluck('value');
  },

  merge: function(hash) {
    return $H(hash).inject($H(this), function(mergedHash, pair) {
      mergedHash[pair.key] = pair.value;
      return mergedHash;
    });
  },

  toQueryString: function() {
    return this.map(function(pair) {
      return pair.map(encodeURIComponent).join('=');
    }).join('&');
  },

  inspect: function() {
    return '#<Hash:{' + this.map(function(pair) {
      return pair.map(Object.inspect).join(': ');
    }).join(', ') + '}>';
  }
}

function $H(object) {
  var hash = Object.extend({}, object || {});
  Object.extend(hash, Enumerable);
  Object.extend(hash, Hash);
  return hash;
}
ObjectRange = Class.create();
Object.extend(ObjectRange.prototype, Enumerable);
Object.extend(ObjectRange.prototype, {
  initialize: function(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  },

  _each: function(iterator) {
    var value = this.start;
    do {
      iterator(value);
      value = value.succ();
    } while (this.include(value));
  },

  include: function(value) {
    if (value < this.start)
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }
});

var $R = function(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
}

var Ajax = {
  getTransport: function() {
    return Try.these(
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')},
      function() {return new XMLHttpRequest()}
    ) || false;
  },

  activeRequestCount: 0
}

Ajax.Responders = {
  responders: [],

  _each: function(iterator) {
    this.responders._each(iterator);
  },

  register: function(responderToAdd) {
    if (!this.include(responderToAdd))
      this.responders.push(responderToAdd);
  },

  unregister: function(responderToRemove) {
    this.responders = this.responders.without(responderToRemove);
  },

  dispatch: function(callback, request, transport, json) {
    this.each(function(responder) {
      if (responder[callback] && typeof responder[callback] == 'function') {
        try {
          responder[callback].apply(responder, [request, transport, json]);
        } catch (e) {}
      }
    });
  }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
  onCreate: function() {
    Ajax.activeRequestCount++;
  },

  onComplete: function() {
    Ajax.activeRequestCount--;
  }
});

Ajax.Base = function() {};
Ajax.Base.prototype = {
  setOptions: function(options) {
    this.options = {
      method:       'post',
      asynchronous: true,
      parameters:   ''
    }
    Object.extend(this.options, options || {});
  },

  responseIsSuccess: function() {
    return this.transport.status == undefined
        || this.transport.status == 0
        || (this.transport.status >= 200 && this.transport.status < 300);
  },

  responseIsFailure: function() {
    return !this.responseIsSuccess();
  }
}

Ajax.Request = Class.create();
Ajax.Request.Events =
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];

Ajax.Request.prototype = Object.extend(new Ajax.Base(), {
  initialize: function(url, options) {
    this.transport = Ajax.getTransport();
    this.setOptions(options);
    this.request(url);
  },

  request: function(url) {
    var parameters = this.options.parameters || '';
    if (parameters.length > 0) parameters += '&_=';

    try {
      this.url = url;
      if (this.options.method == 'get' && parameters.length > 0)
        this.url += (this.url.match(/\?/) ? '&' : '?') + parameters;

      Ajax.Responders.dispatch('onCreate', this, this.transport);

      this.transport.open(this.options.method, this.url,
        this.options.asynchronous);

      if (this.options.asynchronous) {
        this.transport.onreadystatechange = this.onStateChange.bind(this);
        setTimeout((function() {this.respondToReadyState(1)}).bind(this), 10);
      }

      this.setRequestHeaders();

      var body = this.options.postBody ? this.options.postBody : parameters;
      this.transport.send(this.options.method == 'post' ? body : null);

    } catch (e) {
      this.dispatchException(e);
    }
  },

  setRequestHeaders: function() {
    var requestHeaders =
      ['X-Requested-With', 'XMLHttpRequest',
       'X-Prototype-Version', Prototype.Version];

    if (this.options.method == 'post') {
      requestHeaders.push('Content-type',
        'application/x-www-form-urlencoded');

      /* Force "Connection: close" for Mozilla browsers to work around
       * a bug where XMLHttpReqeuest sends an incorrect Content-length
       * header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType)
        requestHeaders.push('Connection', 'close');
    }

    if (this.options.requestHeaders)
      requestHeaders.push.apply(requestHeaders, this.options.requestHeaders);

    for (var i = 0; i < requestHeaders.length; i += 2)
      this.transport.setRequestHeader(requestHeaders[i], requestHeaders[i+1]);
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState != 1)
      this.respondToReadyState(this.transport.readyState);
  },

  header: function(name) {
    try {
      return this.transport.getResponseHeader(name);
    } catch (e) {}
  },

  evalJSON: function() {
    try {
      return eval(this.header('X-JSON'));
    } catch (e) {}
  },

  evalResponse: function() {
    try {
      return eval(this.transport.responseText);
    } catch (e) {
      this.dispatchException(e);
    }
  },

  respondToReadyState: function(readyState) {
    var event = Ajax.Request.Events[readyState];
    var transport = this.transport, json = this.evalJSON();

    if (event == 'Complete') {
      try {
        (this.options['on' + this.transport.status]
         || this.options['on' + (this.responseIsSuccess() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(transport, json);
      } catch (e) {
        this.dispatchException(e);
      }

      if ((this.header('Content-type') || '').match(/^text\/javascript/i))
        this.evalResponse();
    }

    try {
      (this.options['on' + event] || Prototype.emptyFunction)(transport, json);
      Ajax.Responders.dispatch('on' + event, this, transport, json);
    } catch (e) {
      this.dispatchException(e);
    }

    /* Avoid memory leak in MSIE: clean up the oncomplete event handler */
    if (event == 'Complete')
      this.transport.onreadystatechange = Prototype.emptyFunction;
  },

  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

Ajax.Updater = Class.create();

Object.extend(Object.extend(Ajax.Updater.prototype, Ajax.Request.prototype), {
  initialize: function(container, url, options) {
    this.containers = {
      success: container.success ? $(container.success) : $(container),
      failure: container.failure ? $(container.failure) :
        (container.success ? null : $(container))
    }

    this.transport = Ajax.getTransport();
    this.setOptions(options);

    var onComplete = this.options.onComplete || Prototype.emptyFunction;
    this.options.onComplete = (function(transport, object) {
      this.updateContent();
      onComplete(transport, object);
    }).bind(this);

    this.request(url);
  },

  updateContent: function() {
    var receiver = this.responseIsSuccess() ?
      this.containers.success : this.containers.failure;
    var response = this.transport.responseText;

    if (!this.options.evalScripts)
      response = response.stripScripts();

    if (receiver) {
      if (this.options.insertion) {
        new this.options.insertion(receiver, response);
      } else {
        Element.update(receiver, response);
      }
    }

    if (this.responseIsSuccess()) {
      if (this.onComplete)
        setTimeout(this.onComplete.bind(this), 10);
    }
  }
});

Ajax.PeriodicalUpdater = Class.create();
Ajax.PeriodicalUpdater.prototype = Object.extend(new Ajax.Base(), {
  initialize: function(container, url, options) {
    this.setOptions(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = {};
    this.container = container;
    this.url = url;

    this.start();
  },

  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  stop: function() {
    this.updater.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(request) {
    if (this.options.decay) {
      this.decay = (request.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = request.responseText;
    }
    this.timer = setTimeout(this.onTimerEvent.bind(this),
      this.decay * this.frequency * 1000);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});
document.getElementsByClassName = function(className, parentElement) {
  var children = ($(parentElement) || document.body).getElementsByTagName('*');
  return $A(children).inject([], function(elements, child) {
    if (child.className.match(new RegExp("(^|\\s)" + className + "(\\s|$)")))
      elements.push(child);
    return elements;
  });
}

/*--------------------------------------------------------------------------*/

if (!window.Element) {
  var Element = new Object();
}

Object.extend(Element, {
  visible: function(element) {
    return $(element).style.display != 'none';
  },

  toggle: function() {
    for (var i = 0; i < arguments.length; i++) {
      var element = $(arguments[i]);
      Element[Element.visible(element) ? 'hide' : 'show'](element);
    }
  },

  hide: function() {
    for (var i = 0; i < arguments.length; i++) {
      var element = $(arguments[i]);
      element.style.display = 'none';
    }
  },

  show: function() {
    for (var i = 0; i < arguments.length; i++) {
      var element = $(arguments[i]);
      element.style.display = '';
    }
  },

  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
  },

  update: function(element, html) {
    $(element).innerHTML = html.stripScripts();
    setTimeout(function() {html.evalScripts()}, 10);
  },

  getHeight: function(element) {
    element = $(element);
    return element.offsetHeight;
  },

  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    return Element.classNames(element).include(className);
  },

  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    return Element.classNames(element).add(className);
  },

  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    return Element.classNames(element).remove(className);
  },

  // removes whitespace-only text node children
  cleanWhitespace: function(element) {
    element = $(element);
    for (var i = 0; i < element.childNodes.length; i++) {
      var node = element.childNodes[i];
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        Element.remove(node);
    }
  },

  empty: function(element) {
    return $(element).innerHTML.match(/^\s*$/);
  },

  scrollTo: function(element) {
    element = $(element);
    var x = element.x ? element.x : element.offsetLeft,
        y = element.y ? element.y : element.offsetTop;
    window.scrollTo(x, y);
  },

  getStyle: function(element, style) {
    element = $(element);
    var value = element.style[style.camelize()];
    if (!value) {
      if (document.defaultView && document.defaultView.getComputedStyle) {
        var css = document.defaultView.getComputedStyle(element, null);
        value = css ? css.getPropertyValue(style) : null;
      } else if (element.currentStyle) {
        value = element.currentStyle[style.camelize()];
      }
    }

    if (window.opera && ['left', 'top', 'right', 'bottom'].include(style))
      if (Element.getStyle(element, 'position') == 'static') value = 'auto';

    return value == 'auto' ? null : value;
  },

  setStyle: function(element, style) {
    element = $(element);
    for (name in style)
      element.style[name.camelize()] = style[name];
  },

  getDimensions: function(element) {
    element = $(element);
    if (Element.getStyle(element, 'display') != 'none')
      return {width: element.offsetWidth, height: element.offsetHeight};

    // All *Width and *Height properties give 0 on elements with display none,
    // so enable the element temporarily
    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = '';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = 'none';
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
  },

  makePositioned: function(element) {
    element = $(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';
      // Opera returns the offset relative to the positioning context, when an
      // element is position relative but top and left have not been defined
      if (window.opera) {
        element.style.top = 0;
        element.style.left = 0;
      }
    }
  },

  undoPositioned: function(element) {
    element = $(element);
    if (element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position =
        element.style.top =
        element.style.left =
        element.style.bottom =
        element.style.right = '';
    }
  },

  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return;
    element._overflow = element.style.overflow;
    if ((Element.getStyle(element, 'overflow') || 'visible') != 'hidden')
      element.style.overflow = 'hidden';
  },

  undoClipping: function(element) {
    element = $(element);
    if (element._overflow) return;
    element.style.overflow = element._overflow;
    element._overflow = undefined;
  }
});

var Toggle = new Object();
Toggle.display = Element.toggle;

/*--------------------------------------------------------------------------*/

Abstract.Insertion = function(adjacency) {
  this.adjacency = adjacency;
}

Abstract.Insertion.prototype = {
  initialize: function(element, content) {
    this.element = $(element);
    this.content = content.stripScripts();

    if (this.adjacency && this.element.insertAdjacentHTML) {
      try {
        this.element.insertAdjacentHTML(this.adjacency, this.content);
      } catch (e) {
        if (this.element.tagName.toLowerCase() == 'tbody') {
          this.insertContent(this.contentFromAnonymousTable());
        } else {
          throw e;
        }
      }
    } else {
      this.range = this.element.ownerDocument.createRange();
      if (this.initializeRange) this.initializeRange();
      this.insertContent([this.range.createContextualFragment(this.content)]);
    }

    setTimeout(function() {content.evalScripts()}, 10);
  },

  contentFromAnonymousTable: function() {
    var div = document.createElement('div');
    div.innerHTML = '<table><tbody>' + this.content + '</tbody></table>';
    return $A(div.childNodes[0].childNodes[0].childNodes);
  }
}

var Insertion = new Object();

Insertion.Before = Class.create();
Insertion.Before.prototype = Object.extend(new Abstract.Insertion('beforeBegin'), {
  initializeRange: function() {
    this.range.setStartBefore(this.element);
  },

  insertContent: function(fragments) {
    fragments.each((function(fragment) {
      this.element.parentNode.insertBefore(fragment, this.element);
    }).bind(this));
  }
});

Insertion.Top = Class.create();
Insertion.Top.prototype = Object.extend(new Abstract.Insertion('afterBegin'), {
  initializeRange: function() {
    this.range.selectNodeContents(this.element);
    this.range.collapse(true);
  },

  insertContent: function(fragments) {
    fragments.reverse(false).each((function(fragment) {
      this.element.insertBefore(fragment, this.element.firstChild);
    }).bind(this));
  }
});

Insertion.Bottom = Class.create();
Insertion.Bottom.prototype = Object.extend(new Abstract.Insertion('beforeEnd'), {
  initializeRange: function() {
    this.range.selectNodeContents(this.element);
    this.range.collapse(this.element);
  },

  insertContent: function(fragments) {
    fragments.each((function(fragment) {
      this.element.appendChild(fragment);
    }).bind(this));
  }
});

Insertion.After = Class.create();
Insertion.After.prototype = Object.extend(new Abstract.Insertion('afterEnd'), {
  initializeRange: function() {
    this.range.setStartAfter(this.element);
  },

  insertContent: function(fragments) {
    fragments.each((function(fragment) {
      this.element.parentNode.insertBefore(fragment,
        this.element.nextSibling);
    }).bind(this));
  }
});

/*--------------------------------------------------------------------------*/

Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize: function(element) {
    this.element = $(element);
  },

  _each: function(iterator) {
    this.element.className.split(/\s+/).select(function(name) {
      return name.length > 0;
    })._each(iterator);
  },

  set: function(className) {
    this.element.className = className;
  },

  add: function(classNameToAdd) {
    if (this.include(classNameToAdd)) return;
    this.set(this.toArray().concat(classNameToAdd).join(' '));
  },

  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set(this.select(function(className) {
      return className != classNameToRemove;
    }).join(' '));
  },

  toString: function() {
    return this.toArray().join(' ');
  }
}

Object.extend(Element.ClassNames.prototype, Enumerable);
var Field = {
  clear: function() {
    for (var i = 0; i < arguments.length; i++)
      $(arguments[i]).value = '';
  },

  focus: function(element) {
    $(element).focus();
  },

  present: function() {
    for (var i = 0; i < arguments.length; i++)
      if ($(arguments[i]).value == '') return false;
    return true;
  },

  select: function(element) {
    $(element).select();
  },

  activate: function(element) {
    element = $(element);
    element.focus();
    if (element.select)
      element.select();
  }
}

/*--------------------------------------------------------------------------*/

var Form = {
  serialize: function(form) {
    var elements = Form.getElements($(form));
    var queryComponents = new Array();

    for (var i = 0; i < elements.length; i++) {
      var queryComponent = Form.Element.serialize(elements[i]);
      if (queryComponent)
        queryComponents.push(queryComponent);
    }

    return queryComponents.join('&');
  },

  getElements: function(form) {
    form = $(form);
    var elements = new Array();

    for (tagName in Form.Element.Serializers) {
      var tagElements = form.getElementsByTagName(tagName);
      for (var j = 0; j < tagElements.length; j++)
        elements.push(tagElements[j]);
    }
    return elements;
  },

  getInputs: function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name)
      return inputs;

    var matchingInputs = new Array();
    for (var i = 0; i < inputs.length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) ||
          (name && input.name != name))
        continue;
      matchingInputs.push(input);
    }

    return matchingInputs;
  },

  disable: function(form) {
    var elements = Form.getElements(form);
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      element.blur();
      element.disabled = 'true';
    }
  },

  enable: function(form) {
    var elements = Form.getElements(form);
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      element.disabled = '';
    }
  },

  findFirstElement: function(form) {
    return Form.getElements(form).find(function(element) {
      return element.type != 'hidden' && !element.disabled &&
        ['input', 'select', 'textarea'].include(element.tagName.toLowerCase());
    });
  },

  focusFirstElement: function(form) {
    Field.activate(Form.findFirstElement(form));
  },

  reset: function(form) {
    $(form).reset();
  }
}

Form.Element = {
  serialize: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    var parameter = Form.Element.Serializers[method](element);

    if (parameter) {
      var key = encodeURIComponent(parameter[0]);
      if (key.length == 0) return;

      if (parameter[1].constructor != Array)
        parameter[1] = [parameter[1]];

      return parameter[1].map(function(value) {
        return key + '=' + encodeURIComponent(value);
      }).join('&');
    }
  },

  getValue: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    var parameter = Form.Element.Serializers[method](element);

    if (parameter)
      return parameter[1];
  }
}

Form.Element.Serializers = {
  input: function(element) {
    switch (element.type.toLowerCase()) {
      case 'submit':
      case 'hidden':
      case 'password':
      case 'text':
        return Form.Element.Serializers.textarea(element);
      case 'checkbox':
      case 'radio':
        return Form.Element.Serializers.inputSelector(element);
    }
    return false;
  },

  inputSelector: function(element) {
    if (element.checked)
      return [element.name, element.value];
  },

  textarea: function(element) {
    return [element.name, element.value];
  },

  select: function(element) {
    return Form.Element.Serializers[element.type == 'select-one' ?
      'selectOne' : 'selectMany'](element);
  },

  selectOne: function(element) {
    var value = '', opt, index = element.selectedIndex;
    if (index >= 0) {
      opt = element.options[index];
      value = opt.value;
      if (!value && !('value' in opt))
        value = opt.text;
    }
    return [element.name, value];
  },

  selectMany: function(element) {
    var value = new Array();
    for (var i = 0; i < element.length; i++) {
      var opt = element.options[i];
      if (opt.selected) {
        var optValue = opt.value;
        if (!optValue && !('value' in opt))
          optValue = opt.text;
        value.push(optValue);
      }
    }
    return [element.name, value];
  }
}

/*--------------------------------------------------------------------------*/

var $F = Form.Element.getValue;

/*--------------------------------------------------------------------------*/

Abstract.TimedObserver = function() {}
Abstract.TimedObserver.prototype = {
  initialize: function(element, frequency, callback) {
    this.frequency = frequency;
    this.element   = $(element);
    this.callback  = callback;

    this.lastValue = this.getValue();
    this.registerCallback();
  },

  registerCallback: function() {
    setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  onTimerEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  }
}

Form.Element.Observer = Class.create();
Form.Element.Observer.prototype = Object.extend(new Abstract.TimedObserver(), {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.Observer = Class.create();
Form.Observer.prototype = Object.extend(new Abstract.TimedObserver(), {
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = function() {}
Abstract.EventObserver.prototype = {
  initialize: function(element, callback) {
    this.element  = $(element);
    this.callback = callback;

    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == 'form')
      this.registerFormCallbacks();
    else
      this.registerCallback(this.element);
  },

  onElementEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  },

  registerFormCallbacks: function() {
    var elements = Form.getElements(this.element);
    for (var i = 0; i < elements.length; i++)
      this.registerCallback(elements[i]);
  },

  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        case 'password':
        case 'text':
        case 'textarea':
        case 'select-one':
        case 'select-multiple':
          Event.observe(element, 'change', this.onElementEvent.bind(this));
          break;
      }
    }
  }
}

Form.Element.EventObserver = Class.create();
Form.Element.EventObserver.prototype = Object.extend(new Abstract.EventObserver(), {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.EventObserver = Class.create();
Form.EventObserver.prototype = Object.extend(new Abstract.EventObserver(), {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
if (!window.Event) {
  var Event = new Object();
}

Object.extend(Event, {
  KEY_BACKSPACE: 8,
  KEY_TAB:       9,
  KEY_RETURN:   13,
  KEY_ESC:      27,
  KEY_LEFT:     37,
  KEY_UP:       38,
  KEY_RIGHT:    39,
  KEY_DOWN:     40,
  KEY_DELETE:   46,

  element: function(event) {
    return event.target || event.srcElement;
  },

  isLeftClick: function(event) {
    return (((event.which) && (event.which == 1)) ||
            ((event.button) && (event.button == 1)));
  },

  pointerX: function(event) {
    return event.pageX || (event.clientX +
      (document.documentElement.scrollLeft || document.body.scrollLeft));
  },

  pointerY: function(event) {
    return event.pageY || (event.clientY +
      (document.documentElement.scrollTop || document.body.scrollTop));
  },

  stop: function(event) {
    if (event.preventDefault) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.returnValue = false;
      event.cancelBubble = true;
    }
  },

  // find the first node with the given tagName, starting from the
  // node the event was triggered on; traverses the DOM upwards
  findElement: function(event, tagName) {
    var element = Event.element(event);
    while (element.parentNode && (!element.tagName ||
        (element.tagName.toUpperCase() != tagName.toUpperCase())))
      element = element.parentNode;
    return element;
  },

  observers: false,

  _observeAndCache: function(element, name, observer, useCapture) {
    if (!this.observers) this.observers = [];
    if (element.addEventListener) {
      this.observers.push([element, name, observer, useCapture]);
      element.addEventListener(name, observer, useCapture);
    } else if (element.attachEvent) {
      this.observers.push([element, name, observer, useCapture]);
      element.attachEvent('on' + name, observer);
    }
  },

  unloadCache: function() {
    if (!Event.observers) return;
    for (var i = 0; i < Event.observers.length; i++) {
      Event.stopObserving.apply(this, Event.observers[i]);
      Event.observers[i][0] = null;
    }
    Event.observers = false;
  },

  observe: function(element, name, observer, useCapture) {
    var element = $(element);
    useCapture = useCapture || false;

    if (name == 'keypress' &&
        (navigator.appVersion.match(/Konqueror|Safari|KHTML/)
        || element.attachEvent))
      name = 'keydown';

    this._observeAndCache(element, name, observer, useCapture);
  },

  stopObserving: function(element, name, observer, useCapture) {
    var element = $(element);
    useCapture = useCapture || false;

    if (name == 'keypress' &&
        (navigator.appVersion.match(/Konqueror|Safari|KHTML/)
        || element.detachEvent))
      name = 'keydown';

    if (element.removeEventListener) {
      element.removeEventListener(name, observer, useCapture);
    } else if (element.detachEvent) {
      element.detachEvent('on' + name, observer);
    }
  }
});

/* prevent memory leaks in IE */
Event.observe(window, 'unload', Event.unloadCache, false);
var Position = {
  // set to true if needed, warning: firefox performance problems
  // NOT neeeded for page scrolling, only if draggable contained in
  // scrollable elements
  includeScrollOffsets: false,

  // must be called before calling withinIncludingScrolloffset, every time the
  // page is scrolled
  prepare: function() {
    this.deltaX =  window.pageXOffset
                || document.documentElement.scrollLeft
                || document.body.scrollLeft
                || 0;
    this.deltaY =  window.pageYOffset
                || document.documentElement.scrollTop
                || document.body.scrollTop
                || 0;
  },

  realOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode;
    } while (element);
    return [valueL, valueT];
  },

  cumulativeOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    return [valueL, valueT];
  },

  positionedOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        p = Element.getStyle(element, 'position');
        if (p == 'relative' || p == 'absolute') break;
      }
    } while (element);
    return [valueL, valueT];
  },

  offsetParent: function(element) {
    if (element.offsetParent) return element.offsetParent;
    if (element == document.body) return element;

    while ((element = element.parentNode) && element != document.body)
      if (Element.getStyle(element, 'position') != 'static')
        return element;

    return document.body;
  },

  // caches x/y coordinate pair to use with overlap
  within: function(element, x, y) {
    if (this.includeScrollOffsets)
      return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = this.cumulativeOffset(element);

    return (y >= this.offset[1] &&
            y <  this.offset[1] + element.offsetHeight &&
            x >= this.offset[0] &&
            x <  this.offset[0] + element.offsetWidth);
  },

  withinIncludingScrolloffsets: function(element, x, y) {
    var offsetcache = this.realOffset(element);

    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = this.cumulativeOffset(element);

    return (this.ycomp >= this.offset[1] &&
            this.ycomp <  this.offset[1] + element.offsetHeight &&
            this.xcomp >= this.offset[0] &&
            this.xcomp <  this.offset[0] + element.offsetWidth);
  },

  // within must be called directly before
  overlap: function(mode, element) {
    if (!mode) return 0;
    if (mode == 'vertical')
      return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
        element.offsetHeight;
    if (mode == 'horizontal')
      return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
        element.offsetWidth;
  },

  clone: function(source, target) {
    source = $(source);
    target = $(target);
    target.style.position = 'absolute';
    var offsets = this.cumulativeOffset(source);
    target.style.top    = offsets[1] + 'px';
    target.style.left   = offsets[0] + 'px';
    target.style.width  = source.offsetWidth + 'px';
    target.style.height = source.offsetHeight + 'px';
  },

  page: function(forElement) {
    var valueT = 0, valueL = 0;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;

      // Safari fix
      if (element.offsetParent==document.body)
        if (Element.getStyle(element,'position')=='absolute') break;

    } while (element = element.offsetParent);

    element = forElement;
    do {
      valueT -= element.scrollTop  || 0;
      valueL -= element.scrollLeft || 0;
    } while (element = element.parentNode);

    return [valueL, valueT];
  },

  clone: function(source, target) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || {})

    // find page position of source
    source = $(source);
    var p = Position.page(source);

    // find coordinate system to use
    target = $(target);
    var delta = [0, 0];
    var parent = null;
    // delta [0,0] will do fine with position: fixed elements,
    // position:absolute needs offsetParent deltas
    if (Element.getStyle(target,'position') == 'absolute') {
      parent = Position.offsetParent(target);
      delta = Position.page(parent);
    }

    // correct by body offsets (fixes Safari)
    if (parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop;
    }

    // set position
    if(options.setLeft)   target.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if(options.setTop)    target.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
    if(options.setWidth)  target.style.width = source.offsetWidth + 'px';
    if(options.setHeight) target.style.height = source.offsetHeight + 'px';
  },

  absolutize: function(element) {
    element = $(element);
    if (element.style.position == 'absolute') return;
    Position.prepare();

    var offsets = Position.positionedOffset(element);
    var top     = offsets[1];
    var left    = offsets[0];
    var width   = element.clientWidth;
    var height  = element.clientHeight;

    element._originalLeft   = left - parseFloat(element.style.left  || 0);
    element._originalTop    = top  - parseFloat(element.style.top || 0);
    element._originalWidth  = element.style.width;
    element._originalHeight = element.style.height;

    element.style.position = 'absolute';
    element.style.top    = top + 'px';;
    element.style.left   = left + 'px';;
    element.style.width  = width + 'px';;
    element.style.height = height + 'px';;
  },

  relativize: function(element) {
    element = $(element);
    if (element.style.position == 'relative') return;
    Position.prepare();

    element.style.position = 'relative';
    var top  = parseFloat(element.style.top  || 0) - (element._originalTop || 0);
    var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);

    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.height = element._originalHeight;
    element.style.width  = element._originalWidth;
  }
}

// Safari returns margins on body which is incorrect if the child is absolutely
// positioned.  For performance reasons, redefine Position.cumulativeOffset for
// KHTML/WebKit only.
if (/Konqueror|Safari|KHTML/.test(navigator.userAgent)) {
  Position.cumulativeOffset = function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == document.body)
        if (Element.getStyle(element, 'position') == 'absolute') break;

      element = element.offsetParent;
    } while (element);

    return [valueL, valueT];
  }
}/*

Requires: Prototype Javascript library (http://prototype.conio.net/)

Copyright (c) 2005 Corey Johnson (probablyCorey@gmail.com) 

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// ------------
// Custom Event
// ------------

CustomEvent = Class.create()
CustomEvent.prototype = {
  initialize : function() {
  	this.listeners = []
  },

	addListener : function(method) {
		this.listeners.push(method)
	},

	removeListener : function(method) {
		var foundIndexes = this._findListenerIndexes(method)

		for(var i = 0; i < foundIndexes.length; i++) {
			this.listeners.splice(foundIndexes[i], 1)
		}
	},

	dispatch : function(handler) {
		for(var i = 0; i < this.listeners.length; i++) {
			try {
				this.listeners[i](handler)
			}
			catch (e) {
				alert("Could not run the listener " + this.listeners[i] + ". " + e)
			}
		}
	},

	// Private Methods
	// ---------------
	_findListenerIndexes : function(method) {
		var indexes = []
		for(var i = 0; i < this.listeners.length; i++) {			
			if (this.listeners[i] == method) {
				indexes.push(i)
			}
		}

		return indexes
	}
}

// ------
// Cookie
// ------

var Cookie = {
	set : function(name, value, expirationInDays, path) {
		var cookie = escape(name) + "=" + escape(value)

		if (expirationInDays) {
			var date = new Date()
			date.setDate(date.getDate() + expirationInDays)
			cookie += "; expires=" + date.toGMTString()
		} 

		if (path) {
			cookie += ";path=" + path
		}

		document.cookie = cookie

		if (value && (expirationInDays == undefined || expirationInDays > 0) && !this.get(name)) {
			Logger.error("Cookie (" + name + ") was not set correctly... The value was " + value.toString().length + " charachters long (This may be over the cookie limit)");
		}
	},

	get : function(name) {
		var pattern = "(^|;)\\s*" + escape(name) + "=([^;]+)"

		var m = document.cookie.match(pattern)
		if (m && m[2]) {			
			return unescape(m[2])
		}
		else return null
	},

	getAll : function() {
		var cookies = document.cookie.split(';')
		var cookieArray = []				

		for (var i = 0; i < cookies.length; i++) {			
			try {
				var name = unescape(cookies[i].match(/^\s*([^=]+)/m)[1])
				var value = unescape(cookies[i].match(/=(.*$)/m)[1])
			}
			catch (e) {
				continue
			}

			cookieArray.push({name : name, value : value})

			if (cookieArray[name] != undefined) {
				Logger.waring("Trying to retrieve cookie named(" + name + "). There appears to be another property with this name though.");
			}			

			cookieArray[name] = value
		}

		return cookieArray
	},

	clear : function(name) {
		this.set(name, "", -1)
	},

	clearAll : function() {
		var cookies = this.getAll()

		for(var i = 0; i < cookies.length; i++) {
			this.clear(cookies[i].name)
		}

	}
}   

// ------
// Logger
// -----        

Logger = {
	logEntries : [],

	onupdate : new CustomEvent(),
	onclear : new CustomEvent(),
    

	// Logger output    
  log : function(message, tag) {
	  var logEntry = new LogEntry(message, tag || "info")//1:10 2006-6-7 by norman
		this.logEntries.push(logEntry)
		this.onupdate.dispatch(logEntry)
	},

	info : function(message) {
		this.log(message, 'info')
	}, 

	debug : function(message) {
		this.log(message, 'debug')
	},  

	warn : function(message) {
	  this.log(message, 'warning')
	},

	error : function(message, error) {
	  this.log(message + ": \n" + error, 'error')
	},

	clear : function () {
		this.logEntries = []
		this.onclear.dispatch()
	}
}  

LogEntry = Class.create()
LogEntry.prototype = {  
    initialize : function(message, tag) {
      this.message = message
      this.tag = tag
    }
}

LogConsole = Class.create()
LogConsole.prototype = {  

  // Properties
  // ----------
  commandHistory : [],
  commandIndex : 0,

  // Methods
  // -------

  initialize : function() {
    this.outputCount = 0
    this.tagPattern = Cookie.get('tagPattern') || ".*"
  
  	// I hate writing javascript in HTML... but what's a better alternative
    this.logElement = document.createElement('div')
    document.body.appendChild(this.logElement)
    Element.hide(this.logElement)

		this.logElement.style.position = "absolute"
    this.logElement.style.left = '0px'
    this.logElement.style.width = '100%'

    this.logElement.style.textAlign = "left"
    this.logElement.style.fontFamily = "lucida console"
    this.logElement.style.fontSize = "100%"
    this.logElement.style.backgroundColor = 'darkgray'      
    this.logElement.style.opacity = 0.9 
    this.logElement.style.zIndex = 2000 

    // Add toolbarElement
    this.toolbarElement = document.createElement('div')
    this.logElement.appendChild(this.toolbarElement)     
    this.toolbarElement.style.padding = "0 0 0 2px"

    // Add buttons        
    this.buttonsContainerElement = document.createElement('span')
    this.toolbarElement.appendChild(this.buttonsContainerElement) 

    this.buttonsContainerElement.innerHTML += '<button onclick="logConsole.toggle()" style="float:right;color:black">close</button>'
    this.buttonsContainerElement.innerHTML += '<button onclick="Logger.clear()" style="float:right;color:black">clear</button>'        


		//Add Tag Filter
		this.tagFilterContainerElement = document.createElement('span')
    this.toolbarElement.appendChild(this.tagFilterContainerElement) 
    this.tagFilterContainerElement.style.cssFloat = 'left'
    this.tagFilterContainerElement.appendChild(document.createTextNode("Log Filter"))
    
    this.tagFilterElement = document.createElement('input')
    this.tagFilterContainerElement.appendChild(this.tagFilterElement)  
    this.tagFilterElement.style.width = '200px'                    
    this.tagFilterElement.value = this.tagPattern    
    this.tagFilterElement.setAttribute('autocomplete', 'off') // So Firefox doesn't flip out
    
    Event.observe(this.tagFilterElement, 'keyup', this.updateTags.bind(this))
    Event.observe(this.tagFilterElement, 'click', function() {this.tagFilterElement.select()}.bind(this))    
    
    // Add outputElement
    this.outputElement = document.createElement('div')
    this.logElement.appendChild(this.outputElement)  
    this.outputElement.style.overflow = "auto"              
    this.outputElement.style.clear = "both"
    this.outputElement.style.height = "200px"
    this.outputElement.style.backgroundColor = 'black' 
          
    this.inputContainerElement = document.createElement('div')
    this.inputContainerElement.style.width = "100%"
    this.logElement.appendChild(this.inputContainerElement)      
    
    this.inputElement = document.createElement('input')
    this.inputContainerElement.appendChild(this.inputElement)  
    this.inputElement.style.width = '100%'                    
    this.inputElement.style.borderWidth = '0px' // Inputs with 100% width always seem to be too large (I HATE THEM) they only work if the border, margin and padding are 0
    this.inputElement.style.margin = '0px'
    this.inputElement.style.padding = '0px'
    this.inputElement.value = 'Type command here' 
    this.inputElement.setAttribute('autocomplete', 'off') // So Firefox doesn't flip out

    Event.observe(this.inputElement, 'keyup', this.handleInput.bind(this))
    Event.observe(this.inputElement, 'click', function() {this.inputElement.select()}.bind(this))    

		window.setInterval(this.repositionWindow.bind(this), 500)
		this.repositionWindow()
		
    // Listen to the logger....
    Logger.onupdate.addListener(this.logUpdate.bind(this))
    Logger.onclear.addListener(this.clear.bind(this))		

    // Preload log element with the log entries that have been entered
		for (var i = 0; i < Logger.logEntries.length; i++) {
  		this.logUpdate(Logger.logEntries[i])
  	}   
  	
  	// Feed all errors into the logger (For some unknown reason I can only get this to work
  	// with an inline event declaration)
  	Event.observe(window, 'error', function(msg, url, lineNumber) {Logger.error("Error in (" + (url || location) + ") on line "+lineNumber+"", msg)})

    // Allow acess key link          
    var accessElement = document.createElement('span')
    accessElement.innerHTML = '<button style="position:absolute;top:-100px" onclick="javascript:logConsole.toggle()" accesskey="~"></button>' //Change access key from d to ~
  	document.body.appendChild(accessElement)

  	if (Cookie.get('ConsoleVisible') == 'true') {
		  this.toggle()
		}
	},

	toggle : function() {
	  if (this.logElement.style.display == 'none') {
		  this.show()
		}
		else {
			this.hide()
		}
	}, 
	
	show : function() {
	  Element.show(this.logElement)
	  this.outputElement.scrollTop = this.outputElement.scrollHeight // Scroll to bottom when toggled
	  Cookie.set('ConsoleVisible', 'true')
 	  this.inputElement.select()
	}, 
	
	hide : function() {
	  Element.hide(this.logElement)
	  Cookie.set('ConsoleVisible', 'false')
	},  
	
	output : function(message, style) {
			// If we are at the bottom of the window, then keep scrolling with the output			
			var shouldScroll = (this.outputElement.scrollTop + (2 * this.outputElement.clientHeight)) >= this.outputElement.scrollHeight
	
			this.outputCount++
	  	style = (style ? style += ';' : '')	  	
	  	style += 'padding:1px;margin:0 0 5px 0'	     
		  
		  if (this.outputCount % 2 == 0) style += ";background-color:#101010"
	  	
	  	message = message || "undefined"
	  	message = message.toString().escapeHTML()
	  	
	  	this.outputElement.innerHTML += "<pre style='" + style + "'>" + message + "</pre>"
	  	
	  	if (shouldScroll) {				
				this.outputElement.scrollTop = this.outputElement.scrollHeight
			}
	},
	
	updateTags : function() {
		var pattern = this.tagFilterElement.value
	
		if (this.tagPattern == pattern) return

		try {
			new RegExp(pattern)
		}
		catch (e) {
			return
		}
		
		this.tagPattern = pattern
		Cookie.set('tagPattern', this.tagPattern)

		this.outputElement.innerHTML = ""
		
		// Go through each log entry again
		this.outputCount = 0;
		for (var i = 0; i < Logger.logEntries.length; i++) {
  		this.logUpdate(Logger.logEntries[i])
  	}  
	},
	
	repositionWindow : function() {
		var offset = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop
		var pageHeight = self.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
		this.logElement.style.top = (offset + pageHeight - Element.getHeight(this.logElement)) + "px"
	},

	// Event Handlers
	// --------------

	logUpdate : function(logEntry) {
		if (logEntry.tag.search(new RegExp(this.tagPattern, 'igm')) == -1) return
		var style = ''
	  if (logEntry.tag.search(/error/) != -1) style += 'color:red'
	  else if (logEntry.tag.search(/warning/) != -1) style += 'color:orange'
	  else if (logEntry.tag.search(/debug/) != -1) style += 'color:green'
 	  else if (logEntry.tag.search(/info/) != -1) style += 'color:white'
	  else style += 'color:yellow'

		this.output(logEntry.message, style)
	},

	clear : function(e) {
		this.outputElement.innerHTML = ""
	},

	handleInput : function(e) {
		if (e.keyCode == Event.KEY_RETURN ) {      
	  	var command = this.inputElement.value
	  	
	  	switch(command) {
	    	case "clear":
	      		Logger.clear()  
	      		break
		    	
	    	default:        
	      	var consoleOutput = "" 
	      	
	      	try {
	        	consoleOutput = eval(this.inputElement.value)	        	
	      	}
	      	catch (e) {  
	        	Logger.error("Problem parsing input <" + command + ">", e)	        	
	        	break
					}
					
					Logger.log(consoleOutput)	      	
	      	break
			}        
	
	  	if (this.inputElement.value != "" && this.inputElement.value != this.commandHistory[0]) {
	    	this.commandHistory.unshift(this.inputElement.value)
	  	}
	  
	  	this.commandIndex = 0 
	  	this.inputElement.value = ""                                                        
		}
    else if (e.keyCode == Event.KEY_UP && this.commandHistory.length > 0) {
    	this.inputElement.value = this.commandHistory[this.commandIndex]

			if (this.commandIndex < this.commandHistory.length - 1) {
      	this.commandIndex += 1
      }
    }     
    else if (e.keyCode == Event.KEY_DOWN && this.commandHistory.length > 0) {
    	if (this.commandIndex > 0) {                                      
      	this.commandIndex -= 1
	    }                       

			this.inputElement.value = this.commandHistory[this.commandIndex]
	  } 
 		else {
    		this.commandIndex = 0
    }
	}
}         

// Load the Console when the window loads
Event.observe(window, "load", function() {logConsole = new LogConsole()}) 

// -------------------------
// Helper Functions And Junk
// -------------------------
function inspect(element, hideProperties, hideMethods) {
	var properties = []
	var methods = [] 
	
	element = $(element)

	for(var internal in element) {
		try {
			if (element[internal] instanceof Function) {
				if (!hideMethods) methods.push(internal + ":\t" + element[internal] )
			}
			else {
				if (!hideProperties) properties.push(internal + ":\t" + element[internal] )
			}
		}
		catch (e) {
			Logger.error("Excetion thrown while inspecting object.", e)
		}
	}

	properties.sort()
	methods.sort()

	var internals = properties.concat(methods)
	var output = ""
	for (var i = 0; i < internals.length; i++) {
		output += (internals[i] + "\n")
	}
		
	return output
}   

Array.prototype.contains = function(object) {
	for(var i = 0; i < this.length; i++) {
		if (object == this[i]) return true
	}

	return false
}  

// Helper Alias for simple logging
var puts = function() {return Logger.log(arguments[0], arguments[1])}      
/*
	namespace: doufu
	
	The root namespace of doufu game developing framework.
*/
var doufu = new Object();

/*
	namespace: doufu.OOP
	A object-orentied programming helper namespace.
*/
doufu.OOP = new Object();

/*
   Function: doufu.OOP._callBacker

   Create and return a callback function which run specified function under specified context.

   Parameters:

      _m - The function to be ran.
      _c - The context.

   Returns:

      A new function which will run specified function and pass all its arguments to the specified function.

*/
doufu.OOP._callBacker=function(_m,_c){
	var method = _m;
	var context = _c;
	return function(){
		return method.apply(context,arguments);
	}
}

/*
	Function: doufu.OOP.Class

	Making current javascript function as a doufu class.

	Parameters:

      oContext - The instance of current class.
      
	Sample:
	
		oopClass = function()
		{
			doufu.OOP.Class(this);
		}
		
		new oopClass();

*/
doufu.OOP.Class = function(oContext)
{
	if (typeof oContext.__nsc__OOP_IsClass == typeof undefined)
	{
		oContext.__nsc__OOP_IsClass = true;
		doufu.OOP.Inherit(oContext, doufu.OOP._baseClassFunctions,  [oContext]);
	}
}

/*
	Function: doufu.OOP.Inherit

	Inherit a doufu class from the other.
	
	Parameters:
		obj - Specify the derived class.
		baseClass - Specify the base class.
		args - A object array which containing the arguments which required by base class constructor.

*/
doufu.OOP.Inherit = function(obj,baseClass,args)
{
	
	// Check if the baseClass already in the inheritance stacks
	var oCurr = obj;
	while (oCurr.__nsc_OOP_Inherit_Stack != null)
	{
		// If already existed in stack, exit;
		if (oCurr.__nsc_OOP_Inherit_Stack.Ref == baseClass)
		{
			return;
		}
		oCurr = oCurr.__nsc_OOP_Inherit_Stack;
	}
	
	/* 
		Function: OverrideMethod
		
		Override a method which in super/base class.
		
		Parameters:
			methodName - The method name which in base class.
			fn - A new method which will replace the old method.
		
		Sample:
			BaseClassA = function()
			{
				doufu.OOP.Class(this);
				this.SayHello = function()
				{
					return "Hello world!";
				}
				this.InvokeSay = function()
				{
					alert(this.SayHello());
				}
			}
			DerivedFromA = function()
			{
				doufu.OOP.Class(this);
				this.Inherit(BaseClassA);
				var _base_SayHello = this.OverrideMethod("SayHello",
					function()
					{
						return "Overrided " + _base_SayHello();
					}
				);
			}

			ba = new BaseClassA();
			da = new DerivedFromA();

			ba.InvokeSay();
			da.InvokeSay();
	*/
	obj.OverrideMethod = function(methodName, fn){
		var retMethod = this[methodName];
		this[methodName]=fn;
		return doufu.OOP._callBacker(retMethod, this);
	}

	// TO DO: this line might be removed.
	// v-hoxu - 1/31/2008 Removed
	//var temp = obj.constructor;
	//obj.constructor.prototype = new baseClass();
	//obj.constructor = temp;
	//delete temp;
	
	// Create __nsc_OOP_Inherit_Parent stack for inheritance tracing.
	var oTemp = new doufu.OOP._inheritance();

	if (obj.__nsc_OOP_Inherit_Stack != null)
	{
		oTemp.__nsc_OOP_Inherit_Stack = obj.__nsc_OOP_Inherit_Stack;
	}
	
	obj.__nsc_OOP_Inherit_Stack = oTemp;
	obj.__nsc_OOP_Inherit_Stack.Ref = baseClass;


	if (args != null)
	{
		baseClass.apply(obj,args);
	}
	else
		baseClass.apply(obj);
	
}

/*
	Function: doufu.OOP.OverloadMethod

	An overload implementation.
	
	Parameters:
		object - Specify the context/owner.
		name - Specify the function name.
		fn - Specify a overload function.
		
	Sample:
		function Users(){
			doufu.OOP.OverloadMethod(this, "find", function(){
				// Find all users...
			});
			doufu.OOP.OverloadMethod(this, "find", function(name){
				// Find a user by name
			});
			doufu.OOP.OverloadMethod(this, "find", function(first, last){
				// Find a user by first and last name
			});
		}

*/
doufu.OOP.OverloadMethod = function(object, name, fn){
    var old = object[ name ];
    object[ name ] = function(){
    if ( fn.length == arguments.length )
       return fn.apply( this, arguments );
    else if ( typeof old == 'function' )
       return old.apply( this, arguments );
   };
}


//Property toString redirector
doufu.OOP._propertyRedirector=function(){
	return function(){
		return this.call();
	}
}

/*
   Function: doufu.OOP.Property

   Javascript property builder

   Parameters:

      sPropertyName - Specify the property name.
      oContext - The property owner.

*/
doufu.OOP.Property = function(sPropertyName, oContext){
	
	// If no context specified, make pFunc as property directly.
	if (oContext == null)
	{
		if (typeof sPropertyName == "function")
		{
			sPropertyName.toString = doufu.OOP._propertyRedirector();
			sPropertyName.valueOf = doufu.OOP._propertyRedirector();
		}
		else
		{
			throw doufu.System.Exception("if the oContext is not specified, the sPorpertyName must be a function pointer.");
		}
	}
	else
	{
		
		oContext[sPropertyName] = function(value)
		{
			if (value != null)
			{
				// return directly, if user want to get the value, them can call it themself.
				return oContext[sPropertyName].Set.call(oContext, value);
			}
			
			return oContext[sPropertyName].Get.call(oContext);
		}
		
		oContext[sPropertyName].Get = function()
		{
			return value;
		};
		oContext[sPropertyName].Set = function(value)
		{
			
		};

		
		oContext[sPropertyName].toString = doufu.OOP._propertyRedirector();
		oContext[sPropertyName].valueOf = doufu.OOP._propertyRedirector();
	}
	
}

/*
   Function: doufu.OOP.InstanceOf

   Check whether specified object is a instance of specified class.

   Parameters:

      rInstance - The instance to check.
      type - The specified class.

*/
doufu.OOP.InstanceOf = function(rInstance, type)
{
	// Use native keyword to exam if it is a instance of specified type.
	if (rInstance instanceof type)
	{
		return true;
	}
	
	if (rInstance.constructor == type)
	{
		return true;
	}

	var currentInstance;

	currentInstance = rInstance;

	// Looping __nsc_OOP_Inherit_Parent stacks which constructed by nsc framework
	// to see if instance is a specified type
	while (currentInstance.__nsc_OOP_Inherit_Stack != null)
	{
		if (currentInstance.__nsc_OOP_Inherit_Stack.Ref == type)
		{
			return true;
		}
		currentInstance = currentInstance.__nsc_OOP_Inherit_Stack;
	}
	
	// If still not matched type found, looping the javascript native constructor.prototype stacks
	var bRet = false;
	
	var previousType ;
	var currentType;
	
	var StackUp = function(rInstance)
	{
		return rInstance.constructor.prototype;
	}
	
	currentInstance = rInstance;
	
	currentType = currentInstance.constructor;
	
	while(previousType != currentType)
	{
		previousType = currentType;
		currentInstance = StackUp(currentInstance);
		currentType = currentInstance.constructor;
		if (currentType == type)
		{
			bRet = true;
			break;
		}
	}
	
	return bRet;
}

/*
   Function: doufu.OOP.Implement

   Implement specified interface

   Parameters:

      oContext - Current context.
      oBaseInterface - Specify which inteface to be implemented.

*/
doufu.OOP.Implement = function(oContext, oBaseInterface)
{
	// Initialize all Declare array value.
	new oBaseInterface();
	
	if (typeof oBaseInterface.__nsc_OOP_DeclareArray == typeof undefined)
	{
		throw new Error("doufu.OOP.Implement: " + oBaseInterface + "is not a interface!");
	}
	
	for (var i = 0; i < oBaseInterface.__nsc_OOP_DeclareArray.length; i++)
	{
		// if the implementation was not found in direct constructor, dig into the inheritance stack.
		if (oContext.constructor.toString().indexOf(
			oBaseInterface.__nsc_OOP_DeclareArray[i]) == -1)
		{
			var currentInstance;
			var bFound = false;

			currentInstance = oContext;

			while (currentInstance.__nsc_OOP_Inherit_Stack != null)
			{
				if (currentInstance.__nsc_OOP_Inherit_Stack.Ref.toString().indexOf(
					oBaseInterface.__nsc_OOP_DeclareArray[i]) != -1)
				{
					bFound = true;
					break;
				}
				currentInstance = currentInstance.__nsc_OOP_Inherit_Stack;
			}
			
			if (!bFound)
			{
				throw new Error("doufu.OOP.Implement: Method " + oBaseInterface.__nsc_OOP_DeclareArray[i] + " must be implemented!");
			}
		}
	}
		
	if (typeof oContext.__nsc_OOP_BaseInterface == typeof undefined)
	{
		oContext.__nsc_OOP_BaseInterface = new Array();
	}
	oContext.__nsc_OOP_BaseInterface.push(oBaseInterface);

}

/*
	Function: doufu.OOP.IsImplemented

	Check to if specifed instance implemented the specifed interface

	Parameters:

      oContext - The instance of current class.
      oBaseInterface - Specify the interface which to be implemented.

*/
doufu.OOP.IsImplemented = function(oContext, oBaseInterface)
{
	// Check if the specified interface is existed in the internal interface array
	for (var i = 0; i < oContext.__nsc_OOP_BaseInterface.length; i++)
	{
		if (oContext.__nsc_OOP_BaseInterface[i] == oBaseInterface)
		{
			return true;
		}
	}
	
	return false;
}

/*
	Function: doufu.OOP.Declare

	Declare a function in specified interface.
	The function should be implemented by classes which implement specified interface.

	Parameters:

      sMethodName - The method name.
      oContext - Specify the interface which to be implemented.

*/
doufu.OOP.Declare = function(sMethodName, oContext)
{
	// add the method name to Declare array
	if (typeof oContext.constructor.__nsc_OOP_DeclareArray == typeof undefined)
	{
		oContext.constructor.__nsc_OOP_DeclareArray = new Array();
	}
	
	var bFound = false;
	// if the method was not added, then add it into array.
	for (var i = 0; i < oContext.constructor.__nsc_OOP_DeclareArray.length; i++)
	{
		if (oContext.constructor.__nsc_OOP_DeclareArray[i] == sMethodName)
		{
			bFound = true;
		}
	}
	if (!bFound)
	{
		oContext.constructor.__nsc_OOP_DeclareArray.push(sMethodName);
	}
}

/*
	Function: doufu.OOP.Interface

	Making javascript function as a doufu interface.

	Parameters:

      oContext - The instance of a function.
      
	Sample:
	
		oopInterface = function()
		{
			doufu.OOP.Interface(this);
		}

*/
doufu.OOP.Interface = function(oContext)
{
	doufu.OOP.Inherit(oContext, doufu.OOP._baseInterfaceFunctions,  [oContext]);
}

/*
   Class: doufu.OOP._baseClassFunctions

   All doufu class will automatically inherit from this class

   Constructor:

      __nsc_OOP_baseClassFunc_oContext - The instance of derived class.

*/
doufu.OOP._baseClassFunctions = function(__nsc_OOP_baseClassFunc_oContext)
{
	/*
	   Function: NewProperty

	   Create a new property for current class.

	   Parameters:

	      sPropertyName - Specify the property name.

	*/
	this.NewProperty = function(sPropertyName)
	{
		return doufu.OOP.Property(sPropertyName, __nsc_OOP_baseClassFunc_oContext);
	}
	
	/*
	   Function: Inherit

	   Inherit from a specified base class

	   Parameters:

	      baseClass - Specify the base class.
	      args - An object array which containing arguments to pass to base class constructor.

	*/
	this.Inherit = function(baseClass, args)
	{
		return doufu.OOP.Inherit(__nsc_OOP_baseClassFunc_oContext, baseClass, args);
	}
	
	/*
	   Function: InstanceOf

	   Check whether current instance is a instance of specified base class

	   Parameters:

	      type - Specify the base class.

	*/
	this.InstanceOf = function(type)
	{
		return doufu.OOP.InstanceOf(__nsc_OOP_baseClassFunc_oContext, type);
	}
	
	/*
		Function: OverloadMethod

		An overload implementation.
		
		Parameters:
			name - Specify the function name.
			fn - Specify a overload function.
			
		Sample:
			function Users(){
				
				$c(this);
				
				this.OverloadMethod("find", function(){
					// Find all users...
				});
				this.OverloadMethod("find", function(name){
					// Find a user by name
				});
				this.OverloadMethod("find", function(first, last){
					// Find a user by first and last name
				});
			}

	*/
	this.OverloadMethod = function(sMethodName, pFunc)
	{
		return doufu.OOP.OverloadMethod(__nsc_OOP_baseClassFunc_oContext, sMethodName, pFunc)
	}
	
	/*
	   Function: Implement

	   Implement specified interface

	   Parameters:

	      oBaseInterface - Specify which inteface to be implemented.

	*/
	this.Implement = function(baseInterface)
	{
		return doufu.OOP.Implement(__nsc_OOP_baseClassFunc_oContext, baseInterface)
	}
	
	/*
		Function: IsImplemented

		Check to if specifed instance implemented the specifed interface

		Parameters:

	      oBaseInterface - Specify the interface which to be implemented.

	*/
	this.IsImplemented = function(baseInterface)
	{
		return doufu.OOP.IsImplemented(__nsc_OOP_baseClassFunc_oContext, baseInterface);
	}
}

/*
   Class: doufu.OOP._baseInterfaceFunctions

   All doufu interface will automatically inherit from this class

   Constructor:

      __nsc_OOP_baseInterfaceFunc_oContext - The instance of context function.

*/
doufu.OOP._baseInterfaceFunctions = function(__nsc_OOP_baseInterfaceFunc_oContext)
{
	/*
		Function: Declare

		Declare a function in current interface.
		The function should be implemented by classes which implement current interface.

		Parameters:

	      sMethodName - The method name.

	*/
	this.Declare = function(sMethodName)
	{
		return doufu.OOP.Declare(sMethodName, __nsc_OOP_baseInterfaceFunc_oContext);
	}
}

/*
	Class: doufu.OOP._inheritance

	This class will be used as a member of the inheritance stack.

*/
doufu.OOP._inheritance = function()
{
	this.Ref = null;
	this.__nsc_OOP_Inherit_Stack = null;
}
 
/*
	Section: Aliases
	
	short cut to use oop functions.
	this pollute the global environment but we have to do this to reduce workload.
*/

/*
	Function: $c
	
	An alias of doufu.OOP.Class

	See Also:
	<doufu.OOP.Class>

*/
$c = doufu.OOP.Class;

/*
	Function: $i
	
	An alias of doufu.OOP.Interface

	See Also:
	<doufu.OOP.Interface>

*/
$i = doufu.OOP.Interface;;
doufu.System = new Object();;
doufu.System.Hacks = {};
doufu.System.Hacks.Array = new function()
{
	// Adding Array.indexOf for IE browser.
	[].indexOf || (Array.prototype.indexOf = function(v){
       for(var i = this.length; i-- && this[i] !== v;);
       return i;
	});
	
}
doufu.System.Hacks.Date = new function()
{
	Date.prototype.addDay || (Date.prototype.addDay = function(iNum)
	{
		this.setTime(this.getTime() + 1000 * 60 * 60 * 24 * iNum);
	});
	
	Date.prototype.addHour || (Date.prototype.addHour = function(iNum)
	{
		this.setTime(this.getTime() + 1000 * 60 * 60 * iNum);
	});
	
	Date.prototype.addMinute || (Date.prototype.addMinute = function(iNum)
	{
		this.setTime(this.getTime() + 1000 * 60 * iNum);
	});
	
	Date.prototype.addSecond || (Date.prototype.addSecond = function(iNum)
	{
		this.setTime(this.getTime() + 1000 * iNum);
	});
}
doufu.System.Hacks.String = new function()
{
	String.prototype.trim || (String.prototype.trim = function () 
    { 
        return this.replace(/(^\s*)|(\s*$)/g, ""); 
    });
}
;
doufu.System.Constants = new Object();

doufu.System.Constants.TYPE_UNDEFINED = typeof undefined;

// Alias, this pollute the globle environment but we have to do this to reduce workload.
$Undefined = doufu.System.Constants.TYPE_UNDEFINED;;
/*
	Namespace: doufu.System.Logger
	
	Root namespace of logger helper.
*/
doufu.System.Logger = {};

/*
	Namespace: doufu.System.Logger.Adapters
	
	Provide adapters different debug console.
*/
doufu.System.Logger.Adapters = {};

/*
	Class: doufu.System.Logger.Adapters.Adaptable
	
	All logging adapter should inherit this class.

*/
doufu.System.Logger.Adapters.Adaptable = function()
{
	doufu.OOP.Class(this);

	/*
		Property: IsAvailable
		
		<doufu.Property> 
		Return true if current logger is availabe, otherwise, return false.
	*/
	this.NewProperty("IsAvailable");
	this.IsAvailable.Get = function()
	{
		return typeof Logger == doufu.System.Constants.TYPE_UNDEFINED?false: true;
	};
	
	/*
		Function: Debug
		
		Write debug information.
		Derived adapters must override this method.
		
		Parameters:
			sMessage - The message string which needs to be display in console.
	*/
	this.Debug = function(sMessage)
	{
		Logger.info(sMessage);
	}
	
	/*
		Function: Error
		
		Write error message.
		Derived adapters must override this method.
		
		Parameters:
			sMessage - The error message string.
			oError - 
	*/
	this.Error = function(sMessage,oError)
	{
		Logger.error(sMessage,oError);
	}
	
	/*
		Function: Verbose
		
		Write verbose message.
		Derived adapters must override this method.
		
		Parameters:
			sMessage - Verbose message string.
	*/
	this.Verbose = function(sMessage)
	{
		Logger.debug(sMessage);
	}
}

/*
	Class: doufu.System.Logger.Adapters.Doufu
	
	A doufu logger adapter.
*/
doufu.System.Logger.Adapters.Doufu = function()
{
	
	doufu.OOP.Class(this);
	
	this.Inherit(doufu.System.Logger.Adapters.Adaptable);
	
}

/*
	Class: doufu.System.Logger.Adapters.IE8Console
	
	A IE 8 console adapter.
*/
doufu.System.Logger.Adapters.IE8Console = function()
{
	
	doufu.OOP.Class(this);
	
	this.Inherit(doufu.System.Logger.Adapters.Adaptable);
	
	// Hide the base get function.
	this.IsAvailable.Get = function()
	{
		return typeof console == doufu.System.Constants.TYPE_UNDEFINED?false: true;
	}
	
	/*
		Property: ConsoleInstance
		
		Get the ie8 console instance, if not available return null.
		
	*/
	this.NewProperty("ConsoleInstance");
	this.ConsoleInstance.Get = function()
	{
		if (this.IsAvailable())
		{
			return console;
		}
		else
			return null;
	}
	
	this.OverrideMethod("Debug", function(sMessage)
	{
		this.ConsoleInstance().info(sMessage);
	});
	
	this.OverrideMethod("Error", function(sMessage, oError)
	{
		this.ConsoleInstance().error(sMessage, oError);
	});
	
	this.OverrideMethod("Verbose", function(sMessage)
	{
		this.ConsoleInstance().log(sMessage);
	});	
}

/*
	Class: doufu.System.Logger
	
	A singleton logging helper, helpers automatically select available console, and display debug information in it.
	If debug is enabled but there is no browser integrated console available, helper will use a web console instead.
	How to use:
		Press alt + shift + ` to open the web console interface.
		Set CONFIG_LOGGING_VERBOSE to true to enable verbose logging.
	
	Note: This helper won't work for release version.
*/
doufu.System.Logger = new function()
{
	doufu.OOP.Class(this);
	
	var doufuLogger = new doufu.System.Logger.Adapters.Doufu();
	var ie8Logger = new doufu.System.Logger.Adapters.IE8Console();
	var selectedLogger = doufuLogger;
	
	// Only debug build will have doufu logger, so if the doufu logger is availabe,
	// We consider it is running in debug mode.
	__DOUFU_DEBUG = doufuLogger.IsAvailable();
	
	if (__DOUFU_DEBUG && ie8Logger.IsAvailable())
	{
		selectedLogger = ie8Logger;
	}
	
	/*
		Property: IsDebug
		
		<doufu.Property>
		Return true if in debug mode.
	*/
	this.NewProperty("IsDebug");
	this.IsDebug.Get = function()
	{
		return __DOUFU_DEBUG;
	}
	
	/*
		Function: Debug
		
		Write debug information.
		
		Parameters:
			sMessage - The message string which needs to be display in console.
	*/
	this.Debug = function(sMessage)
	{
		if (__DOUFU_DEBUG)
		{
			selectedLogger.Debug(sMessage);
		}
	}
	
	/*
		Function: Error
		
		Write error message.
		
		Parameters:
			sMessage - The error message string.
			oError - 
	*/
	this.Error = function(sMessage,oError)
	{
		if (__DOUFU_DEBUG)
		{
			selectedLogger.Error(sMessage,oError);
		}
	}
	
	/*
		Function: Verbose
		
		Write verbose message.
		When there are large information which need to be display frequently, use verbose logging will be more approprately.
		Devs can enable it or disable verbose logging in runtime by setting CONFIG_LOGGING_VERBOSE = true or false.
		
		Parameters:
			sMessage - Verbose message string.
	*/
	this.Verbose = function(sMessage)
	{
		if (CONFIG_LOGGING_VERBOSE && __DOUFU_DEBUG)
		{
			selectedLogger.Verbose(sMessage);
		}
	}
};
/// <PseudoCompileInfo>
/// 	<Dependencies>
/// 		<Dependency>doufu.System.js</Dependency>
/// 	</Dependencies>`
/// </PseudoCompileInfo>

doufu.System.Handler = function(iHandlerID)
{
	//doufu.System.Logger.Debug("doufu.System.Handler: Creating Handler id " + iHandlerID);
	if (typeof iHandlerID == doufu.System.Constants.TYPE_UNDEFINED  || iHandlerID == null)
	{
		throw doufu.System.Exception("Inputted parameter incorrect.");
	}
	this.ID = iHandlerID;
}

doufu.System.Handler.Generate = function()
{
	var TempID
	if (true)//(doufu.System.Handler._syncLock == 0)
	{
		// lock
		doufu.System.Handler._syncLock = 1;
		
		doufu.System.Logger.Debug("doufu.System.Handler.Generate: Creating Handler, current LastHandlerID is " + (doufu.System.Handler.LastHandlerID == 0?doufu.System.Handler.START_ID:doufu.System.Handler.LastHandlerID));
		TempID = (doufu.System.Handler.LastHandlerID == 0?doufu.System.Handler.Constants.START_ID:doufu.System.Handler.LastHandlerID) + 1;
		doufu.System.Handler.LastHandlerID = TempID;
		
		// unlock
		doufu.System.Handler._syncLock == 0;
	}
	else
	{
		//alert("Block:" + doufu.System.Handler.LastHandlerID + " " + doufu.System.Handler._syncLock);
		doufu.Cycling.Block(1);
		return doufu.System.Handler.Generate();
	}
	return new doufu.System.Handler(TempID);
}

doufu.System.Handler.IsMe = function(oHandlerOwner, oHandler)
{
	if (typeof oHandlerOwner.InstanceOf == doufu.System.Constants.TYPE_UNDEFINED ||
		!oHandlerOwner.InstanceOf(doufu.System.Handler.Handlable))
	{
		throw doufu.System.Exception("oHandlerOwner type incorrect!");
	}
	
	if (oHandler == doufu.System.Handler.Constants.BROADCAST)
	{
		return true;
	}
	if (oHandler == oHandlerOwner.Handler)
	{
		return true;
	}
	return false;
}

doufu.System.Handler.LastHandlerID = 0;

doufu.System.Handler._syncLock = 0;;
doufu.System.Handler.Constants = new Object();

doufu.System.Handler.Constants.START_ID = 0x8000;

doufu.System.Handler.Constants.BROADCAST = 0x0001;;
doufu.System.Handler.Handlable = function()
{
	doufu.OOP.Class(this);
	
	/////////////////////////
	// Attributes
	/////////////////////////
	this.Handler = 0;
};
doufu.System.Message = function(oHandler, sMsg, wParam, lParam)
{
	if (oHandler == null)
		this.Handler = new doufu.System.Handler(0);
	else
		this.Handler = oHandler;
	
	if (sMsg == null)
		this.Message = new Number();
	else
		this.Message = sMsg;
	
	if (wParam == null)
		this.wParam = new Number();
	else
		this.wParam = wParam;
	
	if (lParam == null)
		this.lParam = new Number();
	else
		this.lParam = lParam;
};
doufu.System.MessageQueue = function()
{
	return doufu.System.MessageQueue._internalQueue;
}
doufu.OOP.Property(doufu.System.MessageQueue);

doufu.System.MessageQueue._internalQueue = new Array();


doufu.System.MessageQueue.Push = function(oHandlerOrMessage, sMsg, wParam, lParam)
{
	var tmpMsg;
	if (!(oHandlerOrMessage instanceof doufu.System.Message))
	{
		tmpMsg = doufu.System.Message(oHandlerOrMessage, sMsg, wParam, lParam);
	}
	else
	{
		tmpMsg = oHandlerOrMessage;
	}
	return doufu.System.MessageQueue._internalQueue.push(tmpMsg);
}

doufu.System.MessageQueue.Shift = function()
{
	return doufu.System.MessageQueue._internalQueue.shift();
}

doufu.System.MessageQueue.Length = function()
{
	return doufu.System.MessageQueue._internalQueue.length;
};
doufu.System.MessageProcessor = function()
{
	this.BeforeProcess = function(oMsg)
	{
		if (!(oMsg instanceof doufu.System.Message))
			throw doufu.System.Exception("The message dispatched is not derived from doufu.System.Message");
		
		this.Process.Reference.call(
			this.Process.Context,
			oMsg
			);
	}
	
	this.Process = new doufu.Event.CallBack();
};
doufu.System.MessageConstants = new Object();
// Asking to render.
doufu.System.MessageConstants.DISPLAY_RENDER= 0x8; //00001000

///##########################
/// Javascript Static Method
/// Name: doufu.System.MessageConstants.IsMessage
/// Description: 
/// 	Determine whether specified bit is on in inputted message.
///
/// Parameters:
/// 	oMsg: The message to be determined
/// 	oConst: The message const
///
///##########################
doufu.System.MessageConstants.IsMessage = function(oMsg, oConst)
{
	return (oMsg.Message & oConst) == oConst;
};
doufu.System.Exception = function(sMessage)
{
	var sErrMsg = arguments.caller + ":" + sMessage;
	var err = new Error(sErrMsg);
	if (!err.message)
	{
		err.message = sErrMsg;
	}
	err.name = "System Exception";
	
	doufu.System.Logger.Error(sErrMsg, err);
	
	return err;
}
;
doufu.System.APIs = new Object();

///##########################
/// Javascript Static Method
/// Name: doufu.System.APIs.FunctionHooker
/// Description: 
/// 	Hook a function, make every call to the original function pass its parameters to specified function first.
///		This hook is un-cancelale.
///
/// Parameters:
/// 	sFuncName: string, the orignal function name which need to be hooked.
/// 	fnCap: function, a specified cap function which will be call first.
///		objFuncOwner: specified who own the function.
///
///##########################
doufu.System.APIs.FunctionHooker = function(sFuncName, fnCap, objFuncOwner)
{
	if (objFuncOwner == null)
	{
		objFuncOwner = window;
	}
	
	if (objFuncOwner.__nsc_FunctionHooker_Stack == null)
	{
		objFuncOwner.__nsc_FunctionHooker_Stack = new doufu.CustomTypes.Stack();
		
		// Add orignal function to stack
		objFuncOwner.__nsc_FunctionHooker_Stack.Push(objFuncOwner[sFuncName]);
		var temptest = objFuncOwner[sFuncName];
		// Add initializer 
		objFuncOwner[sFuncName] = function()
		{
			return objFuncOwner.__nsc_FunctionHooker_Stack.Top().RefObject(objFuncOwner, arguments, 1);
			
		}
	}
	
	// Add fnCap to stack to be invoked.
	objFuncOwner.__nsc_FunctionHooker_Stack.Push(function(objFuncOwner, newArguments, i)
		{
			fnCap.apply(objFuncOwner, newArguments);
			// Invoke next none-original func in stack
			// this.LinkedStackElement.LinkedStackElement != null means it is the 2nd item backward in stack.
			// so next item must be a hooker
			if (i < (objFuncOwner.__nsc_FunctionHooker_Stack.Length() - 1) && 
				this.LinkedStackElement.LinkedStackElement != null)
			{
				return this.LinkedStackElement.RefObject(objFuncOwner, newArguments , i+1);
			}
			else
			{
				// Norman 8-28-2008: hanlde ie8 beta2 quirk, use appendChild.apply will cause code error. so check if it is unknown 
				// TODO: Remove this when ie8 release
				if (typeof(this.LinkedStackElement.RefObject.apply) != "unknown" && this.LinkedStackElement.RefObject.apply != null)
				{
					return this.LinkedStackElement.RefObject.apply(objFuncOwner, newArguments);
				}
				// Handle if it is a native function and don't have apply method.
				else
				{
					var sParameters = "";
					for(var i = 0; i < newArguments.length; i++)
					{
						sParameters = sParameters + "newArguments[" + i.toString() + "]";
						if ( (i + 1) < newArguments.length)
						{
							sParameters = sParameters + ", ";
						}
					}
					
					return eval("this.LinkedStackElement.RefObject(" + sParameters + ")");
				}
			}
			
		}
	);
	
}

///##########################
/// Javascript Static Method
/// Name: doufu.System.APIs.GetIsNullMacro
/// Description: 
/// 	Return a string which can be executed by eval() and return if the specified variable is null
///
/// Parameters:
/// 	sObjName: variable name.
///
///##########################
doufu.System.APIs.GetIsNullMacro = function(sObjName)
{
	return "(function(){if (typeof " + sObjName + " == doufu.System.Constants.TYPE_UNDEFINED || " + sObjName + " == null){return true;}})();";
}

///##########################
/// Javascript Static Method
/// Name: doufu.System.APIs.Clone
/// Description: 
/// 	Helps to deeply copy object.
///		This function originally written by Jasno Claswson: http://www.jasonclawson.com/2008/07/01/javascript-operator-and-indexof-failure/
///
/// Parameters:
/// 	obj: the obj which needs to be cloned.
///
///##########################
doufu.System.APIs.Clone = function(obj, level){
	var seenObjects = [];
	var mappingArray = [];
	var	f = function(simpleObject, currentLevel) {
		if (simpleObject == null)
		{
			return null;
		}
		var indexOf = seenObjects.indexOf(simpleObject);
		if (indexOf == -1) {			
			switch ((typeof simpleObject).toLowerCase()) {
				case 'object':
					seenObjects.push(simpleObject);
					var newObject = {};
					mappingArray.push(newObject);
					for (var p in simpleObject) 
					{
						if (p != null)
						{
							if (currentLevel > 0)
							{
								newObject[p] = f(simpleObject[p], currentLevel - 1);
							}
							else
							{
								newObject[p] = simpleObject[p];
							}
						}
					}
					newObject.constructor = simpleObject.constructor;
					return newObject;
					
				case 'array':
					seenObjects.push(simpleObject);
					var newArray = [];
					mappingArray.push(newArray);
					for(var i=0,len=simpleObject.length; i<len; i++)
					newArray.push(f(simpleObject[i]));
				return newArray;
					
				default:	
				return simpleObject;
			}
		} else {
			return mappingArray[indexOf];
		}
	};
	return f(obj, level == null?0:level);		
}

/*
	Function: doufu.System.APIs.NumberOfType
*/
doufu.System.APIs.NumberOfType = function(type)
{
	var iRetCount = 0;
	for (var i = 1; i < arguments.length; i++)
	{
		if (arguments[i].InstanceOf(type))
		{
			iRetCount++;
		}
	}
		
	return iRetCount;
};
doufu.System.Convert = new Object();

doufu.System.Convert.ToString = function(obj)
{
	var sRet = new String("");
	if (obj.toString)
	{
		sRet = obj.toString();
	}
	else
	{
		sRet = obj + "";
	}
	
	return sRet;
}

doufu.System.Convert.ToInt = function(obj)
{
	var iRet = new String("");
	if (obj.valueOf)
	{
		iRet = obj.valueOf();
	}
	else
	{
		iRet = obj * 1
	}
	
	return iRet;
};
doufu.DesignPattern = {};;
doufu.DesignPattern.Attachable = function(type)
{
	doufu.OOP.Class(this);

	var _collection = new doufu.CustomTypes.Collection(type);
	
	this.NewProperty("InnerCollection");
	this.InnerCollection.Get = function()
	{
		return _collection;
	}
	
	this.Ctor = function()
	{
		if (typeof type == doufu.System.Constants.TYPE_UNDEFINED)
		{
			doufu.System.ThrowException("type parameter should not be null");
		}
	}
	
	this.Attach = function(obj)
	{
		_collection.Add(obj);
	}
	this.Detach = function(obj)
	{
		_collection.Remove(obj);
	}
	
	this.Ctor();
};
doufu.Event = new Object();;
doufu.Event.EventHandler = function(oContext)
{
	doufu.OOP.Class(this);
	
	var oSender = oContext;
	var pCallBacks = new doufu.CustomTypes.Collection(doufu.Event.CallBack);
	
	this.Invoke = function(oEvent, oSenderOverride)
	{
		var tempSender;
		var lastResult;
		if (oSenderOverride != null)
		{
			tempSender = oSenderOverride;
		}
		else
		{
			tempSender = oSender;
		}
		for (var i = 0; i < pCallBacks.Length; i++)
		{
			lastResult = pCallBacks.InnerArray()[i].Reference.call(pCallBacks.InnerArray()[i].Context, tempSender, oEvent);
		}
		
		return lastResult;
	}
	this.Attach = function(pCallback)
	{
		if (!pCallback.InstanceOf(doufu.Event.CallBack))
		{
			throw doufu.System.Exception("pCallback was not derived from doufu.Event.CallBack");
		}
		doufu.System.Logger.Debug("doufu.Event.EventHandler: Add call back " + pCallback);
		pCallBacks.Add(pCallback);
	}
	this.Detach = function(pCallback)
	{
		pCallBacks.Remove(pCallback);
	}
};
///##########################
/// Javascript Static Method
/// Name: doufu.Event.CallBack
/// Description: 
/// 	A object which contained a reference to a specified function and 
///		a reference to the context which executing the function.
/// Parameters:
/// 	pReference: reference to the specified function
/// 	pContext: reference to the context which the function need to be executed under,
///					if this parameter does not exist, the context will be the caller 
///					which created the instance of CallBack.
///##########################
doufu.Event.CallBack = function(pReference, pContext)
{
	doufu.OOP.Class(this);
	
	this.Reference = pReference;
	if (pContext == null)
	{
		this.Context = doufu.Event.CallBack.caller;
	}
	else
	{
		this.Context = pContext;
	}
	
};
doufu.Browser = new Object();;
doufu.Browser.Element = function(element)
{
	
	doufu.OOP.Class(this);
	
	var _native;
	
	this.NewProperty("Native");
	this.Native.Get = function()
	{
		return _native;
	}
	
	/*
		Function: AppendChild
		
		Append a child node to current document
	*/
	this.AppendChild = function(elmtAppend)
	{
		var elmtActual = elmtAppend;
		if (typeof elmtAppend.InstanceOf != $Undefined && elmtAppend.InstanceOf(doufu.Browser.Element))
		{
			elmtActual = elmtAppend.Native();
		}
		return _native.appendChild(elmtActual);
	}
	
	this.SetAttribute = function(sName, sValue)
	{
		if (sName.toLowerCase() == "class")
		{
			return _native.class = sValue;
		}
		else
		{
			return _native.setAttribute(sName, sValue);
		}
	}
	
	this.$a = this.AppendChild
	
	this.Ctor = function()
	{
		if ((typeof element).toLowerCase() == "string")
		{
			_native = doufu.Browser.DOM.Select(element);
		}
		else
		{
			_native = element;
		}
		
		if (_native == null)
		{
			throw doufu.Exception("doufu.Browser.Element::Ctor() - Specified element is null.");
		}
	}
	
	this.Ctor();
};
doufu.Browser.DOMBase = function(docRef)
{
	
	doufu.OOP.Class(this);
	
	var _docRef;
	if (typeof docRef == doufu.System.Constants.TYPE_UNDEFINED || docRef == null)
	{
		_docRef = document;
	}
	else
	{
		_docRef = docRef
	}
	this.NewProperty("DocRef");
	this.DocRef.Get = function()
	{
		return _docRef;
	}
	
	this.Inherit(doufu.Browser.Element, [_docRef]);
	
	/*
		Function: CreateElement
		
		Create a element from current document.
		
		Parameters:
			sElement - The element tag name
	*/
	this.CreateElement = function(sElement)
	{
		return new doufu.Browser.Element(this.DocRef().createElement(sElement));
	}
	
	this.$c = this.CreateElement;
	
	/*
		Function: Select
		
		Select a element in current document with specified id.
		
		Parameters:
			sElementId - Specify the element id.
	*/
	this.Select = function(sElementId)
	{
		
		var elmt;
		if (sElementId.substring(0,1) == "$")
		{
			elmt = this.DocRef().getElementsByTagName(sElementId.substring(1, sElementId.length))[0];
		}
		else
		{
			elmt = this.DocRef().getElementById(sElementId);
		}
		
		if (elmt != null)
		{
			return new doufu.Browser.Element(elmt);
		}
		
		return null;
	}
	
	this.$s = this.Select;

	this.CompatibleMode = function()
	{
		if(doufu.Browser.BrowserDetect.Browser == doufu.Browser.BrowserDetect.BrowserEnum.Explorer &&
			doufu.Browser.BrowserDetect.Version < 6)
		{
			return doufu.Browser.DOM.CompatibleMode.BACK_COMPAT;
		}
		else if(doufu.Browser.BrowserDetect.Browser == doufu.Browser.BrowserDetect.BrowserEnum.Safari)
		{
			if (this.DocType().publicId == doufu.Browser.DOM.DocType.DTDXHTML1Strict)
			{
				return doufu.Browser.DOM.CompatibleMode.CSS1_COMPAT;
			}
		}
		else
		{
			return this.DocRef().compatMode;
		}
	}

	this.DesignMode = function()
	{
		return this.DocRef().designMode;
	}

	this.DocType = function()
	{
		// Attributes:
		//  	name
		// 		publicId
		// 		systemId
		// 		notations
		//  	entities
		return this.DocRef().doctype;
	}

	this.Charset = function()
	{
		return this.DocRef().defaultCharset;
	}

}

doufu.Browser.DOM = new doufu.Browser.DOMBase();

//
doufu.Browser.GetDOMFromIFrame = function(elmtIFrame)
{
	return doufu.Browser.GetWindowFromIFrame(elmtIFrame).DOM;
}

// Constants
doufu.Browser.DOM.CompatibleMode.CSS1_COMPAT = "CSS1Compat";

doufu.Browser.DOM.CompatibleMode.BACK_COMPAT = "BackCompat";

doufu.Browser.DOM.DocType.DTDXHTML1Strict  = "-//W3C//DTD XHTML 1.0 Strict//EN";;
// Dependency: doufu.Browser.DOM

doufu.Browser.WindowBase = function(winRef)
{
	
	doufu.OOP.Class(this);
	
	var _winRef;
	if (typeof winRef == doufu.System.Constants.TYPE_UNDEFINED || winRef == null)
	{
		_winRef = window;
	}
	else
	{
		_winRef = winRef
	}
	this.NewProperty("WinRef");
	this.WinRef.Get = function()
	{
		return _winRef;
	}
	
	this.DOM = new doufu.Browser.DOMBase(this.WinRef().document);
}

doufu.Browser.Window = new doufu.Browser.WindowBase();

doufu.Browser.GetWindowFromIFrame = function(elmtIFrame)
{
	if (typeof elmtIFrame.tagName == doufu.System.Constants.TYPE_UNDEFINED ||
		elmtIFrame.tagName.toLowerCase() != "iframe")
	{
		throw doufu.System.Exception("elmtIFrame was not a iframe reference.");
	}
	
	return new doufu.Browser.WindowBase(elmtIFrame.contentWindow);
		
};
doufu.Browser.Helpers = new Object();

doufu.Browser.Helpers.SPACE_NAME = "doufu.Browser.Helpers";

doufu.Browser.Helpers.CreateOverflowHiddenDiv = function(sDivID, elmtParent, iWidth , iHeight)
{
	var borderWidth = 1;
	
	if (sDivID == null ||
		elmtParent == null)
	{
		throw doufu.System.Exception("sDivID and elmtParent were required!");
	}
	
	var retDiv;
	retDiv = doufu.Browser.DOM.CreateElement("div").Native();
	retDiv.setAttribute("id", sDivID);
	retDiv.style.overflow = "hidden";
	retDiv.style.width = iWidth + "px";
	retDiv.style.height = iHeight + "px";
	retDiv.style.border = borderWidth + "px solid #000";
	
	elmtParent.appendChild(retDiv);	
	
	if (doufu.Browser.DOM.CompatibleMode() == doufu.Browser.DOM.CompatibleMode.CSS1_COMPAT)
	{
		retDiv.style.position = "relative";
	}
	else if (doufu.Browser.DOM.CompatibleMode() == doufu.Browser.DOM.CompatibleMode.BACK_COMPAT)
	{
		
	}
	else
	{
		doufu.System.APIs.FunctionHooker("appendChild", function(obj)
			{
				obj.style.clip="rect(0px " + 
					doufu.System.Convert.ToString(retDiv.clientLeft + iWidth) + "px " + 
					iHeight + "px " + retDiv.clientLeft + "px)";
				//alert(doufu.Browser.Helpers.GetAbsolutePosition(retDiv).Y);
				//alert(retDiv.clientTop + 
				//	doufu.System.Convert.ToInt(retDiv.marginTop.replace("px", "")));
				obj.style.marginTop = "9px";//doufu.Browser.Helpers.GetAbsolutePosition(retDiv).Y;
				obj.style.marginLeft = "8px";
			},
		retDiv);
	}

	return retDiv;
}

  /* *
  * Retrieve the coordinates of the given event relative to the center
  * of the widget.
  *
  * @param event
  *  A mouse-related DOM event.
  * @param reference
  *  A DOM element whose position we want to transform the mouse coordinates to.
  * @return
  *    A hash containing keys 'x' and 'y'.
  */
doufu.Browser.Helpers.GetRelativeCoordinates = function(event, reference) {
    var x, y;
    event = event || window.event;
    var el = event.target || event.srcElement;
    if (!window.opera && typeof event.offsetX != 'undefined') {
      // Use offset coordinates and find common offsetParent
      var pos = { x: event.offsetX, y: event.offsetY };
      // Send the coordinates upwards through the offsetParent chain.
      var e = el;
      while (e) {
        e.mouseX = pos.x;
        e.mouseY = pos.y;
        pos.x += e.offsetLeft;
        pos.y += e.offsetTop;
        e = e.offsetParent;
      }
      // Look for the coordinates starting from the reference element.
      var e = reference;
      var offset = { x: 0, y: 0 }
      while (e) {
        if (typeof e.mouseX != 'undefined') {
          x = e.mouseX - offset.x;
          y = e.mouseY - offset.y;
          break;
        }
        offset.x += e.offsetLeft;
        offset.y += e.offsetTop;
        e = e.offsetParent;
      }
      // Reset stored coordinates
      e = el;
      while (e) {
        e.mouseX = undefined;
        e.mouseY = undefined;
        e = e.offsetParent;
      }
    }
    else {
      // Use absolute coordinates
      var pos = getAbsolutePosition(reference);
      x = event.pageX  - pos.x;
      y = event.pageY - pos.y;
    }
    // Subtract distance to middle
    return { x: x, y: y };
  }


doufu.Browser.Helpers.GetAbsolutePosition = function(element) {
    var r = new doufu.Display.Drawing.Rectangle();
    r.X = element.offsetLeft;
    r.Y = element.offsetTop;
    if (element.offsetParent) {
      var tmp = doufu.Browser.Helpers.GetAbsolutePosition(element.offsetParent);
      r.X += tmp.X;
      r.Y += tmp.Y;
    }
    
    return r;
}

/*
	Function: doufu.Browser.Helpers.EnableBackgroundCache
	
	Helps to enable/disable background cache
	
	Parameters:
		bEnable - True to enable, false to disable
*/
doufu.Browser.Helpers.EnableBackgroundCache = function(bEnable)
{
	// Force IE to use cache.
	if (doufu.Browser.BrowserDetect.Browser == doufu.Browser.BrowserDetect.BrowserEnum.Explorer)
	{
		document.execCommand("BackgroundImageCache", false, bEnable);
	}
};
doufu.Browser.BrowserDetect = new function __nsc_Browser_BrowserDetect()
{
	this.OSEnum = 
	{
		Windows:"Windows", 
		Mac:	"Mac", 
		Linux:	"Linux",
		Unknown:"Unknown"
	};
	this.BrowserEnum = 
	{
		OmniWeb: 	"OmniWeb", 
		Safari: 	"Safari", 
		Opera: 		"Opera",
		iCab: 		"iCab",
		Konqueror: 	"Konqueror",
		Firefox: 	"Firefox",
		Camino: 	"Camino",
		Netscape: 	"Netscape",
		Explorer: 	"Explorer",
		Mozilla:	"Mozilla",
		Netscape: 	"Netscape",
		Unknown:	"Unknown"
	};
	
	this.dataOS = [
		{
			string: navigator.platform,
			subString: "Win",
			identity: this.OSEnum.Windows
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: this.OSEnum.Mac
		},
		{
			string: navigator.platform,
			subString: "Linux",
			identity: this.OSEnum.Linux
		}
	];
	
	this.dataBrowser = [
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: this.BrowserEnum.OmniWeb
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: this.BrowserEnum.Safari
		},
		{
			prop: window.opera,
			identity: this.BrowserEnum.Opera
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: this.BrowserEnum.iCab
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: this.BrowserEnum.Konqueror
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: this.BrowserEnum.Firefox
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: this.BrowserEnum.Camino
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: this.BrowserEnum.Netscape
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: this.BrowserEnum.Explorer,
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: this.BrowserEnum.Mozilla,
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: this.BrowserEnum.Netscape,
			versionSearch: "Mozilla"
		}
	];
	
	this.searchString = function (data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	}
	
	this.searchVersion = function (dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	}
	
	this.Ctor = function () 
	{
		this.Browser = this.searchString(this.dataBrowser) || doufu.Browser.BrowserDetect.BrowserEnum.Unknown;
		this.Version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion)
			|| "Unknown";
		this.OS = this.searchString(this.dataOS) || doufu.Browser.BrowserDetect.OSEnum.Unknown;
	}
	
	this.Ctor();
};
/// <PseudoCompileInfo>
/// 	<Dependencies>
/// 		<Dependency>doufu.js</Dependency>
/// 	</Dependencies>
/// </PseudoCompileInfo>

doufu.Cycling = new Object();

///##########################
/// Javascript Static Method
/// Name: Block
/// Description: Block the native browser Cycle.
///				 NOTE!! : Should not block browser too long
///				          otherwise some browser will prompt
///						  user to kill the javascript execution.
///##########################
doufu.Cycling.Block = function(milliseconds)
{
      var sleeping = true;
      var now = new Date();
      var alarm;
      var startingMSeconds = now.getTime();
      while(sleeping)
      {
         alarm = new Date();
         var alarmMSeconds = alarm.getTime();
         if(alarmMSeconds - startingMSeconds > milliseconds){ sleeping = false; }
      }      
};
doufu.Cycling.Pool = new Array();

doufu.Cycling.Pool.Length = function()
{
	return doufu.Cycling.Pool.length;
}
doufu.Cycling.Pool.Length.getValue = doufu.Cycling.Pool.Length.toString = doufu.Cycling.Pool.Length;


doufu.Cycling.Pool.Add = function(oCycle)
{
	if (!(oCycle instanceof doufu.Cycling.Cycle))
			throw doufu.System.Exception("Must pass in a Cycle.");
	
	var bFound = false;
	
	// Found the index of the specified Cycle
	for (var i = 0; i< doufu.Cycling.Pool.length; i++)
	{
		if (doufu.Cycling.Pool[i] == oCycle)
		{
			bFound = true;
			break;
		}
	}
	
	// if the Cycle not in innerCycleList, add it
	if (!bFound)
	{
		var iCycle = doufu.Cycling.Pool.push(oCycle);
		iCycle--;
		this[iCycle] = doufu.Cycling.Pool[iCycle];
	}
}

doufu.Cycling.Pool.Remove = function(oCycle)
{
	var i;
	
	// Found the index of the specified Cycle
	for (i = 0; i< doufu.Cycling.Pool.length; i++)
	{
		if (doufu.Cycling.Pool[i] == oCycle)
		{
			break;
		}
	}
	
	// Remove the specified Cycle
	doufu.Cycling.Pool.splice(i,1);

};

doufu.Cycling.Manager = new function __nsc_Cycling_Manager()
{

	this.Register = function(oCycle)
	{
		// Add to Pool
		doufu.Cycling.Pool.Add(oCycle);
	}
	
	this.Unregister = function(oCycle)
	{
		doufu.Cycling.Pool.Remove(oCycle);
	}
	
	this.Looper = function(oMsg)
	{
		if (!(oMsg instanceof doufu.System.Message))
			throw doufu.System.Exception("The message dispatched is not derived from doufu.System.Message");
		
		for (var i = 0; i < doufu.Cycling.Pool.Length; i++)
		{
			doufu.Cycling.Pool[i].Looper(oMsg);
		}
	}
};
/// <PseudoCompileInfo>
/// 	<Dependencies>
/// 		<Dependency>doufu.Cycling.js</Dependency>
/// 	</Dependencies>
/// </PseudoCompileInfo>

///##########################
/// Javascript Class
/// Name: Cycle
/// Description: A Cycle is a helper to execute a piece of code repeatly.
/// Constructor:
///		pCallback: 	the a pointer to worker function,
///			   	 	this worker will be executed in the main loop.
///##########################

doufu.Cycling.Cycle = function(pCallback)
{
	// The Cycle Handle
	this.Handler = doufu.System.Handler.Generate();
	
	// Indicate whether Cycle should be halted.
	this.Halted = true;
	
	this.Worker = new doufu.System.MessageProcessor();
	
	// For Suspend method use.
	// How long to suspend.
	var suspendMilliSec = 0;
	// When suspend started.
	var suspendStartTime = null;
	
	this.Ctor = function()
	{
		if (pCallback != null && pCallback.InstanceOf(doufu.Event.CallBack));
		{
			this.SetWorkerProcess(pCallback);
		}
	}
	
	this.Looper = function(oMsg)
	{
		// Caculate suspend time
		if (suspendMilliSec < (new Date().getTime() - suspendStartTime)){
			this.Halted = false;
			suspendMilliSec = 0;
			suspendStartTime = 0;
		}

		// Don't loop if halted is true
		if (this.Halted == true)
			return;
		
		if (!(oMsg instanceof doufu.System.Message))
			throw doufu.System.Exception("The message dispatched is not derived from doufu.System.Message");
		
		this.Worker.BeforeProcess(oMsg);
	}
	
	this.SetWorkerProcess = function(pCallback)
	{
		this.Worker.Process = pCallback;
	}
	
	this.Suspend = function(iMillisecond)
	{
		suspendMilliSec = iMillisecond;
		suspendStartTime = (new Date()).getTime();
		this.Halted = true;
	}
	
	this.Start = function()
	{
		// register Cycle to manager
		doufu.Cycling.Manager.Register(this);
		this.Halted = false;
	}
	
	this.Ctor();
	
};
doufu.Display = new Object();;
/*
	Namespace: doufu.Display.Drawing
	
	Containing all drawing related sharp classes and helpers for convertion a sharp to another.
*/
doufu.Display.Drawing = {};

/*
	Class: doufu.Display.Drawing.Drawable
	
	Every sharps should inherit from this class
*/
doufu.Display.Drawing.Drawable = function()
{
	doufu.OOP.Class(this);
	
	/* 
		Property: DeepCopy
			<doufu.Property>
			Copy or get a new copy of current instance.
			If Property value is specified, function will copy the inputted Line object to current instance.
			Otherwise, function will genenrate a new instance of current instance.
	*/
	this.NewProperty("DeepCopy");
	this.DeepCopy.Get = function()
	{
		return new doufu.Display.Drawing.Drawable();
	}
	this.DeepCopy.Set = function(obj)
	{

	}
}

/*
	Class: doufu.Display.Drawing.Point
	
	A point class
	
	Inherit: 
	<doufu.Display.Drawing.Drawable>
*/
doufu.Display.Drawing.Point = function(x, y)
{
	doufu.OOP.Class(this);
	
	this.Inherit(doufu.Display.Drawing.Drawable);
	
	/*
		Property: X
		
		The X coordinator
	*/
	this.X;
	
	/*
		Property: Y
		
		The X coordinator
	*/
	this.Y;
	
	this.Ctor = function()
	{
		if (x != null && typeof x.InstanceOf != doufu.System.Constants.TYPE_UNDEFINED && x.InstanceOf(doufu.Display.Drawing.Point))
		{
			this.X = x.X;
			this.Y = x.Y;
		}
		else
		{
			this.X = x != null? x: 0;
			this.Y = y != null? y: 0;
		}
	}
	
	this.Ctor();

}

/*
	Class: doufu.Display.Drawing.Vector
	
	Vector class
	
	Inherit:
		<doufu.Display.Drawing.Point>
		
	See also:
		http://en.wikipedia.org/wiki/Vector_(spatial)
*/
doufu.Display.Drawing.Vector = function(x, y)
{
	doufu.OOP.Class(this);
	
	this.Inherit(doufu.Display.Drawing.Point, [x, y]);
	
	/*
		Property: Magnitude
		
		Get the magnitude/length/norm of current point.
	*/
	this.NewProperty("Magnitude");
	this.Magnitude.Get = function()
	{
		return Math.sqrt(this.X * this.X + this.Y * this.Y);
	}
	
	/*
		Function: Normalize
		
		Normalize current point.
	*/
	this.Normalize = function()
	{
		var magnitude = this.Magnitude();
		this.X = this.X / magnitude;
		this.Y = this.Y / magnitude;
	}
	
	/*
		Function: GetNormalized
		
		Get a normalized new point.
	*/
	this.GetNormalized = function() 
	{
		var magnitude = this.Magnitude();

		return new doufu.Display.Drawing.Vector(this.X / magnitude, this.Y / magnitude);
	}
	
	/*
		Function: DotProduct
		
		Return dot product of current vector and specified vector.
		
		Parameters:
			vector - Specified the second vector
	*/
	this.DotProduct = function(vector) 
	{
		return this.X * vector.X + this.Y * vector.Y;
	}
	
	/*
		Function: DistanceTo
		
		Caculate the distance from current vector to specified vector
		
		Parameters:
			vector - Specified the destinate vector.
	*/
	this.DistanceTo = function(vector) {
		return Math.sqrt(Math.pow(vector.X - this.X, 2) + Math.pow(vector.Y - this.Y, 2));
	}
}

/*
	Function: Subtract
	
	Do a subtraction of two vector and return the result vector.
	
	Parameters: 
		vector1 - The minuend
		vector2 - The subtrahend
		outVector - [Out, Optional] The vector to output. If not specified, will create a new one.
*/
doufu.Display.Drawing.Vector.Subtract = function(vector1, vector2, outVector)
{
	var retVector;
	
	if (outVector == null)
	{
		retVector = new doufu.Display.Drawing.Vector();
	}
	else
	{
		retVector = outVector;
	}
	
	retVector.X = vector1.X - vector2.X;
	retVector.Y = vector1.Y - vector2.Y;
	
	return retVector;
}

/*
	Class: doufu.Display.Drawing.Line
	
	A line class
	
	Inherit: 
	<doufu.Display.Drawing.Drawable>
	
	Constructor: 
		x1 - The x coordinator of first point or a instace of doufu.Display.Drawing.Line.
			If a instance of line was specified, constructor will do a deep copy.
		y1 - The y coordinator of first point.
		x2 - The x coordinator of second point.
		y2 - The y coordinator of second point.
*/
doufu.Display.Drawing.Line = function(x1, y1, x2, y2)
{
	doufu.OOP.Class(this);
	
	this.Inherit(doufu.Display.Drawing.Drawable);
	
	/* 
		Property: X1
			Indicate the x coordinator of first point.
	*/
	this.X1 = 0;
	/* 
		Property: Y1
			Indicate the y coordinator of first point.
	*/
	this.Y1 = 0;
	/* 
		Property: X2
			Indicate the x coordinator of second point.
	*/
	this.X2 = 0;
	/* 
		Property: Y2
			Indicate the y coordinator of second point.
	*/
	this.Y2 = 0;
	
	this.Ctor = function()
	{
		// Deep copying
		if (x1 != null && typeof x1.InstanceOf != doufu.System.Constants.TYPE_UNDEFINED)
		{
			this.DeepCopy(x1);
		}
		else
		{
			this.X1 = x1!=null?x1:0;
			this.Y1 = y1!=null?y1:0;
			this.X2 = x2!=null?x2:0;
			this.Y2 = y2!=null?y2:0;
		}
	}
	
	/* 
		Property: DeepCopy
			<doufu.Property>
			Copy or get a new copy of current instance.
			If Property value is specified, function will copy the inputted Line object to current instance.
			Otherwise, function will genenrate a new instance of current instance.
	*/
	this.NewProperty("DeepCopy");
	this.DeepCopy.Get = function()
	{
		return new doufu.Display.Drawing.Line(this);
	}
	this.DeepCopy.Set = function(oLine)
	{
		if (!oLine.InstanceOf(doufu.Display.Drawing.Line))
		{
			throw doufu.System.Exception("doufu.Display.Drawing.Line::DeepCopy.Set(): oLine must be an instance of doufu.Display.Drawing.Line or null");
		}
		this.X1 = oLine.X1;
		this.Y1 = oLine.Y1;
		this.X2 = oLine.X2;
		this.Y2 = oLine.Y2;
	}
	
	this.Ctor();
}

/*
	Class: doufu.Display.Drawing.Rectangle
	
	Rectangle class
	
	Inherit: 
	<doufu.Display.Drawing.Point>
	
	Constructor:
		obj - [Optional] If obj is specified and is a rectangle instance, contructor will do a deep copy of obj to current instance.
*/
doufu.Display.Drawing.Rectangle = function(obj)
{
	
	doufu.OOP.Class(this);
	
	this.Inherit(doufu.Display.Drawing.Point);
	
	/* 
		Property: Width
			Indicate the width of the rectangle.
	*/
	this.Width = 0;
	/* 
		Property: Height
			Indicate the height of the rectangle.
	*/
	this.Height = 0;
	
	/* 
		Property: DeepCopy
			<doufu.Property>
			Copy or get a new copy of current instance.
			If Property value is specified, function will copy the inputted Line object to current instance.
			Otherwise, function will genenrate a new instance of current instance.
	*/
	this.NewProperty("DeepCopy");
	this.DeepCopy.Get = function()
	{
		return new doufu.Display.Drawing.Polygon(this);
	}
	this.DeepCopy.Set = function(oRectangle)
	{
		if (!oRectangle.InstanceOf(doufu.Display.Drawing.Rectangle))
		{
			throw doufu.System.Exception("doufu.Display.Drawing.Rectangle::DeepCopy.Set(): oRectangle must be an instance of doufu.Display.Drawing.Rectangle or null");
		}
		
		this.X = oRectangle.X;
		this.Y = oRectangle.Y;
		this.Width = oRectangle.Width;
		this.Height = oRectangle.Height;
	}
	
	/*
		Function: IsDirectionOf
		
		Check if current rectangle is on the specified direction of specified rectangle
		
		Parameters:
			oDirection - Specified direction
			oRect - Specify a rectangle.
			
		Return:
			Return true if current rectange is on the specified direction of specified rectangle.
	*/
	this.IsDirectionOf = function(oDirection, oRect)
	{
		var bRet = true;
		
		if (oDirection.X() > 0)
		{
			var x = oDirection.X() * (oRect.X + oRect.Width - this.X);
			if (x <= 0)
			{
				bRet = false;
			}
		}
		else if(oDirection.X() < 0)
		{
			var x = oDirection.X() * (oRect.X - this.X - this.Width);
			if (x <= 0)
			{
				bRet = false;
			}
		}
		
		if (oDirection.Y() > 0)
		{
			var y = oDirection.Y() * (oRect.Y + oRect.Width - this.Y);
			if (y <= 0)
			{
				bRet = false;
			}
		}
		else if(oDirection.Y() < 0)
		{
			var y = oDirection.Y() * (oRect.Y - this.Y - this.Width);
			if (y <= 0)
			{
				bRet = false;
			}
		}
		
		
		return bRet;
	}
	
	this.Ctor = function()
	{
		if (obj != null)
		{
			this.DeepCopy(obj);
		}
	}
	
	this.Ctor();
}

/*
	Class: doufu.Display.Drawing.Polygon
	
	Polygon class
	
	Inherit: 
	<doufu.Display.Drawing.Drawable>, <doufu.CustomTypes.Collection> (<doufu.Display.Drawing.Point>)
*/
doufu.Display.Drawing.Polygon = function(obj)
{
	doufu.OOP.Class(this);
	
	this.Inherit(doufu.Display.Drawing.Drawable);
	
	this.Inherit(doufu.CustomTypes.Collection, [doufu.Display.Drawing.Vector]);
	
	var edgeBuffer = [];
	// Create edge buffer
	for(var i = 0; i < 255; i++)
	{
		edgeBuffer.push(new doufu.Display.Drawing.Vector());
	}
	
	/* 
		Property: Edges
		
		<doufu.CustomTypes.Collection>
		Get a set of points represent the hull of current polygon.
	*/
	this.Edges = new doufu.CustomTypes.Collection(doufu.Display.Drawing.Vector);
	
	/*
		Property: Center
		
		<doufu.Property>
		Get the center vector.
	*/
	this.NewProperty("Center");
	this.Center.Get = function()
	{
		var totalX = 0;
		var totalY = 0;
		for (var i = 0; i < this.Length(); i++)
		{
			totalX += this.Items(i).X;
			totalY += this.Items(i).Y;
		}

		return new doufu.Display.Drawing.Vector(totalX / this.Length(), totalY / this.Length());
	}
	
	/* 
		Property: DeepCopy
			<doufu.Property>
			Copy or get a new copy of current instance.
			If Property value is specified, function will copy the inputted Line object to current instance.
			Otherwise, function will genenrate a new instance of current instance.
	*/
	this.NewProperty("DeepCopy");
	this.DeepCopy.Get = function()
	{
		return new doufu.Display.Drawing.Polygon(this);
	}
	this.DeepCopy.Set = function(oPolygon)
	{
		if (!oPolygon.InstanceOf(doufu.Display.Drawing.Polygon))
		{
			throw doufu.System.Exception("doufu.Display.Drawing.Polygon::DeepCopy.Set(): oPolygon must be an instance of doufu.Display.Drawing.Polygon or null");
		}
		
		this.Clear();
		
		for (var i = 0; i < oPolygon.Length(); i ++)
		{
			this.Add(doufu.System.APIs.Clone(oPolygon.Items(i), 0));
		}
	}
	
	/*
		Function: BuildEdges
		
		Build the edges of current polygon.
	*/
	this.BuildEdges = function()
	{
		var p1,p2;
		
		this.Edges.Clear();
		
		for (var i = 0; i < this.Length(); i++) {
			p1 = this.Items(i);
			if (i + 1 >= this.Length()) {
				p2 = this.Items(0);
			} else {
				p2 = this.Items(i + 1);
			}
			if (i >= edgeBuffer.length)
			{
				for (var j = edgeBuffer.length; j <= i; j++)
				{
					edgeBuffer.push(new doufu.Display.Drawing.Vector());
				}
			}
			doufu.Display.Drawing.Vector.Subtract(p2,p1, edgeBuffer[i]);
			this.Edges.Add(edgeBuffer[i]);
		}
	}
	
	this.OverloadMethod("Offset", function(v)
	{
		this.Offset(v.X, v.Y);
	});
	
	this.OverloadMethod("Offset", function(x, y) 
	{
		for (var i = 0; i < this.Length(); i++) {
			var p = this.Items(i);
			this.InnerArray()[i] = new doufu.Display.Drawing.Vector(p.X + x, p.Y + y);
		}
	});
	
	var __base_Clear = this.OverrideMethod("Clear", function()
	{
		
		this.Edges.Clear();
		
		__base_Clear.call(this);
	});
	
	this.Ctor = function()
	{
		// Deep copying
		if (obj != null && obj.InstanceOf(doufu.Display.Drawing.Polygon))
		{
			this.DeepCopy(obj);
		}
	}
	
	this.Ctor();
}

/*
	Class: doufu.Display.Drawing.Cube
	
	Cube class, describing sharp and position of a 3d cube.
	
	Inherit: 
	<doufu.Display.Drawing.Rectangle>
*/
doufu.Display.Drawing.Cube = function(obj)
{
	doufu.OOP.Class(this);
	
	this.Inherit(doufu.Display.Drawing.Rectangle);
	
	this.Z = 0;
	this.Depth = 0;
	
	this.Ctor = function()
	{
		// Deep copying
		if (obj != null && typeof obj.InstanceOf != doufu.System.Constants.TYPE_UNDEFINED)
		{
			this.DeepCopy(obj);
		}
	}
	
	this.NewProperty("DeepCopy");
	this.DeepCopy.Get = function()
	{
		return new doufu.Display.Drawing.Cube(this);
	}
	this.DeepCopy.Set = function(oCube)
	{
		if (!oCube.InstanceOf(doufu.Display.Drawing.Cube))
		{
			throw doufu.System.Exception("doufu.Display.Drawing.Cube::DeepCopy.Set(): oCube must be an instance of doufu.Display.Drawing.Cube or null");
		}
		
		this.X = oCube.X;
		this.Y = oCube.Y;
		this.Z = oCube.Z;
	}
	
	this.Ctor();
}

/* 
	Section: Static Functions
	
	Static drawing related helpers.
*/

/*
	Function: doufu.Display.Drawing.ConvertPointsToRectangle
	
	Convert two points to a rectangle.
	The first point will be the upleft point of the rectangle and the second point will be the bottom right point.
	
	Parameters:
	
		oPoint1 - Specify the upleft point.
		oPoint2 - Specify the bottom right point.
		oRectangle - [Out, Optional] if a rectangle is specified, function will modify the rectangle and return it.
					 if not, function will create a new rectangle.
					 Note: Creating new object will consuming lots of cpu times
	
	Returns:
	
		A rectangle.
*/
doufu.Display.Drawing.ConvertPointsToRectangle = function(oPoint1, oPoint2, oRectangle)
{
	if (!oPoint1.InstanceOf(doufu.Display.Drawing.Point))
	{
		throw doufu.System.Exception("doufu.Display.Drawing.ConvertPointsToRectangle(): oPoint1 is not a Point.");
	}
	
	if (!oPoint2.InstanceOf(doufu.Display.Drawing.Point))
	{
		throw doufu.System.Exception("doufu.Display.Drawing.ConvertPointsToRectangle(): oPoint2 is not a Point.");
	}
	
	// smallest x point and y point, biggest x point and y point.
	var sPointX, sPointY, bPointX, bPointY;
	var rectRet;
	
	if (oPoint1.X < oPoint2.X)
	{
		sPointX = oPoint1.X;
		bPointX = oPoint2.X;
	}
	else
	{
		sPointX = oPoint2.X;
		bPointX = oPoint1.X;
	}
	
	if (oPoint1.Y < oPoint2.Y)
	{
		sPointY = oPoint1.Y;
		bPointY = oPoint2.Y;
	}
	else
	{
		sPointY = oPoint2.Y;
		bPointY = oPoint1.Y;
	}
	
	if (!oRectangle)
	{
		rectRet = new doufu.Display.Drawing.Rectangle();
	}
	else
	{
		rectRet = oRectangle;
	}
	
	rectRet.X = sPointX;
	rectRet.Y = sPointY;
	rectRet.Width = bPointX - sPointX;
	rectRet.Height = bPointY - sPointY;
	
	return rectRet;
}

/*
	Function: doufu.Display.Drawing.ConvertRectangleToPolygon
	
	Convert a rectangle to a polygon.
	
	Parameters:
	
		oRectangle - Specify the rectangle to be converted.
		outPolygon - [Out, Optional] if a polygon is specified, function will modify the polygon and return it.
					 if not, function will create a new polygon.
					 Note: Creating new object will consuming lots of cpu times
	
	Returns:
		A new polygon which has 4 points from the rectangle.
*/
doufu.Display.Drawing.ConvertRectangleToPolygon = function(oRectangle, outPolygon)
{
	if (!oRectangle.InstanceOf(doufu.Display.Drawing.Rectangle))
	{
		throw doufu.System.Exception("doufu.Display.Drawing.ConvertRectangleToPolygon(): oRectangle is not a rectangle.");
	}
	var retPolygon;
	if (outPolygon == null)
	{
		retPolygon = new doufu.Display.Drawing.Polygon();
	}
	else
	{
		retPolygon = outPolygon;
	}
	
	retPolygon.Clear();
	retPolygon.Add(new doufu.Display.Drawing.Vector(oRectangle.X, oRectangle.Y));
	retPolygon.Add(new doufu.Display.Drawing.Vector(oRectangle.X + oRectangle.Width, oRectangle.Y));
	retPolygon.Add(new doufu.Display.Drawing.Vector(oRectangle.X + oRectangle.Width, oRectangle.Y + oRectangle.Height));
	retPolygon.Add(new doufu.Display.Drawing.Vector(oRectangle.X, oRectangle.Y + oRectangle.Height));
	
	return retPolygon;
}

/*
	Function: doufu.Display.Drawing.ConvertPolygonToRectangle
	
	Create a rectangle hull for a polygon.
	The smallest and biggest coordinates of rectangle will be the same as the corresponding coordinates of the polygon.
	
	Parameters:
	
		oPolygon - Specify the polygon to be converted.
		outRectangle - [Out, Optional] if a rectangle is specified, function will modify the rectangle and return it.
					 if not, function will create a new rectangle.
					 Note: Creating new object will consuming lots of cpu times
	
	Returns:
		A new rectangle hull.
*/
doufu.Display.Drawing.ConvertPolygonToRectangle = function(oPolygon, outRectangle)
{
	if (!oPolygon.InstanceOf(doufu.Display.Drawing.Polygon))
	{
		throw doufu.System.Exception("doufu.Display.Drawing.ConvertRectangleToPolygon(): oPolygon is not a polygon.");
	}
	var retRectangle;
	if (outRectangle == null)
	{
		retRectangle = new doufu.Display.Drawing.Rectangle();
	}
	else
	{
		retRectangle = outRectangle;
	}
	
	var sX, sY, bX, bY;
	
	sX = oPolygon.Items(0).X;
	sY = oPolygon.Items(0).Y;
	bX = oPolygon.Items(0).X;
	bY = oPolygon.Items(0).Y;
	
	for(var i = 1; i < oPolygon.Length(); i++)
	{
		// get the lowest point.
		if (sX > oPolygon.Items(i).X)
		{
			sX = oPolygon.Items(i).X;
		}
		
		if (sY > oPolygon.Items(i).Y)
		{
			sY = oPolygon.Items(i).Y;
		}
		
		if (bX < oPolygon.Items(i).X)
		{
			bX = oPolygon.Items(i).X;
		}
		
		if (bY < oPolygon.Items(i).Y)
		{
			bY = oPolygon.Items(i).Y;
		}
	}
	
	retRectangle.X = sX;
	retRectangle.Y = sY;
	retRectangle.Width = bX - sX;
	retRectangle.Height = bY - sY;
	
	return retRectangle;
};
doufu.Display.BaseObject = function()
{
	doufu.OOP.Class(this);
	
	this.Inherit(doufu.System.Handler.Handlable);
	
	this.Inherit(doufu.Display.Drawing.Rectangle);
	
	var BACKGROUND_REPEAT_STYLE = "no-repeat";
	
	// Properties
	var _htmlElement;
	this.NewProperty("HTMLElement");
	this.HTMLElement.Get = function()
	{
		return _htmlElement;
	}
	this.HTMLElement.Set = function(value)
	{
		if (typeof value == "string")
		{
			_htmlElement = document.getElementById(value);
		}
		else
		{
			_htmlElement = value;
		}
	}
	
	// Public Methods
	// this.Render
	
	this.Render = new doufu.Event.CallBack(function(oSender, oMsg)
	{
		if (
			doufu.System.MessageConstants.IsMessage(oMsg,
			doufu.System.MessageConstants.DISPLAY_RENDER) &&
			doufu.System.Handler.IsMe(this, oMsg.Handler)
			)
		{
			this.HTMLElement().style.left = this.X + "px";
			this.HTMLElement().style.top = this.Y + "px";
			this.HTMLElement().style.zIndex = this.Z;
			this.HTMLElement().style.width = this.Width + "px";
			this.HTMLElement().style.height = this.Height + "px";
			this.HTMLElement().style.backgroundPosition = doufu.System.Convert.ToString(-this.ImageOffset.X) + "px " + doufu.System.Convert.ToString(-this.ImageOffset.Y) + "px";
			
			this.HTMLElement().style.backgroundRepeat = BACKGROUND_REPEAT_STYLE;
			
			// deal with background image
			var backgroundImage = "url(" + this.ImagePath + ")";
			
			if (backgroundImage != this.HTMLElement().style.backgroundImage)
			{
				this.HTMLElement().style.backgroundImage = backgroundImage;
			}
			
			// verbose log
			doufu.System.Logger.Verbose("doufu.Display.BaseObject: Message=" + oMsg.Message + "; Handler=" + oMsg.Handler);
		}
	},
	this);
	
	// Attributes
	this.ImageOffset = new doufu.Display.Drawing.Rectangle();
	this.ImagePath = new String();
	this.Z = 0;
	// Indicate whether this display object is in user's view.
	this.IsInView = false;
	
	
	// variables
	
	this.Handler = doufu.System.Handler.Generate();
	
	this.Ctor = function()
	{
		this.HTMLElement(doufu.Browser.DOM.CreateElement("div").Native());
		this.HTMLElement().style.position="absolute";
		
		doufu.System.Logger.Debug("doufu.Display.BaseObject::Ctor(): Initialized");
	}
	
	this.Ctor();
	
	// TO DO: 1) AnimationFrame object, the object specified the position of action frame in the static picture.
};
///##########################
/// Javascript Class
/// Name: doufu.Display.Manager
/// Description: 
/// 	Help rendering all display object.
///
/// Properties:
/// 	HTMLElement: A reference to the html element which used for displaying. 
/// 	Width: Readonly, get the display area width.
/// 	Height: Readonly, get the display area height.
///
/// Events:
/// 	OnRender: Will be fired when DISPLAY_RENDER message is caught.
///
/// Public Methods:
/// 	InsertObject(obj)
///##########################

doufu.Display.Manager = function(oHTMLElement)
{
	doufu.OOP.Class(this);
	
	// Define properties and variables
	
	// Inner Cycle for rendering display 
	var _renderingCycle;
	
	var _displayObjects = new Array();
	
	var _htmlElement;
	this.NewProperty("HTMLElement");
	this.HTMLElement.Get = function()
	{
		return _htmlElement;
	}
	this.HTMLElement.Set = function(value)
	{
		if (typeof value == "string")
		{
			doufu.System.Logger.Debug("doufu.Display.Manager: Set html element by id \"" + value + "\"");
			_htmlElement = document.getElementById(value);
			doufu.System.Logger.Debug("doufu.Display.Manager: Html element was set");
		}
		else
		{
			_htmlElement = value;
		}
	}
	
	this.NewProperty("Width");
	this.Width.Get = function()
	{
		return this.HTMLElement().clientWidth;
	}
	
	this.NewProperty("Height");
	this.Height.Get = function()
	{
		return this.HTMLElement().clientHeight;
	}
	
	// On Render event.
	this.OnRender = new doufu.Event.EventHandler(this);
	
	// Define properties and variables End
	
	this.Looper = function(oMsg)
	{
		if (doufu.System.MessageConstants.IsMessage(oMsg,
			doufu.System.MessageConstants.DISPLAY_RENDER
			))
		{
			doufu.System.Logger.Verbose("doufu.Display.Manager: Sending message: message=" + oMsg.Message);
			this.OnRender.Invoke(oMsg);
			doufu.System.Logger.Verbose("doufu.Display.Manager: Message was sent.");
		}
	}
	
	// Insert a object to this display manager
	this.InsertObject = function(obj)
	{
		if (!obj.InstanceOf(doufu.Display.BaseObject))
		{
			throw doufu.System.Exception("obj is not a instance of doufu.Display.BaseObject!");
		}
		
		doufu.System.Logger.Debug("doufu.Display.Manager: Insert Object - " + obj);
		
		if (
			typeof obj.InstanceOf != doufu.System.Constants.TYPE_UNDEFINED  &&
			obj.InstanceOf(doufu.Display.BaseObject)
			)
		{	
			doufu.System.Logger.Debug("doufu.Display.Manager: Insert Object - Object is type safed.");
			
			this.HTMLElement().appendChild(obj.HTMLElement());
			
			doufu.System.Logger.Debug("doufu.Display.Manager: The render function is " + obj.Render);
			
			// Attach the display base object to on render event
			this.OnRender.Attach(obj.Render);
			// Indicate obj is in view
			obj.IsInView = true;
			
			doufu.System.Logger.Debug("doufu.Display.Manager: Insert Object - Object Inserted.");
		}
	}
	
	// Remove a object from display manager
	this.RemoveObject = function(obj)
	{
		if (!obj.InstanceOf(doufu.Display.BaseObject))
		{
			throw doufu.System.Exception("obj is not a instance of doufu.Display.BaseObject!");
		}
		
		doufu.System.Logger.Debug("doufu.Display.Manager: Remove Object - " + obj);
		
		if (
			typeof obj.InstanceOf != doufu.System.Constants.TYPE_UNDEFINED  &&
			obj.InstanceOf(doufu.Display.BaseObject)
			)
		{	
			doufu.System.Logger.Debug("doufu.Display.Manager: Remove Object - Object is type safed.");
			
			this.HTMLElement().removeChild(obj.HTMLElement());
			
			doufu.System.Logger.Debug("doufu.Display.Manager: The render function is " + obj.Render);
			
			// Attach the display base object to on render event
			this.OnRender.Detach(obj.Render);
			
			// Indicate obj is not in view
			obj.IsInView = false;
			
			doufu.System.Logger.Debug("doufu.Display.Manager: Remove Object - Object Removed.");
		}
	}
	
	// Initialize variables and properties.
	this.Ctor = function()
	{
		_renderingCycleCallback = new doufu.Event.CallBack(this.Looper, this);
		_renderingCycle = new doufu.Cycling.Cycle();
		_renderingCycle.SetWorkerProcess(_renderingCycleCallback);
		_renderingCycle.Start();
		
		// Set HTMLElement property
		// if oHTMLElement is a string, consider it as element id and get the reference.
		// otherwise assign the element reference directly
		if (oHTMLElement != null)
		{
			this.HTMLElement(oHTMLElement);
		}
	};
	
	this.Ctor();
	
}

///##########################
/// Javascript Static Method
/// Name: doufu.Display.Manager.Create
/// Description: 
/// 	Create a instance of doufu.Display.Manager
///
/// Parameters:
/// 	[TypePrameterHere]
/// 	
///
///##########################
doufu.Display.Manager.Create = function(elmtParent, elmtID, iWidth, iHeight)
{
	var tmpDiv = doufu.Browser.Helpers.CreateOverflowHiddenDiv(elmtID, elmtParent, iWidth , iHeight);
	//tmpDiv.style.width = iWidth + "px";
	//tmpDiv.style.height = iHeight + "px";
	//tmpDiv.style.border = "1px solid #000"; //hard coded
	return new doufu.Display.Manager(tmpDiv);
};
doufu.CustomTypes = new Object();;
/*
	Class: doufu.CustomTypes.Collection
	
	A strong typed array
	
	Constructor:
		baseClass - Specify a base class, all elements in this collection should inherited from the base class
*/
doufu.CustomTypes.Collection = function(baseClass)
{
	doufu.OOP.Class(this);
	
	/*
		Property: InnerArray
		
		<doufu.Property>
		Get or set the inner array which used by collection.
	*/
	var _innerArray = new Array();
	this.NewProperty("InnerArray");
	this.InnerArray.Get = function()
	{
		return _innerArray;
	}
	this.InnerArray.Set = function(value)
	{
		_innerArray = value
	}
	
	/*
		Property: Length
		
		<doufu.Property>
		Get the lenght of current collection.
	*/
	this.NewProperty("Length");
	this.Length.Get = function()
	{
		return _innerArray.length;
	}
	this.Length.Set = function(value)
	{
		// readonly
		return;
	}
	// Properties end
	
	/*
		Function: Add
		
		Add a object of specified type to the collection.
		
		Parameters:
			obj - An object to be added.
	*/
	this.Add = function(obj)
	{
		if (typeof obj.InstanceOf == doufu.System.Constants.TYPE_UNDEFINED  || !obj.InstanceOf(baseClass))
		{
			throw doufu.System.Exception("doufu.CustomTypes.Collection::Add(): Specified object type is not allowed.");
		}
			
		_innerArray.push(obj);
		return this.Length();
	}
	
	/*
		Function: AddArray
		
		Add a set of objects of specified type to the collection.
		
		Parameters:
			obj - An array of object of specified type .
	*/
	this.AddArray = function(obj)
	{
		if (typeof obj.length == doufu.System.Constants.TYPE_UNDEFINED || obj.length <= 0)
		{
			throw doufu.System.Exception("doufu.CustomTypes.Collection::AddArray(): Specified object is not an array or the array length is 0.");
		}
		
		for (var i = 0; i < obj.length; i ++)
		{
			if (typeof obj[i].InstanceOf == doufu.System.Constants.TYPE_UNDEFINED  || !obj[i].InstanceOf(baseClass))
			{
				throw doufu.System.Exception("doufu.CustomTypes.Collection::AddArray(): Specified object type is not allowed.");
			}
			_innerArray.push(obj[i]);
		}
		
		return this.Length();
	}
	
	/*
		Function: Remove
		
		Remove a object from collection
		
		Parameters:
			obj - An object to be removed.
	*/
	this.Remove = function(obj)
	{
		for (var i = 0; i < this.Length; i++)
		{
			if (_innerArray[i] == obj)
			{
				break;
			}
		}
		_innerArray.splice(i,1);
		return this.Length();
	}
	
	/*
		Function: Clear
		
		Clear the elements in the collection.
	*/
	this.Clear = function()
	{
		this.InnerArray().length = 0;
	}
	
	/*
		Function: Items
		
		Get the element in the collection with speicifed index.
	*/
	this.Items = function(index)
	{
		return _innerArray[index];
	}
	
	/*
		Function: Contain
		
		Check if specified obj is in this collection.
	*/
	this.Contain = function(obj)
	{
		for( var i = 0; i < this.Length(); i++)
		{
			if (obj === this.Items(i))
			{
				return true;
			}
		}
		
		return false;
	}
	
}
;
doufu.CustomTypes.Stack = function()
{
	doufu.OOP.Class(this);

	var _top;
	this.NewProperty("Top");
	this.Top.Get = function()
	{
		return _top;
	}
	
	var _length = 0;
	this.NewProperty("Length");
	this.Length.Get = function()
	{
		return _length;
	}
	this.Length.Set = function(value)
	{
		_length = value;
	}

	this.Push = function(obj)
	{
		var tmp = new doufu.CustomTypes.StackElement();
		tmp.RefObject = obj;
		tmp.LinkedStackElement = _top;
		_length++;
		return _top = tmp;
	}
	
	this.Pop = function()
	{
		if (_top != null)
		{
			var tmp = _top;
			_top = _top.LinkedStackElement;
			_length--;
			return tmp.RefObject;
		}
		return null;
	}
	

}

///##########################
/// Javascript Class
/// Name: doufu.CustomTypes.StackElement
/// Description: 
/// 	An element which used for stacking
///
/// Attribute:
/// 	RefObject: The actual content or data in the stack
/// 	LinkedStackElement: The stack element which on the bottom of current element
///
///##########################
doufu.CustomTypes.StackElement = function()
{
	doufu.OOP.Class(this);
	
	this.RefObject = null;
	this.LinkedStackElement = null;
	
};
/*
	Class: doufu.BenchMark 
	
	BenchMark utility, helps count the time consumed while executing specified piece of code.
*/
doufu.BenchMark = function()
{
	doufu.OOP.Class(this);
	
	var dtStarts = new doufu.CustomTypes.Stack();
	var iResults = [];
	var enable = doufu.System.Logger.IsDebug();
	
	
	/*
		Function: Record
		
		Start to record
		
		Parameters:
			sName - Specified a name for current record.
			signal - If this is not null, benchmark will work only if the signal is set.
	*/
	this.Record = function(sName, signal)
	{
		if (enable)
		{
			// if the signal specified but not set, return directly.
			if (signal != null && !signal.IsSet())
			{
				return;
			}
			var elmt = new doufu.BenchMark.Element();
			elmt.Name = sName;
			elmt.StartTime = new Date().getTime();
			dtStarts.Push(elmt);
		}
	}
	
	/*
		Function: End
		
		End a recording, and push the costed time into array.
		
		Parameters:
			sName - Specified a end name for current record.
			signal - If this is not null, benchmark will work only if the signal is set.
		
	*/
	this.End = function(sName, signal)
	{
		if (enable)
		{
			// if the signal specified but not set, return directly.
			if (signal != null && !signal.IsSet())
			{
				return;
			}
			var elmt = dtStarts.Pop();
			if (elmt != null)
			{
				if (sName != null)
				{
					elmt.Name += "/" + sName;
				}
				elmt.Cost = (new Date().getTime()) - elmt.StartTime;
				iResults.push(elmt);
			}
		}
	}
	
	/*
		Function: ListToConsole
		
		Write information to console.
	*/
	this.ListToConsole = function()
	{
		enable = false;
		
		for(var i = 0; i < iResults.length; i++)
		{
			doufu.System.Logger.Debug("doufu.BenchMark::ListToConsole() - Name: " + iResults[i].Name + " StartTime: " + 
			iResults[i].StartTime + " Cost: " + iResults[i].Cost);
		}
		
		// clear array
		iResults.length = 0;
		
		enable = true;
	}
}

/*
	Struct: doufu.BenchMark.Element
	
	Element struct which used by benchmark class.
*/
doufu.BenchMark.Element = function()
{
	/*
		Property: Name
		
		The name of current benchmark element.
	*/
	this.Name = "";
	
	/* 
		Property: StartTime
	*/
	this.StartTime = 0;
	
	/*
		Property: Cost
	*/
	this.Cost = 0;
}

/*
	Class: doufu.BenchMark.Signal
	
	Signal which used for control when benchmark should start to record.
*/
doufu.BenchMark.Signal = function()
{
	var value = false;
	
	/*
		Property: IsSet
		
		Get current status of signal, return true if set.
	*/
	this.IsSet = function()
	{
		return value;
	}
	
	/*
		Function: Set
		Set the signal, corresponding benchmark will start to record.
	*/
	this.Set = function()
	{
		value = true;
	}
	
	/*
		Function: Release
		
		Release the signal, benchmark will stop recording.
	*/
	this.Release = function()
	{
		value = false;
	}
}

/*
	Section: doufu.BenchMark.Instance
	
	A singleton benchmark.
*/
doufu.BenchMark.Instance = new doufu.BenchMark();;
/*
   Namespace: doufu.Game

   All game related classes and functions.

*/
doufu.Game = {};;
/*
	Namespace: doufu.Game.Helpers
	
	Containing all game related helpers and collision test helpers.
*/
doufu.Game.Helpers = {};

/*
	Function: doufu.Game.Helpers.IsCollided
	
	Return true if two drawable object are collided. otherwise, return false.
	
	Parameters:
		obj1 - a Drawable object which to be tested.
		obj2 - a Drawable object which to be tested.
		oDirection -  [Optional] Only required when detecting polygon collision, if direction is specified, will speed up caculation.
*/
doufu.Game.Helpers.IsCollided = function(obj1, obj2, oDirection)
{
	if (doufu.System.APIs.NumberOfType(doufu.Display.Drawing.Rectangle, obj1, obj2) == 2)
	{
		return doufu.Game.Helpers.IsRectangleCollided(obj1, obj2);
	}
	else if (doufu.System.APIs.NumberOfType(doufu.Display.Drawing.Polygon, obj1, obj2) == 2)
	{
		return doufu.Game.Helpers.IsPolygonCollided(obj1, obj2, oDirection);
	}
	else if (doufu.System.APIs.NumberOfType(doufu.Display.Drawing.Rectangle, obj1, obj2) == 1 &&
		doufu.System.APIs.NumberOfType(doufu.Display.Drawing.Polygon, obj1, obj2) == 1)
	{
		if(obj1.InstanceOf(doufu.Display.Drawing.Rectangle))
		{
			doufu.Display.Drawing.ConvertRectangleToPolygon(obj1, doufu.Game.Helpers.IsCollided.__poly);
			return doufu.Game.Helpers.IsPolygonCollided(doufu.Game.Helpers.IsCollided.__poly, obj2);
		}
		else if(obj2.InstanceOf(doufu.Display.Drawing.Rectangle))
		{
			doufu.Display.Drawing.ConvertRectangleToPolygon(obj2, doufu.Game.Helpers.IsCollided.__poly);
			return doufu.Game.Helpers.IsPolygonCollided(doufu.Game.Helpers.IsCollided.__poly, obj1);
		}
	}
}

// don't want to instantiate at runtime.
doufu.Game.Helpers.IsCollided.__poly = new doufu.Display.Drawing.Polygon();
doufu.Game.Helpers.IsCollided.__rect = new doufu.Display.Drawing.Rectangle();

/*
	Function: doufu.Game.Helpers.IsRectangleCollided
	
	Return true if two rectangle object are collided. otherwise, return false.
	
	Parameters:
		obj1 - <doufu.Display.Drawing.Rectangle> a rectangle object which to be tested.
		obj2 - <doufu.Display.Drawing.Rectangle> a rectangle object which to be tested.
*/
doufu.Game.Helpers.IsRectangleCollided = function(oRectangle1, oRectangle2)
{
	
	if (!oRectangle1.InstanceOf(doufu.Display.Drawing.Rectangle))
	{
		throw doufu.System.Exception("doufu.Game.Helpers.IsCollided(): oRectangle1 is not a rectangle.");
	}
	
	if (!oRectangle2.InstanceOf(doufu.Display.Drawing.Rectangle))
	{
		throw doufu.System.Exception("doufu.Game.Helpers.IsCollided(): oRectangle2 is not a rectangle.");
	}
	
	if (oRectangle1.X > (oRectangle2.X + oRectangle2.Width) || (oRectangle1.X + oRectangle1.Width) < oRectangle2.X)
	{
		return false;
	}
	if (oRectangle1.Y > (oRectangle2.Y + oRectangle2.Height) || (oRectangle1.Y + oRectangle1.Height) < oRectangle2.Y)
	{
		return false;
	}
	return true;
}

/*
	Function: doufu.Game.Helpers.__intervalDistance
	
	Calculate the distance between [minA, maxA] and [minB, maxB]
	The distance will be negative if the intervals overlap
*/
doufu.Game.Helpers.__intervalDistance = function(minA, maxA, minB, maxB) 
{
	if (minA < minB) {
		return minB - maxA;
	} else {
		return minA - maxB;
	}
}

/*
	Function: doufu.Game.Helpers.ProjectPolygon
	
	Calculate the projection of a polygon on an axis and returns it as a [min, max] interval.
*/
doufu.Game.Helpers.ProjectPolygon = function(axis, polygon, min, max)
{
	// To project a point on an axis use the dot product
	var d = axis.DotProduct(polygon.Items(0));
	min.value = d;
	max.value = d;
	for (var i = 0; i < polygon.Length(); i++) {
		d = polygon.Items(i).DotProduct(axis);
		if (d < min.value) {
			min.value = d;
		} else {
			if (d > max.value) {
				max.value = d;
			}
		}
	}
}

/*
	Function: doufu.Game.Helpers.IsRectangleCollided
	
	Check if polygon A is going to collide with polygon B for the given velocity
	
	Parameters:
		polygonA - <doufu.Display.Drawing.Polygon> a polygon object which to be tested (The collidee).
		polygonB - <doufu.Display.Drawing.Polygon> a polygon object which to be tested.
		oDirection - [Optional] If specified, only do detection with the polygon in front of the collidee.
*/
doufu.Game.Helpers.IsPolygonCollided = function(polygonA, polygonB, oDirection) 
{
	// do velocity check
	// only do detection with the polygon in front of the collidee.
	doufu.Display.Drawing.ConvertPolygonToRectangle(polygonA, doufu.Game.Helpers.IsPolygonCollided.__rect1);
	doufu.Display.Drawing.ConvertPolygonToRectangle(polygonB, doufu.Game.Helpers.IsPolygonCollided.__rect2);
	
	if (oDirection != null)
	{
		if (!doufu.Game.Helpers.IsPolygonCollided.__rect1.IsDirectionOf(oDirection,  doufu.Game.Helpers.IsPolygonCollided.__rect2))
		{
			return false;
		}
	}
	if (!doufu.Game.Helpers.IsRectangleCollided(doufu.Game.Helpers.IsPolygonCollided.__rect1, doufu.Game.Helpers.IsPolygonCollided.__rect2))
	{
		return false;
	}
	
	
	if (polygonA.Edges == null || polygonA.Edges.Length() == 0)
	{
		polygonA.BuildEdges();
	}
	if (polygonB.Edges == null || polygonB.Edges.Length() == 0)
	{
		polygonB.BuildEdges();
	}
	
	var edgeCountA = polygonA.Edges.Length();
	var edgeCountB = polygonB.Edges.Length();

	var edge;
	
	// Loop through all the edges of both polygons
	for (var edgeIndex = 0; edgeIndex < edgeCountA + edgeCountB; edgeIndex++) 
	{
		
		if (edgeIndex < edgeCountA) {
			edge = polygonA.Edges.Items(edgeIndex);
		} else {
			edge = polygonB.Edges.Items(edgeIndex - edgeCountA);
		}

		// ===== 1. Find if the polygons are currently intersecting =====

		// Find the axis perpendicular to the current edge
		var axis = doufu.Game.Helpers.IsPolygonCollided.__axis;
		axis.X = -edge.Y;
		axis.Y = edge.X;
		axis.Normalize();

		// Find the projection of the polygon on the current axis
		var minA = new Object();
		var minB = new Object();
		var maxA = new Object();
		var maxB = new Object();
		
		doufu.Game.Helpers.ProjectPolygon(axis, polygonA, minA, maxA);
		doufu.Game.Helpers.ProjectPolygon(axis, polygonB, minB, maxB);

		// Check if the polygon projections are currentlty intersecting
		if (doufu.Game.Helpers.__intervalDistance(minA.value, maxA.value, minB.value, maxB.value) > 0) 
		{
			return false;
		}
		
	}
	
	return true;
}

doufu.Game.Helpers.IsPolygonCollided.__axis = new doufu.Display.Drawing.Vector();
doufu.Game.Helpers.IsPolygonCollided.__rect1 = new doufu.Display.Drawing.Rectangle();
doufu.Game.Helpers.IsPolygonCollided.__rect2 = new doufu.Display.Drawing.Rectangle();;
///##########################
/// Javascript Class
/// Name: doufu.Game.PlayGround
/// Description: 
/// 	Playground itself is also a display object
///
/// Attributes:
/// 	
/// 	
///
///##########################

doufu.Game.PlayGround = function(oDisplayManager)
{
	
	doufu.OOP.Class(this);
	
	this.Inherit(doufu.Display.BaseObject);
	
	/////////////////////////
	// Define properties and variables
	/////////////////////////
	
	/*
		Property: LinkedDisplayManager
		
		<doufu.Propery>
		Get the linked display manager of current playground.
	*/
	var linkedDisplayMgr = null;
	this.NewProperty("LinkedDisplayManager");
	this.LinkedDisplayManager.Get = function()
	{
		return linkedDisplayMgr;
	}
	var displayBufferOffset = new doufu.Display.Drawing.Rectangle();
	
	// for saving all inserted elements
	var _gameObjects = new doufu.CustomTypes.Collection(doufu.Game.BaseObject);
	this.NewProperty("GameObjects");
	this.GameObjects.Get = function()
	{
		return _gameObjects;
	}
	this.GameObjects.Set = function(value)
	{
		_gameObjects = value;
	}
	
	// Javascript property Camera
	var _camera = new doufu.Game.PlayGround.Camera();
	this.NewProperty("Camera");
	this.Camera.Get = function()
	{
		return _camera;
	}
	this.Camera.Set = function(value)
	{
		_camera = value;
	}
	
	this.OnInsertObject = new doufu.Event.EventHandler(this);
	
	// Define properties and variables End
	
	/////////////////////////
	// Public Methods
	/////////////////////////
	
	this.InsertObject = function(obj)
	{
		this.OnInsertObject.Invoke(obj);
		_gameObjects.Add(obj);
	}
	
	this.RemoveObject = function(obj)
	{
		linkedDisplayMgr.RemoveObject(obj.LinkedDisplayObject());
		_gameObjects.Remove(obj);
	}
	
	this._base_RenderRefer = this.Render.Reference;
	this.Render.Reference = function(oSender, oEvent)
	{
		// Caculate which part of the background should be displayed according to camera coordinate
		this.ImageOffset.X = this.Camera().X;
		this.ImageOffset.Y = this.Camera().Y;
		
		// Insert in-range display object to display manager
		for (var i = 0; i < _gameObjects.Length(); i++)
		{
			
			// this is the player rectangle which on the screen surface (caculated by the analog);
			displayBufferOffset.Width = _gameObjects.InnerArray()[i].Width;
			displayBufferOffset.Height = _gameObjects.InnerArray()[i].Height;
			displayBufferOffset.X = _gameObjects.InnerArray()[i].X;
			displayBufferOffset.Y = doufu.Game.PlayGround.Helpers.RealYToScreenY(_gameObjects.InnerArray()[i].Y, true);
			
			if(doufu.Game.Helpers.IsCollided(displayBufferOffset, this.Camera()))
			{
				// translate game object to display object.
				_gameObjects.InnerArray()[i].LinkedDisplayObject().X = displayBufferOffset.X - this.Camera().X;
				// Assuming the anglog is 60 degree.
				_gameObjects.InnerArray()[i].LinkedDisplayObject().Y = Math.round(displayBufferOffset.Y - this.Camera().Y);
				
				// The actual z value in the screen depend on the y coordinate. the game object is start from 4000 layer
				_gameObjects.InnerArray()[i].LinkedDisplayObject().Z = Math.round((_gameObjects.InnerArray()[i].Z + 1) * 4000 + _gameObjects.InnerArray()[i].LinkedDisplayObject().Y);
				_gameObjects.InnerArray()[i].LinkedDisplayObject().Width = _gameObjects.InnerArray()[i].Width;
				_gameObjects.InnerArray()[i].LinkedDisplayObject().Height = _gameObjects.InnerArray()[i].Height;
				_gameObjects.InnerArray()[i].LinkedDisplayObject().ImageOffset = _gameObjects.InnerArray()[i].ImageOffset;
				_gameObjects.InnerArray()[i].LinkedDisplayObject().ImagePath = _gameObjects.InnerArray()[i].ImagePath;

				if (_gameObjects.InnerArray()[i].LinkedDisplayObject().IsInView == false)
				{
					linkedDisplayMgr.InsertObject(_gameObjects.InnerArray()[i].LinkedDisplayObject());
				}
			}
			else
			{
				// linkeedDisplayMgr removeObject
				if (_gameObjects.InnerArray()[i].LinkedDisplayObject().IsInView == true)
				{
					linkedDisplayMgr.RemoveObject(_gameObjects.InnerArray()[i].LinkedDisplayObject());
				}
				
			}
		}
		
		this._base_RenderRefer(oSender, oEvent);
	}
	
	/////////////////////////
	// Constructor, Initializing variables and properties.
	/////////////////////////
	this.Ctor = function()
	{
		if (!oDisplayManager.InstanceOf(doufu.Display.Manager))
		{
			throw doufu.System.Exception("doufu.Game.PlayGround::Ctor(): Must specified a display manager.");
		}
		
		doufu.System.Logger.Debug("doufu.Game.PlayGround::Ctor(): Loopped in.");
		
		// Link display manager
		linkedDisplayMgr = oDisplayManager;
		doufu.System.Logger.Debug("doufu.Game.PlayGround::Ctor(): created play ground temporary html element.");
		
		// Inserted play ground it self to display mananger.
		doufu.System.Logger.Debug("doufu.Game.PlayGround::Ctor(): Insert playground to display manager");
		linkedDisplayMgr.InsertObject(this);
		
		// Playground layer has it default z index 2001;
		this.Z = 2001;
		
		// Set camera property
		this.Camera().Width = oDisplayManager.HTMLElement().clientWidth;
		this.Camera().Height = oDisplayManager.HTMLElement().clientHeight;
		
	};
	
	this.Ctor();
	
	// TO DO: 1) Calculate the object offset if the background scroll
	//			 So the sprite/object movement must be controlled by playground object.
	//		  2) Add ability to set background color.
	
}

/*
	Namespace: doufu.Game.PlayGround.Helpers
*/
doufu.Game.PlayGround.Helpers = {};

/*
	Function: doufu.Game.PlayGround.Helpers.RealYToScreenY
	
	Convert real game world Y coordinate to screen Y coordinate
	
	Parameters:
		iRealY - The real game world Y coordinate.
		bAccuracy - [Optional] If true, return a accurate Y coordinate, otherwise return a rounded integer.
		
	Returns:
		The corresponding screen y coordinate.
*/
doufu.Game.PlayGround.Helpers.RealYToScreenY = function(iRealY, bAccuracy)
{
	if (bAccuracy == null)
	{
		bAccuracy = false;
	}
	var oCndtAccuracy = {};
	oCndtAccuracy[true] = function()
	{
		return iRealY / 1.5;
	}
	oCndtAccuracy[false] = function()
	{
		return Math.round(iRealY / 1.5);
	}
	
	return oCndtAccuracy[bAccuracy]();
};
/*
	Class: doufu.Game.PlayGround.Camera
	
	The camera for playground coordinary caculation
	
	Inherit:
	<doufu.Display.Drawing.Rectangle>
	<doufu.Game.GameObject>
*/
doufu.Game.PlayGround.Camera = function()
{
	doufu.OOP.Class(this);
	
	this.Inherit(doufu.Display.Drawing.Rectangle);
	
	var skipFrameCount = 0;
	
	var callbackOffsetCaculation = new doufu.Event.CallBack(function()
	{
		doufu.System.Logger.Verbose("doufu.Game.PlayGround.Camera::callbackOffsetCaculation(): Invoked.");
		
		if (this.IsTracing)
		{
			if (!this.SmoothTracing)
			{
				this.X = this.TracedObject.X + this.TracedObject.Width/2 - this.Width / 2;
				this.Y = doufu.Game.PlayGround.Helpers.RealYToScreenY(this.TracedObject.Y + this.TracedObject.Height/2, true) - this.Height / 2;
			}
			else if(skipFrameCount % (this.SkipFrame + 1) == 0)
			{
				
				var destX = this.TracedObject.X + this.TracedObject.Width/2 - this.Width / 2;
				var destY = doufu.Game.PlayGround.Helpers.RealYToScreenY(this.TracedObject.Y + this.TracedObject.Height/2, true) - this.Height / 2;
				
				this.X += Math.ceil((destX - this.X) / 2);
				this.Y += Math.ceil((destY - this.Y) / 2);
			}
			skipFrameCount++;
			if (skipFrameCount == 10000000)
			{
				skipFrameCount = 0;
			}
		}
	}, this)
	
	/*
		Property: IsTracing
		
		Indicate whether this camera is tracing a character
	*/
	this.IsTracing = false;
	
	/*
		Property: SmoothTracing
		
		Enable or disable smooth tracing.
	*/
	this.SmoothTracing = false;
	
	/*
		Property: SkipFrame
		
		Indicate how many frames were skipped while using smooth tracing.
	*/
	this.SkipFrame = 0;
	
	/*
		Property: TracedObject
		
		Get the game object which be traced.
	*/
	this.TracedObject = null;
	
	/*
		Function: Trace
		
		Keep camera tracing a game object
		
		Parameters:
			gameObj - Specify a game object to be traced.
	*/
	this.Trace = function(gameObj)
	{
		if (this.IsTracing)
		{
			this.StopTrace();
		}
		doufu.System.Logger.Debug("doufu.Game.PlayGround.Camera::Trace(): Attach OnPaceControlCompleted event.");
		// Camera should follow the pace of sprites.
		doufu.Game.PaceController.OnPaceControlCompleted.Attach(callbackOffsetCaculation);
		
		this.IsTracing = true;
		this.TracedObject = gameObj;
	}
	
	/*
		Function: StopTrace
		
		Stop tracing game object.
	*/
	this.StopTrace = function()
	{
		doufu.Game.PaceController.OnPaceControlCompleted.Detach(callbackOffsetCaculation);
		
		this.IsTracing = false;
		this.TracedObject = null;
	}
	
	this.Ctor = function()
	{
		// detach self becase game object will attach self automatically
		doufu.Game.PaceController.Detach(this);
	}
	
	this.Ctor();
};
doufu.Game.Animation = function(oGameObj)
{
	doufu.OOP.Class(this);
	
	this.RefToGameObj;
	
	this.AnimationInfo;
	
	// indicate the current frame
	var frameCursor = 0;
	// counting for frame skipping
	var frameSkipCount = 0;
	// counting for repeat times.
	var repeatCount = 0;
	// indicate whether we should play backward
	var backwardPlay = false;
		
	var _isPlaying = false;
	this.NewProperty("IsPlaying");
	this.IsPlaying.Get = function()
	{
		return _isPlaying;
	}
	this.IsPlaying.Set = function(value)
	{
		if (value == true)
		{
			frameCursor = 0;
			repeatCount = 0;
			frameSkipCount = this.AnimationInfo.FrameSkip;
			backwardPlay = false;
		}
		_isPlaying = value;
	}
	
	// Play the animation which in the tile set 
	// with specifed start column
	this.Play = function(oAnimationInfo)
	{
		if (!oAnimationInfo.InstanceOf(doufu.Game.Animation.Info))
		{
			throw doufu.System.Exception("doufu.Game.Animation::Play(): oAnimationInfo must be an instance of doufu.Game.Animation.Info.");
		}
		
		doufu.System.Logger.Verbose("doufu.Game.Animation::Play(): Was invoked with following parameters, oAnimationInfo.Row = " + oAnimationInfo.Row.toString());
		
		if (this.IsPlaying() == true)
		{
			this.Stop();
		}
		
		this.AnimationInfo = oAnimationInfo;
		
		this.IsPlaying(true);
		
		
	}
	
	this.Stop = function()
	{
		this.IsPlaying(false);
	}
	
	this.Pacer = function(oMsg)
	{
		// Check if the repeat number is reached.
		if (this.IsPlaying() != true || (this.AnimationInfo.RepeatNumber != -1 && repeatCount > this.AnimationInfo.RepeatNumber))
		{
			if (this.IsPlaying() == true)
			{
				this.IsPlaying(false);
			}
			return;
		}
		
		// Check whether the skip frame number is reached.
		if (this.AnimationInfo.FrameSkip == frameSkipCount)
		{
			frameSkipCount = 0;
		}
		else
		{
			frameSkipCount++;
			return;
		}
		
		// Start to play next frame
		
		doufu.System.Logger.Verbose("doufu.Game.Animation::Pacer():");
		doufu.System.Logger.Verbose("\tColumn: " + this.AnimationInfo.Column.toString());
		doufu.System.Logger.Verbose("\tRefToGameObj.Width: " + this.RefToGameObj.Width.toString());
		doufu.System.Logger.Verbose("\tframeCursor: " + frameCursor.toString());
		
		this.RefToGameObj.ImageOffset.X = this.AnimationInfo.Column * this.RefToGameObj.Width + this.RefToGameObj.Width * frameCursor;
		this.RefToGameObj.ImageOffset.Y = this.AnimationInfo.Row * this.RefToGameObj.Height;
		
		// frameCursor == 0 means the repeat count should add 1.
		if (frameCursor == 0)
		{
			repeatCount++;
		}
		
		if (!backwardPlay)
		{
			frameCursor++;
		}
		else
		{
			frameCursor--;
		}
		
		if (frameCursor >= this.AnimationInfo.FrameNumber)
		{
			if (!this.AnimationInfo.PlayReboundly)
			{
				frameCursor = 0;
			}
			else
			{
				backwardPlay = true;
				// fix the last frame is playing twice.
				frameCursor -=2 ;
			}
		}
		
		// disable backwardPlay if the frameCursor reached 0 and play reboundly is enabled.
		if (frameCursor <= 0 && this.AnimationInfo.PlayReboundly)
		{
			backwardPlay = false;
		}
	}
	
	// Initialize Animation class
	this.Ctor = function()
	{
		if (!oGameObj.InstanceOf(doufu.Game.BaseObject))
		{
			throw doufu.System.Exception("doufu.Game.Animation::Ctor(): oGameObj must be a instance of doufu.Game.BaseObject.");
		}
		this.RefToGameObj = oGameObj;
		
	}
	
	this.Ctor();
}

// This is a animation info class which containing all information needed while playing an animation.
doufu.Game.Animation.Info = function()
{
	doufu.OOP.Class(this);
	
	// Start column
	this.Column;
	// Start row.
	this.Row;
	// Indicate how many frames in this animation.
	this.FrameNumber;
	// Indicate how many times should be played, -0 for infinite
	this.RepeatNumber;
	// Skip how many cycles when play a single frame.
	this.FrameSkip = 0;
	// Specified whether to play backward when forward play is completed.
	this.PlayReboundly = false;
};
doufu.Game.BaseObject = function(){
	
	doufu.OOP.Class(this);
	
	this.Inherit(doufu.Display.Drawing.Cube);
	this.Inherit(doufu.System.Handler.Handlable);
	
	// Saving the image information, this.ImageOffset.X/Y stands for the offset.
	this.ImageOffset = new doufu.Display.Drawing.Point();
	this.ImagePath = new String();
	this.Animation = new doufu.Game.Animation(this);

	var _linkedDisplayObject = new doufu.Display.BaseObject();
	this.NewProperty("LinkedDisplayObject");
	this.LinkedDisplayObject.Get = function()
	{
		return _linkedDisplayObject;
	}
	this.LinkedDisplayObject.Set = function(value)
	{
		_linkedDisplayObject = value;
	}
	
	// Will be invoked by main cycle
	this.Pacer = function(oMsg)
	{
		doufu.System.Logger.Verbose("doufu.Game.BaseObject::Pacer(): Pacer Invoked.");
		this.Animation.Pacer(oMsg);
	}
	
	// Constructor
	this.Ctor = function()
	{
		this.Handler = doufu.System.Handler.Generate();
		// attach self to pace controller
		doufu.System.Logger.Debug("doufu.Game.BaseObject::Ctor(): Attach self to pace controller");
		doufu.Game.PaceController.Attach(this);
	}
	
	this.Ctor();
	
};
// Direction define:
// 		(00 00 00)Binary
//		 x  y  z
//
// 00 00 stands for no direction in the direction
// y: 01 stands for move down
// y: 11 stands for move up
// x: 01 stands for move right.
// x: 11 stands for move left
// z: 01 stands for increase z coordinate (fly up)
// z: 11 stands for decrease z coordinate 

doufu.Game.Direction = function(iDirectionValue)
{
	doufu.OOP.Class(this);
	
	this.Ctor = function()
	{
		if (typeof iDirectionValue == doufu.System.Constants.TYPE_UNDEFINED)
		{
			iDirectionValue = 0;
		}
		
		if (iDirectionValue < 0 || iDirectionValue > 0x3F)
		{
			throw doufu.System.Exception("iDirection is not a valid format.");
		}
		
		_xAxis = (iDirectionValue & 0x30) >> 4;
		_yAxis = (iDirectionValue & 0x0C) >> 2;
		_zAxis = iDirectionValue & 0x03;
	}
	
	// X Axis direction
	var _xAxis;
	this.NewProperty("XAxis");
	this.XAxis.Get = function()
	{
		return _xAxis;
	}
	
	this.NewProperty("X");
	this.X.Get = function()
	{
		var sign = 1;
		
		if ((this.XAxis() >> 1) == 1)
		{
			sign = -1;
		}
		
		return sign * (this.XAxis() % 2);
	}
	this.X.Set = function(value)
	{
		if (value > 1 || value < -1)
		{
			throw doufu.System.Exception("Inputted value should between -1 and 1.");
		}
		
		_xAxis = value * value | ((value < 0?1:0) << 1);
		
	}
	
	var _yAxis;
	this.NewProperty("YAxis");
	this.YAxis.Get = function()
	{
		return _yAxis;
	}
	
	this.NewProperty("Y");
	this.Y.Get = function()
	{
		var sign = 1;
		
		if ((this.YAxis() >> 1) == 1)
		{
			sign = -1;
		}
		
		return sign * (this.YAxis() % 2);
	}
	this.Y.Set = function(value)
	{
		if (value > 1 || value < -1)
		{
			throw doufu.System.Exception("Inputted value should between -1 and 1.");
		}
		
		_yAxis = value * value | ((value < 0?1:0) << 1);
		
	}
	
	var _zAxis;
	this.NewProperty("ZAxis");
	this.ZAxis.Get = function()
	{
		return _zAxis;
	}
	
	this.NewProperty("Z");
	this.Z.Get = function()
	{
		var sign = 1;
		
		if ((this.ZAxis() >> 1) == 1)
		{
			sign = -1;
		}
		
		return sign * (this.ZAxis() % 2);
	}
	this.X.Set = function(value)
	{
		if (value > 1 || value < -1)
		{
			throw doufu.System.Exception("Inputted value should between -1 and 1.");
		}
		
		_zAxis = value * value | ((value < 0?1:0) << 1);
		
	}
	
	this.toString = function()
	{
		return ((_xAxis & 0x1)? ((_xAxis & 0x2)?"Left":"Right"):"") + 
				((_yAxis & 0x1)? ((_yAxis & 0x2)?"Up":"Down"):"") +
				((_zAxis & 0x1)? ((_zAxis & 0x2)?"Ascend":"Descend"):"");
	}
	
	this.Ctor();
};
/*
	Class: doufu.Game.PaceController
	
	A singleton which helps to control the frequency of moving, animation of all game objects.
	
*/
doufu.Game.PaceController = new function()
{
	doufu.OOP.Class(this);
	
	this.Inherit(doufu.DesignPattern.Attachable, [doufu.Game.BaseObject]);
	
	// The shared cycle which will be used by all game objects.
	this.Cycle;
	
	/*
		Event: OnPaceControlCompleted
		
		Will be fired when all pace controll jobs in current cycle is done.
	*/
	this.OnPaceControlCompleted = new doufu.Event.EventHandler(this);
	
	this.WorkerCallback = new doufu.Event.CallBack(function(oMsg)
	{
		doufu.System.Logger.Verbose("doufu.Game.PaceController::WorkerCallback(): Start calling pacers. Length: " + this.InnerCollection().Length());
		var i;
		for(i = 0; i < this.InnerCollection().Length(); i++)
		{
			this.InnerCollection().Items(i).Pacer.call(this.InnerCollection().Items(i), oMsg);
		}
		
		// invoke on pace control complete event.
		this.OnPaceControlCompleted.Invoke();
		
		doufu.System.Logger.Verbose("doufu.Game.PaceController::WorkerCallback(): Pacer calling end.");
	}, this);
	
	this.Ctor = function()
	{
		this.Cycle = new doufu.Cycling.Cycle(this.WorkerCallback);
		this.Cycle.Start();
		
	}
	
	this.Ctor();
};
doufu.Game.Sprites = new Object();;
/*
	Class: doufu.Game.Sprites.Sprite
	
	An sprite implementation which provide basic functionalities of a game sprite
	
	See also:
		<doufu.Game.Sprites.FourDirectionSprite>
*/
doufu.Game.Sprites.Sprite = function()
{
	
	doufu.OOP.Class(this);
	
	this.Inherit(doufu.Game.BaseObject);
	
	/////////////////////////
	// Define Public Properties/Variables/Attributes
	/////////////////////////
	
	var cycleSkip;
	var stepLength;
	var frameCounter=0;
	
	var tmpVector = new doufu.Display.Drawing.Vector();
	// do not assign value to this cube's property.
	var tmpClearCube = new doufu.Display.Drawing.Cube();
	var cubeNextStep = new doufu.Display.Drawing.Cube();
	
	/*
		Property: IsMoving
		
		Indicate whether this sprite is moving.
	*/
	this.IsMoving = false;
	
	/*
		Property: EnableCollision
		
		Indicate whether to do collision detection while moving.
	*/
	this.EnableCollision = true;
	
	/*
		Property: Direction
		
		<doufu.Game.Direction>
		Indicate current sprite direction.
	*/
	this.Direction = new doufu.Game.Direction();
	
	/*
		Property: Sharp
		
		<doufu.Display.Drawing.Drawable>
		The sharps for collision detecting while object is moving.
		
		Allowed drawable objects:
		<doufu.Display.Drawing.Rectangle>
		<doufu.Display.Drawing.Polygon>
	*/
	this.Sharp = null;
	
	/*
		Property: InRangeSharp
		
		<doufu.Display.Drawing.Drawable>
		The sharps for collsion detecting while object being attacked.
		
		Allowed drawable objects:
		<doufu.Display.Drawing.Rectangle>
		<doufu.Display.Drawing.Polygon>
	*/
	this.InRangeSharp = new doufu.Display.Drawing.Drawable();
	
	/*
		Event: OnConfirmMovable
		
		Will be fired when character moving.
		If any of attached event callback return false, character will stop moving.
		
		EventArgs:
			{Cube: cubeNextStep, Sharp:this.Sharp, Velocity: tmpVector, Direction: oDirection}
	*/
	this.OnConfirmMovable = new doufu.Event.EventHandler(this);
	
	/*
		Event: OnTriggerEvent
		
		Will be fired when a single step movement was completed, trigger the event triggers which attached to this sprite.
		
		EventArgs:
			{Cube: cubeNextStep}
	*/
	this.OnTriggerEvent = new doufu.Event.EventHandler(this);
	
	/////////////////////////
	// Define Public Methods
	/////////////////////////
	
	// Move sprite with specified direction point with specified speed.
	this.MoveTo = function(oDirection, iLength)
	{
		if (eval(doufu.System.APIs.GetIsNullMacro("oDirection")))
		{
			throw doufu.System.Exception("oDirection should not be null!");
		}
		if (!oDirection.InstanceOf(doufu.Game.Direction))
		{
			throw doufu.System.Exception("oDirection should be a instance of doufu.Game.Direction!");
		}
		
		var lastConfirmResult = false;
		// Clear the cube
		cubeNextStep.DeepCopy(tmpClearCube);
		
		cubeNextStep.X = this.X + oDirection.X() * iLength;
		cubeNextStep.Y = this.Y + oDirection.Y() * iLength;
		cubeNextStep.Z = this.Z + oDirection.Z() * iLength;
		
		// if no sharp assigned, don't need to do collsion.
		if (this.Sharp != null && this.EnableCollision == true)
		{
			tmpVector.X = oDirection.X() * iLength;
			tmpVector.Y = oDirection.Y() * iLength;
			// Collision detecting and others...
			lastConfirmResult = this.OnConfirmMovable.Invoke({Cube: cubeNextStep, Sharp:this.Sharp, Velocity: tmpVector, Direction: oDirection});
		}
		else
		{
			lastConfirmResult = true;
		}
		
		// TODO: Release the cube
		// Should not move.
		if (lastConfirmResult == false)
		{
			return;
		}
		
		this.OnTriggerEvent.Invoke({Cube: this, Who: this});
		
		// Caculating the next position
		this.X = cubeNextStep.X;
		this.Y = cubeNextStep.Y;
		this.Z = cubeNextStep.Z;
	}
	
	this.StartMoving =function(oDirection, iSpeed)
	{
		this.Direction = oDirection;
		
		var temSpeed = doufu.Game.Sprites.Sprite.Speed.CaculateFromInteger(iSpeed);
		cycleSkip = temSpeed.CycleSkip;
		stepLength = temSpeed.StepLength;
		
		if(this.IsMoving == false)
		{
			this.IsMoving = true;
		}
	}
	
	this.StopMoving = function()
	{
		if (this.IsMoving == true)
		{
			this.IsMoving = false;
		}
	}
	
	var _base_Pacer = this.OverrideMethod("Pacer", function(oMsg)
	{
		if (this.IsMoving)
		{
			frameCounter++;
			if (frameCounter % (cycleSkip + 1) == 0)
			{
				this.MoveTo(this.Direction, stepLength);
			}
		}
		
		_base_Pacer(oMsg);
	});
	
};
doufu.Game.Sprites.Sprite.Speed = function(iSpeed)
{
	doufu.OOP.Class(this);
	
	this.CycleSkip;
	this.StepLength;
	
	this.Ctor = function()
	{
		if (typeof iSpeed != doufu.System.Constants.TYPE_UNDEFINED && iSpeed != null)
		{
			var tmpSpeed = doufu.Game.Sprites.Sprite.Speed.CaculateFromInteger(iSpeed);
			this.CycleSkip = tmpSpeed.CycleSkip;
			this.StepLength = tmpSpeed.StepLength;
			delete tmpSpeed;
		}
	}
	
	this.Ctor();
}

doufu.Game.Sprites.Sprite.Speed.CaculateFromInteger = function(iSpeed)
{
	var oRet = new doufu.Game.Sprites.Sprite.Speed();
	
	// The minium number is 1, means every 1 frame need to do moving.
	oRet.CycleSkip = 49 - iSpeed % 50;
	// The minium number 1; means every move, the sprite goes 1 unit.
	oRet.StepLength = Math.floor(iSpeed / 50) + 1;
	
	return oRet;
}
;
/*
	Class: doufu.Game.Sprites.FourDirectionSprite
	
	An 4 way moving sprite implementation which provide functionalities allow sprite moving in 4 direction.
	
	Inherit:
		<doufu.Game.Sprites.Sprite>
*/
doufu.Game.Sprites.FourDirectionSprite = function(oInfoSet)
{
	doufu.OOP.Class(this);
	
	this.Inherit(doufu.Game.Sprites.Sprite);
	
	this.AnimationInfos = {};
	
	var _base_StartMoving = this.OverrideMethod("StartMoving", function(oDirection, iSpeed)
	{
		doufu.System.Logger.Verbose("doufu.Game.Sprites.FourDirectionSprite::StartMoving(): Was invoked with following parameters, oDirection = " + oDirection.toString());
		if (oDirection.X() == -1)
		{
			this.Animation.Play(this.AnimationInfos.MoveLeft);
			
		}
		else if (oDirection.X() == 1)
		{
			this.Animation.Play(this.AnimationInfos.MoveRight);
			
		}
		else if (oDirection.Y() == 1)
		{
			this.Animation.Play(this.AnimationInfos.MoveDown);
			
		}
		else if (oDirection.Y() == -1)
		{
			this.Animation.Play(this.AnimationInfos.MoveUp);
			
		}

		_base_StartMoving(oDirection, iSpeed);
	});
	
	var _base_StopMoving = this.OverrideMethod("StopMoving", function()
	{
		// Play the stopAnimation and then it will stop itself automatically.
		if (this.Direction.X() == -1 && this.AnimationInfos.StopLeft != null)
		{
			this.Animation.Play(this.AnimationInfos.StopLeft);
			
		}
		else if (this.Direction.X() == 1 && this.AnimationInfos.StopRight != null)
		{
			this.Animation.Play(this.AnimationInfos.StopRight);
			
		}
		else if (this.Direction.Y() == 1 && this.AnimationInfos.StopDown != null)
		{
			this.Animation.Play(this.AnimationInfos.StopDown);
			
		}
		else if (this.Direction.Y() == -1 && this.AnimationInfos.StopUp != null)
		{
			this.Animation.Play(this.AnimationInfos.StopUp);
			
		}
		
		_base_StopMoving();
	});
	
	this.Ctor = function()
	{
		if (oInfoSet != null)
		{
			if (!oInfoSet.InstanceOf(doufu.Game.Sprites.FourDirectionSprite.InfoSet))
			{
				throw doufu.System.Exception("doufu.Game.Sprites.FourDirectionSprite::Ctor(): oInfoSet must be an instance of doufu.Game.Sprites.FourDirectionSprite.InfoSet.");
			}
			
			this.ImagePath = oInfoSet.ImagePath;
			this.ImageOffset = oInfoSet.ImageOffset;
			this.AnimationInfos = oInfoSet.AnimationInfos;
			this.Animation.Play(this.AnimationInfos.Init);
		}
	}
	
	this.Ctor();
}

doufu.Game.Sprites.FourDirectionSprite.InfoSet = function(){
	
	doufu.OOP.Class(this);
	
	ImagePath = "";
	ImageOffset = new doufu.Display.Drawing.Point();
	AnimationInfos = {
		Init : new doufu.Game.Animation.Info(),
		MoveUp : new doufu.Game.Animation.Info(),
		MoveDown : new doufu.Game.Animation.Info(),
		MoveLeft : new doufu.Game.Animation.Info(),
		MoveRight : new doufu.Game.Animation.Info(),
		StopUp : new doufu.Game.Animation.Info(),
		StopDown : new doufu.Game.Animation.Info(),
		StopLeft : new doufu.Game.Animation.Info(),
		StopRight : new doufu.Game.Animation.Info()
	}
};
/*
	Class: doufu.Game.EventTrigger
	
	Game event trigger class
*/
doufu.Game.EventTrigger = function()
{
	doufu.OOP.Class(this);
	
	var monitoredSprites = new doufu.CustomTypes.Collection(doufu.Game.Sprites.Sprite);
	var activatedForSprites = {};
	var activated = true;
	
	/*
		Event: OnCheckCondition
		
		Will be triggered when this event trigger was triggered.
	*/
	this.OnCheckCondition = new doufu.Event.EventHandler(this);
	
	/*
		Event: OnTrigger
		
		Will be triggered when this trigger condition is met.
	*/
	this.OnTrigger = new doufu.Event.EventHandler(this);
	
	/*
		Function: Trigger
		
		Trigger this event trigger.
	*/
	this.Trigger = function(sender, args)
	{
		if (!this.IsActivated())
		{
			return;
		}
		
		if (!this.IsSpriteActivate(args.Who))
		{
			if (this.AutoReactivate())
			{
				// check where
				if (this.Where() != null)
				{
					if (this.Where().Z != args.Cube.Z || !doufu.Game.Helpers.IsRectangleCollided(args.Cube, this.Where()))
					{
						this.Activate(args.Who);
					}
					else
					{
						return;
					}
				}
				else
				{
					this.Activate(args.Who);
				}
			}
			else
			{
				return;
			}
		}
		// check who
		if (this.Who().Contain(args.Who))
		{
			// at least one condition
			var atLeastOne = false;
			// check when
			if (this.When() != null)
			{
				atLeastOne = true;
				var time = (new Date()).getTime() - this.When().getTime() ;
				if (!(time > 0 && time < 500))
				{
					return;
				}
			}
			
			// check where
			if (this.Where() != null)
			{
				atLeastOne = true;
				if (this.Where().Z != args.Cube.Z || !doufu.Game.Helpers.IsRectangleCollided(args.Cube, this.Where()))
				{
					return;
				}
			}
			
			var lastResult = this.OnCheckCondition.Invoke();
			
			if (lastResult != null)
			{
				atLeastOne = true;
				if (lastResult == false)
				{
					return;
				}
			}
			
			if (atLeastOne== true)
			{
				this.OnTrigger.Invoke(args);
				
				if (this.AutoReactivate())
				{
					this.Inactivate(args.Who);
				}
				else
				{
					this.Inactivate();
				}
			}
		}
	}
	
	var triggerCallback = new doufu.Event.CallBack(this.Trigger, this); 
	
	/*
		Function: Monitor
		
		Who can trigger this event.
		Specify the sprite or map (to be done) which to be monitored, will attach this.Trigger to the sprite or map's OnTriggerEvent method.
		
		Parameters:
			obj - Specify sprite or map
	*/
	this.Monitor = function(obj)
	{
		if (obj.InstanceOf(doufu.Game.Sprites.Sprite))
		{
			obj.OnTriggerEvent.Attach(triggerCallback, this);
			this.Who(obj);
		}
		else if (obj.InstanceOf(doufu.Game.Map))
		{
			//TODO
		}
	}
	
	/*
		Function: Activate
		
		Activate this event trigger.
		
		Parameters:
			who - [Optional] Enable trigger for specified sprite, if not specified, will enable entire trigger
	*/
	this.Activate = function(who)
	{
		if (who != null)
		{
			activatedForSprites[who.Handler.ID] = true;
		}
		else
		{
			activated = true;
		}
	}
	
	/*
		Function: Inactivate
		
		Inactivate this event trigger.
		
		Parameters:
			who - [Optional] Disable trigger for specified sprite, if not specified, will disable entire trigger
	*/
	this.Inactivate = function(who)
	{
		if (who != null)
		{
			activatedForSprites[who.Handler.ID] = false;
		}
		else
		{
			activated = false
		}
	}
	
	/*
		Function: IsSpriteActivate
		
		Get a value indicate whether a sprite is activated for this trigger.
		
		Parameters:
			who - Specify the sprite.
		
		Return:
			True if the sprite is activated.
	*/
	this.IsSpriteActivate = function(who)
	{
		return activatedForSprites[who.Handler.ID];
	}
	
	/*
		Property: Who
		
		<doufu.Property>
		Get or set who can trigger this event.
		
	*/
	this.NewProperty("Who");
	this.Who.Get = function()
	{
		return monitoredSprites;
	}
	this.Who.Set = function(value)
	{
		if (!monitoredSprites.Contain(value))
		{
			monitoredSprites.Add(value);
			activatedForSprites[value] = true;
		}
	}
	
	/*
		Property: When
		
		<doufu.Property>
		Get or set when to trigger this event.
	*/
	var when;
	this.NewProperty("When");
	this.When.Get = function()
	{
		return when;
	}
	this.When.Set = function(value)
	{
		when = value;
	}
	
	/*
		Property: Where
		
		<doufu.Property>, <doufu.Display.Drawing.Rectangle>
		Get or set the place to trigger this event.
		
		Remarks:
			event trigger will do rectangle collision when this property was set, if the trigger collided with this rectangle, event will be fired.
	*/
	var where;
	this.NewProperty("Where");
	this.Where.Get = function()
	{
		return where;
	}
	this.Where.Set = function(value)
	{
		where = value;
	}
	
	/*
		Property: IsActivated
		
		Get a value indicate whether this trigger is activated.
	*/
	this.NewProperty("IsActivated");
	this.IsActivated.Get = function()
	{
		return activated;
	}
	
	/*
		Property: AutoReactivate
		
		Specify whether to reactivate event trigger after sprite leave collision area.
	*/
	var autoReactivate = true;
	this.NewProperty("AutoReactivate");
	this.AutoReactivate.Get = function()
	{
		return autoReactivate;
	}
	this.AutoReactivate.Set = function(value)
	{
		autoReactivate = value;
	}

};
/*
	Class: doufu.Game.Map
	
	Game map class, containning the information camera and map sharp.
	
	Constructor:
		oPlayGround - Specified a playground object, new map will bind to the specified playground.
*/
doufu.Game.Map = function(oPlayGround)
{
	doufu.OOP.Class(this);

	// privated and pre-initialized variable helps to speed up collision caculation.
	var tmpPolygon1 = new doufu.Display.Drawing.Polygon();
	var tmpPolygon2 = new doufu.Display.Drawing.Polygon();
	var tmpRectangle1 = new doufu.Display.Drawing.Rectangle();
	var tmpRectangle2 = new doufu.Display.Drawing.Rectangle();
	var tmpCube = new doufu.Display.Drawing.Cube();
	var tmpVector1 = new doufu.Display.Drawing.Vector();
	var tmpVector2 = new doufu.Display.Drawing.Vector();
	
	/*
		Property: LinkedPlayGround
		
		Indicate the linked playground object.
	*/
	this.LinkedPlayGround;
	
	/*
		Property: ImagePath
		
		Indicate the background image of current map.
		If the map is not tiled, map will using the image as background.
	*/
	this.ImagePath;
	
	/*
		Property: BackgroundImagePath
		
		<doufu.Property>
		Get or set the background image path of current map.
	*/
	this.NewProperty("BackgroundImagePath");
	this.BackgroundImagePath.Get = function()
	{
		return this.LinkedPlayGround.LinkedDisplayManager().HTMLElement().style.backgroundImage;
	}
	this.BackgroundImagePath.Set = function(value)
	{
		this.LinkedPlayGround.LinkedDisplayManager().HTMLElement().style.backgroundImage = "url(\"" + value + "\")";
	}
	
	/*
		Property: Width
		
		Indicate the width of current map.
	*/
	this.Width;
	
	/*
		Property: Height
		
		Indicate the height of current map.
	*/
	this.Height;
	
	/*
		Property: Sharps
		
		Can be a polygon collection that present the edge of current map.
	*/
	this.Sharps = new doufu.CustomTypes.Collection(doufu.Display.Drawing.Polygon);
	
	/*
		Property: UsePointCollision
		
		True to use point rather than the entire rectangle of sprite to do collision detect with edges of map.
	*/
	this.UsePointCollision = true;
	
	/*
		Property: Camera
		
		<doufu.Property> Get the camera object of current map.
	*/
	var _camera = new doufu.Game.PlayGround.Camera();
	this.NewProperty("Camera");
	this.Camera.Get = function()
	{
		return _camera;
	}
	
	/*
		Property: InitSprites
		
		Containing the sprites which will be display after map initialized
	*/
	this.InitSprites = new doufu.CustomTypes.Collection(doufu.Game.Sprites.Sprite);
	
	/*
		Callback: ConfirmMovable
		
		A confirmMovable callback which will be attached to GameObject.OnConfirmMovable event.
		
		Parameters:
			sender - One who fired this event.
			obj - Should be the game object which inserted into the playground.
		
		Return:
			Return true if movement is allowed.
	*/
	this.ConfirmMovable = new doufu.Event.CallBack(function(sender, obj)
	{

		for(var i = 0 ; i < this.LinkedPlayGround.GameObjects().Length(); i++)
		{
			// Only sprites has polygon
			if (this.LinkedPlayGround.GameObjects().Items(i).InstanceOf(doufu.Game.Sprites.Sprite) && this.LinkedPlayGround.GameObjects().Items(i).Sharp != null)
			{
				// if the obj is playground, we don't have to do collision test.
				if (obj.Sharp == this.Sharp)
				{
					return true;
				}
				
				var tmpColideDrawable1,tmpColideDrawable2;
				
				// caculate the actual obj coodinates in the map
				if (obj.Sharp.InstanceOf(doufu.Display.Drawing.Rectangle))
				{
					tmpRectangle1.DeepCopy(obj.Sharp);
					
					tmpRectangle1.X += obj.Cube.X;
					tmpRectangle1.Y += obj.Cube.Y;
					
					tmpColideDrawable1 = tmpRectangle1;
				}
				else if (obj.Sharp.InstanceOf(doufu.Display.Drawing.Polygon))
				{
					tmpPolygon1.DeepCopy(obj.Sharp);
					
					for (var j = 0; i < tmpPolygon1.Length(); i++)
					{
						tmpPolygon1.Items(j).X += obj.Cube.X;
						tmpPolygon1.Items(j).Y += obj.Cube.Y;
					}
					
					tmpColideDrawable1 = tmpPolygon1;
				}
				
				// if map has edge
				// Do map edge collision detection first
				// if obj(sprite) is collided with the map edge, break.
				if (this.Sharps.Length() > 0)
				{
					for (var k = 0; k < this.Sharps.Length(); k++)
					{
						// Convert rectangle to a point, this will speed up the caculation
						// And we don't want it to do a full collision detecton when it is just collide with
						// the edges.
						// This function can only be enabled when using rectangle for sprite collision.
						if (this.UsePointCollision == true && obj.Sharp.InstanceOf(doufu.Display.Drawing.Rectangle))
						{
							var x = Math.round(tmpColideDrawable1.Width / 2) + tmpColideDrawable1.X;
							var y = Math.round(tmpColideDrawable1.Height / 2) + tmpColideDrawable1.Y;
							tmpVector1.X = x - obj.Velocity.X;
							tmpVector1.Y = y - obj.Velocity.Y;
							tmpVector2.X = obj.Velocity.X + x;
							tmpVector2.Y = obj.Velocity.Y + y;
							tmpPolygon1.Clear();
							tmpPolygon1.Add(tmpVector1);
							tmpPolygon1.Add(tmpVector2);
							
							if (doufu.Game.Helpers.IsCollided(tmpPolygon1, this.Sharps.Items(k), obj.Direction))
							{
								return false;
							}
						}
						else if (doufu.Game.Helpers.IsCollided(tmpColideDrawable1, this.Sharps.Items(k), obj.Direction))
						{
							return false;
						}
					}
				}
				
				if (obj.Sharp != this.LinkedPlayGround.GameObjects().Items(i).Sharp)
				{
					
					tmpCube.DeepCopy(this.LinkedPlayGround.GameObjects().Items(i));
					
					if (this.LinkedPlayGround.GameObjects().Items(i).Sharp.InstanceOf(doufu.Display.Drawing.Rectangle))
					{
						
						tmpRectangle2.DeepCopy(this.LinkedPlayGround.GameObjects().Items(i).Sharp);
						
						tmpRectangle2.X += tmpCube.X;
						tmpRectangle2.Y += tmpCube.Y;

						tmpColideDrawable2 = tmpRectangle2;
					}
					else if (this.LinkedPlayGround.GameObjects().Items(i).Sharp.InstanceOf(doufu.Display.Drawing.Polygon))
					{
						tmpPolygon2.DeepCopy(this.LinkedPlayGround.GameObjects().Items(i).Sharp);
						
						for (var j = 0; i < tmpPolygon2.Length(); i++)
						{
							tmpPolygon2.Items(j).X += tmpCube.X;
							tmpPolygon2.Items(j).Y += tmpCube.Y;
						}
						
						tmpColideDrawable2 = tmpPolygon2;
					}
					
					// if the two polygon is in same layer and also collided.
					if (tmpCube.Z == obj.Cube.Z && doufu.Game.Helpers.IsCollided(tmpColideDrawable1, tmpColideDrawable2))
					{
						return false;
					}
				}
			}
		} 
		return true;
	}, this);
	
	/*
		Callback: AddCollisionDetection
		
		Adding collision detection for every sprite in the specified playground.
		
		This callback will be called when a object is insertted to linked playground.
		Callback will attach this.ConfirmMovable (callback) to object.OnConfirmMovable event.
		So that when a GameObject.OnConfirmMovable is invoked, this.OnConfrimMovable will be called.
		
		Parameters:
			sender - One who fired this event.
			obj - Should be the game object which inserted into the playground.
		
	*/
	this.AddCollisionDetection = new doufu.Event.CallBack(function(sender, obj)
	{
		if (obj.InstanceOf(doufu.Game.Sprites.Sprite))
		{
			obj.OnConfirmMovable.Attach(this.ConfirmMovable);
		}
	}, this);
	
	/*
		Function: Initialize
		
		Initialize the map object.
		
	*/
	this.Initialize = function()
	{
		this.LinkedPlayGround.ImagePath = this.ImagePath;
		this.LinkedPlayGround.Width = this.Width;
		this.LinkedPlayGround.Height = this.Height;
		
		// set current setting to playground object
		if (this.Camera().X != 0)
		{
			this.LinkedPlayGround.Camera().X = this.Camera().X;
		}
		if (this.Camera().Y != 0)
		{
			this.LinkedPlayGround.Camera().Y = this.Camera().Y;
		}
		if (this.Camera().Width != 0)
		{
			this.LinkedPlayGround.Camera().Width = this.Camera().Width;
		}
		if (this.Camera().Height != 0)
		{
			this.LinkedPlayGround.Camera().Height = this.Camera().Height;
		}
		this.Camera(this.LinkedPlayGround.Camera());
		
		for (var i = 0; i < this.InitSprites.Length(); i++)
		{
			this.LinkedPlayGround.InsertObject(this.InitSprites.Items(i));
		}
	}
	
	this.Ctor = function()
	{
		if (oPlayGround == null || !oPlayGround.InstanceOf(doufu.Game.PlayGround))
		{
			throw doufu.System.Exception("doufu.Game.Map::Ctor(): oPlayGround must be an instance of doufu.Game.PlayGround.");
		}
		
		this.LinkedPlayGround = oPlayGround;
		
		this.LinkedPlayGround.OnInsertObject.Attach(this.AddCollisionDetection);
	}
	
	this.Ctor();
};
/*
	Namespace: doufu.Http
	
	The root namespace of doufu http/ajax/comet relevant classes.
*/
doufu.Http = {};
/*
	Class: doufu.Http.Ajax
	
	Cross browser ajax implementation
*/
doufu.Http.Request = function()
{
	doufu.OOP.Class(this);
	
	var nativeRequest;
	var _disableCache = true;
	
	/* 
		Event: OnSuccess
	*/
	this.OnSuccess = new doufu.Event.EventHandler(this);
	
	/*
		Event: OnFail
	*/
	this.OnFail = new doufu.Event.EventHandler(this);
	
	/*
		Event: OnOpened
	*/
	this.OnOpened = new doufu.Event.EventHandler(this);
	
	/*
		Event: OnSend
	*/
	this.OnSend = new doufu.Event.EventHandler(this);
	
	/*
		Property: NativeRequest
		
		<doufu.Property>
		Get the native xml http request object
	*/
	this.NewProperty("NativeRequest");
	this.NativeRequest.Get = function()
	{
		return nativeRequest;
	}
	
	/*
		Property: Timeout
		
		<doufu.Property>
		The timeout of connection.
	*/
	this.NewProperty("Timeout");
	this.Timeout.Get = function()
	{
		return nativeRequest.timeout;
	}
	this.Timeout.Set = function(value)
	{
		// Deal with IE 8 +
		nativeRequest.timeout = value;
		
		// Other browsers
		//this.SetRequestHeader("Keep-Alive", value.toString());
		//this.SetRequestHeader("Connection", "keep-alive");
		
	}
	
	/*
		Property: DisableCache
		
		<doufu.Property>
		True to disable cache, will add a time stamp to the url when using get method.
	*/
	this.NewProperty("DisableCache");
	this.DisableCache.Get = function()
	{
		return _disableCache;
	}
	this.DisableCache.Set = function(value)
	{
		_disableCache = value;
	}
	
	/*
		Property: ResponseText
		
		<doufu.Property>
		Get the response Text
	*/
	this.NewProperty("ResponseText");
	this.ResponseText.Get = function()
	{
		return nativeRequest.responseText;
	}
	
	/*
		Property: ResponseXML
		
		<doufu.Property>
		Get the response XML
	*/
	this.NewProperty("ResponseXML");
	this.ResponseXML.Get = function()
	{
		return nativeRequest.responseXML;
	}
	
	var GetNativeRequestObj = function()
	{
		// IE7+, Mozilla, Safari,...
		if (window.XMLHttpRequest) 
		{ 
            nativeRequest = new XMLHttpRequest();
        }
        // IE6-
        else if (window.ActiveXObject) 
        { 
            try 
            {
                nativeRequest = new ActiveXObject("Msxml2.XMLHTTP");
            }
            catch (e) 
            {
                try 
                {
                    nativeRequest = new ActiveXObject("Microsoft.XMLHTTP");
                }
                catch (e) 
                {
                }
            }
        }
		if (!nativeRequest) 
		{
            alert('native XmlhttpRequest object could not be created. This may caused by not using a modern browser.');
            return false;
        }
        
        return true;
	}
	
	/*
		Function: SetRequestHeader
		
		Set the request header
	*/
	this.SetRequestHeader = function(sName, sValue)
	{
		nativeRequest.setRequestHeader(sName, sValue);
	}
	
	/*
		Function: GetResponseHeader
		
		Get the response header
	*/
	this.GetResponseHeader = function(sName)
	{
		return nativeRequest.getResponseHeader(sName);
	}
	
	/*
		Function: GetAllResponseHeaders
		
		Get all response header list.
	*/
	this.GetAllResponseHeaders = function()
	{
		return nativeRequest.getAllResponseHeaders();
	}
	
	/*
		Function: Open
		
		Open a http request connection
		
		Parameters:
			sMethod - The method of http request, can be "POST" or "GET".
			sUrl - The request url.
			bSync - [Optional] True to use asynchronization request.
			sUser - [Optional] The user name to connect
			sPassword - [Optional] The password of the user.
	*/
	this.Open = function(sMethod, sUrl, bAsync, sUser, sPassword)
	{
		var sActualUrl = sUrl;
		
		if (this.DisableCache() && sMethod == "GET")
		{
			sActualUrl = doufu.Http.Request.AddStampToUrl(sUrl);
		}
		
		nativeRequest.open(sMethod, sActualUrl, bAsync, sUser, sPassword);
		
		this.OnOpened.Invoke();
	}
	
	/*
		Function: Abort
		
		Abort current connection
	*/
	this.Abort = function()
	{
		nativeRequest.abort();
	}
	
	/*
		Function: Close
		
		Close a http request connection, and dispose created xml http request object.
	*/
	this.Close = function()
	{
		this.Abort();
		delete nativeRequest;
	}
	
	/*
		Function: Send
		
		Start to send the request
		
		Parameters:
			sPostBody - The body message when using POST method, string or a object.
	*/
	this.Send = function(sPostBody)
	{
		var sActualBody = "";
		if ((typeof sPostBody).toLowerCase() == "string")
		{
			sActualBody = sPostBody;
		}
		else
		{
			var bFirstParam = true;
			for(var o in sPostBody)
			{
				if (!bFirstParam)
				{
					sActualBody += '&';
				}
				sActualBody += o;
				sActualBody += "=";
				sActualBody += sPostBody[o];
				bFirstParam = false;
			}
			
			this.SetRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		}
		
		this.OnSend.Invoke();
		
		nativeRequest.send(sActualBody);
	}
	
	this.Ctor = function()
	{
		if (!GetNativeRequestObj())
		{
			throw doufu.System.Exception("doufu.Http.Request::Ctor() - Could not create native xmlhttprequest.");
		}
		
		this.Timeout(50000);
		// A timeout to abort the connection
		this.OnSend.Attach(new doufu.Event.CallBack(function(sender, args)
		{
			var self = this;
			setTimeout(function()
			{
				self.Abort();
			}, this.Timeout());
		},this));
		
		var self = this;
		nativeRequest.onreadystatechange=function()
		{
    		if (nativeRequest.readyState == 4)
    		{
    			// If success
    			if(nativeRequest.status == 200 || nativeRequest.status == 0)
    			{
    				self.OnSuccess.Invoke(
					{
						Native:nativeRequest,
						ResponseXML: nativeRequest.responseXML,
						ResponseText: nativeRequest.responseText
					});
    			}
    			else
    			{
    				self.OnFail.Invoke(
    				{
						Native:nativeRequest,
						ResponseXML: nativeRequest.responseXML,
						ResponseText: nativeRequest.responseText
					});
    			}
    		}
	    }
		
	}
	
	this.Ctor();
}

/*
	Function: doufu.Http.Request.CreateTimeStamp
	
	Create a time stamp
*/
doufu.Http.Request.CreateTimeStamp = function()
{
	var tDate = new Date();
	return (new String(tDate.getSeconds()+tDate.getMinutes()*60 + tDate.getHours()*3600) + "-" + tDate.getDate().toString() + (tDate.getMonth() + 1).toString() + tDate.getYear().toString());
}

/*
	Function: doufu.Http.Request.AddStampToUrl
	
	Paste a time stamp at the end of url string.
*/
doufu.Http.Request.AddStampToUrl = function(sUrl)
{
    if (sUrl.lastIndexOf("?") + 1 == sUrl.length)
    	sUrl = sUrl + doufu.Http.Request.CreateTimeStamp();
    else if (sUrl.lastIndexOf("?") != -1)
    		 sUrl = sUrl + "&DoufuUrlTimeStamp=" + doufu.Http.Request.CreateTimeStamp();
    	 else
    	 	 sUrl = sUrl + "?DoufuUrlTimeStamp=" + doufu.Http.Request.CreateTimeStamp();
   	return sUrl
};
doufu.Http.Comet = function()
{
	doufu.OOP.Class(this);
	
	this.Inherit(doufu.Http.Request);
	
	var bCheckResponse = false;
	
	/*
		Property: ResponseCheckInterval
		
		The interval of every response check
	*/
	this.ResponseCheckInterval = 1000;
	
	/*
		Event: OnMessageArrive
	*/
	this.OnMessageArrive = new doufu.Event.EventHandler(this);
	
	var checkResponse = function()
	{
		// TODO: check response and trigger onmessage arrive event
		
		if (bCheckResponse)
		{
			setTimeout(checkResponse, this.ResponseCheckInterval);
		}
	}
	
	var _base_Close = this.OverrideMethod("Close", function()
	{
		bCheckResponse = false;
		
		_base_Close.call(this);
	});
	
	var _base_Send = this.OverrideMethod("Send", function()
	{
		_base_Send.call(this);
		
		bCheckResponse = true;
		checkResponse();
	});
};
/*
	Class: doufu.Http.JSON
	
	JSON request implementation
*/
doufu.Http.JSON = function()
{
	doufu.OOP.Class(this);
	
	var CONTAINER_ID = 'doufu_Http_JSON_Container';
	var _url;
	
	// Unopen 0
	// Opened 1
	// Sent 2
	// Loading 3
	// Done 4
	this.ReadyState = 0;
	
	/*
		Property: Url
		
		Get the json data url
	*/
	this.NewProperty("Url");
	this.Url.Get = function()
	{
		return _url;
	}
	
	/*
		Function: Open
		
		Open a connection
	*/
	this.Open = function(sUrl)
	{
		_url = sUrl;
		
		this.ReadyState = 1;
	}
	
	this.Send = function()
	{
		if (this.ReadyState != 1)
		{
			throw doufu.System.Exception('doufu.Http.JSON::Send() - Conneciton was not opened.');
		}
		
		// Add a script tag to fetch json data
		
		
		var container = doufu.Browser.DOM.$s(CONTAINER_ID)
		// Check if json script tag container( a div element is existed),
		// if not create it.
		if (!container)
		{
			container = doufu.Browser.DOM.CreateElement('div');
			container.SetAttribute('id',CONTAINER_ID);
			doufu.Browser.DOM.Select('$body').AppendChild(container);
		}
		
		var script = doufu.Browser.DOM.CreateElement('script');
		script.Native().type = "text/javascript";
		script.Native().src = doufu.Http.Request.AddStampToUrl(this.Url());
		
		container.AppendChild(script);
	}
	
	this.Close = function()
	{
		
	}
};

/*
	Function: doufu.Http.JSON.GetJSONObject
	
	Get javascript object from a json string
	
	Return:
		javascript object which build from json string
*/
doufu.Http.JSON.GetObject = function(sJSONStr)
{
	eval("var tmpobj = " + sJSONStr);
	return tmpobj;
};
; 
doufu.__version = "0.0.0.2"; 
