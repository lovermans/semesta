/** Builds receivers for JSONP and Script requests.
 *
 * Each receiver is an object with following fields:
 * - number - unique (for the factory instance), numerical id of the receiver
 * - id - a string ID that can be used in DOM attributes
 * - name - name of the function triggering the receiver
 * - callback - callback function
 *
 * Receivers are triggered only once, on the first callback call.
 *
 * Receivers can be called by their name or by accessing factory object
 * by the number key.
 *
 * @param {String} prefix the prefix used in ids
 * @param {String} name the name of the object
 */
class ScriptReceiverFactory {
    lastId;
    prefix;
    name;
    constructor(prefix, name) {
        this.lastId = 0;
        this.prefix = prefix;
        this.name = name;
    }
    create(callback) {
        this.lastId++;
        var number = this.lastId;
        var id = this.prefix + number;
        var name = this.name + '[' + number + ']';
        var called = false;
        var callbackWrapper = function () {
            if (!called) {
                callback.apply(null, arguments);
                called = true;
            }
        };
        this[number] = callbackWrapper;
        return { number: number, id: id, name: name, callback: callbackWrapper };
    }
    remove(receiver) {
        delete this[receiver.number];
    }
}
var ScriptReceivers = new ScriptReceiverFactory('_pusher_script_', 'Pusher.ScriptReceivers');

var Defaults = {
    VERSION: '8.3.0',
    PROTOCOL: 7,
    wsPort: 80,
    wssPort: 443,
    wsPath: '',
    // DEPRECATED: SockJS fallback parameters
    httpHost: 'sockjs.pusher.com',
    httpPort: 80,
    httpsPort: 443,
    httpPath: '/pusher',
    // DEPRECATED: Stats
    stats_host: 'stats.pusher.com',
    // DEPRECATED: Other settings
    authEndpoint: '/pusher/auth',
    authTransport: 'ajax',
    activityTimeout: 120000,
    pongTimeout: 30000,
    unavailableTimeout: 10000,
    userAuthentication: {
        endpoint: '/pusher/user-auth',
        transport: 'ajax'
    },
    channelAuthorization: {
        endpoint: '/pusher/auth',
        transport: 'ajax'
    },
    // CDN configuration
    cdn_http: 'http://js.pusher.com',
    cdn_https: 'https://js.pusher.com',
    dependency_suffix: 'min'
};

/** Handles loading dependency files.
 *
 * Dependency loaders don't remember whether a resource has been loaded or
 * not. It is caller's responsibility to make sure the resource is not loaded
 * twice. This is because it's impossible to detect resource loading status
 * without knowing its content.
 *
 * Options:
 * - cdn_http - url to HTTP CND
 * - cdn_https - url to HTTPS CDN
 * - version - version of pusher-js
 * - suffix - suffix appended to all names of dependency files
 *
 * @param {Object} options
 */
class DependencyLoader {
    options;
    receivers;
    loading;
    constructor(options) {
        this.options = options;
        this.receivers = options.receivers || ScriptReceivers;
        this.loading = {};
    }
    /** Loads the dependency from CDN.
     *
     * @param  {String} name
     * @param  {Function} callback
     */
    load(name, options, callback) {
        var self = this;
        if (self.loading[name] && self.loading[name].length > 0) {
            self.loading[name].push(callback);
        }
        else {
            self.loading[name] = [callback];
            var request = Runtime$1.createScriptRequest(self.getPath(name, options));
            var receiver = self.receivers.create(function (error) {
                self.receivers.remove(receiver);
                if (self.loading[name]) {
                    var callbacks = self.loading[name];
                    delete self.loading[name];
                    var successCallback = function (wasSuccessful) {
                        if (!wasSuccessful) {
                            request.cleanup();
                        }
                    };
                    for (var i = 0; i < callbacks.length; i++) {
                        callbacks[i](error, successCallback);
                    }
                }
            });
            request.send(receiver);
        }
    }
    /** Returns a root URL for pusher-js CDN.
     *
     * @returns {String}
     */
    getRoot(options) {
        var cdn;
        var protocol = Runtime$1.getDocument().location.protocol;
        if ((options && options.useTLS) || protocol === 'https:') {
            cdn = this.options.cdn_https;
        }
        else {
            cdn = this.options.cdn_http;
        }
        // make sure there are no double slashes
        return cdn.replace(/\/*$/, '') + '/' + this.options.version;
    }
    /** Returns a full path to a dependency file.
     *
     * @param {String} name
     * @returns {String}
     */
    getPath(name, options) {
        return this.getRoot(options) + '/' + name + this.options.suffix + '.js';
    }
}

var DependenciesReceivers = new ScriptReceiverFactory('_pusher_dependencies', 'Pusher.DependenciesReceivers');
var Dependencies = new DependencyLoader({
    cdn_http: Defaults.cdn_http,
    cdn_https: Defaults.cdn_https,
    version: Defaults.VERSION,
    suffix: Defaults.dependency_suffix,
    receivers: DependenciesReceivers
});

/**
 * A place to store help URLs for error messages etc
 */
const urlStore = {
    baseUrl: 'https://pusher.com',
    urls: {
        authenticationEndpoint: {
            path: '/docs/channels/server_api/authenticating_users'
        },
        authorizationEndpoint: {
            path: '/docs/channels/server_api/authorizing-users/'
        },
        javascriptQuickStart: {
            path: '/docs/javascript_quick_start'
        },
        triggeringClientEvents: {
            path: '/docs/client_api_guide/client_events#trigger-events'
        },
        encryptedChannelSupport: {
            fullUrl: 'https://github.com/pusher/pusher-js/tree/cc491015371a4bde5743d1c87a0fbac0feb53195#encrypted-channel-support'
        }
    }
};
/** Builds a consistent string with links to pusher documentation
 *
 * @param {string} key - relevant key in the url_store.urls object
 * @return {string} suffix string to append to log message
 */
const buildLogSuffix = function (key) {
    const urlPrefix = 'See:';
    const urlObj = urlStore.urls[key];
    if (!urlObj)
        return '';
    let url;
    if (urlObj.fullUrl) {
        url = urlObj.fullUrl;
    }
    else if (urlObj.path) {
        url = urlStore.baseUrl + urlObj.path;
    }
    if (!url)
        return '';
    return `${urlPrefix} ${url}`;
};
var urlStore$1 = { buildLogSuffix };

var AuthRequestType;
(function (AuthRequestType) {
    AuthRequestType["UserAuthentication"] = "user-authentication";
    AuthRequestType["ChannelAuthorization"] = "channel-authorization";
})(AuthRequestType || (AuthRequestType = {}));

/** Error classes used throughout the library. */
// https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
class BadEventName extends Error {
    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
class BadChannelName extends Error {
    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
class RequestTimedOut extends Error {
    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
class TransportPriorityTooLow extends Error {
    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
class TransportClosed extends Error {
    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
class UnsupportedFeature extends Error {
    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
class UnsupportedTransport extends Error {
    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
let UnsupportedStrategy$1 = class UnsupportedStrategy extends Error {
    constructor(msg) {
        super(msg);
        Object.setPrototypeOf(this, new.target.prototype);
    }
};
class HTTPAuthError extends Error {
    status;
    constructor(status, msg) {
        super(msg);
        this.status = status;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

const ajax = function (context, query, authOptions, authRequestType, callback) {
    const xhr = Runtime$1.createXHR();
    xhr.open('POST', authOptions.endpoint, true);
    // add request headers
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    for (var headerName in authOptions.headers) {
        xhr.setRequestHeader(headerName, authOptions.headers[headerName]);
    }
    if (authOptions.headersProvider != null) {
        let dynamicHeaders = authOptions.headersProvider();
        for (var headerName in dynamicHeaders) {
            xhr.setRequestHeader(headerName, dynamicHeaders[headerName]);
        }
    }
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let data;
                let parsed = false;
                try {
                    data = JSON.parse(xhr.responseText);
                    parsed = true;
                }
                catch (e) {
                    callback(new HTTPAuthError(200, `JSON returned from ${authRequestType.toString()} endpoint was invalid, yet status code was 200. Data was: ${xhr.responseText}`), null);
                }
                if (parsed) {
                    // prevents double execution.
                    callback(null, data);
                }
            }
            else {
                let suffix = '';
                switch (authRequestType) {
                    case AuthRequestType.UserAuthentication:
                        suffix = urlStore$1.buildLogSuffix('authenticationEndpoint');
                        break;
                    case AuthRequestType.ChannelAuthorization:
                        suffix = `Clients must be authorized to join private or presence channels. ${urlStore$1.buildLogSuffix('authorizationEndpoint')}`;
                        break;
                }
                callback(new HTTPAuthError(xhr.status, `Unable to retrieve auth string from ${authRequestType.toString()} endpoint - ` +
                    `received status: ${xhr.status} from ${authOptions.endpoint}. ${suffix}`), null);
            }
        }
    };
    xhr.send(query);
    return xhr;
};

function encode(s) {
    return btoa(utob(s));
}
var fromCharCode = String.fromCharCode;
var b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var cb_utob = function (c) {
    var cc = c.charCodeAt(0);
    return cc < 0x80
        ? c
        : cc < 0x800
            ? fromCharCode(0xc0 | (cc >>> 6)) + fromCharCode(0x80 | (cc & 0x3f))
            : fromCharCode(0xe0 | ((cc >>> 12) & 0x0f)) +
            fromCharCode(0x80 | ((cc >>> 6) & 0x3f)) +
            fromCharCode(0x80 | (cc & 0x3f));
};
var utob = function (u) {
    return u.replace(/[^\x00-\x7F]/g, cb_utob);
};
var cb_encode = function (ccc) {
    var padlen = [0, 2, 1][ccc.length % 3];
    var ord = (ccc.charCodeAt(0) << 16) |
        ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8) |
        (ccc.length > 2 ? ccc.charCodeAt(2) : 0);
    var chars = [
        b64chars.charAt(ord >>> 18),
        b64chars.charAt((ord >>> 12) & 63),
        padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
        padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
    ];
    return chars.join('');
};
var btoa = window.btoa ||
    function (b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };

class Timer {
    clear;
    timer;
    constructor(set, clear, delay, callback) {
        this.clear = clear;
        this.timer = set(() => {
            if (this.timer) {
                this.timer = callback(this.timer);
            }
        }, delay);
    }
    /** Returns whether the timer is still running.
     *
     * @return {Boolean}
     */
    isRunning() {
        return this.timer !== null;
    }
    /** Aborts a timer when it's running. */
    ensureAborted() {
        if (this.timer) {
            this.clear(this.timer);
            this.timer = null;
        }
    }
}

// We need to bind clear functions this way to avoid exceptions on IE8
function clearTimeout(timer) {
    window.clearTimeout(timer);
}
function clearInterval(timer) {
    window.clearInterval(timer);
}
/** Cross-browser compatible one-off timer abstraction.
 *
 * @param {Number} delay
 * @param {Function} callback
 */
class OneOffTimer extends Timer {
    constructor(delay, callback) {
        super(setTimeout, clearTimeout, delay, function (timer) {
            callback();
            return null;
        });
    }
}
/** Cross-browser compatible periodic timer abstraction.
 *
 * @param {Number} delay
 * @param {Function} callback
 */
class PeriodicTimer extends Timer {
    constructor(delay, callback) {
        super(setInterval, clearInterval, delay, function (timer) {
            callback();
            return timer;
        });
    }
}

var Util = {
    now() {
        if (Date.now) {
            return Date.now();
        }
        else {
            return new Date().valueOf();
        }
    },
    defer(callback) {
        return new OneOffTimer(0, callback);
    },
    /** Builds a function that will proxy a method call to its first argument.
     *
     * Allows partial application of arguments, so additional arguments are
     * prepended to the argument list.
     *
     * @param  {String} name method name
     * @return {Function} proxy function
     */
    method(name, ...args) {
        var boundArguments = Array.prototype.slice.call(arguments, 1);
        return function (object) {
            return object[name].apply(object, boundArguments.concat(arguments));
        };
    }
};

/** Merges multiple objects into the target argument.
 *
 * For properties that are plain Objects, performs a deep-merge. For the
 * rest it just copies the value of the property.
 *
 * To extend prototypes use it as following:
 *   Pusher.Util.extend(Target.prototype, Base.prototype)
 *
 * You can also use it to merge objects without altering them:
 *   Pusher.Util.extend({}, object1, object2)
 *
 * @param  {Object} target
 * @return {Object} the target argument
 */
function extend(target, ...sources) {
    for (var i = 0; i < sources.length; i++) {
        var extensions = sources[i];
        for (var property in extensions) {
            if (extensions[property] &&
                extensions[property].constructor &&
                extensions[property].constructor === Object) {
                target[property] = extend(target[property] || {}, extensions[property]);
            }
            else {
                target[property] = extensions[property];
            }
        }
    }
    return target;
}
function stringify() {
    var m = ['Pusher'];
    for (var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] === 'string') {
            m.push(arguments[i]);
        }
        else {
            m.push(safeJSONStringify(arguments[i]));
        }
    }
    return m.join(' : ');
}
function arrayIndexOf(array, item) {
    // MSIE doesn't have array.indexOf
    var nativeIndexOf = Array.prototype.indexOf;
    if (array === null) {
        return -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) {
        return array.indexOf(item);
    }
    for (var i = 0, l = array.length; i < l; i++) {
        if (array[i] === item) {
            return i;
        }
    }
    return -1;
}
/** Applies a function f to all properties of an object.
 *
 * Function f gets 3 arguments passed:
 * - element from the object
 * - key of the element
 * - reference to the object
 *
 * @param {Object} object
 * @param {Function} f
 */
function objectApply(object, f) {
    for (var key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            f(object[key], key, object);
        }
    }
}
/** Return a list of objects own proerty keys
 *
 * @param {Object} object
 * @returns {Array}
 */
function keys(object) {
    var keys = [];
    objectApply(object, function (_, key) {
        keys.push(key);
    });
    return keys;
}
/** Return a list of object's own property values
 *
 * @param {Object} object
 * @returns {Array}
 */
function values(object) {
    var values = [];
    objectApply(object, function (value) {
        values.push(value);
    });
    return values;
}
/** Applies a function f to all elements of an array.
 *
 * Function f gets 3 arguments passed:
 * - element from the array
 * - index of the element
 * - reference to the array
 *
 * @param {Array} array
 * @param {Function} f
 */
function apply(array, f, context) {
    for (var i = 0; i < array.length; i++) {
        f.call(context || window, array[i], i, array);
    }
}
/** Maps all elements of the array and returns the result.
 *
 * Function f gets 4 arguments passed:
 * - element from the array
 * - index of the element
 * - reference to the source array
 * - reference to the destination array
 *
 * @param {Array} array
 * @param {Function} f
 */
function map(array, f) {
    var result = [];
    for (var i = 0; i < array.length; i++) {
        result.push(f(array[i], i, array, result));
    }
    return result;
}
/** Maps all elements of the object and returns the result.
 *
 * Function f gets 4 arguments passed:
 * - element from the object
 * - key of the element
 * - reference to the source object
 * - reference to the destination object
 *
 * @param {Object} object
 * @param {Function} f
 */
function mapObject(object, f) {
    var result = {};
    objectApply(object, function (value, key) {
        result[key] = f(value);
    });
    return result;
}
/** Filters elements of the array using a test function.
 *
 * Function test gets 4 arguments passed:
 * - element from the array
 * - index of the element
 * - reference to the source array
 * - reference to the destination array
 *
 * @param {Array} array
 * @param {Function} f
 */
function filter(array, test) {
    test =
        test ||
        function (value) {
            return !!value;
        };
    var result = [];
    for (var i = 0; i < array.length; i++) {
        if (test(array[i], i, array, result)) {
            result.push(array[i]);
        }
    }
    return result;
}
/** Filters properties of the object using a test function.
 *
 * Function test gets 4 arguments passed:
 * - element from the object
 * - key of the element
 * - reference to the source object
 * - reference to the destination object
 *
 * @param {Object} object
 * @param {Function} f
 */
function filterObject(object, test) {
    var result = {};
    objectApply(object, function (value, key) {
        if ((test && test(value, key, object, result)) || Boolean(value)) {
            result[key] = value;
        }
    });
    return result;
}
/** Flattens an object into a two-dimensional array.
 *
 * @param  {Object} object
 * @return {Array} resulting array of [key, value] pairs
 */
function flatten(object) {
    var result = [];
    objectApply(object, function (value, key) {
        result.push([key, value]);
    });
    return result;
}
/** Checks whether any element of the array passes the test.
 *
 * Function test gets 3 arguments passed:
 * - element from the array
 * - index of the element
 * - reference to the source array
 *
 * @param {Array} array
 * @param {Function} f
 */
function any(array, test) {
    for (var i = 0; i < array.length; i++) {
        if (test(array[i], i, array)) {
            return true;
        }
    }
    return false;
}
/** Checks whether all elements of the array pass the test.
 *
 * Function test gets 3 arguments passed:
 * - element from the array
 * - index of the element
 * - reference to the source array
 *
 * @param {Array} array
 * @param {Function} f
 */
function all(array, test) {
    for (var i = 0; i < array.length; i++) {
        if (!test(array[i], i, array)) {
            return false;
        }
    }
    return true;
}
function encodeParamsObject(data) {
    return mapObject(data, function (value) {
        if (typeof value === 'object') {
            value = safeJSONStringify(value);
        }
        return encodeURIComponent(encode(value.toString()));
    });
}
function buildQueryString(data) {
    var params = filterObject(data, function (value) {
        return value !== undefined;
    });
    var query = map(flatten(encodeParamsObject(params)), Util.method('join', '=')).join('&');
    return query;
}
/**
 * See https://github.com/douglascrockford/JSON-js/blob/master/cycle.js
 *
 * Remove circular references from an object. Required for JSON.stringify in
 * React Native, which tends to blow up a lot.
 *
 * @param  {any} object
 * @return {any}        Decycled object
 */
function decycleObject(object) {
    var objects = [], paths = [];
    return (function derez(value, path) {
        var i, name, nu;
        switch (typeof value) {
            case 'object':
                if (!value) {
                    return null;
                }
                for (i = 0; i < objects.length; i += 1) {
                    if (objects[i] === value) {
                        return { $ref: paths[i] };
                    }
                }
                objects.push(value);
                paths.push(path);
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    nu = [];
                    for (i = 0; i < value.length; i += 1) {
                        nu[i] = derez(value[i], path + '[' + i + ']');
                    }
                }
                else {
                    nu = {};
                    for (name in value) {
                        if (Object.prototype.hasOwnProperty.call(value, name)) {
                            nu[name] = derez(value[name], path + '[' + JSON.stringify(name) + ']');
                        }
                    }
                }
                return nu;
            case 'number':
            case 'string':
            case 'boolean':
                return value;
        }
    })(object, '$');
}
/**
 * Provides a cross-browser and cross-platform way to safely stringify objects
 * into JSON. This is particularly necessary for ReactNative, where circular JSON
 * structures throw an exception.
 *
 * @param  {any}    source The object to stringify
 * @return {string}        The serialized output.
 */
function safeJSONStringify(source) {
    try {
        return JSON.stringify(source);
    }
    catch (e) {
        return JSON.stringify(decycleObject(source));
    }
}

class Logger {
    debug(...args) {
        this.log(this.globalLog, args);
    }
    warn(...args) {
        this.log(this.globalLogWarn, args);
    }
    error(...args) {
        this.log(this.globalLogError, args);
    }
    globalLog = (message) => {
        if (window.console && window.console.log) {
            window.console.log(message);
        }
    };
    globalLogWarn(message) {
        if (window.console && window.console.warn) {
            window.console.warn(message);
        }
        else {
            this.globalLog(message);
        }
    }
    globalLogError(message) {
        if (window.console && window.console.error) {
            window.console.error(message);
        }
        else {
            this.globalLogWarn(message);
        }
    }
    log(defaultLoggingFunction, ...args) {
        var message = stringify.apply(this, arguments);
        if (Pusher.log) {
            Pusher.log(message);
        }
        else if (Pusher.logToConsole) {
            const log = defaultLoggingFunction.bind(this);
            log(message);
        }
    }
}
var Logger$1 = new Logger();

var jsonp$1 = function (context, query, authOptions, authRequestType, callback) {
    if (authOptions.headers !== undefined ||
        authOptions.headersProvider != null) {
        Logger$1.warn(`To send headers with the ${authRequestType.toString()} request, you must use AJAX, rather than JSONP.`);
    }
    var callbackName = context.nextAuthCallbackID.toString();
    context.nextAuthCallbackID++;
    var document = context.getDocument();
    var script = document.createElement('script');
    // Hacked wrapper.
    context.auth_callbacks[callbackName] = function (data) {
        callback(null, data);
    };
    var callback_name = "Pusher.auth_callbacks['" + callbackName + "']";
    script.src =
        authOptions.endpoint +
        '?callback=' +
        encodeURIComponent(callback_name) +
        '&' +
        query;
    var head = document.getElementsByTagName('head')[0] || document.documentElement;
    head.insertBefore(script, head.firstChild);
};

/** Sends a generic HTTP GET request using a script tag.
 *
 * By constructing URL in a specific way, it can be used for loading
 * JavaScript resources or JSONP requests. It can notify about errors, but
 * only in certain environments. Please take care of monitoring the state of
 * the request yourself.
 *
 * @param {String} src
 */
class ScriptRequest {
    src;
    script;
    errorScript;
    constructor(src) {
        this.src = src;
    }
    send(receiver) {
        var self = this;
        var errorString = 'Error loading ' + self.src;
        self.script = document.createElement('script');
        self.script.id = receiver.id;
        self.script.src = self.src;
        self.script.type = 'text/javascript';
        self.script.charset = 'UTF-8';
        if (self.script.addEventListener) {
            self.script.onerror = function () {
                receiver.callback(errorString);
            };
            self.script.onload = function () {
                receiver.callback(null);
            };
        }
        else {
            self.script.onreadystatechange = function () {
                if (self.script.readyState === 'loaded' ||
                    self.script.readyState === 'complete') {
                    receiver.callback(null);
                }
            };
        }
        // Opera<11.6 hack for missing onerror callback
        if (self.script.async === undefined &&
            document.attachEvent &&
            /opera/i.test(navigator.userAgent)) {
            self.errorScript = document.createElement('script');
            self.errorScript.id = receiver.id + '_error';
            self.errorScript.text = receiver.name + "('" + errorString + "');";
            self.script.async = self.errorScript.async = false;
        }
        else {
            self.script.async = true;
        }
        var head = document.getElementsByTagName('head')[0];
        head.insertBefore(self.script, head.firstChild);
        if (self.errorScript) {
            head.insertBefore(self.errorScript, self.script.nextSibling);
        }
    }
    /** Cleans up the DOM remains of the script request. */
    cleanup() {
        if (this.script) {
            this.script.onload = this.script.onerror = null;
            this.script.onreadystatechange = null;
        }
        if (this.script && this.script.parentNode) {
            this.script.parentNode.removeChild(this.script);
        }
        if (this.errorScript && this.errorScript.parentNode) {
            this.errorScript.parentNode.removeChild(this.errorScript);
        }
        this.script = null;
        this.errorScript = null;
    }
}

/** Sends data via JSONP.
 *
 * Data is a key-value map. Its values are JSON-encoded and then passed
 * through base64. Finally, keys and encoded values are appended to the query
 * string.
 *
 * The class itself does not guarantee raising errors on failures, as it's not
 * possible to support such feature on all browsers. Instead, JSONP endpoint
 * should call back in a way that's easy to distinguish from browser calls,
 * for example by passing a second argument to the receiver.
 *
 * @param {String} url
 * @param {Object} data key-value map of data to be submitted
 */
class JSONPRequest {
    url;
    data;
    request;
    constructor(url, data) {
        this.url = url;
        this.data = data;
    }
    /** Sends the actual JSONP request.
     *
     * @param {ScriptReceiver} receiver
     */
    send(receiver) {
        if (this.request) {
            return;
        }
        var query = buildQueryString(this.data);
        var url = this.url + '/' + receiver.number + '?' + query;
        this.request = Runtime$1.createScriptRequest(url);
        this.request.send(receiver);
    }
    /** Cleans up the DOM remains of the JSONP request. */
    cleanup() {
        if (this.request) {
            this.request.cleanup();
        }
    }
}

var getAgent = function (sender, useTLS) {
    return function (data, callback) {
        var scheme = 'http' + (useTLS ? 's' : '') + '://';
        var url = scheme + (sender.host || sender.options.host) + sender.options.path;
        var request = Runtime$1.createJSONPRequest(url, data);
        var receiver = Runtime$1.ScriptReceivers.create(function (error, result) {
            ScriptReceivers.remove(receiver);
            request.cleanup();
            if (result && result.host) {
                sender.host = result.host;
            }
            if (callback) {
                callback(error, result);
            }
        });
        request.send(receiver);
    };
};
var jsonp = {
    name: 'jsonp',
    getAgent
};

function getGenericURL(baseScheme, params, path) {
    var scheme = baseScheme + (params.useTLS ? 's' : '');
    var host = params.useTLS ? params.hostTLS : params.hostNonTLS;
    return scheme + '://' + host + path;
}
function getGenericPath(key, queryString) {
    var path = '/app/' + key;
    var query = '?protocol=' +
        Defaults.PROTOCOL +
        '&client=js' +
        '&version=' +
        Defaults.VERSION +
        (queryString ? '&' + queryString : '');
    return path + query;
}
var ws = {
    getInitial: function (key, params) {
        var path = (params.httpPath || '') + getGenericPath(key, 'flash=false');
        return getGenericURL('ws', params, path);
    }
};
var http = {
    getInitial: function (key, params) {
        var path = (params.httpPath || '/pusher') + getGenericPath(key);
        return getGenericURL('http', params, path);
    }
};
var sockjs = {
    getInitial: function (key, params) {
        return getGenericURL('http', params, params.httpPath || '/pusher');
    },
    getPath: function (key, params) {
        return getGenericPath(key);
    }
};

class CallbackRegistry {
    _callbacks;
    constructor() {
        this._callbacks = {};
    }
    get(name) {
        return this._callbacks[prefix(name)];
    }
    add(name, callback, context) {
        var prefixedEventName = prefix(name);
        this._callbacks[prefixedEventName] =
            this._callbacks[prefixedEventName] || [];
        this._callbacks[prefixedEventName].push({
            fn: callback,
            context: context
        });
    }
    remove(name, callback, context) {
        if (!name && !callback && !context) {
            this._callbacks = {};
            return;
        }
        var names = name ? [prefix(name)] : keys(this._callbacks);
        if (callback || context) {
            this.removeCallback(names, callback, context);
        }
        else {
            this.removeAllCallbacks(names);
        }
    }
    removeCallback(names, callback, context) {
        apply(names, function (name) {
            this._callbacks[name] = filter(this._callbacks[name] || [], function (binding) {
                return ((callback && callback !== binding.fn) ||
                    (context && context !== binding.context));
            });
            if (this._callbacks[name].length === 0) {
                delete this._callbacks[name];
            }
        }, this);
    }
    removeAllCallbacks(names) {
        apply(names, function (name) {
            delete this._callbacks[name];
        }, this);
    }
}
function prefix(name) {
    return '_' + name;
}

/** Manages callback bindings and event emitting.
 *
 * @param Function failThrough called when no listeners are bound to an event
 */
class Dispatcher {
    callbacks;
    global_callbacks;
    failThrough;
    constructor(failThrough) {
        this.callbacks = new CallbackRegistry();
        this.global_callbacks = [];
        this.failThrough = failThrough;
    }
    bind(eventName, callback, context) {
        this.callbacks.add(eventName, callback, context);
        return this;
    }
    bind_global(callback) {
        this.global_callbacks.push(callback);
        return this;
    }
    unbind(eventName, callback, context) {
        this.callbacks.remove(eventName, callback, context);
        return this;
    }
    unbind_global(callback) {
        if (!callback) {
            this.global_callbacks = [];
            return this;
        }
        this.global_callbacks = filter(this.global_callbacks || [], c => c !== callback);
        return this;
    }
    unbind_all() {
        this.unbind();
        this.unbind_global();
        return this;
    }
    emit(eventName, data, metadata) {
        for (var i = 0; i < this.global_callbacks.length; i++) {
            this.global_callbacks[i](eventName, data);
        }
        var callbacks = this.callbacks.get(eventName);
        var args = [];
        if (metadata) {
            // if there's a metadata argument, we need to call the callback with both
            // data and metadata regardless of whether data is undefined
            args.push(data, metadata);
        }
        else if (data) {
            // metadata is undefined, so we only need to call the callback with data
            // if data exists
            args.push(data);
        }
        if (callbacks && callbacks.length > 0) {
            for (var i = 0; i < callbacks.length; i++) {
                callbacks[i].fn.apply(callbacks[i].context || window, args);
            }
        }
        else if (this.failThrough) {
            this.failThrough(eventName, data);
        }
        return this;
    }
}

/** Provides universal API for transport connections.
 *
 * Transport connection is a low-level object that wraps a connection method
 * and exposes a simple evented interface for the connection state and
 * messaging. It does not implement Pusher-specific WebSocket protocol.
 *
 * Additionally, it fetches resources needed for transport to work and exposes
 * an interface for querying transport features.
 *
 * States:
 * - new - initial state after constructing the object
 * - initializing - during initialization phase, usually fetching resources
 * - intialized - ready to establish a connection
 * - connection - when connection is being established
 * - open - when connection ready to be used
 * - closed - after connection was closed be either side
 *
 * Emits:
 * - error - after the connection raised an error
 *
 * Options:
 * - useTLS - whether connection should be over TLS
 * - hostTLS - host to connect to when connection is over TLS
 * - hostNonTLS - host to connect to when connection is over TLS
 *
 * @param {String} key application key
 * @param {Object} options
 */
class TransportConnection extends Dispatcher {
    hooks;
    name;
    priority;
    key;
    options;
    state;
    timeline;
    activityTimeout;
    id;
    socket;
    beforeOpen;
    initialize;
    constructor(hooks, name, priority, key, options) {
        super();
        this.initialize = Runtime$1.transportConnectionInitializer;
        this.hooks = hooks;
        this.name = name;
        this.priority = priority;
        this.key = key;
        this.options = options;
        this.state = 'new';
        this.timeline = options.timeline;
        this.activityTimeout = options.activityTimeout;
        this.id = this.timeline.generateUniqueID();
    }
    /** Checks whether the transport handles activity checks by itself.
     *
     * @return {Boolean}
     */
    handlesActivityChecks() {
        return Boolean(this.hooks.handlesActivityChecks);
    }
    /** Checks whether the transport supports the ping/pong API.
     *
     * @return {Boolean}
     */
    supportsPing() {
        return Boolean(this.hooks.supportsPing);
    }
    /** Tries to establish a connection.
     *
     * @returns {Boolean} false if transport is in invalid state
     */
    connect() {
        if (this.socket || this.state !== 'initialized') {
            return false;
        }
        var url = this.hooks.urls.getInitial(this.key, this.options);
        try {
            this.socket = this.hooks.getSocket(url, this.options);
        }
        catch (e) {
            Util.defer(() => {
                this.onError(e);
                this.changeState('closed');
            });
            return false;
        }
        this.bindListeners();
        Logger$1.debug('Connecting', { transport: this.name, url });
        this.changeState('connecting');
        return true;
    }
    /** Closes the connection.
     *
     * @return {Boolean} true if there was a connection to close
     */
    close() {
        if (this.socket) {
            this.socket.close();
            return true;
        }
        else {
            return false;
        }
    }
    /** Sends data over the open connection.
     *
     * @param {String} data
     * @return {Boolean} true only when in the "open" state
     */
    send(data) {
        if (this.state === 'open') {
            // Workaround for MobileSafari bug (see https://gist.github.com/2052006)
            Util.defer(() => {
                if (this.socket) {
                    this.socket.send(data);
                }
            });
            return true;
        }
        else {
            return false;
        }
    }
    /** Sends a ping if the connection is open and transport supports it. */
    ping() {
        if (this.state === 'open' && this.supportsPing()) {
            this.socket.ping();
        }
    }
    onOpen() {
        if (this.hooks.beforeOpen) {
            this.hooks.beforeOpen(this.socket, this.hooks.urls.getPath(this.key, this.options));
        }
        this.changeState('open');
        this.socket.onopen = undefined;
    }
    onError(error) {
        this.emit('error', { type: 'WebSocketError', error: error });
        this.timeline.error(this.buildTimelineMessage({ error: error.toString() }));
    }
    onClose(closeEvent) {
        if (closeEvent) {
            this.changeState('closed', {
                code: closeEvent.code,
                reason: closeEvent.reason,
                wasClean: closeEvent.wasClean
            });
        }
        else {
            this.changeState('closed');
        }
        this.unbindListeners();
        this.socket = undefined;
    }
    onMessage(message) {
        this.emit('message', message);
    }
    onActivity() {
        this.emit('activity');
    }
    bindListeners() {
        this.socket.onopen = () => {
            this.onOpen();
        };
        this.socket.onerror = error => {
            this.onError(error);
        };
        this.socket.onclose = closeEvent => {
            this.onClose(closeEvent);
        };
        this.socket.onmessage = message => {
            this.onMessage(message);
        };
        if (this.supportsPing()) {
            this.socket.onactivity = () => {
                this.onActivity();
            };
        }
    }
    unbindListeners() {
        if (this.socket) {
            this.socket.onopen = undefined;
            this.socket.onerror = undefined;
            this.socket.onclose = undefined;
            this.socket.onmessage = undefined;
            if (this.supportsPing()) {
                this.socket.onactivity = undefined;
            }
        }
    }
    changeState(state, params) {
        this.state = state;
        this.timeline.info(this.buildTimelineMessage({
            state: state,
            params: params
        }));
        this.emit(state, params);
    }
    buildTimelineMessage(message) {
        return extend({ cid: this.id }, message);
    }
}

/** Provides interface for transport connection instantiation.
 *
 * Takes transport-specific hooks as the only argument, which allow checking
 * for transport support and creating its connections.
 *
 * Supported hooks: * - file - the name of the file to be fetched during initialization
 * - urls - URL scheme to be used by transport
 * - handlesActivityCheck - true when the transport handles activity checks
 * - supportsPing - true when the transport has a ping/activity API
 * - isSupported - tells whether the transport is supported in the environment
 * - getSocket - creates a WebSocket-compatible transport socket
 *
 * See transports.js for specific implementations.
 *
 * @param {Object} hooks object containing all needed transport hooks
 */
class Transport {
    hooks;
    constructor(hooks) {
        this.hooks = hooks;
    }
    /** Returns whether the transport is supported in the environment.
     *
     * @param {Object} envronment te environment details (encryption, settings)
     * @returns {Boolean} true when the transport is supported
     */
    isSupported(environment) {
        return this.hooks.isSupported(environment);
    }
    /** Creates a transport connection.
     *
     * @param {String} name
     * @param {Number} priority
     * @param {String} key the application key
     * @param {Object} options
     * @returns {TransportConnection}
     */
    createConnection(name, priority, key, options) {
        return new TransportConnection(this.hooks, name, priority, key, options);
    }
}

/** WebSocket transport.
 *
 * Uses native WebSocket implementation, including MozWebSocket supported by
 * earlier Firefox versions.
 */
var WSTransport = new Transport({
    urls: ws,
    handlesActivityChecks: false,
    supportsPing: false,
    isInitialized: function () {
        return Boolean(Runtime$1.getWebSocketAPI());
    },
    isSupported: function () {
        return Boolean(Runtime$1.getWebSocketAPI());
    },
    getSocket: function (url) {
        return Runtime$1.createWebSocket(url);
    }
});
var httpConfiguration = {
    urls: http,
    handlesActivityChecks: false,
    supportsPing: true,
    isInitialized: function () {
        return true;
    }
};
var streamingConfiguration = extend({
    getSocket: function (url) {
        return Runtime$1.HTTPFactory.createStreamingSocket(url);
    }
}, httpConfiguration);
var pollingConfiguration = extend({
    getSocket: function (url) {
        return Runtime$1.HTTPFactory.createPollingSocket(url);
    }
}, httpConfiguration);
var xhrConfiguration = {
    isSupported: function () {
        return Runtime$1.isXHRSupported();
    }
};
/** HTTP streaming transport using CORS-enabled XMLHttpRequest. */
var XHRStreamingTransport = new Transport((extend({}, streamingConfiguration, xhrConfiguration)));
/** HTTP long-polling transport using CORS-enabled XMLHttpRequest. */
var XHRPollingTransport = new Transport(extend({}, pollingConfiguration, xhrConfiguration));
var Transports$1 = {
    ws: WSTransport,
    xhr_streaming: XHRStreamingTransport,
    xhr_polling: XHRPollingTransport
};

var SockJSTransport = new Transport({
    file: 'sockjs',
    urls: sockjs,
    handlesActivityChecks: true,
    supportsPing: false,
    isSupported: function () {
        return true;
    },
    isInitialized: function () {
        return window.SockJS !== undefined;
    },
    getSocket: function (url, options) {
        return new window.SockJS(url, null, {
            js_path: Dependencies.getPath('sockjs', {
                useTLS: options.useTLS
            }),
            ignore_null_origin: options.ignoreNullOrigin
        });
    },
    beforeOpen: function (socket, path) {
        socket.send(JSON.stringify({
            path: path
        }));
    }
});
var xdrConfiguration = {
    isSupported: function (environment) {
        var yes = Runtime$1.isXDRSupported(environment.useTLS);
        return yes;
    }
};
/** HTTP streaming transport using XDomainRequest (IE 8,9). */
var XDRStreamingTransport = new Transport((extend({}, streamingConfiguration, xdrConfiguration)));
/** HTTP long-polling transport using XDomainRequest (IE 8,9). */
var XDRPollingTransport = new Transport(extend({}, pollingConfiguration, xdrConfiguration));
Transports$1.xdr_streaming = XDRStreamingTransport;
Transports$1.xdr_polling = XDRPollingTransport;
Transports$1.sockjs = SockJSTransport;

/** Really basic interface providing network availability info.
 *
 * Emits:
 * - online - when browser goes online
 * - offline - when browser goes offline
 */
class NetInfo extends Dispatcher {
    constructor() {
        super();
        var self = this;
        // This is okay, as IE doesn't support this stuff anyway.
        if (window.addEventListener !== undefined) {
            window.addEventListener('online', function () {
                self.emit('online');
            }, false);
            window.addEventListener('offline', function () {
                self.emit('offline');
            }, false);
        }
    }
    /** Returns whether browser is online or not
     *
     * Offline means definitely offline (no connection to router).
     * Inverse does NOT mean definitely online (only currently supported in Safari
     * and even there only means the device has a connection to the router).
     *
     * @return {Boolean}
     */
    isOnline() {
        if (window.navigator.onLine === undefined) {
            return true;
        }
        else {
            return window.navigator.onLine;
        }
    }
}
var Network = new NetInfo();

/** Creates transport connections monitored by a transport manager.
 *
 * When a transport is closed, it might mean the environment does not support
 * it. It's possible that messages get stuck in an intermediate buffer or
 * proxies terminate inactive connections. To combat these problems,
 * assistants monitor the connection lifetime, report unclean exits and
 * adjust ping timeouts to keep the connection active. The decision to disable
 * a transport is the manager's responsibility.
 *
 * @param {TransportManager} manager
 * @param {TransportConnection} transport
 * @param {Object} options
 */
class AssistantToTheTransportManager {
    manager;
    transport;
    minPingDelay;
    maxPingDelay;
    pingDelay;
    constructor(manager, transport, options) {
        this.manager = manager;
        this.transport = transport;
        this.minPingDelay = options.minPingDelay;
        this.maxPingDelay = options.maxPingDelay;
        this.pingDelay = undefined;
    }
    /** Creates a transport connection.
     *
     * This function has the same API as Transport#createConnection.
     *
     * @param {String} name
     * @param {Number} priority
     * @param {String} key the application key
     * @param {Object} options
     * @returns {TransportConnection}
     */
    createConnection(name, priority, key, options) {
        options = extend({}, options, {
            activityTimeout: this.pingDelay
        });
        var connection = this.transport.createConnection(name, priority, key, options);
        var openTimestamp = null;
        var onOpen = function () {
            connection.unbind('open', onOpen);
            connection.bind('closed', onClosed);
            openTimestamp = Util.now();
        };
        var onClosed = closeEvent => {
            connection.unbind('closed', onClosed);
            if (closeEvent.code === 1002 || closeEvent.code === 1003) {
                // we don't want to use transports not obeying the protocol
                this.manager.reportDeath();
            }
            else if (!closeEvent.wasClean && openTimestamp) {
                // report deaths only for short-living transport
                var lifespan = Util.now() - openTimestamp;
                if (lifespan < 2 * this.maxPingDelay) {
                    this.manager.reportDeath();
                    this.pingDelay = Math.max(lifespan / 2, this.minPingDelay);
                }
            }
        };
        connection.bind('open', onOpen);
        return connection;
    }
    /** Returns whether the transport is supported in the environment.
     *
     * This function has the same API as Transport#isSupported. Might return false
     * when the manager decides to kill the transport.
     *
     * @param {Object} environment the environment details (encryption, settings)
     * @returns {Boolean} true when the transport is supported
     */
    isSupported(environment) {
        return this.manager.isAlive() && this.transport.isSupported(environment);
    }
}

/**
 * Provides functions for handling Pusher protocol-specific messages.
 */
const Protocol = {
    /**
     * Decodes a message in a Pusher format.
     *
     * The MessageEvent we receive from the transport should contain a pusher event
     * (https://pusher.com/docs/pusher_protocol#events) serialized as JSON in the
     * data field
     *
     * The pusher event may contain a data field too, and it may also be
     * serialised as JSON
     *
     * Throws errors when messages are not parse'able.
     *
     * @param  {MessageEvent} messageEvent
     * @return {PusherEvent}
     */
    decodeMessage: function (messageEvent) {
        try {
            var messageData = JSON.parse(messageEvent.data);
            var pusherEventData = messageData.data;
            if (typeof pusherEventData === 'string') {
                try {
                    pusherEventData = JSON.parse(messageData.data);
                }
                catch (e) { }
            }
            var pusherEvent = {
                event: messageData.event,
                channel: messageData.channel,
                data: pusherEventData
            };
            if (messageData.user_id) {
                pusherEvent.user_id = messageData.user_id;
            }
            return pusherEvent;
        }
        catch (e) {
            throw { type: 'MessageParseError', error: e, data: messageEvent.data };
        }
    },
    /**
     * Encodes a message to be sent.
     *
     * @param  {PusherEvent} event
     * @return {String}
     */
    encodeMessage: function (event) {
        return JSON.stringify(event);
    },
    /**
     * Processes a handshake message and returns appropriate actions.
     *
     * Returns an object with an 'action' and other action-specific properties.
     *
     * There are three outcomes when calling this function. First is a successful
     * connection attempt, when pusher:connection_established is received, which
     * results in a 'connected' action with an 'id' property. When passed a
     * pusher:error event, it returns a result with action appropriate to the
     * close code and an error. Otherwise, it raises an exception.
     *
     * @param {String} message
     * @result Object
     */
    processHandshake: function (messageEvent) {
        var message = Protocol.decodeMessage(messageEvent);
        if (message.event === 'pusher:connection_established') {
            if (!message.data.activity_timeout) {
                throw 'No activity timeout specified in handshake';
            }
            return {
                action: 'connected',
                id: message.data.socket_id,
                activityTimeout: message.data.activity_timeout * 1000
            };
        }
        else if (message.event === 'pusher:error') {
            // From protocol 6 close codes are sent only once, so this only
            // happens when connection does not support close codes
            return {
                action: this.getCloseAction(message.data),
                error: this.getCloseError(message.data)
            };
        }
        else {
            throw 'Invalid handshake';
        }
    },
    /**
     * Dispatches the close event and returns an appropriate action name.
     *
     * See:
     * 1. https://developer.mozilla.org/en-US/docs/WebSockets/WebSockets_reference/CloseEvent
     * 2. http://pusher.com/docs/pusher_protocol
     *
     * @param  {CloseEvent} closeEvent
     * @return {String} close action name
     */
    getCloseAction: function (closeEvent) {
        if (closeEvent.code < 4000) {
            // ignore 1000 CLOSE_NORMAL, 1001 CLOSE_GOING_AWAY,
            //        1005 CLOSE_NO_STATUS, 1006 CLOSE_ABNORMAL
            // ignore 1007...3999
            // handle 1002 CLOSE_PROTOCOL_ERROR, 1003 CLOSE_UNSUPPORTED,
            //        1004 CLOSE_TOO_LARGE
            if (closeEvent.code >= 1002 && closeEvent.code <= 1004) {
                return 'backoff';
            }
            else {
                return null;
            }
        }
        else if (closeEvent.code === 4000) {
            return 'tls_only';
        }
        else if (closeEvent.code < 4100) {
            return 'refused';
        }
        else if (closeEvent.code < 4200) {
            return 'backoff';
        }
        else if (closeEvent.code < 4300) {
            return 'retry';
        }
        else {
            // unknown error
            return 'refused';
        }
    },
    /**
     * Returns an error or null basing on the close event.
     *
     * Null is returned when connection was closed cleanly. Otherwise, an object
     * with error details is returned.
     *
     * @param  {CloseEvent} closeEvent
     * @return {Object} error object
     */
    getCloseError: function (closeEvent) {
        if (closeEvent.code !== 1000 && closeEvent.code !== 1001) {
            return {
                type: 'PusherError',
                data: {
                    code: closeEvent.code,
                    message: closeEvent.reason || closeEvent.message
                }
            };
        }
        else {
            return null;
        }
    }
};

/**
 * Provides Pusher protocol interface for transports.
 *
 * Emits following events:
 * - message - on received messages
 * - ping - on ping requests
 * - pong - on pong responses
 * - error - when the transport emits an error
 * - closed - after closing the transport
 *
 * It also emits more events when connection closes with a code.
 * See Protocol.getCloseAction to get more details.
 *
 * @param {Number} id
 * @param {AbstractTransport} transport
 */
class Connection extends Dispatcher {
    id;
    transport;
    activityTimeout;
    constructor(id, transport) {
        super();
        this.id = id;
        this.transport = transport;
        this.activityTimeout = transport.activityTimeout;
        this.bindListeners();
    }
    /** Returns whether used transport handles activity checks by itself
     *
     * @returns {Boolean} true if activity checks are handled by the transport
     */
    handlesActivityChecks() {
        return this.transport.handlesActivityChecks();
    }
    /** Sends raw data.
     *
     * @param {String} data
     */
    send(data) {
        return this.transport.send(data);
    }
    /** Sends an event.
     *
     * @param {String} name
     * @param {String} data
     * @param {String} [channel]
     * @returns {Boolean} whether message was sent or not
     */
    send_event(name, data, channel) {
        var event = { event: name, data: data };
        if (channel) {
            event.channel = channel;
        }
        Logger$1.debug('Event sent', event);
        return this.send(Protocol.encodeMessage(event));
    }
    /** Sends a ping message to the server.
     *
     * Basing on the underlying transport, it might send either transport's
     * protocol-specific ping or pusher:ping event.
     */
    ping() {
        if (this.transport.supportsPing()) {
            this.transport.ping();
        }
        else {
            this.send_event('pusher:ping', {});
        }
    }
    /** Closes the connection. */
    close() {
        this.transport.close();
    }
    bindListeners() {
        var listeners = {
            message: (messageEvent) => {
                var pusherEvent;
                try {
                    pusherEvent = Protocol.decodeMessage(messageEvent);
                }
                catch (e) {
                    this.emit('error', {
                        type: 'MessageParseError',
                        error: e,
                        data: messageEvent.data
                    });
                }
                if (pusherEvent !== undefined) {
                    Logger$1.debug('Event recd', pusherEvent);
                    switch (pusherEvent.event) {
                        case 'pusher:error':
                            this.emit('error', {
                                type: 'PusherError',
                                data: pusherEvent.data
                            });
                            break;
                        case 'pusher:ping':
                            this.emit('ping');
                            break;
                        case 'pusher:pong':
                            this.emit('pong');
                            break;
                    }
                    this.emit('message', pusherEvent);
                }
            },
            activity: () => {
                this.emit('activity');
            },
            error: error => {
                this.emit('error', error);
            },
            closed: closeEvent => {
                unbindListeners();
                if (closeEvent && closeEvent.code) {
                    this.handleCloseEvent(closeEvent);
                }
                this.transport = null;
                this.emit('closed');
            }
        };
        var unbindListeners = () => {
            objectApply(listeners, (listener, event) => {
                this.transport.unbind(event, listener);
            });
        };
        objectApply(listeners, (listener, event) => {
            this.transport.bind(event, listener);
        });
    }
    handleCloseEvent(closeEvent) {
        var action = Protocol.getCloseAction(closeEvent);
        var error = Protocol.getCloseError(closeEvent);
        if (error) {
            this.emit('error', error);
        }
        if (action) {
            this.emit(action, { action: action, error: error });
        }
    }
}

/**
 * Handles Pusher protocol handshakes for transports.
 *
 * Calls back with a result object after handshake is completed. Results
 * always have two fields:
 * - action - string describing action to be taken after the handshake
 * - transport - the transport object passed to the constructor
 *
 * Different actions can set different additional properties on the result.
 * In the case of 'connected' action, there will be a 'connection' property
 * containing a Connection object for the transport. Other actions should
 * carry an 'error' property.
 *
 * @param {AbstractTransport} transport
 * @param {Function} callback
 */
class Handshake {
    transport;
    callback;
    onMessage;
    onClosed;
    constructor(transport, callback) {
        this.transport = transport;
        this.callback = callback;
        this.bindListeners();
    }
    close() {
        this.unbindListeners();
        this.transport.close();
    }
    bindListeners() {
        this.onMessage = m => {
            this.unbindListeners();
            var result;
            try {
                result = Protocol.processHandshake(m);
            }
            catch (e) {
                this.finish('error', { error: e });
                this.transport.close();
                return;
            }
            if (result.action === 'connected') {
                this.finish('connected', {
                    connection: new Connection(result.id, this.transport),
                    activityTimeout: result.activityTimeout
                });
            }
            else {
                this.finish(result.action, { error: result.error });
                this.transport.close();
            }
        };
        this.onClosed = closeEvent => {
            this.unbindListeners();
            var action = Protocol.getCloseAction(closeEvent) || 'backoff';
            var error = Protocol.getCloseError(closeEvent);
            this.finish(action, { error: error });
        };
        this.transport.bind('message', this.onMessage);
        this.transport.bind('closed', this.onClosed);
    }
    unbindListeners() {
        this.transport.unbind('message', this.onMessage);
        this.transport.unbind('closed', this.onClosed);
    }
    finish(action, params) {
        this.callback(extend({ transport: this.transport, action: action }, params));
    }
}

class TimelineSender {
    timeline;
    options;
    host;
    constructor(timeline, options) {
        this.timeline = timeline;
        this.options = options || {};
    }
    send(useTLS, callback) {
        if (this.timeline.isEmpty()) {
            return;
        }
        this.timeline.send(Runtime$1.TimelineTransport.getAgent(this, useTLS), callback);
    }
}

/** Provides base public channel interface with an event emitter.
 *
 * Emits:
 * - pusher:subscription_succeeded - after subscribing successfully
 * - other non-internal events
 *
 * @param {String} name
 * @param {Pusher} pusher
 */
class Channel extends Dispatcher {
    name;
    pusher;
    subscribed;
    subscriptionPending;
    subscriptionCancelled;
    subscriptionCount;
    constructor(name, pusher) {
        super(function (event, data) {
            Logger$1.debug('No callbacks on ' + name + ' for ' + event);
        });
        this.name = name;
        this.pusher = pusher;
        this.subscribed = false;
        this.subscriptionPending = false;
        this.subscriptionCancelled = false;
    }
    /** Skips authorization, since public channels don't require it.
     *
     * @param {Function} callback
     */
    authorize(socketId, callback) {
        return callback(null, { auth: '' });
    }
    /** Triggers an event */
    trigger(event, data) {
        if (event.indexOf('client-') !== 0) {
            throw new BadEventName("Event '" + event + "' does not start with 'client-'");
        }
        if (!this.subscribed) {
            var suffix = urlStore$1.buildLogSuffix('triggeringClientEvents');
            Logger$1.warn(`Client event triggered before channel 'subscription_succeeded' event . ${suffix}`);
        }
        return this.pusher.send_event(event, data, this.name);
    }
    /** Signals disconnection to the channel. For internal use only. */
    disconnect() {
        this.subscribed = false;
        this.subscriptionPending = false;
    }
    /** Handles a PusherEvent. For internal use only.
     *
     * @param {PusherEvent} event
     */
    handleEvent(event) {
        var eventName = event.event;
        var data = event.data;
        if (eventName === 'pusher_internal:subscription_succeeded') {
            this.handleSubscriptionSucceededEvent(event);
        }
        else if (eventName === 'pusher_internal:subscription_count') {
            this.handleSubscriptionCountEvent(event);
        }
        else if (eventName.indexOf('pusher_internal:') !== 0) {
            var metadata = {};
            this.emit(eventName, data, metadata);
        }
    }
    handleSubscriptionSucceededEvent(event) {
        this.subscriptionPending = false;
        this.subscribed = true;
        if (this.subscriptionCancelled) {
            this.pusher.unsubscribe(this.name);
        }
        else {
            this.emit('pusher:subscription_succeeded', event.data);
        }
    }
    handleSubscriptionCountEvent(event) {
        if (event.data.subscription_count) {
            this.subscriptionCount = event.data.subscription_count;
        }
        this.emit('pusher:subscription_count', event.data);
    }
    /** Sends a subscription request. For internal use only. */
    subscribe() {
        if (this.subscribed) {
            return;
        }
        this.subscriptionPending = true;
        this.subscriptionCancelled = false;
        this.authorize(this.pusher.connection.socket_id, (error, data) => {
            if (error) {
                this.subscriptionPending = false;
                // Why not bind to 'pusher:subscription_error' a level up, and log there?
                // Binding to this event would cause the warning about no callbacks being
                // bound (see constructor) to be suppressed, that's not what we want.
                Logger$1.error(error.toString());
                this.emit('pusher:subscription_error', Object.assign({}, {
                    type: 'AuthError',
                    error: error.message
                }, error instanceof HTTPAuthError ? { status: error.status } : {}));
            }
            else {
                this.pusher.send_event('pusher:subscribe', {
                    auth: data.auth,
                    channel_data: data.channel_data,
                    channel: this.name
                });
            }
        });
    }
    /** Sends an unsubscription request. For internal use only. */
    unsubscribe() {
        this.subscribed = false;
        this.pusher.send_event('pusher:unsubscribe', {
            channel: this.name
        });
    }
    /** Cancels an in progress subscription. For internal use only. */
    cancelSubscription() {
        this.subscriptionCancelled = true;
    }
    /** Reinstates an in progress subscripiton. For internal use only. */
    reinstateSubscription() {
        this.subscriptionCancelled = false;
    }
}

/** Extends public channels to provide private channel interface.
 *
 * @param {String} name
 * @param {Pusher} pusher
 */
class PrivateChannel extends Channel {
    /** Authorizes the connection to use the channel.
     *
     * @param  {String} socketId
     * @param  {Function} callback
     */
    authorize(socketId, callback) {
        return this.pusher.config.channelAuthorizer({
            channelName: this.name,
            socketId: socketId
        }, callback);
    }
}

/** Represents a collection of members of a presence channel. */
class Members {
    members;
    count;
    myID;
    me;
    constructor() {
        this.reset();
    }
    /** Returns member's info for given id.
     *
     * Resulting object containts two fields - id and info.
     *
     * @param {Number} id
     * @return {Object} member's info or null
     */
    get(id) {
        if (Object.prototype.hasOwnProperty.call(this.members, id)) {
            return {
                id: id,
                info: this.members[id]
            };
        }
        else {
            return null;
        }
    }
    /** Calls back for each member in unspecified order.
     *
     * @param  {Function} callback
     */
    each(callback) {
        objectApply(this.members, (member, id) => {
            callback(this.get(id));
        });
    }
    /** Updates the id for connected member. For internal use only. */
    setMyID(id) {
        this.myID = id;
    }
    /** Handles subscription data. For internal use only. */
    onSubscription(subscriptionData) {
        this.members = subscriptionData.presence.hash;
        this.count = subscriptionData.presence.count;
        this.me = this.get(this.myID);
    }
    /** Adds a new member to the collection. For internal use only. */
    addMember(memberData) {
        if (this.get(memberData.user_id) === null) {
            this.count++;
        }
        this.members[memberData.user_id] = memberData.user_info;
        return this.get(memberData.user_id);
    }
    /** Adds a member from the collection. For internal use only. */
    removeMember(memberData) {
        var member = this.get(memberData.user_id);
        if (member) {
            delete this.members[memberData.user_id];
            this.count--;
        }
        return member;
    }
    /** Resets the collection to the initial state. For internal use only. */
    reset() {
        this.members = {};
        this.count = 0;
        this.myID = null;
        this.me = null;
    }
}

class PresenceChannel extends PrivateChannel {
    members;
    /** Adds presence channel functionality to private channels.
     *
     * @param {String} name
     * @param {Pusher} pusher
     */
    constructor(name, pusher) {
        super(name, pusher);
        this.members = new Members();
    }
    /** Authorizes the connection as a member of the channel.
     *
     * @param  {String} socketId
     * @param  {Function} callback
     */
    authorize(socketId, callback) {
        super.authorize(socketId, async (error, authData) => {
            if (!error) {
                authData = authData;
                if (authData.channel_data != null) {
                    var channelData = JSON.parse(authData.channel_data);
                    this.members.setMyID(channelData.user_id);
                }
                else {
                    await this.pusher.user.signinDonePromise;
                    if (this.pusher.user.user_data != null) {
                        // If the user is signed in, get the id of the authenticated user
                        // and allow the presence authorization to continue.
                        this.members.setMyID(this.pusher.user.user_data.id);
                    }
                    else {
                        let suffix = urlStore$1.buildLogSuffix('authorizationEndpoint');
                        Logger$1.error(`Invalid auth response for channel '${this.name}', ` +
                            `expected 'channel_data' field. ${suffix}, ` +
                            `or the user should be signed in.`);
                        callback('Invalid auth response');
                        return;
                    }
                }
            }
            callback(error, authData);
        });
    }
    /** Handles presence and subscription events. For internal use only.
     *
     * @param {PusherEvent} event
     */
    handleEvent(event) {
        var eventName = event.event;
        if (eventName.indexOf('pusher_internal:') === 0) {
            this.handleInternalEvent(event);
        }
        else {
            var data = event.data;
            var metadata = {};
            if (event.user_id) {
                metadata.user_id = event.user_id;
            }
            this.emit(eventName, data, metadata);
        }
    }
    handleInternalEvent(event) {
        var eventName = event.event;
        var data = event.data;
        switch (eventName) {
            case 'pusher_internal:subscription_succeeded':
                this.handleSubscriptionSucceededEvent(event);
                break;
            case 'pusher_internal:subscription_count':
                this.handleSubscriptionCountEvent(event);
                break;
            case 'pusher_internal:member_added':
                var addedMember = this.members.addMember(data);
                this.emit('pusher:member_added', addedMember);
                break;
            case 'pusher_internal:member_removed':
                var removedMember = this.members.removeMember(data);
                if (removedMember) {
                    this.emit('pusher:member_removed', removedMember);
                }
                break;
        }
    }
    handleSubscriptionSucceededEvent(event) {
        this.subscriptionPending = false;
        this.subscribed = true;
        if (this.subscriptionCancelled) {
            this.pusher.unsubscribe(this.name);
        }
        else {
            this.members.onSubscription(event.data);
            this.emit('pusher:subscription_succeeded', this.members);
        }
    }
    /** Resets the channel state, including members map. For internal use only. */
    disconnect() {
        this.members.reset();
        super.disconnect();
    }
}

var utf8 = {};

var hasRequiredUtf8;
function requireUtf8() {
    if (hasRequiredUtf8) return utf8;
    hasRequiredUtf8 = 1;
    // Copyright (C) 2016 Dmitry Chestnykh
    // MIT License. See LICENSE file for details.
    Object.defineProperty(utf8, "__esModule", {
        value: true
    });
    /**
     * Package utf8 implements UTF-8 encoding and decoding.
     */
    var INVALID_UTF16 = "utf8: invalid string";
    var INVALID_UTF8 = "utf8: invalid source encoding";
    /**
     * Encodes the given string into UTF-8 byte array.
     * Throws if the source string has invalid UTF-16 encoding.
     */
    function encode(s) {
        // Calculate result length and allocate output array.
        // encodedLength() also validates string and throws errors,
        // so we don't need repeat validation here.
        var arr = new Uint8Array(encodedLength(s));
        var pos = 0;
        for (var i = 0; i < s.length; i++) {
            var c = s.charCodeAt(i);
            if (c < 0x80) {
                arr[pos++] = c;
            } else if (c < 0x800) {
                arr[pos++] = 0xc0 | c >> 6;
                arr[pos++] = 0x80 | c & 0x3f;
            } else if (c < 0xd800) {
                arr[pos++] = 0xe0 | c >> 12;
                arr[pos++] = 0x80 | c >> 6 & 0x3f;
                arr[pos++] = 0x80 | c & 0x3f;
            } else {
                i++; // get one more character
                c = (c & 0x3ff) << 10;
                c |= s.charCodeAt(i) & 0x3ff;
                c += 0x10000;
                arr[pos++] = 0xf0 | c >> 18;
                arr[pos++] = 0x80 | c >> 12 & 0x3f;
                arr[pos++] = 0x80 | c >> 6 & 0x3f;
                arr[pos++] = 0x80 | c & 0x3f;
            }
        }
        return arr;
    }
    utf8.encode = encode;
    /**
     * Returns the number of bytes required to encode the given string into UTF-8.
     * Throws if the source string has invalid UTF-16 encoding.
     */
    function encodedLength(s) {
        var result = 0;
        for (var i = 0; i < s.length; i++) {
            var c = s.charCodeAt(i);
            if (c < 0x80) {
                result += 1;
            } else if (c < 0x800) {
                result += 2;
            } else if (c < 0xd800) {
                result += 3;
            } else if (c <= 0xdfff) {
                if (i >= s.length - 1) {
                    throw new Error(INVALID_UTF16);
                }
                i++; // "eat" next character
                result += 4;
            } else {
                throw new Error(INVALID_UTF16);
            }
        }
        return result;
    }
    utf8.encodedLength = encodedLength;
    /**
     * Decodes the given byte array from UTF-8 into a string.
     * Throws if encoding is invalid.
     */
    function decode(arr) {
        var chars = [];
        for (var i = 0; i < arr.length; i++) {
            var b = arr[i];
            if (b & 0x80) {
                var min = void 0;
                if (b < 0xe0) {
                    // Need 1 more byte.
                    if (i >= arr.length) {
                        throw new Error(INVALID_UTF8);
                    }
                    var n1 = arr[++i];
                    if ((n1 & 0xc0) !== 0x80) {
                        throw new Error(INVALID_UTF8);
                    }
                    b = (b & 0x1f) << 6 | n1 & 0x3f;
                    min = 0x80;
                } else if (b < 0xf0) {
                    // Need 2 more bytes.
                    if (i >= arr.length - 1) {
                        throw new Error(INVALID_UTF8);
                    }
                    var n1 = arr[++i];
                    var n2 = arr[++i];
                    if ((n1 & 0xc0) !== 0x80 || (n2 & 0xc0) !== 0x80) {
                        throw new Error(INVALID_UTF8);
                    }
                    b = (b & 0x0f) << 12 | (n1 & 0x3f) << 6 | n2 & 0x3f;
                    min = 0x800;
                } else if (b < 0xf8) {
                    // Need 3 more bytes.
                    if (i >= arr.length - 2) {
                        throw new Error(INVALID_UTF8);
                    }
                    var n1 = arr[++i];
                    var n2 = arr[++i];
                    var n3 = arr[++i];
                    if ((n1 & 0xc0) !== 0x80 || (n2 & 0xc0) !== 0x80 || (n3 & 0xc0) !== 0x80) {
                        throw new Error(INVALID_UTF8);
                    }
                    b = (b & 0x0f) << 18 | (n1 & 0x3f) << 12 | (n2 & 0x3f) << 6 | n3 & 0x3f;
                    min = 0x10000;
                } else {
                    throw new Error(INVALID_UTF8);
                }
                if (b < min || b >= 0xd800 && b <= 0xdfff) {
                    throw new Error(INVALID_UTF8);
                }
                if (b >= 0x10000) {
                    // Surrogate pair.
                    if (b > 0x10ffff) {
                        throw new Error(INVALID_UTF8);
                    }
                    b -= 0x10000;
                    chars.push(String.fromCharCode(0xd800 | b >> 10));
                    b = 0xdc00 | b & 0x3ff;
                }
            }
            chars.push(String.fromCharCode(b));
        }
        return chars.join("");
    }
    utf8.decode = decode;
    return utf8;
}

var utf8Exports = requireUtf8();

var base64 = {};

var hasRequiredBase64;
function requireBase64() {
    if (hasRequiredBase64) return base64;
    hasRequiredBase64 = 1;
    // Copyright (C) 2016 Dmitry Chestnykh
    // MIT License. See LICENSE file for details.
    var __extends = base64 && base64.__extends || function () {
        var extendStatics = function (d, b) {
            extendStatics = Object.setPrototypeOf || {
                __proto__: []
            } instanceof Array && function (d, b) {
                d.__proto__ = b;
            } || function (d, b) {
                for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
            };
            return extendStatics(d, b);
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    }();
    Object.defineProperty(base64, "__esModule", {
        value: true
    });
    /**
     * Package base64 implements Base64 encoding and decoding.
     */
    // Invalid character used in decoding to indicate
    // that the character to decode is out of range of
    // alphabet and cannot be decoded.
    var INVALID_BYTE = 256;
    /**
     * Implements standard Base64 encoding.
     *
     * Operates in constant time.
     */
    var Coder = /** @class */function () {
        // TODO(dchest): methods to encode chunk-by-chunk.
        function Coder(_paddingCharacter) {
            if (_paddingCharacter === void 0) {
                _paddingCharacter = "=";
            }
            this._paddingCharacter = _paddingCharacter;
        }
        Coder.prototype.encodedLength = function (length) {
            if (!this._paddingCharacter) {
                return (length * 8 + 5) / 6 | 0;
            }
            return (length + 2) / 3 * 4 | 0;
        };
        Coder.prototype.encode = function (data) {
            var out = "";
            var i = 0;
            for (; i < data.length - 2; i += 3) {
                var c = data[i] << 16 | data[i + 1] << 8 | data[i + 2];
                out += this._encodeByte(c >>> 3 * 6 & 63);
                out += this._encodeByte(c >>> 2 * 6 & 63);
                out += this._encodeByte(c >>> 1 * 6 & 63);
                out += this._encodeByte(c >>> 0 * 6 & 63);
            }
            var left = data.length - i;
            if (left > 0) {
                var c = data[i] << 16 | (left === 2 ? data[i + 1] << 8 : 0);
                out += this._encodeByte(c >>> 3 * 6 & 63);
                out += this._encodeByte(c >>> 2 * 6 & 63);
                if (left === 2) {
                    out += this._encodeByte(c >>> 1 * 6 & 63);
                } else {
                    out += this._paddingCharacter || "";
                }
                out += this._paddingCharacter || "";
            }
            return out;
        };
        Coder.prototype.maxDecodedLength = function (length) {
            if (!this._paddingCharacter) {
                return (length * 6 + 7) / 8 | 0;
            }
            return length / 4 * 3 | 0;
        };
        Coder.prototype.decodedLength = function (s) {
            return this.maxDecodedLength(s.length - this._getPaddingLength(s));
        };
        Coder.prototype.decode = function (s) {
            if (s.length === 0) {
                return new Uint8Array(0);
            }
            var paddingLength = this._getPaddingLength(s);
            var length = s.length - paddingLength;
            var out = new Uint8Array(this.maxDecodedLength(length));
            var op = 0;
            var i = 0;
            var haveBad = 0;
            var v0 = 0,
                v1 = 0,
                v2 = 0,
                v3 = 0;
            for (; i < length - 4; i += 4) {
                v0 = this._decodeChar(s.charCodeAt(i + 0));
                v1 = this._decodeChar(s.charCodeAt(i + 1));
                v2 = this._decodeChar(s.charCodeAt(i + 2));
                v3 = this._decodeChar(s.charCodeAt(i + 3));
                out[op++] = v0 << 2 | v1 >>> 4;
                out[op++] = v1 << 4 | v2 >>> 2;
                out[op++] = v2 << 6 | v3;
                haveBad |= v0 & INVALID_BYTE;
                haveBad |= v1 & INVALID_BYTE;
                haveBad |= v2 & INVALID_BYTE;
                haveBad |= v3 & INVALID_BYTE;
            }
            if (i < length - 1) {
                v0 = this._decodeChar(s.charCodeAt(i));
                v1 = this._decodeChar(s.charCodeAt(i + 1));
                out[op++] = v0 << 2 | v1 >>> 4;
                haveBad |= v0 & INVALID_BYTE;
                haveBad |= v1 & INVALID_BYTE;
            }
            if (i < length - 2) {
                v2 = this._decodeChar(s.charCodeAt(i + 2));
                out[op++] = v1 << 4 | v2 >>> 2;
                haveBad |= v2 & INVALID_BYTE;
            }
            if (i < length - 3) {
                v3 = this._decodeChar(s.charCodeAt(i + 3));
                out[op++] = v2 << 6 | v3;
                haveBad |= v3 & INVALID_BYTE;
            }
            if (haveBad !== 0) {
                throw new Error("Base64Coder: incorrect characters for decoding");
            }
            return out;
        };
        // Standard encoding have the following encoded/decoded ranges,
        // which we need to convert between.
        //
        // ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789  +   /
        // Index:   0 - 25                    26 - 51              52 - 61   62  63
        // ASCII:  65 - 90                    97 - 122             48 - 57   43  47
        //
        // Encode 6 bits in b into a new character.
        Coder.prototype._encodeByte = function (b) {
            // Encoding uses constant time operations as follows:
            //
            // 1. Define comparison of A with B using (A - B) >>> 8:
            //          if A > B, then result is positive integer
            //          if A <= B, then result is 0
            //
            // 2. Define selection of C or 0 using bitwise AND: X & C:
            //          if X == 0, then result is 0
            //          if X != 0, then result is C
            //
            // 3. Start with the smallest comparison (b >= 0), which is always
            //    true, so set the result to the starting ASCII value (65).
            //
            // 4. Continue comparing b to higher ASCII values, and selecting
            //    zero if comparison isn't true, otherwise selecting a value
            //    to add to result, which:
            //
            //          a) undoes the previous addition
            //          b) provides new value to add
            //
            var result = b;
            // b >= 0
            result += 65;
            // b > 25
            result += 25 - b >>> 8 & 0 - 65 - 26 + 97;
            // b > 51
            result += 51 - b >>> 8 & 26 - 97 - 52 + 48;
            // b > 61
            result += 61 - b >>> 8 & 52 - 48 - 62 + 43;
            // b > 62
            result += 62 - b >>> 8 & 62 - 43 - 63 + 47;
            return String.fromCharCode(result);
        };
        // Decode a character code into a byte.
        // Must return 256 if character is out of alphabet range.
        Coder.prototype._decodeChar = function (c) {
            // Decoding works similar to encoding: using the same comparison
            // function, but now it works on ranges: result is always incremented
            // by value, but this value becomes zero if the range is not
            // satisfied.
            //
            // Decoding starts with invalid value, 256, which is then
            // subtracted when the range is satisfied. If none of the ranges
            // apply, the function returns 256, which is then checked by
            // the caller to throw error.
            var result = INVALID_BYTE; // start with invalid character
            // c == 43 (c > 42 and c < 44)
            result += (42 - c & c - 44) >>> 8 & -INVALID_BYTE + c - 43 + 62;
            // c == 47 (c > 46 and c < 48)
            result += (46 - c & c - 48) >>> 8 & -INVALID_BYTE + c - 47 + 63;
            // c > 47 and c < 58
            result += (47 - c & c - 58) >>> 8 & -INVALID_BYTE + c - 48 + 52;
            // c > 64 and c < 91
            result += (64 - c & c - 91) >>> 8 & -INVALID_BYTE + c - 65 + 0;
            // c > 96 and c < 123
            result += (96 - c & c - 123) >>> 8 & -INVALID_BYTE + c - 97 + 26;
            return result;
        };
        Coder.prototype._getPaddingLength = function (s) {
            var paddingLength = 0;
            if (this._paddingCharacter) {
                for (var i = s.length - 1; i >= 0; i--) {
                    if (s[i] !== this._paddingCharacter) {
                        break;
                    }
                    paddingLength++;
                }
                if (s.length < 4 || paddingLength > 2) {
                    throw new Error("Base64Coder: incorrect padding");
                }
            }
            return paddingLength;
        };
        return Coder;
    }();
    base64.Coder = Coder;
    var stdCoder = new Coder();
    function encode(data) {
        return stdCoder.encode(data);
    }
    base64.encode = encode;
    function decode(s) {
        return stdCoder.decode(s);
    }
    base64.decode = decode;
    /**
     * Implements URL-safe Base64 encoding.
     * (Same as Base64, but '+' is replaced with '-', and '/' with '_').
     *
     * Operates in constant time.
     */
    var URLSafeCoder = /** @class */function (_super) {
        __extends(URLSafeCoder, _super);
        function URLSafeCoder() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        // URL-safe encoding have the following encoded/decoded ranges:
        //
        // ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789  -   _
        // Index:   0 - 25                    26 - 51              52 - 61   62  63
        // ASCII:  65 - 90                    97 - 122             48 - 57   45  95
        //
        URLSafeCoder.prototype._encodeByte = function (b) {
            var result = b;
            // b >= 0
            result += 65;
            // b > 25
            result += 25 - b >>> 8 & 0 - 65 - 26 + 97;
            // b > 51
            result += 51 - b >>> 8 & 26 - 97 - 52 + 48;
            // b > 61
            result += 61 - b >>> 8 & 52 - 48 - 62 + 45;
            // b > 62
            result += 62 - b >>> 8 & 62 - 45 - 63 + 95;
            return String.fromCharCode(result);
        };
        URLSafeCoder.prototype._decodeChar = function (c) {
            var result = INVALID_BYTE;
            // c == 45 (c > 44 and c < 46)
            result += (44 - c & c - 46) >>> 8 & -INVALID_BYTE + c - 45 + 62;
            // c == 95 (c > 94 and c < 96)
            result += (94 - c & c - 96) >>> 8 & -INVALID_BYTE + c - 95 + 63;
            // c > 47 and c < 58
            result += (47 - c & c - 58) >>> 8 & -INVALID_BYTE + c - 48 + 52;
            // c > 64 and c < 91
            result += (64 - c & c - 91) >>> 8 & -INVALID_BYTE + c - 65 + 0;
            // c > 96 and c < 123
            result += (96 - c & c - 123) >>> 8 & -INVALID_BYTE + c - 97 + 26;
            return result;
        };
        return URLSafeCoder;
    }(Coder);
    base64.URLSafeCoder = URLSafeCoder;
    var urlSafeCoder = new URLSafeCoder();
    function encodeURLSafe(data) {
        return urlSafeCoder.encode(data);
    }
    base64.encodeURLSafe = encodeURLSafe;
    function decodeURLSafe(s) {
        return urlSafeCoder.decode(s);
    }
    base64.decodeURLSafe = decodeURLSafe;
    base64.encodedLength = function (length) {
        return stdCoder.encodedLength(length);
    };
    base64.maxDecodedLength = function (length) {
        return stdCoder.maxDecodedLength(length);
    };
    base64.decodedLength = function (s) {
        return stdCoder.decodedLength(s);
    };
    return base64;
}

var base64Exports = requireBase64();

/** Extends private channels to provide encrypted channel interface.
 *
 * @param {String} name
 * @param {Pusher} pusher
 */
class EncryptedChannel extends PrivateChannel {
    key = null;
    nacl;
    constructor(name, pusher, nacl) {
        super(name, pusher);
        this.nacl = nacl;
    }
    /** Authorizes the connection to use the channel.
     *
     * @param  {String} socketId
     * @param  {Function} callback
     */
    authorize(socketId, callback) {
        super.authorize(socketId, (error, authData) => {
            if (error) {
                callback(error, authData);
                return;
            }
            let sharedSecret = authData['shared_secret'];
            if (!sharedSecret) {
                callback(new Error(`No shared_secret key in auth payload for encrypted channel: ${this.name}`), null);
                return;
            }
            this.key = base64Exports.decode(sharedSecret);
            delete authData['shared_secret'];
            callback(null, authData);
        });
    }
    trigger(event, data) {
        throw new UnsupportedFeature('Client events are not currently supported for encrypted channels');
    }
    /** Handles an event. For internal use only.
     *
     * @param {PusherEvent} event
     */
    handleEvent(event) {
        var eventName = event.event;
        var data = event.data;
        if (eventName.indexOf('pusher_internal:') === 0 ||
            eventName.indexOf('pusher:') === 0) {
            super.handleEvent(event);
            return;
        }
        this.handleEncryptedEvent(eventName, data);
    }
    handleEncryptedEvent(event, data) {
        if (!this.key) {
            Logger$1.debug('Received encrypted event before key has been retrieved from the authEndpoint');
            return;
        }
        if (!data.ciphertext || !data.nonce) {
            Logger$1.error('Unexpected format for encrypted event, expected object with `ciphertext` and `nonce` fields, got: ' +
                data);
            return;
        }
        let cipherText = base64Exports.decode(data.ciphertext);
        if (cipherText.length < this.nacl.secretbox.overheadLength) {
            Logger$1.error(`Expected encrypted event ciphertext length to be ${this.nacl.secretbox.overheadLength}, got: ${cipherText.length}`);
            return;
        }
        let nonce = base64Exports.decode(data.nonce);
        if (nonce.length < this.nacl.secretbox.nonceLength) {
            Logger$1.error(`Expected encrypted event nonce length to be ${this.nacl.secretbox.nonceLength}, got: ${nonce.length}`);
            return;
        }
        let bytes = this.nacl.secretbox.open(cipherText, nonce, this.key);
        if (bytes === null) {
            Logger$1.debug('Failed to decrypt an event, probably because it was encrypted with a different key. Fetching a new key from the authEndpoint...');
            // Try a single time to retrieve a new auth key and decrypt the event with it
            // If this fails, a new key will be requested when a new message is received
            this.authorize(this.pusher.connection.socket_id, (error, authData) => {
                if (error) {
                    Logger$1.error(`Failed to make a request to the authEndpoint: ${authData}. Unable to fetch new key, so dropping encrypted event`);
                    return;
                }
                bytes = this.nacl.secretbox.open(cipherText, nonce, this.key);
                if (bytes === null) {
                    Logger$1.error(`Failed to decrypt event with new key. Dropping encrypted event`);
                    return;
                }
                this.emit(event, this.getDataToEmit(bytes));
                return;
            });
            return;
        }
        this.emit(event, this.getDataToEmit(bytes));
    }
    // Try and parse the decrypted bytes as JSON. If we can't parse it, just
    // return the utf-8 string
    getDataToEmit(bytes) {
        let raw = utf8Exports.decode(bytes);
        try {
            return JSON.parse(raw);
        }
        catch {
            return raw;
        }
    }
}

/** Manages connection to Pusher.
 *
 * Uses a strategy (currently only default), timers and network availability
 * info to establish a connection and export its state. In case of failures,
 * manages reconnection attempts.
 *
 * Exports state changes as following events:
 * - "state_change", { previous: p, current: state }
 * - state
 *
 * States:
 * - initialized - initial state, never transitioned to
 * - connecting - connection is being established
 * - connected - connection has been fully established
 * - disconnected - on requested disconnection
 * - unavailable - after connection timeout or when there's no network
 * - failed - when the connection strategy is not supported
 *
 * Options:
 * - unavailableTimeout - time to transition to unavailable state
 * - activityTimeout - time after which ping message should be sent
 * - pongTimeout - time for Pusher to respond with pong before reconnecting
 *
 * @param {String} key application key
 * @param {Object} options
 */
class ConnectionManager extends Dispatcher {
    key;
    options;
    state;
    connection;
    usingTLS;
    timeline;
    socket_id;
    unavailableTimer;
    activityTimer;
    retryTimer;
    activityTimeout;
    strategy;
    runner;
    errorCallbacks;
    handshakeCallbacks;
    connectionCallbacks;
    constructor(key, options) {
        super();
        this.state = 'initialized';
        this.connection = null;
        this.key = key;
        this.options = options;
        this.timeline = this.options.timeline;
        this.usingTLS = this.options.useTLS;
        this.errorCallbacks = this.buildErrorCallbacks();
        this.connectionCallbacks = this.buildConnectionCallbacks(this.errorCallbacks);
        this.handshakeCallbacks = this.buildHandshakeCallbacks(this.errorCallbacks);
        var Network = Runtime$1.getNetwork();
        Network.bind('online', () => {
            this.timeline.info({ netinfo: 'online' });
            if (this.state === 'connecting' || this.state === 'unavailable') {
                this.retryIn(0);
            }
        });
        Network.bind('offline', () => {
            this.timeline.info({ netinfo: 'offline' });
            if (this.connection) {
                this.sendActivityCheck();
            }
        });
        this.updateStrategy();
    }
    /** Establishes a connection to Pusher.
     *
     * Does nothing when connection is already established. See top-level doc
     * to find events emitted on connection attempts.
     */
    connect() {
        if (this.connection || this.runner) {
            return;
        }
        if (!this.strategy.isSupported()) {
            this.updateState('failed');
            return;
        }
        this.updateState('connecting');
        this.startConnecting();
        this.setUnavailableTimer();
    }
    /** Sends raw data.
     *
     * @param {String} data
     */
    send(data) {
        if (this.connection) {
            return this.connection.send(data);
        }
        else {
            return false;
        }
    }
    /** Sends an event.
     *
     * @param {String} name
     * @param {String} data
     * @param {String} [channel]
     * @returns {Boolean} whether message was sent or not
     */
    send_event(name, data, channel) {
        if (this.connection) {
            return this.connection.send_event(name, data, channel);
        }
        else {
            return false;
        }
    }
    /** Closes the connection. */
    disconnect() {
        this.disconnectInternally();
        this.updateState('disconnected');
    }
    isUsingTLS() {
        return this.usingTLS;
    }
    startConnecting() {
        var callback = (error, handshake) => {
            if (error) {
                this.runner = this.strategy.connect(0, callback);
            }
            else {
                if (handshake.action === 'error') {
                    this.emit('error', {
                        type: 'HandshakeError',
                        error: handshake.error
                    });
                    this.timeline.error({ handshakeError: handshake.error });
                }
                else {
                    this.abortConnecting(); // we don't support switching connections yet
                    this.handshakeCallbacks[handshake.action](handshake);
                }
            }
        };
        this.runner = this.strategy.connect(0, callback);
    }
    abortConnecting() {
        if (this.runner) {
            this.runner.abort();
            this.runner = null;
        }
    }
    disconnectInternally() {
        this.abortConnecting();
        this.clearRetryTimer();
        this.clearUnavailableTimer();
        if (this.connection) {
            var connection = this.abandonConnection();
            connection.close();
        }
    }
    updateStrategy() {
        this.strategy = this.options.getStrategy({
            key: this.key,
            timeline: this.timeline,
            useTLS: this.usingTLS
        });
    }
    retryIn(delay) {
        this.timeline.info({ action: 'retry', delay: delay });
        if (delay > 0) {
            this.emit('connecting_in', Math.round(delay / 1000));
        }
        this.retryTimer = new OneOffTimer(delay || 0, () => {
            this.disconnectInternally();
            this.connect();
        });
    }
    clearRetryTimer() {
        if (this.retryTimer) {
            this.retryTimer.ensureAborted();
            this.retryTimer = null;
        }
    }
    setUnavailableTimer() {
        this.unavailableTimer = new OneOffTimer(this.options.unavailableTimeout, () => {
            this.updateState('unavailable');
        });
    }
    clearUnavailableTimer() {
        if (this.unavailableTimer) {
            this.unavailableTimer.ensureAborted();
        }
    }
    sendActivityCheck() {
        this.stopActivityCheck();
        this.connection.ping();
        // wait for pong response
        this.activityTimer = new OneOffTimer(this.options.pongTimeout, () => {
            this.timeline.error({ pong_timed_out: this.options.pongTimeout });
            this.retryIn(0);
        });
    }
    resetActivityCheck() {
        this.stopActivityCheck();
        // send ping after inactivity
        if (this.connection && !this.connection.handlesActivityChecks()) {
            this.activityTimer = new OneOffTimer(this.activityTimeout, () => {
                this.sendActivityCheck();
            });
        }
    }
    stopActivityCheck() {
        if (this.activityTimer) {
            this.activityTimer.ensureAborted();
        }
    }
    buildConnectionCallbacks(errorCallbacks) {
        return extend({}, errorCallbacks, {
            message: message => {
                // includes pong messages from server
                this.resetActivityCheck();
                this.emit('message', message);
            },
            ping: () => {
                this.send_event('pusher:pong', {});
            },
            activity: () => {
                this.resetActivityCheck();
            },
            error: error => {
                // just emit error to user - socket will already be closed by browser
                this.emit('error', error);
            },
            closed: () => {
                this.abandonConnection();
                if (this.shouldRetry()) {
                    this.retryIn(1000);
                }
            }
        });
    }
    buildHandshakeCallbacks(errorCallbacks) {
        return extend({}, errorCallbacks, {
            connected: (handshake) => {
                this.activityTimeout = Math.min(this.options.activityTimeout, handshake.activityTimeout, handshake.connection.activityTimeout || Infinity);
                this.clearUnavailableTimer();
                this.setConnection(handshake.connection);
                this.socket_id = this.connection.id;
                this.updateState('connected', { socket_id: this.socket_id });
            }
        });
    }
    buildErrorCallbacks() {
        let withErrorEmitted = callback => {
            return (result) => {
                if (result.error) {
                    this.emit('error', { type: 'WebSocketError', error: result.error });
                }
                callback(result);
            };
        };
        return {
            tls_only: withErrorEmitted(() => {
                this.usingTLS = true;
                this.updateStrategy();
                this.retryIn(0);
            }),
            refused: withErrorEmitted(() => {
                this.disconnect();
            }),
            backoff: withErrorEmitted(() => {
                this.retryIn(1000);
            }),
            retry: withErrorEmitted(() => {
                this.retryIn(0);
            })
        };
    }
    setConnection(connection) {
        this.connection = connection;
        for (var event in this.connectionCallbacks) {
            this.connection.bind(event, this.connectionCallbacks[event]);
        }
        this.resetActivityCheck();
    }
    abandonConnection() {
        if (!this.connection) {
            return;
        }
        this.stopActivityCheck();
        for (var event in this.connectionCallbacks) {
            this.connection.unbind(event, this.connectionCallbacks[event]);
        }
        var connection = this.connection;
        this.connection = null;
        return connection;
    }
    updateState(newState, data) {
        var previousState = this.state;
        this.state = newState;
        if (previousState !== newState) {
            var newStateDescription = newState;
            if (newStateDescription === 'connected') {
                newStateDescription += ' with new socket ID ' + data.socket_id;
            }
            Logger$1.debug('State changed', previousState + ' -> ' + newStateDescription);
            this.timeline.info({ state: newState, params: data });
            this.emit('state_change', { previous: previousState, current: newState });
            this.emit(newState, data);
        }
    }
    shouldRetry() {
        return this.state === 'connecting' || this.state === 'connected';
    }
}

/** Handles a channel map. */
class Channels {
    channels;
    constructor() {
        this.channels = {};
    }
    /** Creates or retrieves an existing channel by its name.
     *
     * @param {String} name
     * @param {Pusher} pusher
     * @return {Channel}
     */
    add(name, pusher) {
        if (!this.channels[name]) {
            this.channels[name] = createChannel(name, pusher);
        }
        return this.channels[name];
    }
    /** Returns a list of all channels
     *
     * @return {Array}
     */
    all() {
        return values(this.channels);
    }
    /** Finds a channel by its name.
     *
     * @param {String} name
     * @return {Channel} channel or null if it doesn't exist
     */
    find(name) {
        return this.channels[name];
    }
    /** Removes a channel from the map.
     *
     * @param {String} name
     */
    remove(name) {
        var channel = this.channels[name];
        delete this.channels[name];
        return channel;
    }
    /** Proxies disconnection signal to all channels. */
    disconnect() {
        objectApply(this.channels, function (channel) {
            channel.disconnect();
        });
    }
}
function createChannel(name, pusher) {
    if (name.indexOf('private-encrypted-') === 0) {
        if (pusher.config.nacl) {
            return Factory.createEncryptedChannel(name, pusher, pusher.config.nacl);
        }
        let errMsg = 'Tried to subscribe to a private-encrypted- channel but no nacl implementation available';
        let suffix = urlStore$1.buildLogSuffix('encryptedChannelSupport');
        throw new UnsupportedFeature(`${errMsg}. ${suffix}`);
    }
    else if (name.indexOf('private-') === 0) {
        return Factory.createPrivateChannel(name, pusher);
    }
    else if (name.indexOf('presence-') === 0) {
        return Factory.createPresenceChannel(name, pusher);
    }
    else if (name.indexOf('#') === 0) {
        throw new BadChannelName('Cannot create a channel with name "' + name + '".');
    }
    else {
        return Factory.createChannel(name, pusher);
    }
}

var Factory = {
    createChannels() {
        return new Channels();
    },
    createConnectionManager(key, options) {
        return new ConnectionManager(key, options);
    },
    createChannel(name, pusher) {
        return new Channel(name, pusher);
    },
    createPrivateChannel(name, pusher) {
        return new PrivateChannel(name, pusher);
    },
    createPresenceChannel(name, pusher) {
        return new PresenceChannel(name, pusher);
    },
    createEncryptedChannel(name, pusher, nacl) {
        return new EncryptedChannel(name, pusher, nacl);
    },
    createTimelineSender(timeline, options) {
        return new TimelineSender(timeline, options);
    },
    createHandshake(transport, callback) {
        return new Handshake(transport, callback);
    },
    createAssistantToTheTransportManager(manager, transport, options) {
        return new AssistantToTheTransportManager(manager, transport, options);
    }
};

/** Keeps track of the number of lives left for a transport.
 *
 * In the beginning of a session, transports may be assigned a number of
 * lives. When an AssistantToTheTransportManager instance reports a transport
 * connection closed uncleanly, the transport loses a life. When the number
 * of lives drops to zero, the transport gets disabled by its manager.
 *
 * @param {Object} options
 */
class TransportManager {
    options;
    livesLeft;
    constructor(options) {
        this.options = options || {};
        this.livesLeft = this.options.lives || Infinity;
    }
    /** Creates a assistant for the transport.
     *
     * @param {Transport} transport
     * @returns {AssistantToTheTransportManager}
     */
    getAssistant(transport) {
        return Factory.createAssistantToTheTransportManager(this, transport, {
            minPingDelay: this.options.minPingDelay,
            maxPingDelay: this.options.maxPingDelay
        });
    }
    /** Returns whether the transport has any lives left.
     *
     * @returns {Boolean}
     */
    isAlive() {
        return this.livesLeft > 0;
    }
    /** Takes one life from the transport. */
    reportDeath() {
        this.livesLeft -= 1;
    }
}

/** Loops through strategies with optional timeouts.
 *
 * Options:
 * - loop - whether it should loop through the substrategy list
 * - timeout - initial timeout for a single substrategy
 * - timeoutLimit - maximum timeout
 *
 * @param {Strategy[]} strategies
 * @param {Object} options
 */
class SequentialStrategy {
    strategies;
    loop;
    failFast;
    timeout;
    timeoutLimit;
    constructor(strategies, options) {
        this.strategies = strategies;
        this.loop = Boolean(options.loop);
        this.failFast = Boolean(options.failFast);
        this.timeout = options.timeout;
        this.timeoutLimit = options.timeoutLimit;
    }
    isSupported() {
        return any(this.strategies, Util.method('isSupported'));
    }
    connect(minPriority, callback) {
        var strategies = this.strategies;
        var current = 0;
        var timeout = this.timeout;
        var runner = null;
        var tryNextStrategy = (error, handshake) => {
            if (handshake) {
                callback(null, handshake);
            }
            else {
                current = current + 1;
                if (this.loop) {
                    current = current % strategies.length;
                }
                if (current < strategies.length) {
                    if (timeout) {
                        timeout = timeout * 2;
                        if (this.timeoutLimit) {
                            timeout = Math.min(timeout, this.timeoutLimit);
                        }
                    }
                    runner = this.tryStrategy(strategies[current], minPriority, { timeout, failFast: this.failFast }, tryNextStrategy);
                }
                else {
                    callback(true);
                }
            }
        };
        runner = this.tryStrategy(strategies[current], minPriority, { timeout: timeout, failFast: this.failFast }, tryNextStrategy);
        return {
            abort: function () {
                runner.abort();
            },
            forceMinPriority: function (p) {
                minPriority = p;
                if (runner) {
                    runner.forceMinPriority(p);
                }
            }
        };
    }
    tryStrategy(strategy, minPriority, options, callback) {
        var timer = null;
        var runner = null;
        if (options.timeout > 0) {
            timer = new OneOffTimer(options.timeout, function () {
                runner.abort();
                callback(true);
            });
        }
        runner = strategy.connect(minPriority, function (error, handshake) {
            if (error && timer && timer.isRunning() && !options.failFast) {
                // advance to the next strategy after the timeout
                return;
            }
            if (timer) {
                timer.ensureAborted();
            }
            callback(error, handshake);
        });
        return {
            abort: function () {
                if (timer) {
                    timer.ensureAborted();
                }
                runner.abort();
            },
            forceMinPriority: function (p) {
                runner.forceMinPriority(p);
            }
        };
    }
}

/** Launches all substrategies and emits prioritized connected transports.
 *
 * @param {Array} strategies
 */
class BestConnectedEverStrategy {
    strategies;
    constructor(strategies) {
        this.strategies = strategies;
    }
    isSupported() {
        return any(this.strategies, Util.method('isSupported'));
    }
    connect(minPriority, callback) {
        return connect(this.strategies, minPriority, function (i, runners) {
            return function (error, handshake) {
                runners[i].error = error;
                if (error) {
                    if (allRunnersFailed(runners)) {
                        callback(true);
                    }
                    return;
                }
                apply(runners, function (runner) {
                    runner.forceMinPriority(handshake.transport.priority);
                });
                callback(null, handshake);
            };
        });
    }
}
/** Connects to all strategies in parallel.
 *
 * Callback builder should be a function that takes two arguments: index
 * and a list of runners. It should return another function that will be
 * passed to the substrategy with given index. Runners can be aborted using
 * abortRunner(s) functions from this class.
 *
 * @param  {Array} strategies
 * @param  {Function} callbackBuilder
 * @return {Object} strategy runner
 */
function connect(strategies, minPriority, callbackBuilder) {
    var runners = map(strategies, function (strategy, i, _, rs) {
        return strategy.connect(minPriority, callbackBuilder(i, rs));
    });
    return {
        abort: function () {
            apply(runners, abortRunner);
        },
        forceMinPriority: function (p) {
            apply(runners, function (runner) {
                runner.forceMinPriority(p);
            });
        }
    };
}
function allRunnersFailed(runners) {
    return all(runners, function (runner) {
        return Boolean(runner.error);
    });
}
function abortRunner(runner) {
    if (!runner.error && !runner.aborted) {
        runner.abort();
        runner.aborted = true;
    }
}

/** Caches the last successful transport and, after the first few attempts,
 *  uses the cached transport for subsequent attempts.
 *
 * @param {Strategy} strategy
 * @param {Object} transports
 * @param {Object} options
 */
class WebSocketPrioritizedCachedStrategy {
    strategy;
    transports;
    ttl;
    usingTLS;
    timeline;
    constructor(strategy, transports, options) {
        this.strategy = strategy;
        this.transports = transports;
        this.ttl = options.ttl || 1800 * 1000;
        this.usingTLS = options.useTLS;
        this.timeline = options.timeline;
    }
    isSupported() {
        return this.strategy.isSupported();
    }
    connect(minPriority, callback) {
        var usingTLS = this.usingTLS;
        var info = fetchTransportCache(usingTLS);
        var cacheSkipCount = info && info.cacheSkipCount ? info.cacheSkipCount : 0;
        var strategies = [this.strategy];
        if (info && info.timestamp + this.ttl >= Util.now()) {
            var transport = this.transports[info.transport];
            if (transport) {
                if (['ws', 'wss'].includes(info.transport) || cacheSkipCount > 3) {
                    this.timeline.info({
                        cached: true,
                        transport: info.transport,
                        latency: info.latency
                    });
                    strategies.push(new SequentialStrategy([transport], {
                        timeout: info.latency * 2 + 1000,
                        failFast: true
                    }));
                }
                else {
                    cacheSkipCount++;
                }
            }
        }
        var startTimestamp = Util.now();
        var runner = strategies
            .pop()
            .connect(minPriority, function cb(error, handshake) {
                if (error) {
                    flushTransportCache(usingTLS);
                    if (strategies.length > 0) {
                        startTimestamp = Util.now();
                        runner = strategies.pop().connect(minPriority, cb);
                    }
                    else {
                        callback(error);
                    }
                }
                else {
                    storeTransportCache(usingTLS, handshake.transport.name, Util.now() - startTimestamp, cacheSkipCount);
                    callback(null, handshake);
                }
            });
        return {
            abort: function () {
                runner.abort();
            },
            forceMinPriority: function (p) {
                minPriority = p;
                if (runner) {
                    runner.forceMinPriority(p);
                }
            }
        };
    }
}
function getTransportCacheKey(usingTLS) {
    return 'pusherTransport' + (usingTLS ? 'TLS' : 'NonTLS');
}
function fetchTransportCache(usingTLS) {
    var storage = Runtime$1.getLocalStorage();
    if (storage) {
        try {
            var serializedCache = storage[getTransportCacheKey(usingTLS)];
            if (serializedCache) {
                return JSON.parse(serializedCache);
            }
        }
        catch (e) {
            flushTransportCache(usingTLS);
        }
    }
    return null;
}
function storeTransportCache(usingTLS, transport, latency, cacheSkipCount) {
    var storage = Runtime$1.getLocalStorage();
    if (storage) {
        try {
            storage[getTransportCacheKey(usingTLS)] = safeJSONStringify({
                timestamp: Util.now(),
                transport: transport,
                latency: latency,
                cacheSkipCount: cacheSkipCount
            });
        }
        catch (e) {
            // catch over quota exceptions raised by localStorage
        }
    }
}
function flushTransportCache(usingTLS) {
    var storage = Runtime$1.getLocalStorage();
    if (storage) {
        try {
            delete storage[getTransportCacheKey(usingTLS)];
        }
        catch (e) {
            // catch exceptions raised by localStorage
        }
    }
}

/** Runs substrategy after specified delay.
 *
 * Options:
 * - delay - time in miliseconds to delay the substrategy attempt
 *
 * @param {Strategy} strategy
 * @param {Object} options
 */
class DelayedStrategy {
    strategy;
    options;
    constructor(strategy, { delay: number }) {
        this.strategy = strategy;
        this.options = { delay: number };
    }
    isSupported() {
        return this.strategy.isSupported();
    }
    connect(minPriority, callback) {
        var strategy = this.strategy;
        var runner;
        var timer = new OneOffTimer(this.options.delay, function () {
            runner = strategy.connect(minPriority, callback);
        });
        return {
            abort: function () {
                timer.ensureAborted();
                if (runner) {
                    runner.abort();
                }
            },
            forceMinPriority: function (p) {
                minPriority = p;
                if (runner) {
                    runner.forceMinPriority(p);
                }
            }
        };
    }
}

/** Proxies method calls to one of substrategies basing on the test function.
 *
 * @param {Function} test
 * @param {Strategy} trueBranch strategy used when test returns true
 * @param {Strategy} falseBranch strategy used when test returns false
 */
class IfStrategy {
    test;
    trueBranch;
    falseBranch;
    constructor(test, trueBranch, falseBranch) {
        this.test = test;
        this.trueBranch = trueBranch;
        this.falseBranch = falseBranch;
    }
    isSupported() {
        var branch = this.test() ? this.trueBranch : this.falseBranch;
        return branch.isSupported();
    }
    connect(minPriority, callback) {
        var branch = this.test() ? this.trueBranch : this.falseBranch;
        return branch.connect(minPriority, callback);
    }
}

/** Launches the substrategy and terminates on the first open connection.
 *
 * @param {Strategy} strategy
 */
class FirstConnectedStrategy {
    strategy;
    constructor(strategy) {
        this.strategy = strategy;
    }
    isSupported() {
        return this.strategy.isSupported();
    }
    connect(minPriority, callback) {
        var runner = this.strategy.connect(minPriority, function (error, handshake) {
            if (handshake) {
                runner.abort();
            }
            callback(error, handshake);
        });
        return runner;
    }
}

function testSupportsStrategy(strategy) {
    return function () {
        return strategy.isSupported();
    };
}
var getDefaultStrategy = function (config, baseOptions, defineTransport) {
    var definedTransports = {};
    function defineTransportStrategy(name, type, priority, options, manager) {
        var transport = defineTransport(config, name, type, priority, options, manager);
        definedTransports[name] = transport;
        return transport;
    }
    var ws_options = Object.assign({}, baseOptions, {
        hostNonTLS: config.wsHost + ':' + config.wsPort,
        hostTLS: config.wsHost + ':' + config.wssPort,
        httpPath: config.wsPath
    });
    var wss_options = Object.assign({}, ws_options, {
        useTLS: true
    });
    var sockjs_options = Object.assign({}, baseOptions, {
        hostNonTLS: config.httpHost + ':' + config.httpPort,
        hostTLS: config.httpHost + ':' + config.httpsPort,
        httpPath: config.httpPath
    });
    var timeouts = {
        loop: true,
        timeout: 15000,
        timeoutLimit: 60000
    };
    var ws_manager = new TransportManager({
        minPingDelay: 10000,
        maxPingDelay: config.activityTimeout
    });
    var streaming_manager = new TransportManager({
        lives: 2,
        minPingDelay: 10000,
        maxPingDelay: config.activityTimeout
    });
    var ws_transport = defineTransportStrategy('ws', 'ws', 3, ws_options, ws_manager);
    var wss_transport = defineTransportStrategy('wss', 'ws', 3, wss_options, ws_manager);
    var sockjs_transport = defineTransportStrategy('sockjs', 'sockjs', 1, sockjs_options);
    var xhr_streaming_transport = defineTransportStrategy('xhr_streaming', 'xhr_streaming', 1, sockjs_options, streaming_manager);
    var xdr_streaming_transport = defineTransportStrategy('xdr_streaming', 'xdr_streaming', 1, sockjs_options, streaming_manager);
    var xhr_polling_transport = defineTransportStrategy('xhr_polling', 'xhr_polling', 1, sockjs_options);
    var xdr_polling_transport = defineTransportStrategy('xdr_polling', 'xdr_polling', 1, sockjs_options);
    var ws_loop = new SequentialStrategy([ws_transport], timeouts);
    var wss_loop = new SequentialStrategy([wss_transport], timeouts);
    var sockjs_loop = new SequentialStrategy([sockjs_transport], timeouts);
    var streaming_loop = new SequentialStrategy([
        new IfStrategy(testSupportsStrategy(xhr_streaming_transport), xhr_streaming_transport, xdr_streaming_transport)
    ], timeouts);
    var polling_loop = new SequentialStrategy([
        new IfStrategy(testSupportsStrategy(xhr_polling_transport), xhr_polling_transport, xdr_polling_transport)
    ], timeouts);
    var http_loop = new SequentialStrategy([
        new IfStrategy(testSupportsStrategy(streaming_loop), new BestConnectedEverStrategy([
            streaming_loop,
            new DelayedStrategy(polling_loop, { delay: 4000 })
        ]), polling_loop)
    ], timeouts);
    var http_fallback_loop = new IfStrategy(testSupportsStrategy(http_loop), http_loop, sockjs_loop);
    var wsStrategy;
    if (baseOptions.useTLS) {
        wsStrategy = new BestConnectedEverStrategy([
            ws_loop,
            new DelayedStrategy(http_fallback_loop, { delay: 2000 })
        ]);
    }
    else {
        wsStrategy = new BestConnectedEverStrategy([
            ws_loop,
            new DelayedStrategy(wss_loop, { delay: 2000 }),
            new DelayedStrategy(http_fallback_loop, { delay: 5000 })
        ]);
    }
    return new WebSocketPrioritizedCachedStrategy(new FirstConnectedStrategy(new IfStrategy(testSupportsStrategy(ws_transport), wsStrategy, http_fallback_loop)), definedTransports, {
        ttl: 1800000,
        timeline: baseOptions.timeline,
        useTLS: baseOptions.useTLS
    });
};

/** Initializes the transport.
 *
 * Fetches resources if needed and then transitions to initialized.
 */
function transportConnectionInitializer() {
    var self = this;
    self.timeline.info(self.buildTimelineMessage({
        transport: self.name + (self.options.useTLS ? 's' : '')
    }));
    if (self.hooks.isInitialized()) {
        self.changeState('initialized');
    }
    else if (self.hooks.file) {
        self.changeState('initializing');
        Dependencies.load(self.hooks.file, { useTLS: self.options.useTLS }, function (error, callback) {
            if (self.hooks.isInitialized()) {
                self.changeState('initialized');
                callback(true);
            }
            else {
                if (error) {
                    self.onError(error);
                }
                self.onClose();
                callback(false);
            }
        });
    }
    else {
        self.onClose();
    }
}

var hooks$3 = {
    getRequest: function (socket) {
        var xdr = new window.XDomainRequest();
        xdr.ontimeout = function () {
            socket.emit('error', new RequestTimedOut());
            socket.close();
        };
        xdr.onerror = function (e) {
            socket.emit('error', e);
            socket.close();
        };
        xdr.onprogress = function () {
            if (xdr.responseText && xdr.responseText.length > 0) {
                socket.onChunk(200, xdr.responseText);
            }
        };
        xdr.onload = function () {
            if (xdr.responseText && xdr.responseText.length > 0) {
                socket.onChunk(200, xdr.responseText);
            }
            socket.emit('finished', 200);
            socket.close();
        };
        return xdr;
    },
    abortRequest: function (xdr) {
        xdr.ontimeout = xdr.onerror = xdr.onprogress = xdr.onload = null;
        xdr.abort();
    }
};

const MAX_BUFFER_LENGTH = 256 * 1024;
class HTTPRequest extends Dispatcher {
    hooks;
    method;
    url;
    position;
    xhr;
    unloader;
    constructor(hooks, method, url) {
        super();
        this.hooks = hooks;
        this.method = method;
        this.url = url;
    }
    start(payload) {
        this.position = 0;
        this.xhr = this.hooks.getRequest(this);
        this.unloader = () => {
            this.close();
        };
        Runtime$1.addUnloadListener(this.unloader);
        this.xhr.open(this.method, this.url, true);
        if (this.xhr.setRequestHeader) {
            this.xhr.setRequestHeader('Content-Type', 'application/json'); // ReactNative doesn't set this header by default.
        }
        this.xhr.send(payload);
    }
    close() {
        if (this.unloader) {
            Runtime$1.removeUnloadListener(this.unloader);
            this.unloader = null;
        }
        if (this.xhr) {
            this.hooks.abortRequest(this.xhr);
            this.xhr = null;
        }
    }
    onChunk(status, data) {
        while (true) {
            var chunk = this.advanceBuffer(data);
            if (chunk) {
                this.emit('chunk', { status: status, data: chunk });
            }
            else {
                break;
            }
        }
        if (this.isBufferTooLong(data)) {
            this.emit('buffer_too_long');
        }
    }
    advanceBuffer(buffer) {
        var unreadData = buffer.slice(this.position);
        var endOfLinePosition = unreadData.indexOf('\n');
        if (endOfLinePosition !== -1) {
            this.position += endOfLinePosition + 1;
            return unreadData.slice(0, endOfLinePosition);
        }
        else {
            // chunk is not finished yet, don't move the buffer pointer
            return null;
        }
    }
    isBufferTooLong(buffer) {
        return this.position === buffer.length && buffer.length > MAX_BUFFER_LENGTH;
    }
}

var State;
(function (State) {
    State[State["CONNECTING"] = 0] = "CONNECTING";
    State[State["OPEN"] = 1] = "OPEN";
    State[State["CLOSED"] = 3] = "CLOSED";
})(State || (State = {}));
var State$1 = State;

var autoIncrement = 1;
class HTTPSocket {
    hooks;
    session;
    location;
    readyState;
    stream;
    onopen;
    onerror;
    onclose;
    onmessage;
    onactivity;
    constructor(hooks, url) {
        this.hooks = hooks;
        this.session = randomNumber(1000) + '/' + randomString(8);
        this.location = getLocation(url);
        this.readyState = State$1.CONNECTING;
        this.openStream();
    }
    send(payload) {
        return this.sendRaw(JSON.stringify([payload]));
    }
    ping() {
        this.hooks.sendHeartbeat(this);
    }
    close(code, reason) {
        this.onClose(code, reason, true);
    }
    /** For internal use only */
    sendRaw(payload) {
        if (this.readyState === State$1.OPEN) {
            try {
                Runtime$1.createSocketRequest('POST', getUniqueURL(getSendURL(this.location, this.session))).start(payload);
                return true;
            }
            catch (e) {
                return false;
            }
        }
        else {
            return false;
        }
    }
    /** For internal use only */
    reconnect() {
        this.closeStream();
        this.openStream();
    }
    /** For internal use only */
    onClose(code, reason, wasClean) {
        this.closeStream();
        this.readyState = State$1.CLOSED;
        if (this.onclose) {
            this.onclose({
                code: code,
                reason: reason,
                wasClean: wasClean
            });
        }
    }
    onChunk(chunk) {
        if (chunk.status !== 200) {
            return;
        }
        if (this.readyState === State$1.OPEN) {
            this.onActivity();
        }
        var payload;
        var type = chunk.data.slice(0, 1);
        switch (type) {
            case 'o':
                payload = JSON.parse(chunk.data.slice(1) || '{}');
                this.onOpen(payload);
                break;
            case 'a':
                payload = JSON.parse(chunk.data.slice(1) || '[]');
                for (var i = 0; i < payload.length; i++) {
                    this.onEvent(payload[i]);
                }
                break;
            case 'm':
                payload = JSON.parse(chunk.data.slice(1) || 'null');
                this.onEvent(payload);
                break;
            case 'h':
                this.hooks.onHeartbeat(this);
                break;
            case 'c':
                payload = JSON.parse(chunk.data.slice(1) || '[]');
                this.onClose(payload[0], payload[1], true);
                break;
        }
    }
    onOpen(options) {
        if (this.readyState === State$1.CONNECTING) {
            if (options && options.hostname) {
                this.location.base = replaceHost(this.location.base, options.hostname);
            }
            this.readyState = State$1.OPEN;
            if (this.onopen) {
                this.onopen();
            }
        }
        else {
            this.onClose(1006, 'Server lost session', true);
        }
    }
    onEvent(event) {
        if (this.readyState === State$1.OPEN && this.onmessage) {
            this.onmessage({ data: event });
        }
    }
    onActivity() {
        if (this.onactivity) {
            this.onactivity();
        }
    }
    onError(error) {
        if (this.onerror) {
            this.onerror(error);
        }
    }
    openStream() {
        this.stream = Runtime$1.createSocketRequest('POST', getUniqueURL(this.hooks.getReceiveURL(this.location, this.session)));
        this.stream.bind('chunk', chunk => {
            this.onChunk(chunk);
        });
        this.stream.bind('finished', status => {
            this.hooks.onFinished(this, status);
        });
        this.stream.bind('buffer_too_long', () => {
            this.reconnect();
        });
        try {
            this.stream.start();
        }
        catch (error) {
            Util.defer(() => {
                this.onError(error);
                this.onClose(1006, 'Could not start streaming', false);
            });
        }
    }
    closeStream() {
        if (this.stream) {
            this.stream.unbind_all();
            this.stream.close();
            this.stream = null;
        }
    }
}
function getLocation(url) {
    var parts = /([^\?]*)\/*(\??.*)/.exec(url);
    return {
        base: parts[1],
        queryString: parts[2]
    };
}
function getSendURL(url, session) {
    return url.base + '/' + session + '/xhr_send';
}
function getUniqueURL(url) {
    var separator = url.indexOf('?') === -1 ? '?' : '&';
    return url + separator + 't=' + +new Date() + '&n=' + autoIncrement++;
}
function replaceHost(url, hostname) {
    var urlParts = /(https?:\/\/)([^\/:]+)((\/|:)?.*)/.exec(url);
    return urlParts[1] + hostname + urlParts[3];
}
function randomNumber(max) {
    return Runtime$1.randomInt(max);
}
function randomString(length) {
    var result = [];
    for (var i = 0; i < length; i++) {
        result.push(randomNumber(32).toString(32));
    }
    return result.join('');
}

var hooks$2 = {
    getReceiveURL: function (url, session) {
        return url.base + '/' + session + '/xhr_streaming' + url.queryString;
    },
    onHeartbeat: function (socket) {
        socket.sendRaw('[]');
    },
    sendHeartbeat: function (socket) {
        socket.sendRaw('[]');
    },
    onFinished: function (socket, status) {
        socket.onClose(1006, 'Connection interrupted (' + status + ')', false);
    }
};

var hooks$1 = {
    getReceiveURL: function (url, session) {
        return url.base + '/' + session + '/xhr' + url.queryString;
    },
    onHeartbeat: function () {
        // next HTTP request will reset server's activity timer
    },
    sendHeartbeat: function (socket) {
        socket.sendRaw('[]');
    },
    onFinished: function (socket, status) {
        if (status === 200) {
            socket.reconnect();
        }
        else {
            socket.onClose(1006, 'Connection interrupted (' + status + ')', false);
        }
    }
};

var hooks = {
    getRequest: function (socket) {
        var Constructor = Runtime$1.getXHRAPI();
        var xhr = new Constructor();
        xhr.onreadystatechange = xhr.onprogress = function () {
            switch (xhr.readyState) {
                case 3:
                    if (xhr.responseText && xhr.responseText.length > 0) {
                        socket.onChunk(xhr.status, xhr.responseText);
                    }
                    break;
                case 4:
                    // this happens only on errors, never after calling close
                    if (xhr.responseText && xhr.responseText.length > 0) {
                        socket.onChunk(xhr.status, xhr.responseText);
                    }
                    socket.emit('finished', xhr.status);
                    socket.close();
                    break;
            }
        };
        return xhr;
    },
    abortRequest: function (xhr) {
        xhr.onreadystatechange = null;
        xhr.abort();
    }
};

var HTTP = {
    createStreamingSocket(url) {
        return this.createSocket(hooks$2, url);
    },
    createPollingSocket(url) {
        return this.createSocket(hooks$1, url);
    },
    createSocket(hooks, url) {
        return new HTTPSocket(hooks, url);
    },
    createXHR(method, url) {
        return this.createRequest(hooks, method, url);
    },
    createRequest(hooks, method, url) {
        return new HTTPRequest(hooks, method, url);
    }
};

HTTP.createXDR = function (method, url) {
    return this.createRequest(hooks$3, method, url);
};

var Runtime = {
    // for jsonp auth
    nextAuthCallbackID: 1,
    auth_callbacks: {},
    ScriptReceivers,
    DependenciesReceivers,
    getDefaultStrategy,
    Transports: Transports$1,
    transportConnectionInitializer,
    HTTPFactory: HTTP,
    TimelineTransport: jsonp,
    getXHRAPI() {
        return window.XMLHttpRequest;
    },
    getWebSocketAPI() {
        return window.WebSocket || window.MozWebSocket;
    },
    setup(PusherClass) {
        window.Pusher = PusherClass; // JSONp requires Pusher to be in the window scope.
        var initializeOnDocumentBody = () => {
            this.onDocumentBody(PusherClass.ready);
        };
        if (!window.JSON) {
            Dependencies.load('json2', {}, initializeOnDocumentBody);
        }
        else {
            initializeOnDocumentBody();
        }
    },
    getDocument() {
        return document;
    },
    getProtocol() {
        return this.getDocument().location.protocol;
    },
    getAuthorizers() {
        return { ajax: ajax, jsonp: jsonp$1 };
    },
    onDocumentBody(callback) {
        if (document.body) {
            callback();
        }
        else {
            setTimeout(() => {
                this.onDocumentBody(callback);
            }, 0);
        }
    },
    createJSONPRequest(url, data) {
        return new JSONPRequest(url, data);
    },
    createScriptRequest(src) {
        return new ScriptRequest(src);
    },
    getLocalStorage() {
        try {
            return window.localStorage;
        }
        catch (e) {
            return undefined;
        }
    },
    createXHR() {
        if (this.getXHRAPI()) {
            return this.createXMLHttpRequest();
        }
        else {
            return this.createMicrosoftXHR();
        }
    },
    createXMLHttpRequest() {
        var Constructor = this.getXHRAPI();
        return new Constructor();
    },
    createMicrosoftXHR() {
        return new ActiveXObject('Microsoft.XMLHTTP');
    },
    getNetwork() {
        return Network;
    },
    createWebSocket(url) {
        var Constructor = this.getWebSocketAPI();
        return new Constructor(url);
    },
    createSocketRequest(method, url) {
        if (this.isXHRSupported()) {
            return this.HTTPFactory.createXHR(method, url);
        }
        else if (this.isXDRSupported(url.indexOf('https:') === 0)) {
            return this.HTTPFactory.createXDR(method, url);
        }
        else {
            throw 'Cross-origin HTTP requests are not supported';
        }
    },
    isXHRSupported() {
        var Constructor = this.getXHRAPI();
        return (Boolean(Constructor) && new Constructor().withCredentials !== undefined);
    },
    isXDRSupported(useTLS) {
        var protocol = useTLS ? 'https:' : 'http:';
        var documentProtocol = this.getProtocol();
        return (Boolean(window['XDomainRequest']) && documentProtocol === protocol);
    },
    addUnloadListener(listener) {
        if (window.addEventListener !== undefined) {
            window.addEventListener('unload', listener, false);
        }
        else if (window.attachEvent !== undefined) {
            window.attachEvent('onunload', listener);
        }
    },
    removeUnloadListener(listener) {
        if (window.addEventListener !== undefined) {
            window.removeEventListener('unload', listener, false);
        }
        else if (window.detachEvent !== undefined) {
            window.detachEvent('onunload', listener);
        }
    },
    randomInt(max) {
        /**
         * Return values in the range of [0, 1[
         */
        const random = function () {
            const crypto = window.crypto || window['msCrypto'];
            const random = crypto.getRandomValues(new Uint32Array(1))[0];
            return random / 2 ** 32;
        };
        return Math.floor(random() * max);
    }
};
var Runtime$1 = Runtime;

var TimelineLevel;
(function (TimelineLevel) {
    TimelineLevel[TimelineLevel["ERROR"] = 3] = "ERROR";
    TimelineLevel[TimelineLevel["INFO"] = 6] = "INFO";
    TimelineLevel[TimelineLevel["DEBUG"] = 7] = "DEBUG";
})(TimelineLevel || (TimelineLevel = {}));
var TimelineLevel$1 = TimelineLevel;

class Timeline {
    key;
    session;
    events;
    options;
    sent;
    uniqueID;
    constructor(key, session, options) {
        this.key = key;
        this.session = session;
        this.events = [];
        this.options = options || {};
        this.sent = 0;
        this.uniqueID = 0;
    }
    log(level, event) {
        if (level <= this.options.level) {
            this.events.push(extend({}, event, { timestamp: Util.now() }));
            if (this.options.limit && this.events.length > this.options.limit) {
                this.events.shift();
            }
        }
    }
    error(event) {
        this.log(TimelineLevel$1.ERROR, event);
    }
    info(event) {
        this.log(TimelineLevel$1.INFO, event);
    }
    debug(event) {
        this.log(TimelineLevel$1.DEBUG, event);
    }
    isEmpty() {
        return this.events.length === 0;
    }
    send(sendfn, callback) {
        var data = extend({
            session: this.session,
            bundle: this.sent + 1,
            key: this.key,
            lib: 'js',
            version: this.options.version,
            cluster: this.options.cluster,
            features: this.options.features,
            timeline: this.events
        }, this.options.params);
        this.events = [];
        sendfn(data, (error, result) => {
            if (!error) {
                this.sent++;
            }
            if (callback) {
                callback(error, result);
            }
        });
        return true;
    }
    generateUniqueID() {
        this.uniqueID++;
        return this.uniqueID;
    }
}

/** Provides a strategy interface for transports.
 *
 * @param {String} name
 * @param {Number} priority
 * @param {Class} transport
 * @param {Object} options
 */
class TransportStrategy {
    name;
    priority;
    transport;
    options;
    constructor(name, priority, transport, options) {
        this.name = name;
        this.priority = priority;
        this.transport = transport;
        this.options = options || {};
    }
    /** Returns whether the transport is supported in the browser.
     *
     * @returns {Boolean}
     */
    isSupported() {
        return this.transport.isSupported({
            useTLS: this.options.useTLS
        });
    }
    /** Launches a connection attempt and returns a strategy runner.
     *
     * @param  {Function} callback
     * @return {Object} strategy runner
     */
    connect(minPriority, callback) {
        if (!this.isSupported()) {
            return failAttempt(new UnsupportedStrategy$1(), callback);
        }
        else if (this.priority < minPriority) {
            return failAttempt(new TransportPriorityTooLow(), callback);
        }
        var connected = false;
        var transport = this.transport.createConnection(this.name, this.priority, this.options.key, this.options);
        var handshake = null;
        var onInitialized = function () {
            transport.unbind('initialized', onInitialized);
            transport.connect();
        };
        var onOpen = function () {
            handshake = Factory.createHandshake(transport, function (result) {
                connected = true;
                unbindListeners();
                callback(null, result);
            });
        };
        var onError = function (error) {
            unbindListeners();
            callback(error);
        };
        var onClosed = function () {
            unbindListeners();
            var serializedTransport;
            // The reason for this try/catch block is that on React Native
            // the WebSocket object is circular. Therefore transport.socket will
            // throw errors upon stringification. Collections.safeJSONStringify
            // discards circular references when serializing.
            serializedTransport = safeJSONStringify(transport);
            callback(new TransportClosed(serializedTransport));
        };
        var unbindListeners = function () {
            transport.unbind('initialized', onInitialized);
            transport.unbind('open', onOpen);
            transport.unbind('error', onError);
            transport.unbind('closed', onClosed);
        };
        transport.bind('initialized', onInitialized);
        transport.bind('open', onOpen);
        transport.bind('error', onError);
        transport.bind('closed', onClosed);
        // connect will be called automatically after initialization
        transport.initialize();
        return {
            abort: () => {
                if (connected) {
                    return;
                }
                unbindListeners();
                if (handshake) {
                    handshake.close();
                }
                else {
                    transport.close();
                }
            },
            forceMinPriority: p => {
                if (connected) {
                    return;
                }
                if (this.priority < p) {
                    if (handshake) {
                        handshake.close();
                    }
                    else {
                        transport.close();
                    }
                }
            }
        };
    }
}
function failAttempt(error, callback) {
    Util.defer(function () {
        callback(error);
    });
    return {
        abort: function () { },
        forceMinPriority: function () { }
    };
}

const { Transports } = Runtime$1;
var defineTransport = function (config, name, type, priority, options, manager) {
    var transportClass = Transports[type];
    if (!transportClass) {
        throw new UnsupportedTransport(type);
    }
    var enabled = (!config.enabledTransports ||
        arrayIndexOf(config.enabledTransports, name) !== -1) &&
        (!config.disabledTransports ||
            arrayIndexOf(config.disabledTransports, name) === -1);
    var transport;
    if (enabled) {
        options = Object.assign({ ignoreNullOrigin: config.ignoreNullOrigin }, options);
        transport = new TransportStrategy(name, priority, manager ? manager.getAssistant(transportClass) : transportClass, options);
    }
    else {
        transport = UnsupportedStrategy;
    }
    return transport;
};
var UnsupportedStrategy = {
    isSupported: function () {
        return false;
    },
    connect: function (_, callback) {
        var deferred = Util.defer(function () {
            callback(new UnsupportedStrategy$1());
        });
        return {
            abort: function () {
                deferred.ensureAborted();
            },
            forceMinPriority: function () { }
        };
    }
};

function validateOptions(options) {
    if (options == null) {
        throw 'You must pass an options object';
    }
    if (options.cluster == null) {
        throw 'Options object must provide a cluster';
    }
    if ('disableStats' in options) {
        Logger$1.warn('The disableStats option is deprecated in favor of enableStats');
    }
}

const composeChannelQuery$1 = (params, authOptions) => {
    var query = 'socket_id=' + encodeURIComponent(params.socketId);
    for (var key in authOptions.params) {
        query +=
            '&' +
            encodeURIComponent(key) +
            '=' +
            encodeURIComponent(authOptions.params[key]);
    }
    if (authOptions.paramsProvider != null) {
        let dynamicParams = authOptions.paramsProvider();
        for (var key in dynamicParams) {
            query +=
                '&' +
                encodeURIComponent(key) +
                '=' +
                encodeURIComponent(dynamicParams[key]);
        }
    }
    return query;
};
const UserAuthenticator = (authOptions) => {
    if (typeof Runtime$1.getAuthorizers()[authOptions.transport] === 'undefined') {
        throw `'${authOptions.transport}' is not a recognized auth transport`;
    }
    return (params, callback) => {
        const query = composeChannelQuery$1(params, authOptions);
        Runtime$1.getAuthorizers()[authOptions.transport](Runtime$1, query, authOptions, AuthRequestType.UserAuthentication, callback);
    };
};

const composeChannelQuery = (params, authOptions) => {
    var query = 'socket_id=' + encodeURIComponent(params.socketId);
    query += '&channel_name=' + encodeURIComponent(params.channelName);
    for (var key in authOptions.params) {
        query +=
            '&' +
            encodeURIComponent(key) +
            '=' +
            encodeURIComponent(authOptions.params[key]);
    }
    if (authOptions.paramsProvider != null) {
        let dynamicParams = authOptions.paramsProvider();
        for (var key in dynamicParams) {
            query +=
                '&' +
                encodeURIComponent(key) +
                '=' +
                encodeURIComponent(dynamicParams[key]);
        }
    }
    return query;
};
const ChannelAuthorizer = (authOptions) => {
    if (typeof Runtime$1.getAuthorizers()[authOptions.transport] === 'undefined') {
        throw `'${authOptions.transport}' is not a recognized auth transport`;
    }
    return (params, callback) => {
        const query = composeChannelQuery(params, authOptions);
        Runtime$1.getAuthorizers()[authOptions.transport](Runtime$1, query, authOptions, AuthRequestType.ChannelAuthorization, callback);
    };
};

const ChannelAuthorizerProxy = (pusher, authOptions, channelAuthorizerGenerator) => {
    const deprecatedAuthorizerOptions = {
        authTransport: authOptions.transport,
        authEndpoint: authOptions.endpoint,
        auth: {
            params: authOptions.params,
            headers: authOptions.headers
        }
    };
    return (params, callback) => {
        const channel = pusher.channel(params.channelName);
        // This line creates a new channel authorizer every time.
        // In the past, this was only done once per channel and reused.
        // We can do that again if we want to keep this behavior intact.
        const channelAuthorizer = channelAuthorizerGenerator(channel, deprecatedAuthorizerOptions);
        channelAuthorizer.authorize(params.socketId, callback);
    };
};

// getConfig mainly sets the defaults for the options that are not provided
function getConfig(opts, pusher) {
    let config = {
        activityTimeout: opts.activityTimeout || Defaults.activityTimeout,
        cluster: opts.cluster,
        httpPath: opts.httpPath || Defaults.httpPath,
        httpPort: opts.httpPort || Defaults.httpPort,
        httpsPort: opts.httpsPort || Defaults.httpsPort,
        pongTimeout: opts.pongTimeout || Defaults.pongTimeout,
        statsHost: opts.statsHost || Defaults.stats_host,
        unavailableTimeout: opts.unavailableTimeout || Defaults.unavailableTimeout,
        wsPath: opts.wsPath || Defaults.wsPath,
        wsPort: opts.wsPort || Defaults.wsPort,
        wssPort: opts.wssPort || Defaults.wssPort,
        enableStats: getEnableStatsConfig(opts),
        httpHost: getHttpHost(opts),
        useTLS: shouldUseTLS(opts),
        wsHost: getWebsocketHost(opts),
        userAuthenticator: buildUserAuthenticator(opts),
        channelAuthorizer: buildChannelAuthorizer(opts, pusher)
    };
    if ('disabledTransports' in opts)
        config.disabledTransports = opts.disabledTransports;
    if ('enabledTransports' in opts)
        config.enabledTransports = opts.enabledTransports;
    if ('ignoreNullOrigin' in opts)
        config.ignoreNullOrigin = opts.ignoreNullOrigin;
    if ('timelineParams' in opts)
        config.timelineParams = opts.timelineParams;
    if ('nacl' in opts) {
        config.nacl = opts.nacl;
    }
    return config;
}
function getHttpHost(opts) {
    if (opts.httpHost) {
        return opts.httpHost;
    }
    if (opts.cluster) {
        return `sockjs-${opts.cluster}.pusher.com`;
    }
    return Defaults.httpHost;
}
function getWebsocketHost(opts) {
    if (opts.wsHost) {
        return opts.wsHost;
    }
    return getWebsocketHostFromCluster(opts.cluster);
}
function getWebsocketHostFromCluster(cluster) {
    return `ws-${cluster}.pusher.com`;
}
function shouldUseTLS(opts) {
    if (Runtime$1.getProtocol() === 'https:') {
        return true;
    }
    else if (opts.forceTLS === false) {
        return false;
    }
    return true;
}
// if enableStats is set take the value
// if disableStats is set take the inverse
// otherwise default to false
function getEnableStatsConfig(opts) {
    if ('enableStats' in opts) {
        return opts.enableStats;
    }
    if ('disableStats' in opts) {
        return !opts.disableStats;
    }
    return false;
}
function buildUserAuthenticator(opts) {
    const userAuthentication = {
        ...Defaults.userAuthentication,
        ...opts.userAuthentication
    };
    if ('customHandler' in userAuthentication &&
        userAuthentication['customHandler'] != null) {
        return userAuthentication['customHandler'];
    }
    return UserAuthenticator(userAuthentication);
}
function buildChannelAuth(opts, pusher) {
    let channelAuthorization;
    if ('channelAuthorization' in opts) {
        channelAuthorization = {
            ...Defaults.channelAuthorization,
            ...opts.channelAuthorization
        };
    }
    else {
        channelAuthorization = {
            transport: opts.authTransport || Defaults.authTransport,
            endpoint: opts.authEndpoint || Defaults.authEndpoint
        };
        if ('auth' in opts) {
            if ('params' in opts.auth)
                channelAuthorization.params = opts.auth.params;
            if ('headers' in opts.auth)
                channelAuthorization.headers = opts.auth.headers;
        }
        if ('authorizer' in opts)
            channelAuthorization.customHandler = ChannelAuthorizerProxy(pusher, channelAuthorization, opts.authorizer);
    }
    return channelAuthorization;
}
function buildChannelAuthorizer(opts, pusher) {
    const channelAuthorization = buildChannelAuth(opts, pusher);
    if ('customHandler' in channelAuthorization &&
        channelAuthorization['customHandler'] != null) {
        return channelAuthorization['customHandler'];
    }
    return ChannelAuthorizer(channelAuthorization);
}

class WatchlistFacade extends Dispatcher {
    pusher;
    constructor(pusher) {
        super(function (eventName, data) {
            Logger$1.debug(`No callbacks on watchlist events for ${eventName}`);
        });
        this.pusher = pusher;
        this.bindWatchlistInternalEvent();
    }
    handleEvent(pusherEvent) {
        pusherEvent.data.events.forEach(watchlistEvent => {
            this.emit(watchlistEvent.name, watchlistEvent);
        });
    }
    bindWatchlistInternalEvent() {
        this.pusher.connection.bind('message', pusherEvent => {
            var eventName = pusherEvent.event;
            if (eventName === 'pusher_internal:watchlist_events') {
                this.handleEvent(pusherEvent);
            }
        });
    }
}

function flatPromise() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

class UserFacade extends Dispatcher {
    pusher;
    signin_requested = false;
    user_data = null;
    serverToUserChannel = null;
    signinDonePromise = null;
    watchlist;
    _signinDoneResolve = null;
    constructor(pusher) {
        super(function (eventName, data) {
            Logger$1.debug('No callbacks on user for ' + eventName);
        });
        this.pusher = pusher;
        this.pusher.connection.bind('state_change', ({ previous, current }) => {
            if (previous !== 'connected' && current === 'connected') {
                this._signin();
            }
            if (previous === 'connected' && current !== 'connected') {
                this._cleanup();
                this._newSigninPromiseIfNeeded();
            }
        });
        this.watchlist = new WatchlistFacade(pusher);
        this.pusher.connection.bind('message', event => {
            var eventName = event.event;
            if (eventName === 'pusher:signin_success') {
                this._onSigninSuccess(event.data);
            }
            if (this.serverToUserChannel &&
                this.serverToUserChannel.name === event.channel) {
                this.serverToUserChannel.handleEvent(event);
            }
        });
    }
    signin() {
        if (this.signin_requested) {
            return;
        }
        this.signin_requested = true;
        this._signin();
    }
    _signin() {
        if (!this.signin_requested) {
            return;
        }
        this._newSigninPromiseIfNeeded();
        if (this.pusher.connection.state !== 'connected') {
            // Signin will be attempted when the connection is connected
            return;
        }
        this.pusher.config.userAuthenticator({
            socketId: this.pusher.connection.socket_id
        }, this._onAuthorize);
    }
    _onAuthorize = (err, authData) => {
        if (err) {
            Logger$1.warn(`Error during signin: ${err}`);
            this._cleanup();
            return;
        }
        this.pusher.send_event('pusher:signin', {
            auth: authData.auth,
            user_data: authData.user_data
        });
        // Later when we get pusher:singin_success event, the user will be marked as signed in
    };
    _onSigninSuccess(data) {
        try {
            this.user_data = JSON.parse(data.user_data);
        }
        catch (e) {
            Logger$1.error(`Failed parsing user data after signin: ${data.user_data}`);
            this._cleanup();
            return;
        }
        if (typeof this.user_data.id !== 'string' || this.user_data.id === '') {
            Logger$1.error(`user_data doesn't contain an id. user_data: ${this.user_data}`);
            this._cleanup();
            return;
        }
        // Signin succeeded
        this._signinDoneResolve();
        this._subscribeChannels();
    }
    _subscribeChannels() {
        const ensure_subscribed = channel => {
            if (channel.subscriptionPending && channel.subscriptionCancelled) {
                channel.reinstateSubscription();
            }
            else if (!channel.subscriptionPending &&
                this.pusher.connection.state === 'connected') {
                channel.subscribe();
            }
        };
        this.serverToUserChannel = new Channel(`#server-to-user-${this.user_data.id}`, this.pusher);
        this.serverToUserChannel.bind_global((eventName, data) => {
            if (eventName.indexOf('pusher_internal:') === 0 ||
                eventName.indexOf('pusher:') === 0) {
                // ignore internal events
                return;
            }
            this.emit(eventName, data);
        });
        ensure_subscribed(this.serverToUserChannel);
    }
    _cleanup() {
        this.user_data = null;
        if (this.serverToUserChannel) {
            this.serverToUserChannel.unbind_all();
            this.serverToUserChannel.disconnect();
            this.serverToUserChannel = null;
        }
        if (this.signin_requested) {
            // If signin is in progress and cleanup is called,
            // Mark the current signin process as done.
            this._signinDoneResolve();
        }
    }
    _newSigninPromiseIfNeeded() {
        if (!this.signin_requested) {
            return;
        }
        // If there is a promise and it is not resolved, return without creating a new one.
        if (this.signinDonePromise && !this.signinDonePromise.done) {
            return;
        }
        // This promise is never rejected.
        // It gets resolved when the signin process is done whether it failed or succeeded
        const { promise, resolve, reject: _ } = flatPromise();
        promise.done = false;
        const setDone = () => {
            promise.done = true;
        };
        promise.then(setDone).catch(setDone);
        this.signinDonePromise = promise;
        this._signinDoneResolve = resolve;
    }
}

class Pusher {
    /*  STATIC PROPERTIES */
    static instances = [];
    static isReady = false;
    static logToConsole = false;
    // for jsonp
    static Runtime = Runtime$1;
    static ScriptReceivers = Runtime$1.ScriptReceivers;
    static DependenciesReceivers = Runtime$1.DependenciesReceivers;
    static auth_callbacks = Runtime$1.auth_callbacks;
    static ready() {
        Pusher.isReady = true;
        for (var i = 0, l = Pusher.instances.length; i < l; i++) {
            Pusher.instances[i].connect();
        }
    }
    static log;
    static getClientFeatures() {
        return keys(filterObject({ ws: Runtime$1.Transports.ws }, function (t) {
            return t.isSupported({});
        }));
    }
    /* INSTANCE PROPERTIES */
    key;
    config;
    channels;
    global_emitter;
    sessionID;
    timeline;
    timelineSender;
    connection;
    timelineSenderTimer;
    user;
    constructor(app_key, options) {
        checkAppKey(app_key);
        validateOptions(options);
        this.key = app_key;
        this.config = getConfig(options, this);
        this.channels = Factory.createChannels();
        this.global_emitter = new Dispatcher();
        this.sessionID = Runtime$1.randomInt(1000000000);
        this.timeline = new Timeline(this.key, this.sessionID, {
            cluster: this.config.cluster,
            features: Pusher.getClientFeatures(),
            params: this.config.timelineParams || {},
            limit: 50,
            level: TimelineLevel$1.INFO,
            version: Defaults.VERSION
        });
        if (this.config.enableStats) {
            this.timelineSender = Factory.createTimelineSender(this.timeline, {
                host: this.config.statsHost,
                path: '/timeline/v2/' + Runtime$1.TimelineTransport.name
            });
        }
        var getStrategy = (options) => {
            return Runtime$1.getDefaultStrategy(this.config, options, defineTransport);
        };
        this.connection = Factory.createConnectionManager(this.key, {
            getStrategy: getStrategy,
            timeline: this.timeline,
            activityTimeout: this.config.activityTimeout,
            pongTimeout: this.config.pongTimeout,
            unavailableTimeout: this.config.unavailableTimeout,
            useTLS: Boolean(this.config.useTLS)
        });
        this.connection.bind('connected', () => {
            this.subscribeAll();
            if (this.timelineSender) {
                this.timelineSender.send(this.connection.isUsingTLS());
            }
        });
        this.connection.bind('message', event => {
            var eventName = event.event;
            var internal = eventName.indexOf('pusher_internal:') === 0;
            if (event.channel) {
                var channel = this.channel(event.channel);
                if (channel) {
                    channel.handleEvent(event);
                }
            }
            // Emit globally [deprecated]
            if (!internal) {
                this.global_emitter.emit(event.event, event.data);
            }
        });
        this.connection.bind('connecting', () => {
            this.channels.disconnect();
        });
        this.connection.bind('disconnected', () => {
            this.channels.disconnect();
        });
        this.connection.bind('error', err => {
            Logger$1.warn(err);
        });
        Pusher.instances.push(this);
        this.timeline.info({ instances: Pusher.instances.length });
        this.user = new UserFacade(this);
        if (Pusher.isReady) {
            this.connect();
        }
    }
    channel(name) {
        return this.channels.find(name);
    }
    allChannels() {
        return this.channels.all();
    }
    connect() {
        this.connection.connect();
        if (this.timelineSender) {
            if (!this.timelineSenderTimer) {
                var usingTLS = this.connection.isUsingTLS();
                var timelineSender = this.timelineSender;
                this.timelineSenderTimer = new PeriodicTimer(60000, function () {
                    timelineSender.send(usingTLS);
                });
            }
        }
    }
    disconnect() {
        this.connection.disconnect();
        if (this.timelineSenderTimer) {
            this.timelineSenderTimer.ensureAborted();
            this.timelineSenderTimer = null;
        }
    }
    bind(event_name, callback, context) {
        this.global_emitter.bind(event_name, callback, context);
        return this;
    }
    unbind(event_name, callback, context) {
        this.global_emitter.unbind(event_name, callback, context);
        return this;
    }
    bind_global(callback) {
        this.global_emitter.bind_global(callback);
        return this;
    }
    unbind_global(callback) {
        this.global_emitter.unbind_global(callback);
        return this;
    }
    unbind_all(callback) {
        this.global_emitter.unbind_all();
        return this;
    }
    subscribeAll() {
        var channelName;
        for (channelName in this.channels.channels) {
            if (this.channels.channels.hasOwnProperty(channelName)) {
                this.subscribe(channelName);
            }
        }
    }
    subscribe(channel_name) {
        var channel = this.channels.add(channel_name, this);
        if (channel.subscriptionPending && channel.subscriptionCancelled) {
            channel.reinstateSubscription();
        }
        else if (!channel.subscriptionPending &&
            this.connection.state === 'connected') {
            channel.subscribe();
        }
        return channel;
    }
    unsubscribe(channel_name) {
        var channel = this.channels.find(channel_name);
        if (channel && channel.subscriptionPending) {
            channel.cancelSubscription();
        }
        else {
            channel = this.channels.remove(channel_name);
            if (channel && channel.subscribed) {
                channel.unsubscribe();
            }
        }
    }
    send_event(event_name, data, channel) {
        return this.connection.send_event(event_name, data, channel);
    }
    shouldUseTLS() {
        return this.config.useTLS;
    }
    signin() {
        this.user.signin();
    }
}
function checkAppKey(key) {
    if (key === null || key === undefined) {
        throw 'You must pass your app key when you instantiate Pusher.';
    }
}
Runtime$1.setup(Pusher);

export { Pusher as default };
