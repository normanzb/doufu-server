//CHKBuild Start 
/*  Prototype JavaScript framework, version 1.6.0.3
 *  (c) 2005-2008 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/

var Prototype = {
  Version: '1.6.0.3',

  Browser: {
    IE:     !!(window.attachEvent &&
      navigator.userAgent.indexOf('Opera') === -1),
    Opera:  navigator.userAgent.indexOf('Opera') > -1,
    WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
    Gecko:  navigator.userAgent.indexOf('Gecko') > -1 &&
      navigator.userAgent.indexOf('KHTML') === -1,
    MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/)
  },

  BrowserFeatures: {
    XPath: !!document.evaluate,
    SelectorsAPI: !!document.querySelector,
    ElementExtensions: !!window.HTMLElement,
    SpecificElementExtensions:
      document.createElement('div')['__proto__'] &&
      document.createElement('div')['__proto__'] !==
        document.createElement('form')['__proto__']
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

  emptyFunction: function() { },
  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;


/* Based on Alex Arnell's inheritance implementation. */
var Class = {
  create: function() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      var subclass = function() { };
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0; i < properties.length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;

    klass.prototype.constructor = klass;

    return klass;
  }
};

Class.Methods = {
  addMethods: function(source) {
    var ancestor   = this.superclass && this.superclass.prototype;
    var properties = Object.keys(source);

    if (!Object.keys({ toString: true }).length)
      properties.push("toString", "valueOf");

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames().first() == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments) };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }
};

var Abstract = { };

Object.extend = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};

Object.extend(Object, {
  inspect: function(object) {
    try {
      if (Object.isUndefined(object)) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : String(object);
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  },

  toJSON: function(object) {
    var type = typeof object;
    switch (type) {
      case 'undefined':
      case 'function':
      case 'unknown': return;
      case 'boolean': return object.toString();
    }

    if (object === null) return 'null';
    if (object.toJSON) return object.toJSON();
    if (Object.isElement(object)) return;

    var results = [];
    for (var property in object) {
      var value = Object.toJSON(object[property]);
      if (!Object.isUndefined(value))
        results.push(property.toJSON() + ': ' + value);
    }

    return '{' + results.join(', ') + '}';
  },

  toQueryString: function(object) {
    return $H(object).toQueryString();
  },

  toHTML: function(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
  },

  keys: function(object) {
    var keys = [];
    for (var property in object)
      keys.push(property);
    return keys;
  },

  values: function(object) {
    var values = [];
    for (var property in object)
      values.push(object[property]);
    return values;
  },

  clone: function(object) {
    return Object.extend({ }, object);
  },

  isElement: function(object) {
    return !!(object && object.nodeType == 1);
  },

  isArray: function(object) {
    return object != null && typeof object == "object" &&
      'splice' in object && 'join' in object;
  },

  isHash: function(object) {
    return object instanceof Hash;
  },

  isFunction: function(object) {
    return typeof object == "function";
  },

  isString: function(object) {
    return typeof object == "string";
  },

  isNumber: function(object) {
    return typeof object == "number";
  },

  isUndefined: function(object) {
    return typeof object == "undefined";
  }
});

Object.extend(Function.prototype, {
  argumentNames: function() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^\)]*)\)/)[1]
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  },

  bind: function() {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = $A(arguments), object = args.shift();
    return function() {
      return __method.apply(object, args.concat($A(arguments)));
    }
  },

  bindAsEventListener: function() {
    var __method = this, args = $A(arguments), object = args.shift();
    return function(event) {
      return __method.apply(object, [event || window.event].concat(args));
    }
  },

  curry: function() {
    if (!arguments.length) return this;
    var __method = this, args = $A(arguments);
    return function() {
      return __method.apply(this, args.concat($A(arguments)));
    }
  },

  delay: function() {
    var __method = this, args = $A(arguments), timeout = args.shift() * 1000;
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  },

  defer: function() {
    var args = [0.01].concat($A(arguments));
    return this.delay.apply(this, args);
  },

  wrap: function(wrapper) {
    var __method = this;
    return function() {
      return wrapper.apply(this, [__method.bind(this)].concat($A(arguments)));
    }
  },

  methodize: function() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      return __method.apply(null, [this].concat($A(arguments)));
    };
  }
});

Date.prototype.toJSON = function() {
  return '"' + this.getUTCFullYear() + '-' +
    (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
    this.getUTCDate().toPaddedString(2) + 'T' +
    this.getUTCHours().toPaddedString(2) + ':' +
    this.getUTCMinutes().toPaddedString(2) + ':' +
    this.getUTCSeconds().toPaddedString(2) + 'Z"';
};

var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }

    return returnValue;
  }
};

RegExp.prototype.match = RegExp.prototype.test;

RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};

/*--------------------------------------------------------------------------*/

var PeriodicalExecuter = Class.create({
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  execute: function() {
    this.callback(this);
  },

  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.execute();
      } finally {
        this.currentlyExecuting = false;
      }
    }
  }
});
Object.extend(String, {
  interpret: function(value) {
    return value == null ? '' : String(value);
  },
  specialChar: {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
  }
});

Object.extend(String.prototype, {
  gsub: function(pattern, replacement) {
    var result = '', source = this, match;
    replacement = arguments.callee.prepareReplacement(replacement);

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  },

  sub: function(pattern, replacement, count) {
    replacement = this.gsub.prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  },

  scan: function(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
  },

  truncate: function(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  },

  strip: function() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  },

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
    return this.extractScripts().map(function(script) { return eval(script) });
  },

  escapeHTML: function() {
    var self = arguments.callee;
    self.text.data = this;
    return self.div.innerHTML;
  },

  unescapeHTML: function() {
    var div = new Element('div');
    div.innerHTML = this.stripTags();
    return div.childNodes[0] ? (div.childNodes.length > 1 ?
      $A(div.childNodes).inject('', function(memo, node) { return memo+node.nodeValue }) :
      div.childNodes[0].nodeValue) : '';
  },

  toQueryParams: function(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) return { };

    return match[1].split(separator || '&').inject({ }, function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift());
        var value = pair.length > 1 ? pair.join('=') : pair[0];
        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    });
  },

  toArray: function() {
    return this.split('');
  },

  succ: function() {
    return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
  },

  times: function(count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
  },

  camelize: function() {
    var parts = this.split('-'), len = parts.length;
    if (len == 1) return parts[0];

    var camelized = this.charAt(0) == '-'
      ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1)
      : parts[0];

    for (var i = 1; i < len; i++)
      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1);

    return camelized;
  },

  capitalize: function() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  },

  underscore: function() {
    return this.gsub(/::/, '/').gsub(/([A-Z]+)([A-Z][a-z])/,'#{1}_#{2}').gsub(/([a-z\d])([A-Z])/,'#{1}_#{2}').gsub(/-/,'_').toLowerCase();
  },

  dasherize: function() {
    return this.gsub(/_/,'-');
  },

  inspect: function(useDoubleQuotes) {
    var escapedString = this.gsub(/[\x00-\x1f\\]/, function(match) {
      var character = String.specialChar[match[0]];
      return character ? character : '\\u00' + match[0].charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
  },

  toJSON: function() {
    return this.inspect(true);
  },

  unfilterJSON: function(filter) {
    return this.sub(filter || Prototype.JSONFilter, '#{1}');
  },

  isJSON: function() {
    var str = this;
    if (str.blank()) return false;
    str = this.replace(/\\./g, '@').replace(/"[^"\\\n\r]*"/g, '');
    return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str);
  },

  evalJSON: function(sanitize) {
    var json = this.unfilterJSON();
    try {
      if (!sanitize || json.isJSON()) return eval('(' + json + ')');
    } catch (e) { }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
  },

  include: function(pattern) {
    return this.indexOf(pattern) > -1;
  },

  startsWith: function(pattern) {
    return this.indexOf(pattern) === 0;
  },

  endsWith: function(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d;
  },

  empty: function() {
    return this == '';
  },

  blank: function() {
    return /^\s*$/.test(this);
  },

  interpolate: function(object, pattern) {
    return new Template(this, pattern).evaluate(object);
  }
});

if (Prototype.Browser.WebKit || Prototype.Browser.IE) Object.extend(String.prototype, {
  escapeHTML: function() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  },
  unescapeHTML: function() {
    return this.stripTags().replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  }
});

String.prototype.gsub.prepareReplacement = function(replacement) {
  if (Object.isFunction(replacement)) return replacement;
  var template = new Template(replacement);
  return function(match) { return template.evaluate(match) };
};

String.prototype.parseQuery = String.prototype.toQueryParams;

Object.extend(String.prototype.escapeHTML, {
  div:  document.createElement('div'),
  text: document.createTextNode('')
});

String.prototype.escapeHTML.div.appendChild(String.prototype.escapeHTML.text);

var Template = Class.create({
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  },

  evaluate: function(object) {
    if (Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if (object == null) return '';

      var before = match[1] || '';
      if (before == '\\') return match[2];

      var ctx = object, expr = match[3];
      var pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
      match = pattern.exec(expr);
      if (match == null) return before;

      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].gsub('\\\\]', ']') : match[1];
        ctx = ctx[comp];
        if (null == ctx || '' == match[3]) break;
        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }

      return before + String.interpret(ctx);
    });
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;

var $break = { };

var Enumerable = {
  each: function(iterator, context) {
    var index = 0;
    try {
      this._each(function(value) {
        iterator.call(context, value, index++);
      });
    } catch (e) {
      if (e != $break) throw e;
    }
    return this;
  },

  eachSlice: function(number, iterator, context) {
    var index = -number, slices = [], array = this.toArray();
    if (number < 1) return array;
    while ((index += number) < array.length)
      slices.push(array.slice(index, index+number));
    return slices.collect(iterator, context);
  },

  all: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator.call(context, value, index);
      if (!result) throw $break;
    });
    return result;
  },

  any: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if (result = !!iterator.call(context, value, index))
        throw $break;
    });
    return result;
  },

  collect: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator.call(context, value, index));
    });
    return results;
  },

  detect: function(iterator, context) {
    var result;
    this.each(function(value, index) {
      if (iterator.call(context, value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  },

  findAll: function(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  },

  grep: function(filter, iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];

    if (Object.isString(filter))
      filter = new RegExp(filter);

    this.each(function(value, index) {
      if (filter.match(value))
        results.push(iterator.call(context, value, index));
    });
    return results;
  },

  include: function(object) {
    if (Object.isFunction(this.indexOf))
      if (this.indexOf(object) != -1) return true;

    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  },

  inGroupsOf: function(number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) slice.push(fillWith);
      return slice;
    });
  },

  inject: function(memo, iterator, context) {
    this.each(function(value, index) {
      memo = iterator.call(context, memo, value, index);
    });
    return memo;
  },

  invoke: function(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  },

  max: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value >= result)
        result = value;
    });
    return result;
  },

  min: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value < result)
        result = value;
    });
    return result;
  },

  partition: function(iterator, context) {
    iterator = iterator || Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator.call(context, value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  },

  pluck: function(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property]);
    });
    return results;
  },

  reject: function(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (!iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  },

  sortBy: function(iterator, context) {
    return this.map(function(value, index) {
      return {
        value: value,
        criteria: iterator.call(context, value, index)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  },

  toArray: function() {
    return this.map();
  },

  zip: function() {
    var iterator = Prototype.K, args = $A(arguments);
    if (Object.isFunction(args.last()))
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index));
    });
  },

  size: function() {
    return this.toArray().length;
  },

  inspect: function() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }
};

Object.extend(Enumerable, {
  map:     Enumerable.collect,
  find:    Enumerable.detect,
  select:  Enumerable.findAll,
  filter:  Enumerable.findAll,
  member:  Enumerable.include,
  entries: Enumerable.toArray,
  every:   Enumerable.all,
  some:    Enumerable.any
});
function $A(iterable) {
  if (!iterable) return [];
  if (iterable.toArray) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}

if (Prototype.Browser.WebKit) {
  $A = function(iterable) {
    if (!iterable) return [];
    // In Safari, only use the `toArray` method if it's not a NodeList.
    // A NodeList is a function, has an function `item` property, and a numeric
    // `length` property. Adapted from Google Doctype.
    if (!(typeof iterable === 'function' && typeof iterable.length ===
        'number' && typeof iterable.item === 'function') && iterable.toArray)
      return iterable.toArray();
    var length = iterable.length || 0, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
  };
}

Array.from = $A;

Object.extend(Array.prototype, Enumerable);

if (!Array.prototype._reverse) Array.prototype._reverse = Array.prototype.reverse;

Object.extend(Array.prototype, {
  _each: function(iterator) {
    for (var i = 0, length = this.length; i < length; i++)
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
      return value != null;
    });
  },

  flatten: function() {
    return this.inject([], function(array, value) {
      return array.concat(Object.isArray(value) ?
        value.flatten() : [value]);
    });
  },

  without: function() {
    var values = $A(arguments);
    return this.select(function(value) {
      return !values.include(value);
    });
  },

  reverse: function(inline) {
    return (inline !== false ? this : this.toArray())._reverse();
  },

  reduce: function() {
    return this.length > 1 ? this : this[0];
  },

  uniq: function(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  },

  intersect: function(array) {
    return this.uniq().findAll(function(item) {
      return array.detect(function(value) { return item === value });
    });
  },

  clone: function() {
    return [].concat(this);
  },

  size: function() {
    return this.length;
  },

  inspect: function() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  },

  toJSON: function() {
    var results = [];
    this.each(function(object) {
      var value = Object.toJSON(object);
      if (!Object.isUndefined(value)) results.push(value);
    });
    return '[' + results.join(', ') + ']';
  }
});

// use native browser JS 1.6 implementation if available
if (Object.isFunction(Array.prototype.forEach))
  Array.prototype._each = Array.prototype.forEach;

if (!Array.prototype.indexOf) Array.prototype.indexOf = function(item, i) {
  i || (i = 0);
  var length = this.length;
  if (i < 0) i = length + i;
  for (; i < length; i++)
    if (this[i] === item) return i;
  return -1;
};

if (!Array.prototype.lastIndexOf) Array.prototype.lastIndexOf = function(item, i) {
  i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
  var n = this.slice(0, i).reverse().indexOf(item);
  return (n < 0) ? n : i - n - 1;
};

Array.prototype.toArray = Array.prototype.clone;

function $w(string) {
  if (!Object.isString(string)) return [];
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

if (Prototype.Browser.Opera){
  Array.prototype.concat = function() {
    var array = [];
    for (var i = 0, length = this.length; i < length; i++) array.push(this[i]);
    for (var i = 0, length = arguments.length; i < length; i++) {
      if (Object.isArray(arguments[i])) {
        for (var j = 0, arrayLength = arguments[i].length; j < arrayLength; j++)
          array.push(arguments[i][j]);
      } else {
        array.push(arguments[i]);
      }
    }
    return array;
  };
}
Object.extend(Number.prototype, {
  toColorPart: function() {
    return this.toPaddedString(2, 16);
  },

  succ: function() {
    return this + 1;
  },

  times: function(iterator, context) {
    $R(0, this, true).each(iterator, context);
    return this;
  },

  toPaddedString: function(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
  },

  toJSON: function() {
    return isFinite(this) ? this.toString() : 'null';
  }
});

$w('abs round ceil floor').each(function(method){
  Number.prototype[method] = Math[method].methodize();
});
function $H(object) {
  return new Hash(object);
};

var Hash = Class.create(Enumerable, (function() {

  function toQueryPair(key, value) {
    if (Object.isUndefined(value)) return key;
    return key + '=' + encodeURIComponent(String.interpret(value));
  }

  return {
    initialize: function(object) {
      this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
    },

    _each: function(iterator) {
      for (var key in this._object) {
        var value = this._object[key], pair = [key, value];
        pair.key = key;
        pair.value = value;
        iterator(pair);
      }
    },

    set: function(key, value) {
      return this._object[key] = value;
    },

    get: function(key) {
      // simulating poorly supported hasOwnProperty
      if (this._object[key] !== Object.prototype[key])
        return this._object[key];
    },

    unset: function(key) {
      var value = this._object[key];
      delete this._object[key];
      return value;
    },

    toObject: function() {
      return Object.clone(this._object);
    },

    keys: function() {
      return this.pluck('key');
    },

    values: function() {
      return this.pluck('value');
    },

    index: function(value) {
      var match = this.detect(function(pair) {
        return pair.value === value;
      });
      return match && match.key;
    },

    merge: function(object) {
      return this.clone().update(object);
    },

    update: function(object) {
      return new Hash(object).inject(this, function(result, pair) {
        result.set(pair.key, pair.value);
        return result;
      });
    },

    toQueryString: function() {
      return this.inject([], function(results, pair) {
        var key = encodeURIComponent(pair.key), values = pair.value;

        if (values && typeof values == 'object') {
          if (Object.isArray(values))
            return results.concat(values.map(toQueryPair.curry(key)));
        } else results.push(toQueryPair(key, values));
        return results;
      }).join('&');
    },

    inspect: function() {
      return '#<Hash:{' + this.map(function(pair) {
        return pair.map(Object.inspect).join(': ');
      }).join(', ') + '}>';
    },

    toJSON: function() {
      return Object.toJSON(this.toObject());
    },

    clone: function() {
      return new Hash(this);
    }
  }
})());

Hash.prototype.toTemplateReplacements = Hash.prototype.toObject;
Hash.from = $H;
var ObjectRange = Class.create(Enumerable, {
  initialize: function(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  },

  _each: function(iterator) {
    var value = this.start;
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
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
};

var Ajax = {
  getTransport: function() {
    return Try.these(
      function() {return new XMLHttpRequest()},
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')}
    ) || false;
  },

  activeRequestCount: 0
};

Ajax.Responders = {
  responders: [],

  _each: function(iterator) {
    this.responders._each(iterator);
  },

  register: function(responder) {
    if (!this.include(responder))
      this.responders.push(responder);
  },

  unregister: function(responder) {
    this.responders = this.responders.without(responder);
  },

  dispatch: function(callback, request, transport, json) {
    this.each(function(responder) {
      if (Object.isFunction(responder[callback])) {
        try {
          responder[callback].apply(responder, [request, transport, json]);
        } catch (e) { }
      }
    });
  }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
  onCreate:   function() { Ajax.activeRequestCount++ },
  onComplete: function() { Ajax.activeRequestCount-- }
});

Ajax.Base = Class.create({
  initialize: function(options) {
    this.options = {
      method:       'post',
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   '',
      evalJSON:     true,
      evalJS:       true
    };
    Object.extend(this.options, options || { });

    this.options.method = this.options.method.toLowerCase();

    if (Object.isString(this.options.parameters))
      this.options.parameters = this.options.parameters.toQueryParams();
    else if (Object.isHash(this.options.parameters))
      this.options.parameters = this.options.parameters.toObject();
  }
});

Ajax.Request = Class.create(Ajax.Base, {
  _complete: false,

  initialize: function($super, url, options) {
    $super(options);
    this.transport = Ajax.getTransport();
    this.request(url);
  },

  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.clone(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {
      // simulate other verbs over post
      params['_method'] = this.method;
      this.method = 'post';
    }

    this.parameters = params;

    if (params = Object.toQueryString(params)) {
      // when GET, append parameters to URL
      if (this.method == 'get')
        this.url += (this.url.include('?') ? '&' : '?') + params;
      else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent))
        params += '&_=';
    }

    try {
      var response = new Ajax.Response(this);
      if (this.options.onCreate) this.options.onCreate(response);
      Ajax.Responders.dispatch('onCreate', this, response);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous) this.respondToReadyState.bind(this).defer(1);

      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();

      this.body = this.method == 'post' ? (this.options.postBody || params) : null;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
    }
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete))
      this.respondToReadyState(this.transport.readyState);
  },

  setRequestHeaders: function() {
    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Prototype-Version': Prototype.Version,
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };

    if (this.method == 'post') {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      /* Force "Connection: close" for older Mozilla browsers to work
       * around a bug where XMLHttpRequest sends an incorrect
       * Content-length header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }

    // user-defined headers
    if (typeof this.options.requestHeaders == 'object') {
      var extras = this.options.requestHeaders;

      if (Object.isFunction(extras.push))
        for (var i = 0, length = extras.length; i < length; i += 2)
          headers[extras[i]] = extras[i+1];
      else
        $H(extras).each(function(pair) { headers[pair.key] = pair.value });
    }

    for (var name in headers)
      this.transport.setRequestHeader(name, headers[name]);
  },

  success: function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300);
  },

  getStatus: function() {
    try {
      return this.transport.status || 0;
    } catch (e) { return 0 }
  },

  respondToReadyState: function(readyState) {
    var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);

    if (state == 'Complete') {
      try {
        this._complete = true;
        (this.options['on' + response.status]
         || this.options['on' + (this.success() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(response, response.headerJSON);
      } catch (e) {
        this.dispatchException(e);
      }

      var contentType = response.getHeader('Content-type');
      if (this.options.evalJS == 'force'
          || (this.options.evalJS && this.isSameOrigin() && contentType
          && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
        this.evalResponse();
    }

    try {
      (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
      Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
    } catch (e) {
      this.dispatchException(e);
    }

    if (state == 'Complete') {
      // avoid memory leak in MSIE: clean up
      this.transport.onreadystatechange = Prototype.emptyFunction;
    }
  },

  isSameOrigin: function() {
    var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return !m || (m[0] == '#{protocol}//#{domain}#{port}'.interpolate({
      protocol: location.protocol,
      domain: document.domain,
      port: location.port ? ':' + location.port : ''
    }));
  },

  getHeader: function(name) {
    try {
      return this.transport.getResponseHeader(name) || null;
    } catch (e) { return null }
  },

  evalResponse: function() {
    try {
      return eval((this.transport.responseText || '').unfilterJSON());
    } catch (e) {
      this.dispatchException(e);
    }
  },

  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

Ajax.Request.Events =
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];

Ajax.Response = Class.create({
  initialize: function(request){
    this.request = request;
    var transport  = this.transport  = request.transport,
        readyState = this.readyState = transport.readyState;

    if((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
      this.status       = this.getStatus();
      this.statusText   = this.getStatusText();
      this.responseText = String.interpret(transport.responseText);
      this.headerJSON   = this._getHeaderJSON();
    }

    if(readyState == 4) {
      var xml = transport.responseXML;
      this.responseXML  = Object.isUndefined(xml) ? null : xml;
      this.responseJSON = this._getResponseJSON();
    }
  },

  status:      0,
  statusText: '',

  getStatus: Ajax.Request.prototype.getStatus,

  getStatusText: function() {
    try {
      return this.transport.statusText || '';
    } catch (e) { return '' }
  },

  getHeader: Ajax.Request.prototype.getHeader,

  getAllHeaders: function() {
    try {
      return this.getAllResponseHeaders();
    } catch (e) { return null }
  },

  getResponseHeader: function(name) {
    return this.transport.getResponseHeader(name);
  },

  getAllResponseHeaders: function() {
    return this.transport.getAllResponseHeaders();
  },

  _getHeaderJSON: function() {
    var json = this.getHeader('X-JSON');
    if (!json) return null;
    json = decodeURIComponent(escape(json));
    try {
      return json.evalJSON(this.request.options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  },

  _getResponseJSON: function() {
    var options = this.request.options;
    if (!options.evalJSON || (options.evalJSON != 'force' &&
      !(this.getHeader('Content-type') || '').include('application/json')) ||
        this.responseText.blank())
          return null;
    try {
      return this.responseText.evalJSON(options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  }
});

Ajax.Updater = Class.create(Ajax.Request, {
  initialize: function($super, container, url, options) {
    this.container = {
      success: (container.success || container),
      failure: (container.failure || (container.success ? null : container))
    };

    options = Object.clone(options);
    var onComplete = options.onComplete;
    options.onComplete = (function(response, json) {
      this.updateContent(response.responseText);
      if (Object.isFunction(onComplete)) onComplete(response, json);
    }).bind(this);

    $super(url, options);
  },

  updateContent: function(responseText) {
    var receiver = this.container[this.success() ? 'success' : 'failure'],
        options = this.options;

    if (!options.evalScripts) responseText = responseText.stripScripts();

    if (receiver = $(receiver)) {
      if (options.insertion) {
        if (Object.isString(options.insertion)) {
          var insertion = { }; insertion[options.insertion] = responseText;
          receiver.insert(insertion);
        }
        else options.insertion(receiver, responseText);
      }
      else receiver.update(responseText);
    }
  }
});

Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
  initialize: function($super, container, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = { };
    this.container = container;
    this.url = url;

    this.start();
  },

  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(response) {
    if (this.options.decay) {
      this.decay = (response.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = response.responseText;
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});
function $(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push($(arguments[i]));
    return elements;
  }
  if (Object.isString(element))
    element = document.getElementById(element);
  return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, $(parentElement) || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, length = query.snapshotLength; i < length; i++)
      results.push(Element.extend(query.snapshotItem(i)));
    return results;
  };
}

/*--------------------------------------------------------------------------*/

if (!window.Node) var Node = { };

if (!Node.ELEMENT_NODE) {
  // DOM level 2 ECMAScript Language Binding
  Object.extend(Node, {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  });
}

(function() {
  var element = this.Element;
  this.Element = function(tagName, attributes) {
    attributes = attributes || { };
    tagName = tagName.toLowerCase();
    var cache = Element.cache;
    if (Prototype.Browser.IE && attributes.name) {
      tagName = '<' + tagName + ' name="' + attributes.name + '">';
      delete attributes.name;
      return Element.writeAttribute(document.createElement(tagName), attributes);
    }
    if (!cache[tagName]) cache[tagName] = Element.extend(document.createElement(tagName));
    return Element.writeAttribute(cache[tagName].cloneNode(false), attributes);
  };
  Object.extend(this.Element, element || { });
  if (element) this.Element.prototype = element.prototype;
}).call(window);

Element.cache = { };

Element.Methods = {
  visible: function(element) {
    return $(element).style.display != 'none';
  },

  toggle: function(element) {
    element = $(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
  },

  hide: function(element) {
    element = $(element);
    element.style.display = 'none';
    return element;
  },

  show: function(element) {
    element = $(element);
    element.style.display = '';
    return element;
  },

  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
    return element;
  },

  update: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) return element.update().insert(content);
    content = Object.toHTML(content);
    element.innerHTML = content.stripScripts();
    content.evalScripts.bind(content).defer();
    return element;
  },

  replace: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    else if (!Object.isElement(content)) {
      content = Object.toHTML(content);
      var range = element.ownerDocument.createRange();
      range.selectNode(element);
      content.evalScripts.bind(content).defer();
      content = range.createContextualFragment(content.stripScripts());
    }
    element.parentNode.replaceChild(content, element);
    return element;
  },

  insert: function(element, insertions) {
    element = $(element);

    if (Object.isString(insertions) || Object.isNumber(insertions) ||
        Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
          insertions = {bottom:insertions};

    var content, insert, tagName, childNodes;

    for (var position in insertions) {
      content  = insertions[position];
      position = position.toLowerCase();
      insert = Element._insertionTranslations[position];

      if (content && content.toElement) content = content.toElement();
      if (Object.isElement(content)) {
        insert(element, content);
        continue;
      }

      content = Object.toHTML(content);

      tagName = ((position == 'before' || position == 'after')
        ? element.parentNode : element).tagName.toUpperCase();

      childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());

      if (position == 'top' || position == 'after') childNodes.reverse();
      childNodes.each(insert.curry(element));

      content.evalScripts.bind(content).defer();
    }

    return element;
  },

  wrap: function(element, wrapper, attributes) {
    element = $(element);
    if (Object.isElement(wrapper))
      $(wrapper).writeAttribute(attributes || { });
    else if (Object.isString(wrapper)) wrapper = new Element(wrapper, attributes);
    else wrapper = new Element('div', wrapper);
    if (element.parentNode)
      element.parentNode.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
  },

  inspect: function(element) {
    element = $(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function(pair) {
      var property = pair.first(), attribute = pair.last();
      var value = (element[property] || '').toString();
      if (value) result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
  },

  recursivelyCollect: function(element, property) {
    element = $(element);
    var elements = [];
    while (element = element[property])
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
    return elements;
  },

  ancestors: function(element) {
    return $(element).recursivelyCollect('parentNode');
  },

  descendants: function(element) {
    return $(element).select("*");
  },

  firstDescendant: function(element) {
    element = $(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return $(element);
  },

  immediateDescendants: function(element) {
    if (!(element = $(element).firstChild)) return [];
    while (element && element.nodeType != 1) element = element.nextSibling;
    if (element) return [element].concat($(element).nextSiblings());
    return [];
  },

  previousSiblings: function(element) {
    return $(element).recursivelyCollect('previousSibling');
  },

  nextSiblings: function(element) {
    return $(element).recursivelyCollect('nextSibling');
  },

  siblings: function(element) {
    element = $(element);
    return element.previousSiblings().reverse().concat(element.nextSiblings());
  },

  match: function(element, selector) {
    if (Object.isString(selector))
      selector = new Selector(selector);
    return selector.match($(element));
  },

  up: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(element.parentNode);
    var ancestors = element.ancestors();
    return Object.isNumber(expression) ? ancestors[expression] :
      Selector.findElement(ancestors, expression, index);
  },

  down: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return element.firstDescendant();
    return Object.isNumber(expression) ? element.descendants()[expression] :
      Element.select(element, expression)[index || 0];
  },

  previous: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.previousElementSibling(element));
    var previousSiblings = element.previousSiblings();
    return Object.isNumber(expression) ? previousSiblings[expression] :
      Selector.findElement(previousSiblings, expression, index);
  },

  next: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(Selector.handlers.nextElementSibling(element));
    var nextSiblings = element.nextSiblings();
    return Object.isNumber(expression) ? nextSiblings[expression] :
      Selector.findElement(nextSiblings, expression, index);
  },

  select: function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element, args);
  },

  adjacent: function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element.parentNode, args).without(element);
  },

  identify: function(element) {
    element = $(element);
    var id = element.readAttribute('id'), self = arguments.callee;
    if (id) return id;
    do { id = 'anonymous_element_' + self.counter++ } while ($(id));
    element.writeAttribute('id', id);
    return id;
  },

  readAttribute: function(element, name) {
    element = $(element);
    if (Prototype.Browser.IE) {
      var t = Element._attributeTranslations.read;
      if (t.values[name]) return t.values[name](element, name);
      if (t.names[name]) name = t.names[name];
      if (name.include(':')) {
        return (!element.attributes || !element.attributes[name]) ? null :
         element.attributes[name].value;
      }
    }
    return element.getAttribute(name);
  },

  writeAttribute: function(element, name, value) {
    element = $(element);
    var attributes = { }, t = Element._attributeTranslations.write;

    if (typeof name == 'object') attributes = name;
    else attributes[name] = Object.isUndefined(value) ? true : value;

    for (var attr in attributes) {
      name = t.names[attr] || attr;
      value = attributes[attr];
      if (t.values[attr]) name = t.values[attr](element, value);
      if (value === false || value === null)
        element.removeAttribute(name);
      else if (value === true)
        element.setAttribute(name, name);
      else element.setAttribute(name, value);
    }
    return element;
  },

  getHeight: function(element) {
    return $(element).getDimensions().height;
  },

  getWidth: function(element) {
    return $(element).getDimensions().width;
  },

  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className ||
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  },

  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    if (!element.hasClassName(className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  },

  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    element.className = element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
  },

  toggleClassName: function(element, className) {
    if (!(element = $(element))) return;
    return element[element.hasClassName(className) ?
      'removeClassName' : 'addClassName'](className);
  },

  // removes whitespace-only text node children
  cleanWhitespace: function(element) {
    element = $(element);
    var node = element.firstChild;
    while (node) {
      var nextNode = node.nextSibling;
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        element.removeChild(node);
      node = nextNode;
    }
    return element;
  },

  empty: function(element) {
    return $(element).innerHTML.blank();
  },

  descendantOf: function(element, ancestor) {
    element = $(element), ancestor = $(ancestor);

    if (element.compareDocumentPosition)
      return (element.compareDocumentPosition(ancestor) & 8) === 8;

    if (ancestor.contains)
      return ancestor.contains(element) && ancestor !== element;

    while (element = element.parentNode)
      if (element == ancestor) return true;

    return false;
  },

  scrollTo: function(element) {
    element = $(element);
    var pos = element.cumulativeOffset();
    window.scrollTo(pos[0], pos[1]);
    return element;
  },

  getStyle: function(element, style) {
    element = $(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value || value == 'auto') {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },

  getOpacity: function(element) {
    return $(element).getStyle('opacity');
  },

  setStyle: function(element, styles) {
    element = $(element);
    var elementStyle = element.style, match;
    if (Object.isString(styles)) {
      element.style.cssText += ';' + styles;
      return styles.include('opacity') ?
        element.setOpacity(styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
    }
    for (var property in styles)
      if (property == 'opacity') element.setOpacity(styles[property]);
      else
        elementStyle[(property == 'float' || property == 'cssFloat') ?
          (Object.isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') :
            property] = styles[property];

    return element;
  },

  setOpacity: function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;
    return element;
  },

  getDimensions: function(element) {
    element = $(element);
    var display = element.getStyle('display');
    if (display != 'none' && display != null) // Safari bug
      return {width: element.offsetWidth, height: element.offsetHeight};

    // All *Width and *Height properties give 0 on elements with display none,
    // so enable the element temporarily
    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
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
      if (Prototype.Browser.Opera) {
        element.style.top = 0;
        element.style.left = 0;
      }
    }
    return element;
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
    return element;
  },

  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return element;
    element._overflow = Element.getStyle(element, 'overflow') || 'auto';
    if (element._overflow !== 'hidden')
      element.style.overflow = 'hidden';
    return element;
  },

  undoClipping: function(element) {
    element = $(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  },

  cumulativeOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  positionedOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (element.tagName.toUpperCase() == 'BODY') break;
        var p = Element.getStyle(element, 'position');
        if (p !== 'static') break;
      }
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  absolutize: function(element) {
    element = $(element);
    if (element.getStyle('position') == 'absolute') return element;
    // Position.prepare(); // To be done manually by Scripty when it needs it.

    var offsets = element.positionedOffset();
    var top     = offsets[1];
    var left    = offsets[0];
    var width   = element.clientWidth;
    var height  = element.clientHeight;

    element._originalLeft   = left - parseFloat(element.style.left  || 0);
    element._originalTop    = top  - parseFloat(element.style.top || 0);
    element._originalWidth  = element.style.width;
    element._originalHeight = element.style.height;

    element.style.position = 'absolute';
    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.width  = width + 'px';
    element.style.height = height + 'px';
    return element;
  },

  relativize: function(element) {
    element = $(element);
    if (element.getStyle('position') == 'relative') return element;
    // Position.prepare(); // To be done manually by Scripty when it needs it.

    element.style.position = 'relative';
    var top  = parseFloat(element.style.top  || 0) - (element._originalTop || 0);
    var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);

    element.style.top    = top + 'px';
    element.style.left   = left + 'px';
    element.style.height = element._originalHeight;
    element.style.width  = element._originalWidth;
    return element;
  },

  cumulativeScrollOffset: function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode;
    } while (element);
    return Element._returnOffset(valueL, valueT);
  },

  getOffsetParent: function(element) {
    if (element.offsetParent) return $(element.offsetParent);
    if (element == document.body) return $(element);

    while ((element = element.parentNode) && element != document.body)
      if (Element.getStyle(element, 'position') != 'static')
        return $(element);

    return $(document.body);
  },

  viewportOffset: function(forElement) {
    var valueT = 0, valueL = 0;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;

      // Safari fix
      if (element.offsetParent == document.body &&
        Element.getStyle(element, 'position') == 'absolute') break;

    } while (element = element.offsetParent);

    element = forElement;
    do {
      if (!Prototype.Browser.Opera || (element.tagName && (element.tagName.toUpperCase() == 'BODY'))) {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);

    return Element._returnOffset(valueL, valueT);
  },

  clonePosition: function(element, source) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || { });

    // find page position of source
    source = $(source);
    var p = source.viewportOffset();

    // find coordinate system to use
    element = $(element);
    var delta = [0, 0];
    var parent = null;
    // delta [0,0] will do fine with position: fixed elements,
    // position:absolute needs offsetParent deltas
    if (Element.getStyle(element, 'position') == 'absolute') {
      parent = element.getOffsetParent();
      delta = parent.viewportOffset();
    }

    // correct by body offsets (fixes Safari)
    if (parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop;
    }

    // set position
    if (options.setLeft)   element.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if (options.setTop)    element.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
    if (options.setWidth)  element.style.width = source.offsetWidth + 'px';
    if (options.setHeight) element.style.height = source.offsetHeight + 'px';
    return element;
  }
};

Element.Methods.identify.counter = 1;

Object.extend(Element.Methods, {
  getElementsBySelector: Element.Methods.select,
  childElements: Element.Methods.immediateDescendants
});

Element._attributeTranslations = {
  write: {
    names: {
      className: 'class',
      htmlFor:   'for'
    },
    values: { }
  }
};

if (Prototype.Browser.Opera) {
  Element.Methods.getStyle = Element.Methods.getStyle.wrap(
    function(proceed, element, style) {
      switch (style) {
        case 'left': case 'top': case 'right': case 'bottom':
          if (proceed(element, 'position') === 'static') return null;
        case 'height': case 'width':
          // returns '0px' for hidden elements; we want it to return null
          if (!Element.visible(element)) return null;

          // returns the border-box dimensions rather than the content-box
          // dimensions, so we subtract padding and borders from the value
          var dim = parseInt(proceed(element, style), 10);

          if (dim !== element['offset' + style.capitalize()])
            return dim + 'px';

          var properties;
          if (style === 'height') {
            properties = ['border-top-width', 'padding-top',
             'padding-bottom', 'border-bottom-width'];
          }
          else {
            properties = ['border-left-width', 'padding-left',
             'padding-right', 'border-right-width'];
          }
          return properties.inject(dim, function(memo, property) {
            var val = proceed(element, property);
            return val === null ? memo : memo - parseInt(val, 10);
          }) + 'px';
        default: return proceed(element, style);
      }
    }
  );

  Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(
    function(proceed, element, attribute) {
      if (attribute === 'title') return element.title;
      return proceed(element, attribute);
    }
  );
}

else if (Prototype.Browser.IE) {
  // IE doesn't report offsets correctly for static elements, so we change them
  // to "relative" to get the values, then change them back.
  Element.Methods.getOffsetParent = Element.Methods.getOffsetParent.wrap(
    function(proceed, element) {
      element = $(element);
      // IE throws an error if element is not in document
      try { element.offsetParent }
      catch(e) { return $(document.body) }
      var position = element.getStyle('position');
      if (position !== 'static') return proceed(element);
      element.setStyle({ position: 'relative' });
      var value = proceed(element);
      element.setStyle({ position: position });
      return value;
    }
  );

  $w('positionedOffset viewportOffset').each(function(method) {
    Element.Methods[method] = Element.Methods[method].wrap(
      function(proceed, element) {
        element = $(element);
        try { element.offsetParent }
        catch(e) { return Element._returnOffset(0,0) }
        var position = element.getStyle('position');
        if (position !== 'static') return proceed(element);
        // Trigger hasLayout on the offset parent so that IE6 reports
        // accurate offsetTop and offsetLeft values for position: fixed.
        var offsetParent = element.getOffsetParent();
        if (offsetParent && offsetParent.getStyle('position') === 'fixed')
          offsetParent.setStyle({ zoom: 1 });
        element.setStyle({ position: 'relative' });
        var value = proceed(element);
        element.setStyle({ position: position });
        return value;
      }
    );
  });

  Element.Methods.cumulativeOffset = Element.Methods.cumulativeOffset.wrap(
    function(proceed, element) {
      try { element.offsetParent }
      catch(e) { return Element._returnOffset(0,0) }
      return proceed(element);
    }
  );

  Element.Methods.getStyle = function(element, style) {
    element = $(element);
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];

    if (style == 'opacity') {
      if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
        if (value[1]) return parseFloat(value[1]) / 100;
      return 1.0;
    }

    if (value == 'auto') {
      if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
        return element['offset' + style.capitalize()] + 'px';
      return null;
    }
    return value;
  };

  Element.Methods.setOpacity = function(element, value) {
    function stripAlpha(filter){
      return filter.replace(/alpha\([^\)]*\)/gi,'');
    }
    element = $(element);
    var currentStyle = element.currentStyle;
    if ((currentStyle && !currentStyle.hasLayout) ||
      (!currentStyle && element.style.zoom == 'normal'))
        element.style.zoom = 1;

    var filter = element.getStyle('filter'), style = element.style;
    if (value == 1 || value === '') {
      (filter = stripAlpha(filter)) ?
        style.filter = filter : style.removeAttribute('filter');
      return element;
    } else if (value < 0.00001) value = 0;
    style.filter = stripAlpha(filter) +
      'alpha(opacity=' + (value * 100) + ')';
    return element;
  };

  Element._attributeTranslations = {
    read: {
      names: {
        'class': 'className',
        'for':   'htmlFor'
      },
      values: {
        _getAttr: function(element, attribute) {
          return element.getAttribute(attribute, 2);
        },
        _getAttrNode: function(element, attribute) {
          var node = element.getAttributeNode(attribute);
          return node ? node.value : "";
        },
        _getEv: function(element, attribute) {
          attribute = element.getAttribute(attribute);
          return attribute ? attribute.toString().slice(23, -2) : null;
        },
        _flag: function(element, attribute) {
          return $(element).hasAttribute(attribute) ? attribute : null;
        },
        style: function(element) {
          return element.style.cssText.toLowerCase();
        },
        title: function(element) {
          return element.title;
        }
      }
    }
  };

  Element._attributeTranslations.write = {
    names: Object.extend({
      cellpadding: 'cellPadding',
      cellspacing: 'cellSpacing'
    }, Element._attributeTranslations.read.names),
    values: {
      checked: function(element, value) {
        element.checked = !!value;
      },

      style: function(element, value) {
        element.style.cssText = value ? value : '';
      }
    }
  };

  Element._attributeTranslations.has = {};

  $w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' +
      'encType maxLength readOnly longDesc frameBorder').each(function(attr) {
    Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
    Element._attributeTranslations.has[attr.toLowerCase()] = attr;
  });

  (function(v) {
    Object.extend(v, {
      href:        v._getAttr,
      src:         v._getAttr,
      type:        v._getAttr,
      action:      v._getAttrNode,
      disabled:    v._flag,
      checked:     v._flag,
      readonly:    v._flag,
      multiple:    v._flag,
      onload:      v._getEv,
      onunload:    v._getEv,
      onclick:     v._getEv,
      ondblclick:  v._getEv,
      onmousedown: v._getEv,
      onmouseup:   v._getEv,
      onmouseover: v._getEv,
      onmousemove: v._getEv,
      onmouseout:  v._getEv,
      onfocus:     v._getEv,
      onblur:      v._getEv,
      onkeypress:  v._getEv,
      onkeydown:   v._getEv,
      onkeyup:     v._getEv,
      onsubmit:    v._getEv,
      onreset:     v._getEv,
      onselect:    v._getEv,
      onchange:    v._getEv
    });
  })(Element._attributeTranslations.read.values);
}

else if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1) ? 0.999999 :
      (value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
  };
}

else if (Prototype.Browser.WebKit) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;

    if (value == 1)
      if(element.tagName.toUpperCase() == 'IMG' && element.width) {
        element.width++; element.width--;
      } else try {
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.removeChild(n);
      } catch (e) { }

    return element;
  };

  // Safari returns margins on body which is incorrect if the child is absolutely
  // positioned.  For performance reasons, redefine Element#cumulativeOffset for
  // KHTML/WebKit only.
  Element.Methods.cumulativeOffset = function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == document.body)
        if (Element.getStyle(element, 'position') == 'absolute') break;

      element = element.offsetParent;
    } while (element);

    return Element._returnOffset(valueL, valueT);
  };
}

if (Prototype.Browser.IE || Prototype.Browser.Opera) {
  // IE and Opera are missing .innerHTML support for TABLE-related and SELECT elements
  Element.Methods.update = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) return element.update().insert(content);

    content = Object.toHTML(content);
    var tagName = element.tagName.toUpperCase();

    if (tagName in Element._insertionTranslations.tags) {
      $A(element.childNodes).each(function(node) { element.removeChild(node) });
      Element._getContentFromAnonymousElement(tagName, content.stripScripts())
        .each(function(node) { element.appendChild(node) });
    }
    else element.innerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

if ('outerHTML' in document.createElement('div')) {
  Element.Methods.replace = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) {
      element.parentNode.replaceChild(content, element);
      return element;
    }

    content = Object.toHTML(content);
    var parent = element.parentNode, tagName = parent.tagName.toUpperCase();

    if (Element._insertionTranslations.tags[tagName]) {
      var nextSibling = element.next();
      var fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      parent.removeChild(element);
      if (nextSibling)
        fragments.each(function(node) { parent.insertBefore(node, nextSibling) });
      else
        fragments.each(function(node) { parent.appendChild(node) });
    }
    else element.outerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

Element._returnOffset = function(l, t) {
  var result = [l, t];
  result.left = l;
  result.top = t;
  return result;
};

Element._getContentFromAnonymousElement = function(tagName, html) {
  var div = new Element('div'), t = Element._insertionTranslations.tags[tagName];
  if (t) {
    div.innerHTML = t[0] + html + t[1];
    t[2].times(function() { div = div.firstChild });
  } else div.innerHTML = html;
  return $A(div.childNodes);
};

Element._insertionTranslations = {
  before: function(element, node) {
    element.parentNode.insertBefore(node, element);
  },
  top: function(element, node) {
    element.insertBefore(node, element.firstChild);
  },
  bottom: function(element, node) {
    element.appendChild(node);
  },
  after: function(element, node) {
    element.parentNode.insertBefore(node, element.nextSibling);
  },
  tags: {
    TABLE:  ['<table>',                '</table>',                   1],
    TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
    TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
    TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
    SELECT: ['<select>',               '</select>',                  1]
  }
};

(function() {
  Object.extend(this.tags, {
    THEAD: this.tags.TBODY,
    TFOOT: this.tags.TBODY,
    TH:    this.tags.TD
  });
}).call(Element._insertionTranslations);

Element.Methods.Simulated = {
  hasAttribute: function(element, attribute) {
    attribute = Element._attributeTranslations.has[attribute] || attribute;
    var node = $(element).getAttributeNode(attribute);
    return !!(node && node.specified);
  }
};

Element.Methods.ByTag = { };

Object.extend(Element, Element.Methods);

if (!Prototype.BrowserFeatures.ElementExtensions &&
    document.createElement('div')['__proto__']) {
  window.HTMLElement = { };
  window.HTMLElement.prototype = document.createElement('div')['__proto__'];
  Prototype.BrowserFeatures.ElementExtensions = true;
}

Element.extend = (function() {
  if (Prototype.BrowserFeatures.SpecificElementExtensions)
    return Prototype.K;

  var Methods = { }, ByTag = Element.Methods.ByTag;

  var extend = Object.extend(function(element) {
    if (!element || element._extendedByPrototype ||
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
      tagName = element.tagName.toUpperCase(), property, value;

    // extend methods for specific tags
    if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);

    for (property in methods) {
      value = methods[property];
      if (Object.isFunction(value) && !(property in element))
        element[property] = value.methodize();
    }

    element._extendedByPrototype = Prototype.emptyFunction;
    return element;

  }, {
    refresh: function() {
      // extend methods for all tags (Safari doesn't need this)
      if (!Prototype.BrowserFeatures.ElementExtensions) {
        Object.extend(Methods, Element.Methods);
        Object.extend(Methods, Element.Methods.Simulated);
      }
    }
  });

  extend.refresh();
  return extend;
})();

Element.hasAttribute = function(element, attribute) {
  if (element.hasAttribute) return element.hasAttribute(attribute);
  return Element.Methods.Simulated.hasAttribute(element, attribute);
};

Element.addMethods = function(methods) {
  var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;

  if (!methods) {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(Element.Methods.ByTag, {
      "FORM":     Object.clone(Form.Methods),
      "INPUT":    Object.clone(Form.Element.Methods),
      "SELECT":   Object.clone(Form.Element.Methods),
      "TEXTAREA": Object.clone(Form.Element.Methods)
    });
  }

  if (arguments.length == 2) {
    var tagName = methods;
    methods = arguments[1];
  }

  if (!tagName) Object.extend(Element.Methods, methods || { });
  else {
    if (Object.isArray(tagName)) tagName.each(extend);
    else extend(tagName);
  }

  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if (!Element.Methods.ByTag[tagName])
      Element.Methods.ByTag[tagName] = { };
    Object.extend(Element.Methods.ByTag[tagName], methods);
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    for (var property in methods) {
      var value = methods[property];
      if (!Object.isFunction(value)) continue;
      if (!onlyIfAbsent || !(property in destination))
        destination[property] = value.methodize();
    }
  }

  function findDOMClass(tagName) {
    var klass;
    var trans = {
      "OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph",
      "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList",
      "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading",
      "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote",
      "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION":
      "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD":
      "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
      "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET":
      "FrameSet", "IFRAME": "IFrame"
    };
    if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName.capitalize() + 'Element';
    if (window[klass]) return window[klass];

    window[klass] = { };
    window[klass].prototype = document.createElement(tagName)['__proto__'];
    return window[klass];
  }

  if (F.ElementExtensions) {
    copy(Element.Methods, HTMLElement.prototype);
    copy(Element.Methods.Simulated, HTMLElement.prototype, true);
  }

  if (F.SpecificElementExtensions) {
    for (var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if (Object.isUndefined(klass)) continue;
      copy(T[tag], klass.prototype);
    }
  }

  Object.extend(Element, Element.Methods);
  delete Element.ByTag;

  if (Element.extend.refresh) Element.extend.refresh();
  Element.cache = { };
};

document.viewport = {
  getDimensions: function() {
    var dimensions = { }, B = Prototype.Browser;
    $w('width height').each(function(d) {
      var D = d.capitalize();
      if (B.WebKit && !document.evaluate) {
        // Safari <3.0 needs self.innerWidth/Height
        dimensions[d] = self['inner' + D];
      } else if (B.Opera && parseFloat(window.opera.version()) < 9.5) {
        // Opera <9.5 needs document.body.clientWidth/Height
        dimensions[d] = document.body['client' + D]
      } else {
        dimensions[d] = document.documentElement['client' + D];
      }
    });
    return dimensions;
  },

  getWidth: function() {
    return this.getDimensions().width;
  },

  getHeight: function() {
    return this.getDimensions().height;
  },

  getScrollOffsets: function() {
    return Element._returnOffset(
      window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop);
  }
};
/* Portions of the Selector class are derived from Jack Slocum's DomQuery,
 * part of YUI-Ext version 0.40, distributed under the terms of an MIT-style
 * license.  Please see http://www.yui-ext.com/ for more information. */

var Selector = Class.create({
  initialize: function(expression) {
    this.expression = expression.strip();

    if (this.shouldUseSelectorsAPI()) {
      this.mode = 'selectorsAPI';
    } else if (this.shouldUseXPath()) {
      this.mode = 'xpath';
      this.compileXPathMatcher();
    } else {
      this.mode = "normal";
      this.compileMatcher();
    }

  },

  shouldUseXPath: function() {
    if (!Prototype.BrowserFeatures.XPath) return false;

    var e = this.expression;

    // Safari 3 chokes on :*-of-type and :empty
    if (Prototype.Browser.WebKit &&
     (e.include("-of-type") || e.include(":empty")))
      return false;

    // XPath can't do namespaced attributes, nor can it read
    // the "checked" property from DOM nodes
    if ((/(\[[\w-]*?:|:checked)/).test(e))
      return false;

    return true;
  },

  shouldUseSelectorsAPI: function() {
    if (!Prototype.BrowserFeatures.SelectorsAPI) return false;

    if (!Selector._div) Selector._div = new Element('div');

    // Make sure the browser treats the selector as valid. Test on an
    // isolated element to minimize cost of this check.
    try {
      Selector._div.querySelector(this.expression);
    } catch(e) {
      return false;
    }

    return true;
  },

  compileMatcher: function() {
    var e = this.expression, ps = Selector.patterns, h = Selector.handlers,
        c = Selector.criteria, le, p, m;

    if (Selector._cache[e]) {
      this.matcher = Selector._cache[e];
      return;
    }

    this.matcher = ["this.matcher = function(root) {",
                    "var r = root, h = Selector.handlers, c = false, n;"];

    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        p = ps[i];
        if (m = e.match(p)) {
          this.matcher.push(Object.isFunction(c[i]) ? c[i](m) :
            new Template(c[i]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.matcher.push("return h.unique(n);\n}");
    eval(this.matcher.join('\n'));
    Selector._cache[this.expression] = this.matcher;
  },

  compileXPathMatcher: function() {
    var e = this.expression, ps = Selector.patterns,
        x = Selector.xpath, le, m;

    if (Selector._cache[e]) {
      this.xpath = Selector._cache[e]; return;
    }

    this.matcher = ['.//*'];
    while (e && le != e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        if (m = e.match(ps[i])) {
          this.matcher.push(Object.isFunction(x[i]) ? x[i](m) :
            new Template(x[i]).evaluate(m));
          e = e.replace(m[0], '');
          break;
        }
      }
    }

    this.xpath = this.matcher.join('');
    Selector._cache[this.expression] = this.xpath;
  },

  findElements: function(root) {
    root = root || document;
    var e = this.expression, results;

    switch (this.mode) {
      case 'selectorsAPI':
        // querySelectorAll queries document-wide, then filters to descendants
        // of the context element. That's not what we want.
        // Add an explicit context to the selector if necessary.
        if (root !== document) {
          var oldId = root.id, id = $(root).identify();
          e = "#" + id + " " + e;
        }

        results = $A(root.querySelectorAll(e)).map(Element.extend);
        root.id = oldId;

        return results;
      case 'xpath':
        return document._getElementsByXPath(this.xpath, root);
      default:
       return this.matcher(root);
    }
  },

  match: function(element) {
    this.tokens = [];

    var e = this.expression, ps = Selector.patterns, as = Selector.assertions;
    var le, p, m;

    while (e && le !== e && (/\S/).test(e)) {
      le = e;
      for (var i in ps) {
        p = ps[i];
        if (m = e.match(p)) {
          // use the Selector.assertions methods unless the selector
          // is too complex.
          if (as[i]) {
            this.tokens.push([i, Object.clone(m)]);
            e = e.replace(m[0], '');
          } else {
            // reluctantly do a document-wide search
            // and look for a match in the array
            return this.findElements(document).include(element);
          }
        }
      }
    }

    var match = true, name, matches;
    for (var i = 0, token; token = this.tokens[i]; i++) {
      name = token[0], matches = token[1];
      if (!Selector.assertions[name](element, matches)) {
        match = false; break;
      }
    }

    return match;
  },

  toString: function() {
    return this.expression;
  },

  inspect: function() {
    return "#<Selector:" + this.expression.inspect() + ">";
  }
});

Object.extend(Selector, {
  _cache: { },

  xpath: {
    descendant:   "//*",
    child:        "/*",
    adjacent:     "/following-sibling::*[1]",
    laterSibling: '/following-sibling::*',
    tagName:      function(m) {
      if (m[1] == '*') return '';
      return "[local-name()='" + m[1].toLowerCase() +
             "' or local-name()='" + m[1].toUpperCase() + "']";
    },
    className:    "[contains(concat(' ', @class, ' '), ' #{1} ')]",
    id:           "[@id='#{1}']",
    attrPresence: function(m) {
      m[1] = m[1].toLowerCase();
      return new Template("[@#{1}]").evaluate(m);
    },
    attr: function(m) {
      m[1] = m[1].toLowerCase();
      m[3] = m[5] || m[6];
      return new Template(Selector.xpath.operators[m[2]]).evaluate(m);
    },
    pseudo: function(m) {
      var h = Selector.xpath.pseudos[m[1]];
      if (!h) return '';
      if (Object.isFunction(h)) return h(m);
      return new Template(Selector.xpath.pseudos[m[1]]).evaluate(m);
    },
    operators: {
      '=':  "[@#{1}='#{3}']",
      '!=': "[@#{1}!='#{3}']",
      '^=': "[starts-with(@#{1}, '#{3}')]",
      '$=': "[substring(@#{1}, (string-length(@#{1}) - string-length('#{3}') + 1))='#{3}']",
      '*=': "[contains(@#{1}, '#{3}')]",
      '~=': "[contains(concat(' ', @#{1}, ' '), ' #{3} ')]",
      '|=': "[contains(concat('-', @#{1}, '-'), '-#{3}-')]"
    },
    pseudos: {
      'first-child': '[not(preceding-sibling::*)]',
      'last-child':  '[not(following-sibling::*)]',
      'only-child':  '[not(preceding-sibling::* or following-sibling::*)]',
      'empty':       "[count(*) = 0 and (count(text()) = 0)]",
      'checked':     "[@checked]",
      'disabled':    "[(@disabled) and (@type!='hidden')]",
      'enabled':     "[not(@disabled) and (@type!='hidden')]",
      'not': function(m) {
        var e = m[6], p = Selector.patterns,
            x = Selector.xpath, le, v;

        var exclusion = [];
        while (e && le != e && (/\S/).test(e)) {
          le = e;
          for (var i in p) {
            if (m = e.match(p[i])) {
              v = Object.isFunction(x[i]) ? x[i](m) : new Template(x[i]).evaluate(m);
              exclusion.push("(" + v.substring(1, v.length - 1) + ")");
              e = e.replace(m[0], '');
              break;
            }
          }
        }
        return "[not(" + exclusion.join(" and ") + ")]";
      },
      'nth-child':      function(m) {
        return Selector.xpath.pseudos.nth("(count(./preceding-sibling::*) + 1) ", m);
      },
      'nth-last-child': function(m) {
        return Selector.xpath.pseudos.nth("(count(./following-sibling::*) + 1) ", m);
      },
      'nth-of-type':    function(m) {
        return Selector.xpath.pseudos.nth("position() ", m);
      },
      'nth-last-of-type': function(m) {
        return Selector.xpath.pseudos.nth("(last() + 1 - position()) ", m);
      },
      'first-of-type':  function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-of-type'](m);
      },
      'last-of-type':   function(m) {
        m[6] = "1"; return Selector.xpath.pseudos['nth-last-of-type'](m);
      },
      'only-of-type':   function(m) {
        var p = Selector.xpath.pseudos; return p['first-of-type'](m) + p['last-of-type'](m);
      },
      nth: function(fragment, m) {
        var mm, formula = m[6], predicate;
        if (formula == 'even') formula = '2n+0';
        if (formula == 'odd')  formula = '2n+1';
        if (mm = formula.match(/^(\d+)$/)) // digit only
          return '[' + fragment + "= " + mm[1] + ']';
        if (mm = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
          if (mm[1] == "-") mm[1] = -1;
          var a = mm[1] ? Number(mm[1]) : 1;
          var b = mm[2] ? Number(mm[2]) : 0;
          predicate = "[((#{fragment} - #{b}) mod #{a} = 0) and " +
          "((#{fragment} - #{b}) div #{a} >= 0)]";
          return new Template(predicate).evaluate({
            fragment: fragment, a: a, b: b });
        }
      }
    }
  },

  criteria: {
    tagName:      'n = h.tagName(n, r, "#{1}", c);      c = false;',
    className:    'n = h.className(n, r, "#{1}", c);    c = false;',
    id:           'n = h.id(n, r, "#{1}", c);           c = false;',
    attrPresence: 'n = h.attrPresence(n, r, "#{1}", c); c = false;',
    attr: function(m) {
      m[3] = (m[5] || m[6]);
      return new Template('n = h.attr(n, r, "#{1}", "#{3}", "#{2}", c); c = false;').evaluate(m);
    },
    pseudo: function(m) {
      if (m[6]) m[6] = m[6].replace(/"/g, '\\"');
      return new Template('n = h.pseudo(n, "#{1}", "#{6}", r, c); c = false;').evaluate(m);
    },
    descendant:   'c = "descendant";',
    child:        'c = "child";',
    adjacent:     'c = "adjacent";',
    laterSibling: 'c = "laterSibling";'
  },

  patterns: {
    // combinators must be listed first
    // (and descendant needs to be last combinator)
    laterSibling: /^\s*~\s*/,
    child:        /^\s*>\s*/,
    adjacent:     /^\s*\+\s*/,
    descendant:   /^\s/,

    // selectors follow
    tagName:      /^\s*(\*|[\w\-]+)(\b|$)?/,
    id:           /^#([\w\-\*]+)(\b|$)/,
    className:    /^\.([\w\-\*]+)(\b|$)/,
    pseudo:
/^:((first|last|nth|nth-last|only)(-child|-of-type)|empty|checked|(en|dis)abled|not)(\((.*?)\))?(\b|$|(?=\s|[:+~>]))/,
    attrPresence: /^\[((?:[\w]+:)?[\w]+)\]/,
    attr:         /\[((?:[\w-]*:)?[\w-]+)\s*(?:([!^$*~|]?=)\s*((['"])([^\4]*?)\4|([^'"][^\]]*?)))?\]/
  },

  // for Selector.match and Element#match
  assertions: {
    tagName: function(element, matches) {
      return matches[1].toUpperCase() == element.tagName.toUpperCase();
    },

    className: function(element, matches) {
      return Element.hasClassName(element, matches[1]);
    },

    id: function(element, matches) {
      return element.id === matches[1];
    },

    attrPresence: function(element, matches) {
      return Element.hasAttribute(element, matches[1]);
    },

    attr: function(element, matches) {
      var nodeValue = Element.readAttribute(element, matches[1]);
      return nodeValue && Selector.operators[matches[2]](nodeValue, matches[5] || matches[6]);
    }
  },

  handlers: {
    // UTILITY FUNCTIONS
    // joins two collections
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        a.push(node);
      return a;
    },

    // marks an array of nodes for counting
    mark: function(nodes) {
      var _true = Prototype.emptyFunction;
      for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = _true;
      return nodes;
    },

    unmark: function(nodes) {
      for (var i = 0, node; node = nodes[i]; i++)
        node._countedByPrototype = undefined;
      return nodes;
    },

    // mark each child node with its position (for nth calls)
    // "ofType" flag indicates whether we're indexing for nth-of-type
    // rather than nth-child
    index: function(parentNode, reverse, ofType) {
      parentNode._countedByPrototype = Prototype.emptyFunction;
      if (reverse) {
        for (var nodes = parentNode.childNodes, i = nodes.length - 1, j = 1; i >= 0; i--) {
          var node = nodes[i];
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
        }
      } else {
        for (var i = 0, j = 1, nodes = parentNode.childNodes; node = nodes[i]; i++)
          if (node.nodeType == 1 && (!ofType || node._countedByPrototype)) node.nodeIndex = j++;
      }
    },

    // filters out duplicates and extends all nodes
    unique: function(nodes) {
      if (nodes.length == 0) return nodes;
      var results = [], n;
      for (var i = 0, l = nodes.length; i < l; i++)
        if (!(n = nodes[i])._countedByPrototype) {
          n._countedByPrototype = Prototype.emptyFunction;
          results.push(Element.extend(n));
        }
      return Selector.handlers.unmark(results);
    },

    // COMBINATOR FUNCTIONS
    descendant: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, node.getElementsByTagName('*'));
      return results;
    },

    child: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        for (var j = 0, child; child = node.childNodes[j]; j++)
          if (child.nodeType == 1 && child.tagName != '!') results.push(child);
      }
      return results;
    },

    adjacent: function(nodes) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        var next = this.nextElementSibling(node);
        if (next) results.push(next);
      }
      return results;
    },

    laterSibling: function(nodes) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        h.concat(results, Element.nextSiblings(node));
      return results;
    },

    nextElementSibling: function(node) {
      while (node = node.nextSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    previousElementSibling: function(node) {
      while (node = node.previousSibling)
        if (node.nodeType == 1) return node;
      return null;
    },

    // TOKEN FUNCTIONS
    tagName: function(nodes, root, tagName, combinator) {
      var uTagName = tagName.toUpperCase();
      var results = [], h = Selector.handlers;
      if (nodes) {
        if (combinator) {
          // fastlane for ordinary descendant combinators
          if (combinator == "descendant") {
            for (var i = 0, node; node = nodes[i]; i++)
              h.concat(results, node.getElementsByTagName(tagName));
            return results;
          } else nodes = this[combinator](nodes);
          if (tagName == "*") return nodes;
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName.toUpperCase() === uTagName) results.push(node);
        return results;
      } else return root.getElementsByTagName(tagName);
    },

    id: function(nodes, root, id, combinator) {
      var targetNode = $(id), h = Selector.handlers;
      if (!targetNode) return [];
      if (!nodes && root == document) return [targetNode];
      if (nodes) {
        if (combinator) {
          if (combinator == 'child') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (targetNode.parentNode == node) return [targetNode];
          } else if (combinator == 'descendant') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Element.descendantOf(targetNode, node)) return [targetNode];
          } else if (combinator == 'adjacent') {
            for (var i = 0, node; node = nodes[i]; i++)
              if (Selector.handlers.previousElementSibling(targetNode) == node)
                return [targetNode];
          } else nodes = h[combinator](nodes);
        }
        for (var i = 0, node; node = nodes[i]; i++)
          if (node == targetNode) return [targetNode];
        return [];
      }
      return (targetNode && Element.descendantOf(targetNode, root)) ? [targetNode] : [];
    },

    className: function(nodes, root, className, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      return Selector.handlers.byClassName(nodes, root, className);
    },

    byClassName: function(nodes, root, className) {
      if (!nodes) nodes = Selector.handlers.descendant([root]);
      var needle = ' ' + className + ' ';
      for (var i = 0, results = [], node, nodeClassName; node = nodes[i]; i++) {
        nodeClassName = node.className;
        if (nodeClassName.length == 0) continue;
        if (nodeClassName == className || (' ' + nodeClassName + ' ').include(needle))
          results.push(node);
      }
      return results;
    },

    attrPresence: function(nodes, root, attr, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var results = [];
      for (var i = 0, node; node = nodes[i]; i++)
        if (Element.hasAttribute(node, attr)) results.push(node);
      return results;
    },

    attr: function(nodes, root, attr, value, operator, combinator) {
      if (!nodes) nodes = root.getElementsByTagName("*");
      if (nodes && combinator) nodes = this[combinator](nodes);
      var handler = Selector.operators[operator], results = [];
      for (var i = 0, node; node = nodes[i]; i++) {
        var nodeValue = Element.readAttribute(node, attr);
        if (nodeValue === null) continue;
        if (handler(nodeValue, value)) results.push(node);
      }
      return results;
    },

    pseudo: function(nodes, name, value, root, combinator) {
      if (nodes && combinator) nodes = this[combinator](nodes);
      if (!nodes) nodes = root.getElementsByTagName("*");
      return Selector.pseudos[name](nodes, value, root);
    }
  },

  pseudos: {
    'first-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.previousElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'last-child': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        if (Selector.handlers.nextElementSibling(node)) continue;
          results.push(node);
      }
      return results;
    },
    'only-child': function(nodes, value, root) {
      var h = Selector.handlers;
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!h.previousElementSibling(node) && !h.nextElementSibling(node))
          results.push(node);
      return results;
    },
    'nth-child':        function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root);
    },
    'nth-last-child':   function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true);
    },
    'nth-of-type':      function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, false, true);
    },
    'nth-last-of-type': function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true, true);
    },
    'first-of-type':    function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, false, true);
    },
    'last-of-type':     function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, true, true);
    },
    'only-of-type':     function(nodes, formula, root) {
      var p = Selector.pseudos;
      return p['last-of-type'](p['first-of-type'](nodes, formula, root), formula, root);
    },

    // handles the an+b logic
    getIndices: function(a, b, total) {
      if (a == 0) return b > 0 ? [b] : [];
      return $R(1, total).inject([], function(memo, i) {
        if (0 == (i - b) % a && (i - b) / a >= 0) memo.push(i);
        return memo;
      });
    },

    // handles nth(-last)-child, nth(-last)-of-type, and (first|last)-of-type
    nth: function(nodes, formula, root, reverse, ofType) {
      if (nodes.length == 0) return [];
      if (formula == 'even') formula = '2n+0';
      if (formula == 'odd')  formula = '2n+1';
      var h = Selector.handlers, results = [], indexed = [], m;
      h.mark(nodes);
      for (var i = 0, node; node = nodes[i]; i++) {
        if (!node.parentNode._countedByPrototype) {
          h.index(node.parentNode, reverse, ofType);
          indexed.push(node.parentNode);
        }
      }
      if (formula.match(/^\d+$/)) { // just a number
        formula = Number(formula);
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.nodeIndex == formula) results.push(node);
      } else if (m = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) { // an+b
        if (m[1] == "-") m[1] = -1;
        var a = m[1] ? Number(m[1]) : 1;
        var b = m[2] ? Number(m[2]) : 0;
        var indices = Selector.pseudos.getIndices(a, b, nodes.length);
        for (var i = 0, node, l = indices.length; node = nodes[i]; i++) {
          for (var j = 0; j < l; j++)
            if (node.nodeIndex == indices[j]) results.push(node);
        }
      }
      h.unmark(nodes);
      h.unmark(indexed);
      return results;
    },

    'empty': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++) {
        // IE treats comments as element nodes
        if (node.tagName == '!' || node.firstChild) continue;
        results.push(node);
      }
      return results;
    },

    'not': function(nodes, selector, root) {
      var h = Selector.handlers, selectorType, m;
      var exclusions = new Selector(selector).findElements(root);
      h.mark(exclusions);
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node._countedByPrototype) results.push(node);
      h.unmark(exclusions);
      return results;
    },

    'enabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (!node.disabled && (!node.type || node.type !== 'hidden'))
          results.push(node);
      return results;
    },

    'disabled': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.disabled) results.push(node);
      return results;
    },

    'checked': function(nodes, value, root) {
      for (var i = 0, results = [], node; node = nodes[i]; i++)
        if (node.checked) results.push(node);
      return results;
    }
  },

  operators: {
    '=':  function(nv, v) { return nv == v; },
    '!=': function(nv, v) { return nv != v; },
    '^=': function(nv, v) { return nv == v || nv && nv.startsWith(v); },
    '$=': function(nv, v) { return nv == v || nv && nv.endsWith(v); },
    '*=': function(nv, v) { return nv == v || nv && nv.include(v); },
    '$=': function(nv, v) { return nv.endsWith(v); },
    '*=': function(nv, v) { return nv.include(v); },
    '~=': function(nv, v) { return (' ' + nv + ' ').include(' ' + v + ' '); },
    '|=': function(nv, v) { return ('-' + (nv || "").toUpperCase() +
     '-').include('-' + (v || "").toUpperCase() + '-'); }
  },

  split: function(expression) {
    var expressions = [];
    expression.scan(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/, function(m) {
      expressions.push(m[1].strip());
    });
    return expressions;
  },

  matchElements: function(elements, expression) {
    var matches = $$(expression), h = Selector.handlers;
    h.mark(matches);
    for (var i = 0, results = [], element; element = elements[i]; i++)
      if (element._countedByPrototype) results.push(element);
    h.unmark(matches);
    return results;
  },

  findElement: function(elements, expression, index) {
    if (Object.isNumber(expression)) {
      index = expression; expression = false;
    }
    return Selector.matchElements(elements, expression || '*')[index || 0];
  },

  findChildElements: function(element, expressions) {
    expressions = Selector.split(expressions.join(','));
    var results = [], h = Selector.handlers;
    for (var i = 0, l = expressions.length, selector; i < l; i++) {
      selector = new Selector(expressions[i].strip());
      h.concat(results, selector.findElements(element));
    }
    return (l > 1) ? h.unique(results) : results;
  }
});

if (Prototype.Browser.IE) {
  Object.extend(Selector.handlers, {
    // IE returns comment nodes on getElementsByTagName("*").
    // Filter them out.
    concat: function(a, b) {
      for (var i = 0, node; node = b[i]; i++)
        if (node.tagName !== "!") a.push(node);
      return a;
    },

    // IE improperly serializes _countedByPrototype in (inner|outer)HTML.
    unmark: function(nodes) {
      for (var i = 0, node; node = nodes[i]; i++)
        node.removeAttribute('_countedByPrototype');
      return nodes;
    }
  });
}

function $$() {
  return Selector.findChildElements(document, $A(arguments));
}
var Form = {
  reset: function(form) {
    $(form).reset();
    return form;
  },

  serializeElements: function(elements, options) {
    if (typeof options != 'object') options = { hash: !!options };
    else if (Object.isUndefined(options.hash)) options.hash = true;
    var key, value, submitted = false, submit = options.submit;

    var data = elements.inject({ }, function(result, element) {
      if (!element.disabled && element.name) {
        key = element.name; value = $(element).getValue();
        if (value != null && element.type != 'file' && (element.type != 'submit' || (!submitted &&
            submit !== false && (!submit || key == submit) && (submitted = true)))) {
          if (key in result) {
            // a key is already present; construct an array of values
            if (!Object.isArray(result[key])) result[key] = [result[key]];
            result[key].push(value);
          }
          else result[key] = value;
        }
      }
      return result;
    });

    return options.hash ? data : Object.toQueryString(data);
  }
};

Form.Methods = {
  serialize: function(form, options) {
    return Form.serializeElements(Form.getElements(form), options);
  },

  getElements: function(form) {
    return $A($(form).getElementsByTagName('*')).inject([],
      function(elements, child) {
        if (Form.Element.Serializers[child.tagName.toLowerCase()])
          elements.push(Element.extend(child));
        return elements;
      }
    );
  },

  getInputs: function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name) return $A(inputs).map(Element.extend);

    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) || (name && input.name != name))
        continue;
      matchingInputs.push(Element.extend(input));
    }

    return matchingInputs;
  },

  disable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('disable');
    return form;
  },

  enable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('enable');
    return form;
  },

  findFirstElement: function(form) {
    var elements = $(form).getElements().findAll(function(element) {
      return 'hidden' != element.type && !element.disabled;
    });
    var firstByIndex = elements.findAll(function(element) {
      return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
    }).sortBy(function(element) { return element.tabIndex }).first();

    return firstByIndex ? firstByIndex : elements.find(function(element) {
      return ['input', 'select', 'textarea'].include(element.tagName.toLowerCase());
    });
  },

  focusFirstElement: function(form) {
    form = $(form);
    form.findFirstElement().activate();
    return form;
  },

  request: function(form, options) {
    form = $(form), options = Object.clone(options || { });

    var params = options.parameters, action = form.readAttribute('action') || '';
    if (action.blank()) action = window.location.href;
    options.parameters = form.serialize(true);

    if (params) {
      if (Object.isString(params)) params = params.toQueryParams();
      Object.extend(options.parameters, params);
    }

    if (form.hasAttribute('method') && !options.method)
      options.method = form.method;

    return new Ajax.Request(action, options);
  }
};

/*--------------------------------------------------------------------------*/

Form.Element = {
  focus: function(element) {
    $(element).focus();
    return element;
  },

  select: function(element) {
    $(element).select();
    return element;
  }
};

Form.Element.Methods = {
  serialize: function(element) {
    element = $(element);
    if (!element.disabled && element.name) {
      var value = element.getValue();
      if (value != undefined) {
        var pair = { };
        pair[element.name] = value;
        return Object.toQueryString(pair);
      }
    }
    return '';
  },

  getValue: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
  },

  setValue: function(element, value) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    Form.Element.Serializers[method](element, value);
    return element;
  },

  clear: function(element) {
    $(element).value = '';
    return element;
  },

  present: function(element) {
    return $(element).value != '';
  },

  activate: function(element) {
    element = $(element);
    try {
      element.focus();
      if (element.select && (element.tagName.toLowerCase() != 'input' ||
          !['button', 'reset', 'submit'].include(element.type)))
        element.select();
    } catch (e) { }
    return element;
  },

  disable: function(element) {
    element = $(element);
    element.disabled = true;
    return element;
  },

  enable: function(element) {
    element = $(element);
    element.disabled = false;
    return element;
  }
};

/*--------------------------------------------------------------------------*/

var Field = Form.Element;
var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = {
  input: function(element, value) {
    switch (element.type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        return Form.Element.Serializers.inputSelector(element, value);
      default:
        return Form.Element.Serializers.textarea(element, value);
    }
  },

  inputSelector: function(element, value) {
    if (Object.isUndefined(value)) return element.checked ? element.value : null;
    else element.checked = !!value;
  },

  textarea: function(element, value) {
    if (Object.isUndefined(value)) return element.value;
    else element.value = value;
  },

  select: function(element, value) {
    if (Object.isUndefined(value))
      return this[element.type == 'select-one' ?
        'selectOne' : 'selectMany'](element);
    else {
      var opt, currentValue, single = !Object.isArray(value);
      for (var i = 0, length = element.length; i < length; i++) {
        opt = element.options[i];
        currentValue = this.optionValue(opt);
        if (single) {
          if (currentValue == value) {
            opt.selected = true;
            return;
          }
        }
        else opt.selected = value.include(currentValue);
      }
    }
  },

  selectOne: function(element) {
    var index = element.selectedIndex;
    return index >= 0 ? this.optionValue(element.options[index]) : null;
  },

  selectMany: function(element) {
    var values, length = element.length;
    if (!length) return null;

    for (var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if (opt.selected) values.push(this.optionValue(opt));
    }
    return values;
  },

  optionValue: function(opt) {
    // extend element because hasAttribute may not be native
    return Element.extend(opt).hasAttribute('value') ? opt.value : opt.text;
  }
};

/*--------------------------------------------------------------------------*/

Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  initialize: function($super, element, frequency, callback) {
    $super(callback, frequency);
    this.element   = $(element);
    this.lastValue = this.getValue();
  },

  execute: function() {
    var value = this.getValue();
    if (Object.isString(this.lastValue) && Object.isString(value) ?
        this.lastValue != value : String(this.lastValue) != String(value)) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  }
});

Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = Class.create({
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
    Form.getElements(this.element).each(this.registerCallback, this);
  },

  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        default:
          Event.observe(element, 'change', this.onElementEvent.bind(this));
          break;
      }
    }
  }
});

Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
if (!window.Event) var Event = { };

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
  KEY_HOME:     36,
  KEY_END:      35,
  KEY_PAGEUP:   33,
  KEY_PAGEDOWN: 34,
  KEY_INSERT:   45,

  cache: { },

  relatedTarget: function(event) {
    var element;
    switch(event.type) {
      case 'mouseover': element = event.fromElement; break;
      case 'mouseout':  element = event.toElement;   break;
      default: return null;
    }
    return Element.extend(element);
  }
});

Event.Methods = (function() {
  var isButton;

  if (Prototype.Browser.IE) {
    var buttonMap = { 0: 1, 1: 4, 2: 2 };
    isButton = function(event, code) {
      return event.button == buttonMap[code];
    };

  } else if (Prototype.Browser.WebKit) {
    isButton = function(event, code) {
      switch (code) {
        case 0: return event.which == 1 && !event.metaKey;
        case 1: return event.which == 1 && event.metaKey;
        default: return false;
      }
    };

  } else {
    isButton = function(event, code) {
      return event.which ? (event.which === code + 1) : (event.button === code);
    };
  }

  return {
    isLeftClick:   function(event) { return isButton(event, 0) },
    isMiddleClick: function(event) { return isButton(event, 1) },
    isRightClick:  function(event) { return isButton(event, 2) },

    element: function(event) {
      event = Event.extend(event);

      var node          = event.target,
          type          = event.type,
          currentTarget = event.currentTarget;

      if (currentTarget && currentTarget.tagName) {
        // Firefox screws up the "click" event when moving between radio buttons
        // via arrow keys. It also screws up the "load" and "error" events on images,
        // reporting the document as the target instead of the original image.
        if (type === 'load' || type === 'error' ||
          (type === 'click' && currentTarget.tagName.toLowerCase() === 'input'
            && currentTarget.type === 'radio'))
              node = currentTarget;
      }
      if (node.nodeType == Node.TEXT_NODE) node = node.parentNode;
      return Element.extend(node);
    },

    findElement: function(event, expression) {
      var element = Event.element(event);
      if (!expression) return element;
      var elements = [element].concat(element.ancestors());
      return Selector.findElement(elements, expression, 0);
    },

    pointer: function(event) {
      var docElement = document.documentElement,
      body = document.body || { scrollLeft: 0, scrollTop: 0 };
      return {
        x: event.pageX || (event.clientX +
          (docElement.scrollLeft || body.scrollLeft) -
          (docElement.clientLeft || 0)),
        y: event.pageY || (event.clientY +
          (docElement.scrollTop || body.scrollTop) -
          (docElement.clientTop || 0))
      };
    },

    pointerX: function(event) { return Event.pointer(event).x },
    pointerY: function(event) { return Event.pointer(event).y },

    stop: function(event) {
      Event.extend(event);
      event.preventDefault();
      event.stopPropagation();
      event.stopped = true;
    }
  };
})();

Event.extend = (function() {
  var methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m;
  });

  if (Prototype.Browser.IE) {
    Object.extend(methods, {
      stopPropagation: function() { this.cancelBubble = true },
      preventDefault:  function() { this.returnValue = false },
      inspect: function() { return "[object Event]" }
    });

    return function(event) {
      if (!event) return false;
      if (event._extendedByPrototype) return event;

      event._extendedByPrototype = Prototype.emptyFunction;
      var pointer = Event.pointer(event);
      Object.extend(event, {
        target: event.srcElement,
        relatedTarget: Event.relatedTarget(event),
        pageX:  pointer.x,
        pageY:  pointer.y
      });
      return Object.extend(event, methods);
    };

  } else {
    Event.prototype = Event.prototype || document.createEvent("HTMLEvents")['__proto__'];
    Object.extend(Event.prototype, methods);
    return Prototype.K;
  }
})();

Object.extend(Event, (function() {
  var cache = Event.cache;

  function getEventID(element) {
    if (element._prototypeEventID) return element._prototypeEventID[0];
    arguments.callee.id = arguments.callee.id || 1;
    return element._prototypeEventID = [++arguments.callee.id];
  }

  function getDOMEventName(eventName) {
    if (eventName && eventName.include(':')) return "dataavailable";
    return eventName;
  }

  function getCacheForID(id) {
    return cache[id] = cache[id] || { };
  }

  function getWrappersForEventName(id, eventName) {
    var c = getCacheForID(id);
    return c[eventName] = c[eventName] || [];
  }

  function createWrapper(element, eventName, handler) {
    var id = getEventID(element);
    var c = getWrappersForEventName(id, eventName);
    if (c.pluck("handler").include(handler)) return false;

    var wrapper = function(event) {
      if (!Event || !Event.extend ||
        (event.eventName && event.eventName != eventName))
          return false;

      Event.extend(event);
      handler.call(element, event);
    };

    wrapper.handler = handler;
    c.push(wrapper);
    return wrapper;
  }

  function findWrapper(id, eventName, handler) {
    var c = getWrappersForEventName(id, eventName);
    return c.find(function(wrapper) { return wrapper.handler == handler });
  }

  function destroyWrapper(id, eventName, handler) {
    var c = getCacheForID(id);
    if (!c[eventName]) return false;
    c[eventName] = c[eventName].without(findWrapper(id, eventName, handler));
  }

  function destroyCache() {
    for (var id in cache)
      for (var eventName in cache[id])
        cache[id][eventName] = null;
  }


  // Internet Explorer needs to remove event handlers on page unload
  // in order to avoid memory leaks.
  if (window.attachEvent) {
    window.attachEvent("onunload", destroyCache);
  }

  // Safari has a dummy event handler on page unload so that it won't
  // use its bfcache. Safari <= 3.1 has an issue with restoring the "document"
  // object when page is returned to via the back button using its bfcache.
  if (Prototype.Browser.WebKit) {
    window.addEventListener('unload', Prototype.emptyFunction, false);
  }

  return {
    observe: function(element, eventName, handler) {
      element = $(element);
      var name = getDOMEventName(eventName);

      var wrapper = createWrapper(element, eventName, handler);
      if (!wrapper) return element;

      if (element.addEventListener) {
        element.addEventListener(name, wrapper, false);
      } else {
        element.attachEvent("on" + name, wrapper);
      }

      return element;
    },

    stopObserving: function(element, eventName, handler) {
      element = $(element);
      var id = getEventID(element), name = getDOMEventName(eventName);

      if (!handler && eventName) {
        getWrappersForEventName(id, eventName).each(function(wrapper) {
          element.stopObserving(eventName, wrapper.handler);
        });
        return element;

      } else if (!eventName) {
        Object.keys(getCacheForID(id)).each(function(eventName) {
          element.stopObserving(eventName);
        });
        return element;
      }

      var wrapper = findWrapper(id, eventName, handler);
      if (!wrapper) return element;

      if (element.removeEventListener) {
        element.removeEventListener(name, wrapper, false);
      } else {
        element.detachEvent("on" + name, wrapper);
      }

      destroyWrapper(id, eventName, handler);

      return element;
    },

    fire: function(element, eventName, memo) {
      element = $(element);
      if (element == document && document.createEvent && !element.dispatchEvent)
        element = document.documentElement;

      var event;
      if (document.createEvent) {
        event = document.createEvent("HTMLEvents");
        event.initEvent("dataavailable", true, true);
      } else {
        event = document.createEventObject();
        event.eventType = "ondataavailable";
      }

      event.eventName = eventName;
      event.memo = memo || { };

      if (document.createEvent) {
        element.dispatchEvent(event);
      } else {
        element.fireEvent(event.eventType, event);
      }

      return Event.extend(event);
    }
  };
})());

Object.extend(Event, Event.Methods);

Element.addMethods({
  fire:          Event.fire,
  observe:       Event.observe,
  stopObserving: Event.stopObserving
});

Object.extend(document, {
  fire:          Element.Methods.fire.methodize(),
  observe:       Element.Methods.observe.methodize(),
  stopObserving: Element.Methods.stopObserving.methodize(),
  loaded:        false
});

(function() {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb,
     Matthias Miller, Dean Edwards and John Resig. */

  var timer;

  function fireContentLoadedEvent() {
    if (document.loaded) return;
    if (timer) window.clearInterval(timer);
    document.fire("dom:loaded");
    document.loaded = true;
  }

  if (document.addEventListener) {
    if (Prototype.Browser.WebKit) {
      timer = window.setInterval(function() {
        if (/loaded|complete/.test(document.readyState))
          fireContentLoadedEvent();
      }, 0);

      Event.observe(window, "load", fireContentLoadedEvent);

    } else {
      document.addEventListener("DOMContentLoaded",
        fireContentLoadedEvent, false);
    }

  } else {
    document.write("<script id=__onDOMContentLoaded defer src=//:><\/script>");
    $("__onDOMContentLoaded").onreadystatechange = function() {
      if (this.readyState == "complete") {
        this.onreadystatechange = null;
        fireContentLoadedEvent();
      }
    };
  }
})();
/*------------------------------- DEPRECATED -------------------------------*/

Hash.toQueryString = Object.toQueryString;

var Toggle = { display: Element.toggle };

Element.Methods.childOf = Element.Methods.descendantOf;

var Insertion = {
  Before: function(element, content) {
    return Element.insert(element, {before:content});
  },

  Top: function(element, content) {
    return Element.insert(element, {top:content});
  },

  Bottom: function(element, content) {
    return Element.insert(element, {bottom:content});
  },

  After: function(element, content) {
    return Element.insert(element, {after:content});
  }
};

var $continue = new Error('"throw $continue" is deprecated, use "return" instead');

// This should be moved to script.aculo.us; notice the deprecated methods
// further below, that map to the newer Element methods.
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

  // caches x/y coordinate pair to use with overlap
  within: function(element, x, y) {
    if (this.includeScrollOffsets)
      return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = Element.cumulativeOffset(element);

    return (y >= this.offset[1] &&
            y <  this.offset[1] + element.offsetHeight &&
            x >= this.offset[0] &&
            x <  this.offset[0] + element.offsetWidth);
  },

  withinIncludingScrolloffsets: function(element, x, y) {
    var offsetcache = Element.cumulativeScrollOffset(element);

    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = Element.cumulativeOffset(element);

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

  // Deprecation layer -- use newer Element methods now (1.5.2).

  cumulativeOffset: Element.Methods.cumulativeOffset,

  positionedOffset: Element.Methods.positionedOffset,

  absolutize: function(element) {
    Position.prepare();
    return Element.absolutize(element);
  },

  relativize: function(element) {
    Position.prepare();
    return Element.relativize(element);
  },

  realOffset: Element.Methods.cumulativeScrollOffset,

  offsetParent: Element.Methods.getOffsetParent,

  page: Element.Methods.viewportOffset,

  clone: function(source, target, options) {
    options = options || { };
    return Element.clonePosition(target, source, options);
  }
};

/*--------------------------------------------------------------------------*/

if (!document.getElementsByClassName) document.getElementsByClassName = function(instanceMethods){
  function iter(name) {
    return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]";
  }

  instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ?
  function(element, className) {
    className = className.toString().strip();
    var cond = /\s/.test(className) ? $w(className).map(iter).join('') : iter(className);
    return cond ? document._getElementsByXPath('.//*' + cond, element) : [];
  } : function(element, className) {
    className = className.toString().strip();
    var elements = [], classNames = (/\s/.test(className) ? $w(className) : null);
    if (!classNames && !className) return elements;

    var nodes = $(element).getElementsByTagName('*');
    className = ' ' + className + ' ';

    for (var i = 0, child, cn; child = nodes[i]; i++) {
      if (child.className && (cn = ' ' + child.className + ' ') && (cn.include(className) ||
          (classNames && classNames.all(function(name) {
            return !name.toString().blank() && cn.include(' ' + name + ' ');
          }))))
        elements.push(Element.extend(child));
    }
    return elements;
  };

  return function(className, parentElement) {
    return $(parentElement || document.body).getElementsByClassName(className);
  };
}(Element.Methods);

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
    this.set($A(this).concat(classNameToAdd).join(' '));
  },

  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set($A(this).without(classNameToRemove).join(' '));
  },

  toString: function() {
    return $A(this).join(' ');
  }
};

Object.extend(Element.ClassNames.prototype, Enumerable);

/*--------------------------------------------------------------------------*/

Element.addMethods();/*

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

doufu.System.Handle = function(iHandleID)
{
	//doufu.System.Logger.Debug("doufu.System.Handle: Creating Handle id " + iHandleID);
	if (typeof iHandleID == doufu.System.Constants.TYPE_UNDEFINED  || iHandleID == null)
	{
		throw doufu.System.Exception("Inputted parameter incorrect.");
	}
	this.ID = iHandleID;
}

doufu.System.Handle.Generate = function()
{
	var TempID
	if (true)//(doufu.System.Handle._syncLock == 0)
	{
		// lock
		doufu.System.Handle._syncLock = 1;
		
		doufu.System.Logger.Debug("doufu.System.Handle.Generate: Creating Handle, current LastHandlerID is " + (doufu.System.Handle.LastHandlerID == 0?doufu.System.Handle.START_ID:doufu.System.Handle.LastHandlerID));
		TempID = (doufu.System.Handle.LastHandlerID == 0?doufu.System.Handle.Constants.START_ID:doufu.System.Handle.LastHandlerID) + 1;
		doufu.System.Handle.LastHandlerID = TempID;
		
		// unlock
		doufu.System.Handle._syncLock == 0;
	}
	else
	{
		//alert("Block:" + doufu.System.Handle.LastHandlerID + " " + doufu.System.Handle._syncLock);
		doufu.Cycling.Block(1);
		return doufu.System.Handle.Generate();
	}
	return new doufu.System.Handle(TempID);
}

doufu.System.Handle.IsMe = function(oHandleOwner, oHandle)
{
	if (typeof oHandleOwner.InstanceOf == doufu.System.Constants.TYPE_UNDEFINED ||
		!oHandleOwner.InstanceOf(doufu.System.Handle.Handlable))
	{
		throw doufu.System.Exception("oHandleOwner type incorrect!");
	}
	
	if (oHandle == doufu.System.Handle.Constants.BROADCAST)
	{
		return true;
	}
	if (oHandle == oHandleOwner.Handle)
	{
		return true;
	}
	return false;
}

doufu.System.Handle.LastHandlerID = 0;

doufu.System.Handle._syncLock = 0;;
doufu.System.Handle.Constants = new Object();

doufu.System.Handle.Constants.START_ID = 0x8000;

doufu.System.Handle.Constants.BROADCAST = 0x0001;;
doufu.System.Handle.Handlable = function()
{
	doufu.OOP.Class(this);
	
	/////////////////////////
	// Attributes
	/////////////////////////
	this.Handle = 0;
};
doufu.System.Message = function(oHandle, sMsg, wParam, lParam)
{
	if (oHandle == null)
		this.Handle = new doufu.System.Handle(0);
	else
		this.Handle = oHandle;
	
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


doufu.System.MessageQueue.Push = function(oHandleOrMessage, sMsg, wParam, lParam)
{
	var tmpMsg;
	if (!(oHandleOrMessage instanceof doufu.System.Message))
	{
		tmpMsg = doufu.System.Message(oHandleOrMessage, sMsg, wParam, lParam);
	}
	else
	{
		tmpMsg = oHandleOrMessage;
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
			return _native.className = sValue;
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
	this.Handle = doufu.System.Handle.Generate();
	
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
			var y = oDirection.Y() * (oRect.Y + oRect.Height - this.Y);
			if (y <= 0)
			{
				bRet = false;
			}
		}
		else if(oDirection.Y() < 0)
		{
			var y = oDirection.Y() * (oRect.Y - this.Y - this.Height);
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
	
	this.Inherit(doufu.System.Handle.Handlable);
	
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
			doufu.System.Handle.IsMe(this, oMsg.Handle)
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
			doufu.System.Logger.Verbose("doufu.Display.BaseObject: Message=" + oMsg.Message + "; Handle=" + oMsg.Handle);
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
	
	this.Handle = doufu.System.Handle.Generate();
	
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
	this.Inherit(doufu.System.Handle.Handlable);
	
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
		this.Handle = doufu.System.Handle.Generate();
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
			activatedForSprites[who.Handle.ID] = true;
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
			activatedForSprites[who.Handle.ID] = false;
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
		return activatedForSprites[who.Handle.ID];
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
doufu.Http = {}

/*
	Function: doufu.Http.CreateTimeStamp
	
	Create a time stamp
*/
doufu.Http.CreateTimeStamp = function()
{
	var tDate = new Date();
	return (new String(tDate.getSeconds()+tDate.getMinutes()*60 + tDate.getHours()*3600) + "-" + tDate.getDate().toString() + (tDate.getMonth() + 1).toString() + tDate.getYear().toString());
}

/*
	Function: doufu.Http.AddParameterToUrl
	
	Add a get method style parameter to the end of url.
	
	Parameters:
		sUrl - Specify the url.
		sParameterName - Specify the parameter name.
		sValue - Spcify the value of the parameter, must be a string.
*/
doufu.Http.AddParameterToUrl = function(sUrl, sParameterName, sValue)
{
	if (sUrl.lastIndexOf("?") + 1 == sUrl.length)
	{
    	sUrl = sUrl + sValue;
    }
    else if (sUrl.lastIndexOf("?") != -1)
    {
    	sUrl = sUrl + "&" + sParameterName + "=" + sValue;
    }
     else
    {
		sUrl = sUrl + "?" + sParameterName + "=" + sValue;
    }
   	return sUrl;
}

/*
	Function: doufu.Http.AddStampToUrl
	
	Paste a time stamp at the end of url string.
*/
doufu.Http.AddStampToUrl = function(sUrl)
{
    return doufu.Http.AddParameterToUrl(sUrl, "DoufuUrlTimeStamp", doufu.Http.CreateTimeStamp());
}

;
/*
	Class: doufu.Http.Ajax
	
	Cross browser ajax implementation
*/
doufu.Http.Request = function()
{
	doufu.OOP.Class(this);
	
	var nativeRequest;
	var _disableCache = true;
	var _timeout;
	
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
		return _timeout;
	}
	this.Timeout.Set = function(value)
	{
		_timeout = value;
		
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
			sActualUrl = doufu.Http.AddStampToUrl(sUrl);
		}
		
		nativeRequest.open(sMethod, sActualUrl, bAsync, sUser, sPassword);
		nativeRequest.timeout = _timeout;
		
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
	
	Sample
		json = new doufu.Http.JSON();
		json.Open('http://jsondatatest.appjet.net/?keyword=mandelbrot_set','callback');
		json.OnSuccess.Attach(new doufu.Event.CallBack(function(s,o){alert(o.ResponseJSON.content)},this));
		json.Send();
*/
doufu.Http.JSON = function()
{
	doufu.OOP.Class(this);
	
	this.Inherit(doufu.System.Handle.Handlable);
	
	this.Handle = doufu.System.Handle.Generate();
	
	var CONTAINER_ID = 'doufu_Http_JSON_Container';
	var _url;
	var _callbackParameterName;
	var sGCallbackFunc;
	
	// Unopen 0
	// Opened 1
	// Sent 2
	// Loading 3
	// Done 4
	this.ReadyState = 0;
	
	/*
		Property: Url
		
		<doufu.Property>
		Get the json data url
	*/
	this.NewProperty("Url");
	this.Url.Get = function()
	{
		return _url;
	}
	
	/*
		Property: CallbackParameterName
		
		<doufu.Property>
		Get the CallbackParameterName
	*/
	this.NewProperty("CallbackParameterName");
	this.CallbackParameterName.Get = function()
	{
		return _callbackParameterName;
	}
	
	/*
		Property: ScriptElement
		
		<doufu.Property>
		Get the script element which used for getting the remote json data.
	*/
	var script;
	this.NewProperty("ScriptElement");
	this.ScriptElement.Get = function()
	{
		return script;
	}
	
	/*
		Property: ResponseJSON
		
		<doufu.Property>
		Get the responded json object
	*/
	var responseJSON;
	this.NewProperty("ResponseJSON");
	this.ResponseJSON.Get = function()
	{
		return responseJSON;
	}
	this.ResponseJSON.Set = function(value)
	{
		responseJSON = value;
	}
	
	/*
		Property: ResponseText
		
		<doufu.Property>
		Get the responded stringified json text.
	*/
	this.NewProperty("ResponseText");
	this.ResponseText.Get = function()
	{
		return this.ScriptElement().innerHTML;
	}
	
	/*
		Event: OnSuccess
	*/
	this.OnSuccess = new doufu.Event.EventHandler(this);
	
	/*
		Function: Open
		
		Open a connection
	*/
	this.Open = function(sUrl, sCallbackParameterName)
	{
		_url = sUrl;
		_callbackParameterName = sCallbackParameterName;
		
		// register this instance to callback manager.
		sGCallbackFunc = doufu.Http.JSON.CallbackManager.Register(this);
		
		this.ReadyState = 1;
	}
	
	this.Send = function()
	{
		if (this.ReadyState != 1)
		{
			throw doufu.System.Exception('doufu.Http.JSON::Send() - Conneciton was not opened.');
		}
		
		if (_callbackParameterName != null)
		{
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
			
			script = doufu.Browser.DOM.CreateElement('script');
			script.Native().type = "text/javascript";
			script.Native().src = doufu.Http.AddStampToUrl(doufu.Http.AddParameterToUrl(this.Url(), _callbackParameterName, sGCallbackFunc));
			
			container.AppendChild(script);
		}
		else
		{
			// TODO: use xmlhttprequest to get json data
			var rq = new doufu.Http.Request();
			rq.OnSuccess.Attach(new doufu.Event.CallBack(function(sender, args)
			{
				alert(this == a);
				this.OnSuccess.Invoke({
					"ResponseJSON": doufu.Http.JSON.Parse(args.ResponseText)
				});
			},this));
			rq.Open('GET', this.Url(), true);
			rq.Send();
		}
	}
	
	this.Close = function()
	{
		if (_callbackParameterName != null)
		{
			doufu.Http.JSON.CallbackManager.Unregister(this);
		}
	}
	
	this.Ctor = function()
	{
		
	}
	
	this.Ctor();
};

/*
	Function: doufu.Http.JSON.GetJSONObject
	
	Get javascript object from a json string
	
	Return:
		javascript object which build from json string
*/
doufu.Http.JSON.Parse = function(sJSONStr)
{
	eval("var tmpobj = " + sJSONStr);
	return tmpobj;
}

/*
	Class: doufu.Http.JSON.CallbackManager
	
	callback manage singleton
*/
doufu.Http.JSON.CallbackManager = new function()
{
	doufu.OOP.Class(this);
	
	this.Callbacks = {};

	this.Register = function(oJSONRequst)
	{
		if (!oJSONRequst.InstanceOf(doufu.Http.JSON))
		{
			throw doufu.System.Exception("doufu.Http.JSON.CallbackManager::Register() - The object specified was not a json request object.");
		}
		
		this.Callbacks[oJSONRequst.Handle.ID] = function(oJData)
		{
			oJSONRequst.OnSuccess.Invoke({
				"ResponseJSON": oJData,
				"ResponseText": oJSONRequst.ResponseText()
			});
			oJSONRequst.ResponseJSON(oJData); 
		}
		
		return "doufu.Http.JSON.CallbackManager.Callbacks[" + oJSONRequst.Handle.ID + "]";
	}
	
	this.Unregister = function(oJSONRequst)
	{
		if (!oJSONRequst.InstanceOf(doufu.Http.JSON))
		{
			throw doufu.System.Exception("doufu.Http.JSON.CallbackManager::Register() - The object specified was not a json request object.");
		}
		
		this.Callbacks[oJSONRequst.Handle.ID] = null;
	}
};
; 
doufu.__version = "0.0.0.2"; 
