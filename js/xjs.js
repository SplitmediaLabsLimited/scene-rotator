require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/// <reference path="../../defs/es6-promise.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var eventemitter_1 = require('./eventemitter');
var internal_1 = require('../internal/internal');
/** This utility class exposes functionality for source plugin developers to
 *  handle the configuration window for their source plugins.
 *
 *  Developers can use this class to specify how their configuration HTML
 *  should be rendered within the built-in window in XSplit Broadcaster.
 *  This class also serves as an event emitter for specific important events.
 *
 *  The framework also uses this class for its own internal purposes.
 */
var SourceConfigWindow = (function (_super) {
    __extends(SourceConfigWindow, _super);
    function SourceConfigWindow() {
        var _this = this;
        _super.call(this);
        window.addEventListener('message', function (event) {
            try {
                var data = JSON.parse(event.data);
            }
            catch (e) {
                // syntax error probably happened, exit gracefully
                return;
            }
            switch (data.event) {
                // currently, restrict messages to selected set
                case 'set-selected-tab':
                    this.emit(data.event, data.value);
                    break;
                case 'async-callback':
                    this.emit(data.event, {
                        asyncId: data.value.asyncId,
                        result: data.value.result
                    });
                    break;
            }
        }.bind(this));
        this.on('config-load', function () {
            _this._informConfigLoaded();
        });
        SourceConfigWindow._instance = this;
    }
    SourceConfigWindow.getInstance = function () {
        if (SourceConfigWindow._instance === undefined) {
            SourceConfigWindow._instance = new SourceConfigWindow();
        }
        return SourceConfigWindow._instance;
    };
    // helper function to communicate with built-in container
    SourceConfigWindow.prototype._notify = function (obj) {
        window.parent.postMessage(JSON.stringify(obj), '*');
    };
    SourceConfigWindow.prototype.useFullWindow = function () {
        this._setRenderMode(SourceConfigWindow._MODE_FULL);
    };
    SourceConfigWindow.prototype.useTabbedWindow = function (config) {
        this._setRenderMode(SourceConfigWindow._MODE_TABBED);
        this._declareCustomTabs(config.customTabs);
        this._setTabOrder(config.tabOrder);
    };
    SourceConfigWindow.prototype._setRenderMode = function (renderMode) {
        this._mode = renderMode;
        this._notify({
            event: 'set-mode',
            value: renderMode
        });
    };
    ;
    SourceConfigWindow.prototype._setTabOrder = function (tabArray) {
        this._notify({
            event: 'set-tab-order',
            value: JSON.stringify(tabArray)
        });
    };
    ;
    SourceConfigWindow.prototype._declareCustomTabs = function (tabArray) {
        this._notify({
            event: 'set-custom-tabs',
            value: JSON.stringify(tabArray)
        });
    };
    ;
    SourceConfigWindow.prototype._informConfigLoaded = function () {
        this._notify({ event: 'load' });
    };
    SourceConfigWindow.prototype.resizeConfig = function (width, height) {
        if (this._mode === 'full') {
            this._notify({
                event: 'resize',
                value: JSON.stringify({
                    width: width,
                    height: height
                })
            });
        }
        else if (this._mode !== 'embedded') {
            internal_1.exec('SetDialogSize', String(width), String(height));
        }
    };
    ;
    SourceConfigWindow.prototype.closeConfig = function () {
        internal_1.exec('Close');
    };
    ;
    SourceConfigWindow._MODE_FULL = 'full';
    SourceConfigWindow._MODE_TABBED = 'embedded';
    return SourceConfigWindow;
})(eventemitter_1.MyEventEmitter);
exports.SourceConfigWindow = SourceConfigWindow;
},{"../internal/internal":22,"./eventemitter":2}],2:[function(require,module,exports){
// simple event emitter
var MyEventEmitter = (function () {
    function MyEventEmitter() {
        this._handlers = {};
    }
    // allows duplicates
    MyEventEmitter.prototype.on = function (event, handler) {
        if (this._handlers[event] === undefined) {
            this._handlers[event] = [];
        }
        this._handlers[event].push(handler);
    };
    MyEventEmitter.prototype.emit = function (event) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        if (this._handlers[event] === undefined) {
            return;
        }
        for (var _a = 0, _b = this._handlers[event]; _a < _b.length; _a++) {
            var handler = _b[_a];
            handler.apply(this, params);
        }
    };
    return MyEventEmitter;
})();
exports.MyEventEmitter = MyEventEmitter;
},{}],3:[function(require,module,exports){
/// <reference path="../../defs/es6-promise.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var eventemitter_1 = require('./eventemitter');
/** This utility class is used internally by the framework for certain important
 *  processes. This class also exposes certain important events for
 *
 *
 */
var SourcePluginWindow = (function (_super) {
    __extends(SourcePluginWindow, _super);
    function SourcePluginWindow() {
        _super.call(this);
        // TODO: need to document events emitted
        this.on('message-source', function (message) {
            if (message.request !== undefined) {
                if (message.request === 'saveConfig') {
                    this.emit('save-config', message.data);
                }
                else if (message.request === 'applyConfig') {
                    this.emit('apply-config', message.data);
                }
            }
        });
        SourcePluginWindow._instance = this;
    }
    SourcePluginWindow.getInstance = function () {
        if (SourcePluginWindow._instance === undefined) {
            SourcePluginWindow._instance = new SourcePluginWindow();
        }
        return SourcePluginWindow._instance;
    };
    return SourcePluginWindow;
})(eventemitter_1.MyEventEmitter);
exports.SourcePluginWindow = SourcePluginWindow;
window['MessageSource'] = function (message) {
    SourcePluginWindow.getInstance().emit("message-source", JSON.parse(message));
};
window['SetConfiguration'] = function (configObj) {
    try {
        var data = JSON.parse(configObj);
        var source = SourcePluginWindow.getInstance();
        source.emit("apply-config", data);
        source.emit("save-config", data);
    }
    catch (e) {
        // syntax error probably happened, exit gracefully
        return;
    }
};
},{"./eventemitter":2}],4:[function(require,module,exports){
/// <reference path="../../defs/es6-promise.d.ts" />
var app_1 = require('../internal/app');
var rectangle_1 = require('../util/rectangle');
var audio_1 = require('../system/audio');
var json_1 = require('../internal/util/json');
var xml_1 = require('../internal/util/xml');
var internal_1 = require('../internal/internal');
var environment_1 = require('./environment');
var transition_1 = require('./transition');
var DEFAULT_SILENCE_DETECTION_THRESHOLD = 5;
var DEFAULT_SILENCE_DETECTION_PERIOD = 1000;
/**
 * The App Class provides you methods to get and set application-related
 * functionalities.
 *
 * ### Basic Usage
 *
 * ```javascript
 * var XJS = require('xjs');
 * var App = new XJS.App();
 *
 * App.getFrameTime().then(function(frametime) {
 *   window.frametime = frametime;
 * });
 * ```
 */
var App = (function () {
    function App() {
    }
    /**
     * return: Promise<number>
     *
     * Gets application's frame time (duration per frame in 100ns unit)
     *
     * #### Usage
     *
     * ```javascript
     * var frameTimeP = App.getFrameTime();
     * frameTimeP.then(function(res) {
     *   var frameTime = res;
     * });
     * ```
     */
    App.prototype.getFrametime = function () {
        return new Promise(function (resolve) {
            app_1.App.get('frametime').then(function (val) {
                resolve(Number(val));
            });
        });
    };
    /**
     * return: Promise<Rectangle>
     *
     * Gets application default output resolution.
     * See also: Util/Rectangle
     *
     * #### Usage
     *
     * ```javascript
     * var resolutionP = App.getResolution();
     * resolutionP.then(function(res) {
     *   var height = res.getHeight();
     *   var width = res.getWidth();
     * });
     * ```
     */
    App.prototype.getResolution = function () {
        return new Promise(function (resolve) {
            app_1.App.get('resolution').then(function (val) {
                var dimensions = val.split(",");
                resolve(rectangle_1.Rectangle.fromDimensions(parseInt(dimensions[0]), parseInt(dimensions[1])));
            });
        });
    };
    /**
     * return: Promise<Rectangle>
     *
     * Gets application viewport display resolution
     * See also: Util/Rectangle
     *
     * #### Usage
     *
     * ```javascript
     * var viewPortP = App.getViewport();
     * viewPortP.then(function(res) {
     *   var height = res.getHeight();
     *   var width = res.getWidth();
     * });
     * ```
     */
    App.prototype.getViewport = function () {
        return new Promise(function (resolve) {
            app_1.App.get('viewport').then(function (val) {
                var dimensions = val.split(",");
                resolve(rectangle_1.Rectangle.fromDimensions(parseInt(dimensions[0]), parseInt(dimensions[1])));
            });
        });
    };
    /**
     * return: Promise<string>
     *
     * Refers to XSplit Broadcaster DLL file version number
     *
     * #### Usage
     *
     * ```javascript
     * var versionP = App.getVersion();
     * versionP.then(function(res) {
     *   var version = res;
     * });
     * ```
     */
    App.prototype.getVersion = function () {
        return new Promise(function (resolve) {
            resolve(app_1.App.get('version'));
        });
    };
    /**
     * return: Promise<number>
     *
     * Gets the total number of frames rendered
     *
     * #### Usage
     *
     * ```javascript
     * var framesrenderedP = App.getFramesRendered();
     * framesrenderedP.then(function(res) {
     *   var framesrendered = res;
     * });
     * ```
     */
    App.prototype.getFramesRendered = function () {
        return new Promise(function (resolve) {
            app_1.App.get('framesrendered').then(function (val) {
                resolve(Number(val));
            });
        });
    };
    // Audio Services
    /**
     * return: Promise<AudioDevice>
     *
     * Gets the primary microphone device used in the application
     * See also: System/AudioDevice
     *
     * ### Usage
     *
     * ```javascript
     * App.getPrimaryMic().then(function(audioDevice) {
     *   var primaryMic = audioDevice;
     * });
     * ```
     */
    App.prototype.getPrimaryMic = function () {
        return new Promise(function (resolve) {
            app_1.App.getAsList('microphonedev2').then(function (arr) {
                var audioDevices = arr.map(function (val) {
                    return audio_1.AudioDevice.parse(val);
                });
                if (audioDevices.length && audioDevices.length > 0) {
                    resolve(audioDevices[0]);
                }
                else {
                    resolve(new audio_1.AudioDevice({ id: "empty" }));
                }
            });
        });
    };
    /**
     * return: Promise<AudioDevice>
     *
     * Gets the primary speaker/audio render device used in the application
     * See also: System/AudioDevice
     *
     * ### Usage
     *
     * ```javascript
     * App.getPrimarySpeaker().then(function(audioDevice) {
     *   var primarySpeaker = audioDevice;
     * });
     * ```
     */
    App.prototype.getPrimarySpeaker = function () {
        return new Promise(function (resolve) {
            app_1.App.getAsList('microphonedev2').then(function (arr) {
                var audioDevices = arr.map(function (val) {
                    return audio_1.AudioDevice.parse(val);
                });
                if (audioDevices.length && audioDevices.length > 1) {
                    resolve(audioDevices[1]);
                }
                else {
                    resolve(new audio_1.AudioDevice({ id: "empty" }));
                }
            });
        });
    };
    /**
     * param: device<AudioDevice>
     * ```
     * return: Promise<boolean>
     * ```
     *
     * Sets the primary microphone device to be used in the application
     * See also: System/AudioDevice
     *
     * ### Usage
     *
     * ```javascript
     * App.setPrimaryMic(device).then(function(val) {
     *   var isSet = val;
     * });
     * ```
     */
    App.prototype.setPrimaryMic = function (device) {
        return new Promise(function (resolve) {
            app_1.App.getAsList('microphonedev2').then(function (arr) {
                var audioDevices = arr.map(function (val) {
                    return audio_1.AudioDevice.parse(val);
                });
                audioDevices[0] = device;
                var dev = '';
                if (Array.isArray(audioDevices)) {
                    for (var i = 0; i < audioDevices.length; ++i) {
                        dev += audioDevices[i].toString();
                    }
                }
                dev = '<devices>' + dev + '</devices>';
                app_1.App.set('microphonedev2', dev).then(function (setVal) {
                    resolve(setVal);
                });
            });
        });
    };
    /**
     * param: device<AudioDevice>
     * ```
     * return: Promise<boolean>
     * ```
     *
     * Sets the primary speaker/audio render device to be used in the application
     * See also: System/AudioDevice
     *
     * ### Usage
     *
     * ```javascript
     * App.setPrimarySpeaker(device).then(function(val) {
     *   var isSet = val;
     * });
     * ```
     */
    App.prototype.setPrimarySpeaker = function (device) {
        return new Promise(function (resolve) {
            app_1.App.getAsList('microphonedev2').then(function (arr) {
                var audioDevices = arr.map(function (val) {
                    return audio_1.AudioDevice.parse(val);
                });
                audioDevices[1] = device;
                var dev = '';
                if (Array.isArray(audioDevices)) {
                    for (var i = 0; i < audioDevices.length; ++i) {
                        dev += audioDevices[i].toString();
                    }
                }
                dev = '<devices>' + dev + '</devices>';
                app_1.App.set('microphonedev2', dev).then(function (setVal) {
                    resolve(setVal);
                });
            });
        });
    };
    /**
     * return: Promise<boolean>
     *
     * Gets whether silence detection is enabled
     *
     * ### Usage
     *
     * ```javascript
     * App.isSilenceDetectionEnabled().then(function(val) {
     *   var isEnabled = val;
     * });
     * ```
     */
    App.prototype.isSilenceDetectionEnabled = function () {
        return new Promise(function (resolve) {
            app_1.App.get('microphonegain').then(function (val) {
                var micGainObj = json_1.JSON.parse(val);
                resolve(micGainObj['enable'] == '1');
            });
        });
    };
    /**
     * param: enabled<boolean>
     * ```
     * return: Promise<boolean>
     * ```
     *
     * Enables or disables silence detection
     *
     * ### Usage
     *
     * ```javascript
     * App.enableSilenceDetection(enabled).then(function(val) {
     *   var isSet = val;
     * });
     * ```
     */
    App.prototype.enableSilenceDetection = function (enabled) {
        return new Promise(function (resolve) {
            app_1.App.get('microphonegain').then(function (val) {
                var silenceDetectionObj = json_1.JSON.parse(decodeURIComponent(val));
                silenceDetectionObj['enable'] = (enabled ? '1' : '0');
                app_1.App.set('microphonegain', xml_1.XML.parseJSON(silenceDetectionObj).toString())
                    .then(function (setVal) {
                    resolve(setVal);
                });
            });
        });
    };
    /**
     * return: Promise<number>
     *
     * Gets silence detection period,
     * the length of time after voice detection before silence is again detected
     *
     * ### Usage
     *
     * ```javascript
     * App.getSilenceDetectionPeriod().then(function(val) {
     *   var silenceDetectionPeriod = val;
     * });
     * ```
     */
    App.prototype.getSilenceDetectionPeriod = function () {
        return new Promise(function (resolve) {
            app_1.App.get('microphonegain').then(function (val) {
                var micGainObj = json_1.JSON.parse(val);
                resolve(micGainObj['latency'] !== undefined ?
                    Number(micGainObj['latency']) : DEFAULT_SILENCE_DETECTION_PERIOD);
            });
        });
    };
    /**
     * param: sdPeriod<number>
     * ```
     * return: Promise<boolean>
     * ```
     *
     * Sets silence detection period (0-60000 ms),
     * the length of time after voice detection before silence is again detected
     *
     * ### Usage
     *
     * ```javascript
     * App.setSilenceDetectionPeriod(sdPeriod).then(function(val) {
     *   var isSet = val;
     * });
     * ```
     */
    App.prototype.setSilenceDetectionPeriod = function (sdPeriod) {
        return new Promise(function (resolve, reject) {
            if (typeof sdPeriod !== 'number') {
                reject(Error('Silence detection period must be a number'));
            }
            else if (sdPeriod % 1 != 0) {
                reject(Error('Silence detection period must be an integer'));
            }
            else if (sdPeriod < 0 || sdPeriod > 60000) {
                reject(Error('Silence detection must be in the range 0-60000.'));
            }
            app_1.App.get('microphonegain').then(function (val) {
                var silenceDetectionObj = json_1.JSON.parse(decodeURIComponent(val));
                silenceDetectionObj['latency'] = (sdPeriod.toString());
                app_1.App.set('microphonegain', xml_1.XML.parseJSON(silenceDetectionObj).toString())
                    .then(function (setVal) {
                    resolve(setVal);
                });
            });
        });
    };
    /**
     * return: Promise<number>
     *
     * Gets silence detection threshold/silence amplitude
     *
     * ### Usage
     *
     * ```javascript
     * App.getSilenceDetectionThreshold().then(function(val) {
     *   var silenceDetectionTfhreshold = val;
     * });
     * ```
     */
    App.prototype.getSilenceDetectionThreshold = function () {
        return new Promise(function (resolve) {
            app_1.App.get('microphonegain').then(function (val) {
                var micGainObj = json_1.JSON.parse(val);
                resolve(micGainObj['gain'] !== undefined ?
                    Number(micGainObj['gain']) : DEFAULT_SILENCE_DETECTION_THRESHOLD);
            });
        });
    };
    /**
     * param: sdThreshold<number>
     * ```
     * return: Promise<boolean>
     * ```
     *
     * Sets silence detection threshold/silence amplitude (values from 0-128)
     *
     * ### Usage
     *
     * ```javascript
     * App.setSilenceDetectionThreshold(sdThreshold).then(function(val) {
     *   var isSet = val;
     * });
     * ```
     */
    App.prototype.setSilenceDetectionThreshold = function (sdThreshold) {
        return new Promise(function (resolve, reject) {
            if (typeof sdThreshold !== 'number') {
                reject(Error('Silence detection threshold must be a number'));
            }
            else if (sdThreshold % 1 != 0) {
                reject(Error('Silence detection threshold must be an integer'));
            }
            else if (sdThreshold < 0 || sdThreshold > 128) {
                reject(Error('Silence detection threshold must be in the range 0-128.'));
            }
            app_1.App.get('microphonegain').then(function (val) {
                var silenceDetectionObj = json_1.JSON.parse(decodeURIComponent(val));
                silenceDetectionObj['gain'] = (sdThreshold.toString());
                app_1.App.set('microphonegain', xml_1.XML.parseJSON(silenceDetectionObj).toString())
                    .then(function (setVal) {
                    resolve(setVal);
                });
            });
        });
    };
    /**
     * param: url<string>[, width<number>[, height<number>[, flags<number>[, title<string>]]]]
     *
     * Creates a persistent modal dialog.<br/>
     * This method is not available for source
     *
     * #### Usage
     *
     * ```javascript
     * // you may use the following:
     * //     * App.BORDER_ENABLE (1)
     * //     * App.BORDER_ENABLE_CAPTION (2)
     * //     * App.BORDER_ENABLE_SIZING (4)
     * //     * App.BORDER_ENABLE_MINIMIZE (8)
     * //     * App.BORDER_ENABLE_MAXIMIZE (16)
     * App.newDialog(url, width, height, flags, title);
     * ```
     */
    App.prototype.newDialog = function (url, width, height, flags, title) {
        if (width === void 0) { width = 300; }
        if (height === void 0) { height = 300; }
        if (environment_1.Environment.isSourcePlugin()) {
            throw new TypeError('function is not available for source');
        }
        else if (url !== undefined && url !== '') {
            var params = ['NewDialog', url, '', width + ',' + height];
            for (var i = 3; i < arguments.length; i++) {
                if (arguments[i] !== undefined)
                    params.push(String(arguments[i]));
            }
            internal_1.exec.apply(this, params);
        }
        else {
            throw new Error('URL parameter expected');
        }
    };
    /**
     * param: url<string>[, width<number>[, height<number>]]
     *
     * Creates a dialog that automatically closes on outside click
     *
     * #### Usage
     *
     * ```javascript
     * App.newAutoDialog(url, width, height);
     * ```
     */
    App.prototype.newAutoDialog = function (url, width, height) {
        if (width === void 0) { width = 300; }
        if (height === void 0) { height = 300; }
        if (environment_1.Environment.isSourcePlugin()) {
            throw new TypeError('function is not available for source');
        }
        else if (url !== undefined && url !== '') {
            internal_1.exec('NewAutoDialog', url, width + ',' + height);
        }
        else {
            throw new Error('URL parameter expected');
        }
    };
    /**
     * Close a created dialog
     */
    App.prototype.closeDialog = function () {
        if (environment_1.Environment.isSourcePlugin()) {
            throw new TypeError('function is not available for source');
        }
        else {
            internal_1.exec('CloseDialog');
        }
    };
    // Transition Services
    /**
     * return: Promise<Transition>
     *
     * Gets the transition for scene changes
     * See also: Core/Transition
     *
     * #### Usage
     *
     * ```javascript
     * var transitionP = App.getTransition();
     * transitionP.then(function(res) {
     *   var transitionid = res;
     * });
     * ```
     */
    App.prototype.getTransition = function () {
        return new Promise(function (resolve) {
            app_1.App.get('transitionid').then(function (val) {
                if (val === '') {
                    resolve(transition_1.Transition.NONE);
                }
                else {
                    resolve(transition_1.Transition[val.toUpperCase()]);
                }
            });
        });
    };
    /**
     * param: transition<Transition>
     * ```
     * return: Promise<Transition>
     * ```
     *
     * Sets the transition for scene changes
     * See also: Core/Transition
     *
     * #### Usage
     *
     * ```javascript
     * var xjs = require('xjs'),
     *     Transition = xjs.Transition,
     *     App = new xjs.App();
  
     * App.setTransition(Transition.CLOCK).then(function(val) {
     *  var isSet = val;
     * });
     * ```
     */
    App.prototype.setTransition = function (transition) {
        return new Promise(function (resolve) {
            app_1.App.set('transitionid', transition.toString()).then(function (val) {
                resolve(val);
            });
        });
    };
    /**
     * return: Promise<number>
     *
     * Gets the scene transition duration in milliseconds
     *
     * #### Usage
     *
     * ```javascript
     * var transitionTimeP = App.getTransitionTime();
     * transitionTimeP.then(function(res) {
     *   var transitiontime = res;
     * });
     * ```
     */
    App.prototype.getTransitionTime = function () {
        return new Promise(function (resolve) {
            app_1.App.get('transitiontime').then(function (val) {
                resolve(Number(val));
            });
        });
    };
    /**
     * param: transition<number>
     * ```
     * return: Promise<string>
     * ```
     *
     * Sets the scene transition duration in milliseconds
     *
     * #### Usage
     *
     * ```javascript
     * App.setTransitionTime(time).then(function(val) {
     *  var isSet = val;
     * });
     * ```
     */
    App.prototype.setTransitionTime = function (time) {
        return new Promise(function (resolve) {
            app_1.App.set('transitiontime', time.toString()).then(function (val) {
                resolve(val);
            });
        });
    };
    // Dialog Services
    App.BORDER_ENABLE = 1;
    App.BORDER_ENABLE_CAPTION = 2;
    App.BORDER_ENABLE_SIZING = 4;
    App.BORDER_ENABLE_MINIMIZE = 8;
    App.BORDER_ENABLE_MAXIMIZE = 16;
    return App;
})();
exports.App = App;
},{"../internal/app":19,"../internal/internal":22,"../internal/util/json":24,"../internal/util/xml":26,"../system/audio":27,"../util/rectangle":35,"./environment":5,"./transition":18}],5:[function(require,module,exports){
/**
 * This class allows detection of the context in which the HTML is located.
 */
var Environment = (function () {
    function Environment() {
    }
    /**
     * This method is only used internally.
     */
    Environment.initialize = function () {
        if (Environment._initialized) {
            return;
        }
        Environment._isSourcePlugin = (window.external &&
            window.external['GetConfiguration'] !== undefined);
        Environment._isSourceConfig = (window.external &&
            window.external['GetConfiguration'] === undefined &&
            window.external['GetViewId'] !== undefined &&
            window.external['GetViewId']() !== undefined);
        Environment._isExtension = (window.external &&
            window.external['GetConfiguration'] === undefined &&
            window.external['GetViewId'] !== undefined &&
            window.external['GetViewId']() === undefined);
        Environment._initialized = true;
    };
    /**
     * return: boolean
     *
     * Determines if this HTML is running as a source.
     */
    Environment.isSourcePlugin = function () {
        return Environment._isSourcePlugin;
    };
    /**
     * return: boolean
     * Determines if this HTML is running within the source configuration window.
     */
    Environment.isSourceConfig = function () {
        return Environment._isSourceConfig;
    };
    /**
     * return: boolean
     *
     * Determines if this HTML is running as an extension plugin.
     */
    Environment.isExtension = function () {
        return Environment._isExtension;
    };
    return Environment;
})();
exports.Environment = Environment;
Environment.initialize();
},{}],6:[function(require,module,exports){
/// <reference path="../../../defs/es6-promise.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var mixin_1 = require('../../internal/util/mixin');
var item_1 = require('../../internal/item');
var iaudio_1 = require('./iaudio');
var item_2 = require('./item');
var environment_1 = require('../environment');
/**
 * The AudioItem class represents an audio device that has been added
 * to the stage.
 */
var AudioItem = (function (_super) {
    __extends(AudioItem, _super);
    function AudioItem() {
        _super.apply(this, arguments);
    }
    AudioItem.prototype.isSilenceDetectionEnabled = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:AudioGainEnable', slot).then(function (val) {
                resolve(val === '1');
            });
        });
    };
    AudioItem.prototype.setSilenceDetectionEnabled = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (environment_1.Environment.isSourcePlugin()) {
                reject(Error('Source plugins cannot update audio sources properties'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:AudioGainEnable', (value ? '1' : '0'), slot)
                    .then(function (res) {
                    if (!res) {
                        reject(Error('Item set property failed'));
                    }
                    else {
                        resolve(_this);
                    }
                });
            }
        });
    };
    AudioItem.prototype.getSilenceThreshold = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:AudioGain', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    AudioItem.prototype.setSilenceThreshold = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (environment_1.Environment.isSourcePlugin()) {
                reject(Error('Source plugins cannot update audio sources properties'));
            }
            else if (typeof value !== 'number') {
                reject(Error('Only numbers are acceptable values for threshold'));
            }
            else if (value % 1 !== 0 || value < 0 || value > 128) {
                reject(Error('Only integers in the range 0-128 are acceptable for threshold'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:AudioGain', String(value), slot).then(function (res) {
                    if (!res) {
                        reject(Error('Item set property failed'));
                    }
                    else {
                        resolve(_this);
                    }
                });
            }
        });
    };
    AudioItem.prototype.getSilencePeriod = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:AudioGainLatency', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    AudioItem.prototype.setSilencePeriod = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (environment_1.Environment.isSourcePlugin()) {
                reject(Error('Source plugins cannot update audio sources properties'));
            }
            else if (typeof value !== 'number') {
                reject(Error('Only numbers are acceptable values for period'));
            }
            else if (value % 1 !== 0 || value < 0 || value > 10000) {
                reject(Error('Only integers in the range 0-10000 are acceptable for period'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:AudioGainLatency', String(value), slot).then(function (res) {
                    if (!res) {
                        reject(Error('Item set property failed'));
                    }
                    else {
                        resolve(_this);
                    }
                });
            }
        });
    };
    return AudioItem;
})(item_2.Item);
exports.AudioItem = AudioItem;
mixin_1.applyMixins(item_2.Item, [iaudio_1.ItemAudio]);
},{"../../internal/item":23,"../../internal/util/mixin":25,"../environment":5,"./iaudio":10,"./item":15}],7:[function(require,module,exports){
/// <reference path="../../../defs/es6-promise.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var mixin_1 = require('../../internal/util/mixin');
var item_1 = require('../../internal/item');
var ilayout_1 = require('./ilayout');
var icolor_1 = require('./icolor');
var ichroma_1 = require('./ichroma');
var itransition_1 = require('./itransition');
var item_2 = require('./item');
/**
 * The CameraItem Class provides methods specifically used for camera items and
 * also methods that are shared between Item Classes. The
 * {@link #core/Scene Scene} class' getItems method would automatically return a
 * CameraItem object if there's a camera item on the specified scene.
 *
 * ### Basic Usage
 *
 * ```javascript
 * var XJS = require('xjs');
 *
 * XJS.Scene.getActiveScene().then(function(scene) {
 *   scene.getItems().then(function(items) {
 *     for (var i in items) {
 *       if (items[i] instanceof XJS.CameraItem) {
 *         // Manipulate your camera item here
 *         items[i].getDeviceId().then(function(id) {
 *           // Do something with the id
 *         });
 *       }
 *     }
 *   });
 * });
 * ```
 */
var CameraItem = (function (_super) {
    __extends(CameraItem, _super);
    function CameraItem() {
        _super.apply(this, arguments);
    }
    /**
     * return: Promise<string>
     *
     * Gets the device ID of the underlying camera deviec.
     */
    CameraItem.prototype.getDeviceId = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:item', slot).then(function (val) {
                resolve(val);
            });
        });
    };
    // special color options pinning
    /**
     * param: value<boolean>
     *
     * Set this to true to share color settings across all instances of this
     * camera device on the stage.
     */
    CameraItem.prototype.setColorOptionsPinned = function (value) {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.set('prop:cc_pin', value ? '1' : '0', slot).then(function () {
                resolve(_this);
            });
        });
    };
    /**
     * return: Promise<boolean>
     *
     * Checks whether color settings are shared across all instances of
     * this camera device on the stage.
     */
    CameraItem.prototype.getColorOptionsPinned = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:cc_pin', slot).then(function (val) {
                resolve(val === '1' ? true : false);
            });
        });
    };
    // special chroma options pinning
    /**
     * param: value<boolean>
     *
     * Set this to true to share chroma keying settings across all instances of
     * this camera device on the stage.
     */
    CameraItem.prototype.setKeyingOptionsPinned = function (value) {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.set('prop:key_pin', value ? '1' : '0', slot).then(function () {
                resolve(_this);
            });
        });
    };
    /**
     * return: value<boolean>
     *
     * Checks whether chroma keying settings are shared across all instances of
     * this camera device on the stage.
     */
    CameraItem.prototype.getKeyingOptionsPinned = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:key_pin', slot).then(function (val) {
                resolve(val === '1' ? true : false);
            });
        });
    };
    return CameraItem;
})(item_2.Item);
exports.CameraItem = CameraItem;
mixin_1.applyMixins(CameraItem, [ilayout_1.ItemLayout, icolor_1.ItemColor, ichroma_1.ItemChroma, itransition_1.ItemTransition]);
},{"../../internal/item":23,"../../internal/util/mixin":25,"./ichroma":11,"./icolor":12,"./ilayout":14,"./item":15,"./itransition":16}],8:[function(require,module,exports){
/// <reference path="../../../defs/es6-promise.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var mixin_1 = require('../../internal/util/mixin');
var item_1 = require('../../internal/item');
var ilayout_1 = require('./ilayout');
var icolor_1 = require('./icolor');
var ichroma_1 = require('./ichroma');
var itransition_1 = require('./itransition');
var item_2 = require('./item');
var json_1 = require('../../internal/util/json');
var xml_1 = require('../../internal/util/xml');
var item_3 = require('./item');
var environment_1 = require('../environment');
/**
 * The GameItem Class provides methods specifically used for game items and
 * also methods that is shared between Item Classes. The
 * {@link #core/Scene Scene} class' getItems method would automatically return a
 * GameItem object if there's a game item on the specified scene.
 *
 * ### Basic Usage
 *
 * ```javascript
 * var XJS = require('xjs');
 *
 * XJS.Scene.getActiveScene().then(function(scene) {
 *   scene.getItems().then(function(items) {
 *     for (var i in items) {
 *       if (items[i] instanceof XJS.GameItem) {
 *         // Manipulate your game item here
 *         items[i].setOfflineImage(path); // just an example here
 *       }
 *     }
 *   });
 * });
 * ```
 */
var GameItem = (function (_super) {
    __extends(GameItem, _super);
    function GameItem() {
        _super.apply(this, arguments);
    }
    /**
     * return: Promise<boolean>
     *
     * Check if Game Special Optimization is currently enabled or not
     */
    GameItem.prototype.isSpecialOptimizationEnabled = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('GameCapSurfSharing').then(function (res) {
                resolve(res === '1');
            });
        });
    };
    /**
     * param: Promise<boolean>
     *
     * Set Game Special Optimization to on or off
     */
    GameItem.prototype.setSpecialOptimizationEnabled = function (value) {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.set('GameCapSurfSharing', (value ? '1' : '0'), slot).then(function () {
                resolve(_this);
            });
        });
    };
    /**
     * return: Promise<boolean>
     *
     * Check if Show Mouse is currently enabled or not
     */
    GameItem.prototype.isShowMouseEnabled = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('GameCapShowMouse').then(function (res) {
                resolve(res === '1');
            });
        });
    };
    /**
     * param: value<boolean>
     *
     * Set Show Mouse in game to on or off
     */
    GameItem.prototype.setShowMouseEnabled = function (value) {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.set('GameCapShowMouse', (value ? '1' : '0'), slot).then(function () {
                resolve(_this);
            });
        });
    };
    /**
     * param: path<string>
     *
     * Set the offline image of a game source
     */
    GameItem.prototype.setOfflineImage = function (path) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this._type !== item_3.ItemTypes.GAMESOURCE) {
                reject(Error('Current item should be a game source'));
            }
            else if (environment_1.Environment.isSourcePlugin()) {
                reject(Error('Source plugins cannot update offline images of other sources'));
            }
            else if (!(_this._value instanceof xml_1.XML)) {
                _this.getValue().then(function () {
                    _this.setOfflineImage(path).then(function (itemObj) {
                        resolve(itemObj);
                    });
                });
            }
            else {
                var regExp = new RegExp('^(([A-Z|a-z]:\\\\[^*|"<>?\n]*)|(\\\\\\\\.*?' +
                    '\\\\.*)|([A-Za-z]+\\\\[^*|"<>?\\n]*))\.(png|gif|jpg|jpeg|tif)$');
                if (regExp.test(path) || path === '') {
                    var valueObj = json_1.JSON.parse(_this._value.toString());
                    valueObj['replace'] = path;
                    _this.setValue(xml_1.XML.parseJSON(valueObj)).then(function () {
                        resolve(_this);
                    });
                }
            }
        });
    };
    /**
     * return: Promise<string>
     *
     * Get the offline image of a game source
     */
    GameItem.prototype.getOfflineImage = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (_this._type !== item_3.ItemTypes.GAMESOURCE) {
                reject(Error('Current item should be a game source'));
            }
            else {
                _this.getValue().then(function () {
                    var valueObj = json_1.JSON.parse(_this._value.toString());
                    resolve(valueObj['replace'] ? valueObj['replace'] : '');
                });
            }
        });
    };
    return GameItem;
})(item_2.Item);
exports.GameItem = GameItem;
mixin_1.applyMixins(GameItem, [ilayout_1.ItemLayout, icolor_1.ItemColor, ichroma_1.ItemChroma, itransition_1.ItemTransition]);
},{"../../internal/item":23,"../../internal/util/json":24,"../../internal/util/mixin":25,"../../internal/util/xml":26,"../environment":5,"./ichroma":11,"./icolor":12,"./ilayout":14,"./item":15,"./itransition":16}],9:[function(require,module,exports){
/// <reference path="../../../defs/es6-promise.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var mixin_1 = require('../../internal/util/mixin');
var item_1 = require('../../internal/item');
var ilayout_1 = require('./ilayout');
var icolor_1 = require('./icolor');
var ichroma_1 = require('./ichroma');
var itransition_1 = require('./itransition');
var iconfig_1 = require('./iconfig');
var item_2 = require('./item');
var HTMLItem = (function (_super) {
    __extends(HTMLItem, _super);
    function HTMLItem() {
        _super.apply(this, arguments);
    }
    HTMLItem.prototype.getURL = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:item', slot).then(function (url) {
                resolve(url);
            });
        });
    };
    HTMLItem.prototype.setURL = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.set('prop:item', value, slot).then(function (code) {
                if (code) {
                    resolve(_this);
                }
                else {
                    reject('Invalid value');
                }
            });
        });
    };
    return HTMLItem;
})(item_2.Item);
exports.HTMLItem = HTMLItem;
mixin_1.applyMixins(HTMLItem, [ilayout_1.ItemLayout, icolor_1.ItemColor, ichroma_1.ItemChroma, itransition_1.ItemTransition, iconfig_1.ItemConfigurable]);
},{"../../internal/item":23,"../../internal/util/mixin":25,"./ichroma":11,"./icolor":12,"./iconfig":13,"./ilayout":14,"./item":15,"./itransition":16}],10:[function(require,module,exports){
/// <reference path="../../../defs/es6-promise.d.ts" />
var item_1 = require('../../internal/item');
var environment_1 = require('../environment');
var ItemAudio = (function () {
    function ItemAudio() {
    }
    ItemAudio.prototype.getVolume = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:volume', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemAudio.prototype.setVolume = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (environment_1.Environment.isSourcePlugin()) {
                reject(Error('Source plugins cannot update audio source properties.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                value = value < 0 ? 0 : value > 100 ? 100 : value;
                item_1.Item.set('prop:volume', String(value), slot).then(function (res) {
                    if (!res) {
                        reject(Error('Item set property failed'));
                    }
                    else {
                        resolve(_this);
                    }
                });
            }
        });
    };
    ItemAudio.prototype.isMute = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:mute', slot).then(function (val) {
                resolve(val === '1');
            });
        });
    };
    ItemAudio.prototype.setMute = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (environment_1.Environment.isSourcePlugin()) {
                reject(Error('Source plugins cannot update audio sources properties'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:mute', (value ? '1' : '0'), slot).then(function (res) {
                    if (!res) {
                        reject(Error('Item set property failed'));
                    }
                    else {
                        resolve(_this);
                    }
                });
            }
        });
    };
    ItemAudio.prototype.getAudioOffset = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:AudioDelay', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemAudio.prototype.setAudioOffset = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (environment_1.Environment.isSourcePlugin()) {
                reject(Error('Source plugins cannot update audio sources properties'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:AudioDelay', String(value), slot).then(function (res) {
                    if (!res) {
                        reject(Error('Item set property failed'));
                    }
                    else {
                        resolve(_this);
                    }
                });
            }
        });
    };
    ItemAudio.prototype.isStreamOnlyEnabled = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:sounddev', slot).then(function (val) {
                resolve(val === '1');
            });
        });
    };
    ItemAudio.prototype.setStreamOnlyEnabled = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (environment_1.Environment.isSourcePlugin()) {
                reject(Error('Source plugins cannot update audio sources properties'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:sounddev', (value ? '1' : '0'), slot).then(function (res) {
                    if (!res) {
                        reject(Error('Item set property failed'));
                    }
                    else {
                        resolve(_this);
                    }
                });
            }
        });
    };
    return ItemAudio;
})();
exports.ItemAudio = ItemAudio;
},{"../../internal/item":23,"../environment":5}],11:[function(require,module,exports){
/// <reference path="../../../defs/es6-promise.d.ts" />
var item_1 = require('../../internal/item');
var color_1 = require('../../util/color');
(function (KeyingType) {
    KeyingType[KeyingType["LEGACY"] = 0] = "LEGACY";
    KeyingType[KeyingType["COLORKEY"] = 1] = "COLORKEY";
    KeyingType[KeyingType["RGBKEY"] = 2] = "RGBKEY"; // Chroma Key RGB Mode
})(exports.KeyingType || (exports.KeyingType = {}));
var KeyingType = exports.KeyingType;
(function (ChromaPrimaryColors) {
    ChromaPrimaryColors[ChromaPrimaryColors["RED"] = 0] = "RED";
    ChromaPrimaryColors[ChromaPrimaryColors["GREEN"] = 1] = "GREEN";
    ChromaPrimaryColors[ChromaPrimaryColors["BLUE"] = 2] = "BLUE";
})(exports.ChromaPrimaryColors || (exports.ChromaPrimaryColors = {}));
var ChromaPrimaryColors = exports.ChromaPrimaryColors;
(function (ChromaAntiAliasLevel) {
    ChromaAntiAliasLevel[ChromaAntiAliasLevel["NONE"] = 0] = "NONE";
    ChromaAntiAliasLevel[ChromaAntiAliasLevel["LOW"] = 1] = "LOW";
    ChromaAntiAliasLevel[ChromaAntiAliasLevel["HIGH"] = 2] = "HIGH";
})(exports.ChromaAntiAliasLevel || (exports.ChromaAntiAliasLevel = {}));
var ChromaAntiAliasLevel = exports.ChromaAntiAliasLevel;
var ItemChroma = (function () {
    function ItemChroma() {
    }
    ItemChroma.prototype.isChromaEnabled = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:key_chromakey', slot).then(function (val) {
                resolve(val === '1');
            });
        });
    };
    ItemChroma.prototype.setChromaEnabled = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof value !== 'boolean') {
                reject(TypeError('Parameter should be boolean.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:key_chromakey', (value ? '1' : '0'), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    ItemChroma.prototype.getKeyingType = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:key_chromakeytype', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemChroma.prototype.setKeyingType = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof value !== 'number') {
                reject(TypeError('Use a KeyingType value as the parameter.'));
            }
            else if (value < 0 || value > 2) {
                reject(RangeError('Use a KeyingType value as the parameter.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:key_chromakeytype', String(value), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    // COMMON TO CHROMA LEGACY AND CHROMA RGB KEY
    ItemChroma.prototype.getChromaAntiAliasLevel = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:key_antialiasing', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemChroma.prototype.setChromaAntiAliasLevel = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof value !== 'number') {
                reject(TypeError('Use a ChromaAntiAliasLevel value as the parameter.'));
            }
            else if (value < 0 || value > 2) {
                reject(RangeError('Use a ChromaAntiAliasLevel value as the parameter.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:key_antialiasing', String(value), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    // CHROMA LEGACY MODE FUNCTIONS
    ItemChroma.prototype.getChromaLegacyBrightness = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:key_chromabr', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemChroma.prototype.setChromaLegacyBrightness = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof value !== 'number') {
                reject(TypeError('Use an integer as the parameter.'));
            }
            else if (value < 0 || value > 255) {
                reject(RangeError('Valid value is an integer from 0-255.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:key_chromabr', String(value), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    ItemChroma.prototype.getChromaLegacySaturation = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:key_chromasat', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemChroma.prototype.setChromaLegacySaturation = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof value !== 'number') {
                reject(TypeError('Use an integer as the parameter.'));
            }
            else if (value < 0 || value > 255) {
                reject(RangeError('Valid value is an integer from 0-255.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:key_chromasat', String(value), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    ItemChroma.prototype.getChromaLegacyHue = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:key_chromahue', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemChroma.prototype.setChromaLegacyHue = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof value !== 'number') {
                reject(TypeError('Use an integer as the parameter.'));
            }
            else if (value < 0 || value > 180) {
                reject(RangeError('Valid value is an integer from 0-180.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:key_chromahue', String(value), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    ItemChroma.prototype.getChromaLegacyThreshold = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:key_chromarang', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemChroma.prototype.setChromaLegacyThreshold = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof value !== 'number') {
                reject(TypeError('Use an integer as the parameter.'));
            }
            else if (value < 0 || value > 255) {
                reject(RangeError('Valid value is an integer from 0-255.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:key_chromarang', String(value), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    ItemChroma.prototype.getChromaLegacyAlphaSmoothing = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:key_chromaranga', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemChroma.prototype.setChromaLegacyAlphaSmoothing = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof value !== 'number') {
                reject(TypeError('Use an integer as the parameter.'));
            }
            else if (value < 0 || value > 255) {
                reject(RangeError('Valid value is an integer from 0-255.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:key_chromaranga', String(value), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    // CHROMA RGB KEY FUNCTIONS
    ItemChroma.prototype.getChromaRGBKeyPrimaryColor = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:key_chromargbkeyprimary', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemChroma.prototype.setChromaRGBKeyPrimaryColor = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof value !== 'number') {
                reject(TypeError('Use a ChromaPrimaryColors value as the parameter.'));
            }
            else if (value < 0 || value > 2) {
                reject(RangeError('Use a ChromaPrimaryColors value as the parameter.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:key_chromargbkeyprimary', String(value), slot)
                    .then(function () {
                    resolve(_this);
                });
            }
        });
    };
    ItemChroma.prototype.getChromaRGBKeyThreshold = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:key_chromargbkeythresh', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemChroma.prototype.setChromaRGBKeyThreshold = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof value !== 'number') {
                reject(TypeError('Use an integer as the parameter.'));
            }
            else if (value < 0 || value > 255) {
                reject(RangeError('Valid value is an integer from 0-255.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:key_chromargbkeythresh', String(value), slot)
                    .then(function () {
                    resolve(_this);
                });
            }
        });
    };
    ItemChroma.prototype.getChromaRGBKeyExposure = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:key_chromargbkeybalance', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemChroma.prototype.setChromaRGBKeyExposure = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof value !== 'number') {
                reject(TypeError('Use an integer as the parameter.'));
            }
            else if (value < 0 || value > 255) {
                reject(RangeError('Valid value is an integer from 0-255.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:key_chromargbkeybalance', String(value), slot)
                    .then(function () {
                    resolve(_this);
                });
            }
        });
    };
    // CHROMA COLOR KEY FUNCTIONS
    ItemChroma.prototype.getChromaColorKeyThreshold = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:key_colorrang', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemChroma.prototype.setChromaColorKeyThreshold = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof value !== 'number') {
                reject(TypeError('Use an integer as the parameter.'));
            }
            else if (value < 0 || value > 255) {
                reject(RangeError('Valid value is an integer from 0-255.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:key_colorrang', String(value), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    ItemChroma.prototype.getChromaColorKeyExposure = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:key_colorranga', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemChroma.prototype.setChromaColorKeyExposure = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (typeof value !== 'number') {
                reject(TypeError('Use an integer as the parameter.'));
            }
            else if (value < 0 || value > 255) {
                reject(RangeError('Valid value is an integer from 0-255.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:key_colorranga', String(value), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    ItemChroma.prototype.getChromaColorKeyColor = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:key_colorrgb', slot).then(function (val) {
                var color = color_1.Color.fromBGRString(val);
                resolve(color);
            });
        });
    };
    ItemChroma.prototype.setChromaColorKeyColor = function (value) {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.set('prop:key_colorrgb', String(value.getIbgr()), slot).then(function () {
                resolve(_this);
            });
        });
    };
    return ItemChroma;
})();
exports.ItemChroma = ItemChroma;
},{"../../internal/item":23,"../../util/color":32}],12:[function(require,module,exports){
/// <reference path="../../../defs/es6-promise.d.ts" />
var item_1 = require('../../internal/item');
var color_1 = require('../../util/color');
var ItemColor = (function () {
    function ItemColor() {
    }
    ItemColor.prototype.getTransparency = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:alpha', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemColor.prototype.setTransparency = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (value < 0 || value > 255) {
                reject(RangeError('Transparency may only be in the range 0 to 255.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:alpha', String(value), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    ItemColor.prototype.getBrightness = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:cc_brightness', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemColor.prototype.setBrightness = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (value < -100 || value > 100) {
                reject(RangeError('Brightness may only be in the range -100 to 100.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:cc_brightness', String(value), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    ItemColor.prototype.getContrast = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:cc_contrast', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemColor.prototype.setContrast = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (value < -100 || value > 100) {
                reject(RangeError('Contrast may only be in the range -100 to 100.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:cc_contrast', String(value), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    ItemColor.prototype.getHue = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:cc_hue', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemColor.prototype.setHue = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (value < -180 || value > 180) {
                reject(RangeError('Contrast may only be in the range -180 to 180.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:cc_hue', String(value), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    ItemColor.prototype.getSaturation = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:cc_saturation', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemColor.prototype.setSaturation = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (value < -100 || value > 100) {
                reject(RangeError('Saturation may only be in the range -100 to 100'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:cc_saturation', String(value), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    ItemColor.prototype.getBorderColor = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:border', slot).then(function (val) {
                var bgr = Number(val) - 0x80000000;
                var color = color_1.Color.fromBGRInt(bgr);
                resolve(color);
            });
        });
    };
    ItemColor.prototype.setBorderColor = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.set('prop:border', String(value.getIbgr() - 0x80000000), slot).then(function () {
                resolve(_this);
            });
        });
    };
    return ItemColor;
})();
exports.ItemColor = ItemColor;
},{"../../internal/item":23,"../../util/color":32}],13:[function(require,module,exports){
/// <reference path="../../../defs/es6-promise.d.ts" />
var item_1 = require('../../internal/item');
var global_1 = require('../../internal/global');
var internal_1 = require('../../internal/internal');
var environment_1 = require('../environment');
var ItemConfigurable = (function () {
    function ItemConfigurable() {
    }
    ItemConfigurable.prototype.loadConfig = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:BrowserConfiguration', slot).then(function (config) {
                var configObj = config === 'null' ? {} : JSON.parse(config);
                var persist = global_1.Global.getPersistentConfig();
                for (var key in persist) {
                    delete configObj[key];
                }
                resolve(configObj);
            });
        });
    };
    ItemConfigurable.prototype.saveConfig = function (configObj) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (environment_1.Environment.isSourcePlugin) {
                var slot = item_1.Item.attach(_this._id);
                // only allow direct saving for self
                if (slot === 0) {
                    // check for valid object
                    if ({}.toString.call(configObj) === '[object Object]') {
                        // add persisted configuration if available
                        // currently only top level merging is available
                        var persist = global_1.Global.getPersistentConfig();
                        for (var key in persist) {
                            configObj[key] = persist[key];
                        }
                        internal_1.exec('SetBrowserProperty', 'Configuration', JSON.stringify(configObj));
                        resolve(_this);
                    }
                    else {
                        reject(Error('Configuration object should be ' +
                            'in JSON format.'));
                    }
                }
                else {
                    reject(Error('Sources may only request other ' +
                        'sources to save a configuration. Consider ' +
                        'calling requestSaveConfig() on this Item ' +
                        'instance instead.'));
                }
            }
            else {
                reject(Error('Extensions and source configuration windows are ' +
                    'not allowed to directly save configuration objects. ' +
                    'Call requestSaveConfig() instead.'));
            }
        });
    };
    ItemConfigurable.prototype.requestSaveConfig = function (configObj) {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            internal_1.exec('CallInner' + (slot === 0 ? '' : (slot + 1)), 'MessageSource', JSON.stringify({
                'request': 'saveConfig',
                'data': configObj
            }));
            resolve(_this);
        });
    };
    ItemConfigurable.prototype.applyConfig = function (configObj) {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            internal_1.exec('CallInner' + (slot === 0 ? '' : (slot + 1)), 'MessageSource', JSON.stringify({
                'request': 'applyConfig',
                'data': configObj
            }));
            resolve(_this);
        });
    };
    return ItemConfigurable;
})();
exports.ItemConfigurable = ItemConfigurable;
},{"../../internal/global":20,"../../internal/internal":22,"../../internal/item":23,"../environment":5}],14:[function(require,module,exports){
/// <reference path="../../../defs/es6-promise.d.ts" />
var item_1 = require('../../internal/item');
var rectangle_1 = require('../../util/rectangle');
var ItemLayout = (function () {
    function ItemLayout() {
    }
    ItemLayout.prototype.isKeepAspectRatio = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:keep_ar', slot).then(function (val) {
                resolve(val === '1');
            });
        });
    };
    ItemLayout.prototype.setKeepAspectRatio = function (value) {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.set('prop:keep_ar', value ? '1' : '0', slot).then(function () {
                resolve(_this);
            });
        });
    };
    ItemLayout.prototype.isPositionLocked = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:lockmove', slot).then(function (val) {
                resolve(val === '1');
            });
        });
    };
    ItemLayout.prototype.setPositionLocked = function (value) {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.set('prop:lockmove', value ? '1' : '0', slot).then(function () {
                resolve(_this);
            });
        });
    };
    ItemLayout.prototype.isEnhancedResizeEnabled = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:mipmaps', slot).then(function (val) {
                resolve(val === '1');
            });
        });
    };
    ItemLayout.prototype.setEnhancedResizeEnabled = function (value) {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.set('prop:mipmaps', value ? '1' : '0', slot).then(function () {
                resolve(_this);
            });
        });
    };
    ItemLayout.prototype.getPosition = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:pos', slot).then(function (val) {
                var _a = decodeURIComponent(val).split(','), left = _a[0], top = _a[1], right = _a[2], bottom = _a[3];
                _this.position = rectangle_1.Rectangle.fromCoordinates(Number(top), Number(left), Number(right), Number(bottom));
                resolve(_this.position);
            });
        });
    };
    ItemLayout.prototype.setPosition = function (value) {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            _this.position = value;
            item_1.Item.set('prop:pos', value.toCoordinateString(), slot).then(function () {
                resolve(_this);
            });
        });
    };
    ItemLayout.prototype.getRotateY = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:rotate_y', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemLayout.prototype.setRotateY = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (value < -360 || value > 360) {
                reject(Error('Invalid value. Min: -360, Max: 360'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:rotate_y', String(value), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    ItemLayout.prototype.getRotateX = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:rotate_x', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemLayout.prototype.setRotateX = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (value < -360 || value > 360) {
                reject(Error('Invalid value. Min: -360, Max: 360'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:rotate_x', String(value), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    ItemLayout.prototype.getRotateZ = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:rotate_z', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemLayout.prototype.setRotateZ = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (value < -360 || value > 360) {
                reject(Error('Invalid value. Min: -360, Max: 360'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:rotate_z', String(value), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    return ItemLayout;
})();
exports.ItemLayout = ItemLayout;
},{"../../internal/item":23,"../../util/rectangle":35}],15:[function(require,module,exports){
/// <reference path="../../../defs/es6-promise.d.ts" />
var item_1 = require('../../internal/item');
var environment_1 = require('../environment');
var json_1 = require('../../internal/util/json');
var xml_1 = require('../../internal/util/xml');
var scene_1 = require('../scene');
(function (ItemTypes) {
    ItemTypes[ItemTypes["UNDEFINED"] = 0] = "UNDEFINED";
    ItemTypes[ItemTypes["FILE"] = 1] = "FILE";
    ItemTypes[ItemTypes["LIVE"] = 2] = "LIVE";
    ItemTypes[ItemTypes["TEXT"] = 3] = "TEXT";
    ItemTypes[ItemTypes["BITMAP"] = 4] = "BITMAP";
    ItemTypes[ItemTypes["SCREEN"] = 5] = "SCREEN";
    ItemTypes[ItemTypes["FLASHFILE"] = 6] = "FLASHFILE";
    ItemTypes[ItemTypes["GAMESOURCE"] = 7] = "GAMESOURCE";
    ItemTypes[ItemTypes["HTML"] = 8] = "HTML";
})(exports.ItemTypes || (exports.ItemTypes = {}));
var ItemTypes = exports.ItemTypes;
/**
 * An Item represents an object that is used as a source on the stage.
 * Some possible sources are games, microphones, or a webpage.
 */
var Item = (function () {
    function Item(props) {
        props = props ? props : {};
        this._name = props['name'];
        this._cname = props['cname'];
        this._id = props['id'];
        this._sceneID = props['sceneID'];
        this._value = props['value'];
        this._keepLoaded = props['keeploaded'];
        this._type = Number(props['type']);
        this._xmlparams = props;
    }
    /** Sets the name of the item */
    Item.prototype.setName = function (value) {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            _this._name = value;
            item_1.Item.set('prop:name', _this._name, slot).then(function () {
                resolve(_this);
            });
        });
    };
    /** Gets the current name of the item */
    Item.prototype.getName = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:name', slot).then(function (val) {
                _this._name = val;
                resolve(val);
            });
        });
    };
    /** Sets the custom name of the item */
    Item.prototype.setCustomName = function (value) {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            _this._cname = value;
            item_1.Item.set('prop:cname', _this._cname, slot).then(function () {
                resolve(_this);
            });
        });
    };
    /** Gets the custom name of the item */
    Item.prototype.getCustomName = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:cname', slot).then(function (val) {
                _this._cname = val;
                resolve(val);
            });
        });
    };
    /** Get the video item's main definition */
    Item.prototype.getValue = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:item', slot).then(function (val) {
                val = (val === 'null') ? '' : val;
                if (val === '') {
                    _this._value = '';
                    resolve(val);
                }
                else {
                    try {
                        _this._value = xml_1.XML.parseJSON(json_1.JSON.parse(val));
                        resolve(_this._value);
                    }
                    catch (e) {
                        // value is not valid XML (it is a string instead)
                        _this._value = val;
                        resolve(val);
                    }
                }
            });
        });
    };
    /** Set the video item's main definition */
    Item.prototype.setValue = function (value) {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            var val = (typeof value === 'string') ?
                value : value.toString();
            if (typeof value !== 'string') {
                _this._value = json_1.JSON.parse(val);
            }
            else {
                _this._value = val;
            }
            item_1.Item.set('prop:item', val, slot).then(function () {
                resolve(_this);
            });
        });
    };
    /** Check if item is kept loaded in memory */
    Item.prototype.getKeepLoaded = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:keeploaded', slot).then(function (val) {
                _this._keepLoaded = (val === '1');
                resolve(_this._keepLoaded);
            });
        });
    };
    /** Set Keep loaded option to ON or OFF */
    Item.prototype.setKeepLoaded = function (value) {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            _this._keepLoaded = value;
            item_1.Item.set('prop:keeploaded', (_this._keepLoaded ? '1' : '0'), slot)
                .then(function () {
                resolve(_this);
            });
        });
    };
    /** Get the type of the item */
    Item.prototype.getType = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:type', slot).then(function (val) {
                _this._type = ItemTypes[ItemTypes[Number(val)]];
                resolve(_this._type);
            });
        });
    };
    /** Get the ID of the item */
    Item.prototype.getID = function () {
        var _this = this;
        return new Promise(function (resolve) {
            resolve(_this._id);
        });
    };
    /** Get (1-indexed) Scene ID where the item is loaded */
    Item.prototype.getSceneID = function () {
        var _this = this;
        return new Promise(function (resolve) {
            resolve(Number(_this._sceneID) + 1);
        });
    };
    /** Convert the Item object to an XML string */
    Item.prototype.toXML = function () {
        var item = new json_1.JSON();
        item['tag'] = 'item';
        item['name'] = this._name;
        item['item'] = this._value;
        item['type'] = this._type;
        item['selfclosing'] = true;
        if (this._cname) {
            item['cname'] = this._cname;
        }
        return xml_1.XML.parseJSON(item);
    };
    /** Get the current source (when function is called by sources), or the source
     * that was right-clicked to open the config window (when function is called
     * from the config window) */
    Item.getCurrentSource = function () {
        return new Promise(function (resolve, reject) {
            if (environment_1.Environment.isExtension()) {
                reject(Error('Extensions do not have sources ' +
                    'associated with them.'));
            }
            else if (environment_1.Environment.isSourcePlugin() || environment_1.Environment.isSourceConfig()) {
                scene_1.Scene.searchAllForItemId(item_1.Item.getBaseID()).then(function (item) {
                    resolve(item); // this should always exist
                });
            }
        });
    };
    return Item;
})();
exports.Item = Item;
},{"../../internal/item":23,"../../internal/util/json":24,"../../internal/util/xml":26,"../environment":5,"../scene":17}],16:[function(require,module,exports){
/// <reference path="../../../defs/es6-promise.d.ts" />
var item_1 = require('../../internal/item');
var transition_1 = require('../transition');
var ItemTransition = (function () {
    function ItemTransition() {
    }
    ItemTransition.prototype.isVisible = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:visible', slot).then(function (val) {
                resolve(val === '1' ? true : false);
            });
        });
    };
    ItemTransition.prototype.setVisible = function (value) {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.set('prop:visible', value ? '1' : '0', slot).then(function () {
                resolve(_this);
            });
        });
    };
    ItemTransition.prototype.getTransition = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:transitionid', slot).then(function (val) {
                if (val === '') {
                    resolve(transition_1.Transition.NONE);
                }
                else {
                    resolve(transition_1.Transition[val.toUpperCase()]);
                }
            });
        });
    };
    ItemTransition.prototype.setTransition = function (value) {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.set('prop:transitionid', value.toString(), slot).then(function () {
                resolve(_this);
            });
        });
    };
    ItemTransition.prototype.getTransitionTime = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var slot = item_1.Item.attach(_this._id);
            item_1.Item.get('prop:transitiontime', slot).then(function (val) {
                resolve(Number(val));
            });
        });
    };
    ItemTransition.prototype.setTransitionTime = function (value) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (value < 0 || value > 60000) {
                reject(RangeError('Transparency may only be in the range 0 to 60000.'));
            }
            else {
                var slot = item_1.Item.attach(_this._id);
                item_1.Item.set('prop:transitiontime', String(value), slot).then(function () {
                    resolve(_this);
                });
            }
        });
    };
    return ItemTransition;
})();
exports.ItemTransition = ItemTransition;
},{"../../internal/item":23,"../transition":18}],17:[function(require,module,exports){
/// <reference path="../../defs/es6-promise.d.ts" />
var json_1 = require('../internal/util/json');
var xml_1 = require('../internal/util/xml');
var app_1 = require('../internal/app');
var internal_1 = require('../internal/internal');
var environment_1 = require('./environment');
var item_1 = require('./item/item');
var game_1 = require('./item/game');
var camera_1 = require('./item/camera');
var audio_1 = require('./item/audio');
var html_1 = require('./item/html');
var Scene = (function () {
    function Scene(sceneNum) {
        this._id = sceneNum - 1;
    }
    ;
    Scene._initializeScenePool = function () {
        if (Scene._scenePool.length === 0) {
            for (var i = 0; i < Scene._maxScenes; i++) {
                Scene._scenePool[i] = new Scene(i + 1);
            }
        }
    };
    /**
     * return: Scene
     *
     * Get a specific scene object given the scene number.
     *
     *
     * #### Usage
     *
     * ```javascript
     * var scene1 = Scene.getById(1);
     * ```
     */
    Scene.getById = function (sceneNum) {
        // initialize if necessary
        Scene._initializeScenePool();
        return Scene._scenePool[sceneNum - 1];
    };
    /**
     * return: Promise<Scene[]>
     *
     * Asynchronous functon to get a list of scene objects with a specific name.
     *
     *
     * #### Usage
     *
     * ```javascript
     * var scenes = Scene.getByName('Game').then(function(scenes) {
     *    // manipulate scenes
     * });
     * ```
     */
    Scene.getByName = function (sceneName) {
        // initialize if necessary
        Scene._initializeScenePool();
        var namePromise = Promise.all(Scene._scenePool.map(function (scene, index) {
            return app_1.App.get('presetname:' + index).then(function (name) {
                if (sceneName === name) {
                    return Scene._scenePool[index];
                }
                else {
                    return null;
                }
            });
        }));
        return new Promise(function (resolve) {
            namePromise.then(function (results) {
                var returnArray = [];
                for (var j = 0; j < results.length; ++j) {
                    if (results[j] !== null) {
                        returnArray.push(results[j]);
                    }
                }
                ;
                resolve(returnArray);
            });
        });
    };
    /**
     * return: Promise<Scene>
     *
     * Get the currently active scene.
     *
     *
     * #### Usage
     *
     * ```javascript
     * var myScene = Scene.getActiveScene();
     * ```
     */
    Scene.getActiveScene = function () {
        return new Promise(function (resolve) {
            if (environment_1.Environment.isSourcePlugin()) {
                app_1.App.get('presetconfig:-1').then(function (sceneString) {
                    var curScene = json_1.JSON.parse(sceneString);
                    if (curScene.children.length > 0) {
                        resolve(Scene.searchSceneWithItemId(curScene.children[0]['id']));
                    }
                    else {
                        throw new Error('presetconfig cannot fetch current scene');
                    }
                });
            }
            else {
                app_1.App.get('preset:0').then(function (id) {
                    resolve(Scene.getById(Number(id) + 1));
                });
            }
        });
    };
    /**
     * param: scene<number|Scene>
     * ```
     * return: Promise<boolean>
     * ```
     *
     * Change active scene. Does not work on source plugins.
     */
    Scene.setActiveScene = function (scene) {
        return new Promise(function (resolve, reject) {
            if (environment_1.Environment.isSourcePlugin()) {
                reject(Error('Not supported on source plugins'));
            }
            else {
                if (scene instanceof Scene) {
                    scene.getID().then(function (id) {
                        app_1.App.set('preset', String(id));
                    });
                }
                else if (typeof scene === 'number') {
                    if (scene < 1 || scene > 12) {
                        reject(Error('Invalid parameters. Valid range is 1 to 12.'));
                    }
                    else {
                        app_1.App.set('preset', String(scene - 1)).then(function (res) {
                            resolve(res);
                        });
                    }
                }
                else {
                    reject(Error('Invalid parameters'));
                }
            }
        });
    };
    /**
     *
     * Searches all scenes for an item by ID. ID search will return exactly 1 result (IDs are unique) or null.
     * See also: Core/Item
     * #Return
     * ```
     * Item
     * ```
     *
     * #### Usage
     *
     * ```javascript
     * Scene.searchAllForItemId('{10F04AE-6215-3A88-7899-950B12186359}').then(function(item) {
     *   // item is either an Item or null
     * });
     * ```
     *
     */
    Scene.searchAllForItemId = function (id) {
        var isID = /^{[A-F0-9-]*}$/i.test(id);
        if (!isID) {
            throw new Error('Not a valid ID format for items');
        }
        else {
            Scene._initializeScenePool();
            return new Promise(function (resolve) {
                var match = null;
                var found = false;
                Scene._scenePool.forEach(function (scene, idx, arr) {
                    if (match === null) {
                        scene.getItems().then((function (items) {
                            found = items.some(function (item) {
                                if (item['_id'] === id) {
                                    match = item;
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            });
                            if (found ||
                                Number(this) === arr.length - 1) {
                                resolve(match);
                            }
                        }).bind(idx));
                    }
                });
            });
        }
    };
    ;
    /**
     * return: Promise<Scene>
     *
     * Searches all scenes for one that contains the given item ID.
     *
     *
     * #### Usage
     *
     * ```javascript
     * Scene.searchSceneWithItemId('{10F04AE-6215-3A88-7899-950B12186359}').then(function(scene) {
     *   // scene contains the item
     * });
     * ```
     *
     */
    Scene.searchSceneWithItemId = function (id) {
        var isID = /^{[A-F0-9-]*}$/i.test(id);
        if (!isID) {
            throw new Error('Not a valid ID format for items');
        }
        else {
            Scene._initializeScenePool();
            return new Promise(function (resolve) {
                var match = null;
                var found = false;
                Scene._scenePool.forEach(function (scene, idx, arr) {
                    if (match === null) {
                        scene.getItems().then(function (items) {
                            found = items.some(function (item) {
                                if (item['_id'] === id) {
                                    match = Scene.getById(idx + 1);
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            });
                            if (found ||
                                idx === arr.length - 1) {
                                resolve(match);
                            }
                        });
                    }
                });
            });
        }
    };
    ;
    /**
     * return: Promise<Item[]>
     *
     * Searches all scenes for an item by name substring.
     *
     *
     * #### Usage
     *
     * ```javascript
     * Scene.searchAllForItemName('camera').then(function(items) {
     *   // do something to each item in items array
     * });
     * ```
     *
     */
    Scene.searchAllForItemName = function (param) {
        Scene._initializeScenePool();
        var matches = [];
        return new Promise(function (resolve) {
            return Promise.all(Scene._scenePool.map(function (scene) {
                return new Promise(function (resolveScene) {
                    scene.getItems().then(function (items) {
                        if (items.length === 0) {
                            resolveScene();
                        }
                        else {
                            return Promise.all(items.map(function (item) {
                                return new Promise(function (resolveItem) {
                                    item.getName().then(function (name) {
                                        if (name.match(param)) {
                                            matches.push(item);
                                            return '';
                                        }
                                        else {
                                            return item.getValue();
                                        }
                                    }).then(function (value) {
                                        if (value.toString().match(param)) {
                                            matches.push(item);
                                        }
                                        resolveItem();
                                    });
                                });
                            })).then(function () {
                                resolveScene();
                            });
                        }
                    });
                });
            })).then(function () {
                resolve(matches);
            });
        });
    };
    ;
    /**
     * return: Promise<boolean>
  
     * Load scenes that are not yet initialized in XSplit Broadcaster.
     *
     * Note: For memory saving purposes, this is not called automatically.
     * If your extension wants to manipulate multiple scenes, it is imperative that you call this function.
     * This function is only available to extensions.
     *
     * #### Usage
     *
     * ```javascript
     * Scene.initializeScenes().then(function(val) {
     *   if (val === true) {
     *     // Now you know that all scenes are loaded :)
     *   }
     * })
     * ```
     */
    Scene.initializeScenes = function () {
        return new Promise(function (resolve, reject) {
            if (environment_1.Environment.isSourcePlugin()) {
                reject(Error('function is not available for source'));
            }
            app_1.App.get('presetcount').then(function (cnt) {
                if (Number(cnt) !== 12) {
                    // Insert an empty scene for scene #12
                    app_1.App
                        .set('presetconfig:11', '<placement name="Scene 12" defpos="0" />')
                        .then(function (res) {
                        resolve(res);
                    });
                }
                else {
                    resolve(true);
                }
            });
        });
    };
    /**
     * return: number
     *
     * Get the 1-indexed scene number of this scene object.
     *
     *
     * #### Usage
     *
     * ```javascript
     * myScene.getSceneNumber().then(function(num) {
     *  console.log('My scene is scene number ' + num);
     * });
     * ```
     */
    Scene.prototype.getSceneNumber = function () {
        var _this = this;
        return new Promise(function (resolve) {
            resolve(_this._id + 1);
        });
    };
    /**
     * return: number
     *
     * Get the name of this scene object.
     *
     *
     * #### Usage
     *
     * ```javascript
     * myScene.getSceneName().then(function(name) {
     *  console.log('My scene is named ' + name);
     * });
     * ```
     */
    Scene.prototype.getName = function () {
        var _this = this;
        return new Promise(function (resolve) {
            app_1.App.get('presetname:' + _this._id).then(function (val) {
                resolve(val);
            });
        });
    };
    /**
     *
     * Set the name of this scene object. Cannot be set by source plugins.
     *
     * #### Usage
     *
     * ```javascript
     * myScene.setName('Gameplay');
     * ```
     */
    Scene.prototype.setName = function (name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (environment_1.Environment.isSourcePlugin()) {
                reject(Error('Scene names are readonly for source plugins.'));
            }
            else {
                app_1.App.set('presetname:' + _this._id, name).then(function (value) {
                    resolve(value);
                });
            }
        });
    };
    /**
     * return: Promise<Item[]>
     *
     * Gets all the items (sources) in a specific scene.
     * See also: Core/Item
     *
     * #### Usage
     *
     * ```javascript
     * myScene.getItems().then(function(items) {
     *  // do something to each item in items array
     * });
     * ```
     */
    Scene.prototype.getItems = function () {
        var _this = this;
        return new Promise(function (resolve) {
            app_1.App.getAsList('presetconfig:' + _this._id).then(function (jsonArr) {
                var promiseArray = [];
                // type checking to return correct Item subtype
                var typePromise = function (index) { return new Promise(function (typeResolve) {
                    var item = jsonArr[index];
                    var type = Number(item['type']);
                    if (type === item_1.ItemTypes.GAMESOURCE) {
                        typeResolve(new game_1.GameItem(item));
                    }
                    else if (type === item_1.ItemTypes.HTML) {
                        typeResolve(new html_1.HTMLItem(item));
                    }
                    else if (Number(jsonArr[index]['type']) === item_1.ItemTypes.LIVE &&
                        jsonArr[index]['item'].indexOf('{33D9A762-90C8-11D0-BD43-00A0C911CE86}') === -1) {
                        typeResolve(new camera_1.CameraItem(jsonArr[index]));
                    }
                    else if (Number(jsonArr[index]['type']) === item_1.ItemTypes.LIVE &&
                        jsonArr[index]['item'].indexOf('{33D9A762-90C8-11D0-BD43-00A0C911CE86}') !== -1) {
                        typeResolve(new audio_1.AudioItem(jsonArr[index]));
                    }
                    else {
                        typeResolve(new item_1.Item(jsonArr[index]));
                    }
                }); };
                if (Array.isArray(jsonArr)) {
                    for (var i = 0; i < jsonArr.length; i++) {
                        jsonArr[i]['sceneID'] = _this._id;
                        promiseArray.push(typePromise(i));
                    }
                }
                Promise.all(promiseArray).then(function (results) {
                    resolve(results);
                });
            });
        });
    };
    /**
     * Checks if a scene is empty.
     *
     * #### Usage
     *
     * ```javascript
     * myScene.isEmpty().then(function(empty) {
     *   if (empty === true) {
     *     console.log("My scene is empty.");
     *   }
     * });
     * ```
     */
    Scene.prototype.isEmpty = function () {
        var _this = this;
        return new Promise(function (resolve) {
            app_1.App.get('presetisempty:' + _this._id).then(function (val) {
                resolve(val === '1');
            });
        });
    };
    /**
     * param: Array<Item> | Array<string>
     * ```
     * return: Promise<Scene>
     * ```
     *
     * Sets the item order of the current scene. It is ordered as bottom to top.
     */
    Scene.prototype.setItemOrder = function (items) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            if (environment_1.Environment.isSourcePlugin()) {
                reject(Error('not available for source plugins'));
            }
            else {
                var ids = [];
                Scene.getActiveScene().then(function (scene) {
                    if (items.every(function (el) { return el instanceof item_1.Item; })) {
                        return new Promise(function (resolve) {
                            for (var i in items) {
                                (function (_i) {
                                    items[_i].getID().then(function (id) {
                                        ids[_i] = id;
                                        if (ids.length === items.length) {
                                            scene.getSceneNumber().then(function (id) {
                                                resolve(id);
                                            });
                                        }
                                    });
                                })(i);
                            }
                        });
                    }
                    else {
                        ids = items;
                        return scene.getSceneNumber();
                    }
                }).then(function (id) {
                    if ((Number(id) - 1) === _this._id && environment_1.Environment.isSourceConfig()) {
                        internal_1.exec('SourcesListOrderSave', ids.join(','));
                        resolve(_this);
                    }
                    else {
                        var sceneName;
                        _this.getName().then(function (name) {
                            sceneName = name;
                            return app_1.App.getAsList('presetconfig:' + _this._id);
                        }).then(function (jsonArr) {
                            var newOrder = new json_1.JSON();
                            newOrder.children = [];
                            newOrder['tag'] = 'placement';
                            newOrder['name'] = sceneName;
                            if (Array.isArray(jsonArr)) {
                                for (var i = 0; i < jsonArr.length; i++) {
                                    jsonArr[i]['name'] = jsonArr[i]['name']
                                        .replace(/([^\\])(\\)([^\\])/g, '$1\\\\$3');
                                    jsonArr[i]['item'] = jsonArr[i]['item']
                                        .replace(/([^\\])(\\)([^\\])/g, '$1\\\\$3');
                                    newOrder.children[ids.indexOf(jsonArr[i]['id'])] = jsonArr[i];
                                }
                                app_1.App.set('presetconfig:' + _this._id, xml_1.XML.parseJSON(newOrder).toString());
                            }
                        });
                    }
                });
            }
        });
    };
    Scene._maxScenes = 12;
    Scene._scenePool = [];
    return Scene;
})();
exports.Scene = Scene;
},{"../internal/app":19,"../internal/internal":22,"../internal/util/json":24,"../internal/util/xml":26,"./environment":5,"./item/audio":6,"./item/camera":7,"./item/game":8,"./item/html":9,"./item/item":15}],18:[function(require,module,exports){
/**
 * The Transition class represents a preset transition within XSplit Broadcaster.
 * This may be used to set the application's transition scheme when switching scenes,
 * or to set an individual source's transition when its visibility changes.
 *
 * Simply use one of the available Transition objects such as Transition.FAN or
 * Transition.COLLAPSE as the parameter to the setTransition method of an App
 * or Item instance.
 */
var Transition = (function () {
    function Transition(key) {
        this._key = key; // retain key so that NONE is readable
        this._value = Transition._transitionMap[key];
    }
    /**
     * Converts this transition object to the underlying string representation to be read by XSplit Broadcaster.
     */
    Transition.prototype.toString = function () {
        return this._value;
    };
    /**
     * Converts this transition object to a easily identifiable string such as 'NONE'.
     */
    Transition.prototype.toTransitionKey = function () {
        return this._key;
    };
    Transition._transitionMap = {
        NONE: '',
        CLOCK: 'clock',
        COLLAPSE: 'collapse',
        FADE: 'fade',
        FAN: 'fan',
        HOLE: 'hole',
        MOVE_BOTTOM: 'move_bottom',
        MOVE_LEFT: 'move_left',
        MOVE_LEFT_RIGHT: 'move_left_right',
        MOVE_RIGHT: 'move_right',
        MOVE_TOP: 'move_top',
        MOVE_TOP_BOTTOM: 'move_top_bottom',
        WAVE: 'wave'
    };
    Transition.NONE = new Transition('NONE');
    Transition.CLOCK = new Transition('CLOCK');
    Transition.COLLAPSE = new Transition('COLLAPSE');
    Transition.FADE = new Transition('FADE');
    Transition.FAN = new Transition('FAN');
    Transition.HOLE = new Transition('HOLE');
    Transition.MOVE_BOTTOM = new Transition('MOVE_BOTTOM');
    Transition.MOVE_LEFT = new Transition('MOVE_LEFT');
    Transition.MOVE_LEFT_RIGHT = new Transition('MOVE_LEFT_RIGHT');
    Transition.MOVE_RIGHT = new Transition('MOVE_RIGHT');
    Transition.MOVE_TOP = new Transition('MOVE_TOP');
    Transition.MOVE_TOP_BOTTOM = new Transition('MOVE_TOP_BOTTOM');
    Transition.WAVE = new Transition('WAVE');
    return Transition;
})();
exports.Transition = Transition;
},{}],19:[function(require,module,exports){
/// <reference path="../../defs/es6-promise.d.ts" />
var internal_1 = require('./internal');
var json_1 = require('./util/json');
var POSTMESSAGE_CLOSE = '1';
var POSTMESSAGE_SIZE = '2';
var App = (function () {
    function App() {
    }
    /** Get the value of the given property */
    App.get = function (name) {
        return new Promise(function (resolve) {
            internal_1.exec('AppGetPropertyAsync', name, resolve);
        });
    };
    /** Sets the value of a property */
    App.set = function (name, value) {
        return new Promise(function (resolve) {
            internal_1.exec('AppSetPropertyAsync', name, value, function (ret) {
                resolve(Number(ret) < 0 ? false : true);
            });
        });
    };
    /** Gets the value of the given property as list */
    App.getAsList = function (name) {
        return new Promise(function (resolve) {
            App.get(name).then(function (xml) {
                var propsJSON = json_1.JSON.parse(xml), propsArr = [];
                if (propsJSON.children && propsJSON.children.length > 0) {
                    propsArr = propsJSON.children;
                }
                resolve(propsArr);
            });
        });
    };
    /** Get the value of the given global property */
    App.getGlobalProperty = function (name) {
        return internal_1.exec('GetGlobalProperty', name);
    };
    /** Calls a DLL function synchronously */
    App.callDll = function (func) {
        var arg = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            arg[_i - 1] = arguments[_i];
        }
        var args = [].slice.call(arguments);
        args.unshift('CallDll');
        return internal_1.exec.apply(this, args);
    };
    /** Calls an application method asynchronously */
    App.callFunc = function (func, arg) {
        return new Promise(function (resolve) {
            internal_1.exec('AppCallFuncAsync', func, arg, function (ret) {
                resolve(ret);
            });
        });
    };
    App.postMessage = function (key) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return new Promise(function (resolve) {
            args.unshift(key);
            args.unshift('PostMessageToParent');
            args.push(function (val) {
                resolve(val);
            });
            internal_1.exec.apply(_this, args);
        });
    };
    return App;
})();
exports.App = App;
},{"./internal":22,"./util/json":24}],20:[function(require,module,exports){
/// <reference path="../../defs/es6-promise.d.ts" />
var Global = (function () {
    function Global() {
    }
    Global.addInitializationPromise = function (promise) {
        Global.initialPromises.push(promise);
    };
    Global.getInitializationPromises = function () {
        return Global.initialPromises;
    };
    Global.setPersistentConfig = function (config) {
        Global.persistedConfig = config;
    };
    Global.getPersistentConfig = function () {
        return Global.persistedConfig;
    };
    Global.persistedConfig = {};
    Global.initialPromises = [];
    return Global;
})();
exports.Global = Global;
},{}],21:[function(require,module,exports){
/// <reference path="../../defs/es6-promise.d.ts" />
var environment_1 = require('../core/environment');
var item_1 = require('./item');
var internal_1 = require('./internal');
var global_1 = require('./global');
var config_1 = require('../context/config');
require('../util/ready');
function resolveRelativePath(path, base) {
    // ABSOLUTE PATHS
    if (path.substring(0, 7) === 'http://' ||
        path.substring(0, 8) === 'https://') {
        return path;
    }
    else if (path.substring(0, 2) === '//') {
        // get current protocol
        return base.split('://')[0] + ':' + path;
    }
    else if (path.substring(0, 3) === '../') {
        // RELATIVE PATHS
        var upDirectoryCount = 0;
        // count ../ segments
        while (path.substring(0, 3) === '../') {
            path = path.substring(3);
            ++upDirectoryCount;
        }
        var baseDirectories = base.split('/');
        baseDirectories = baseDirectories.slice(0, length - 1 - upDirectoryCount);
        baseDirectories.push(path);
        return baseDirectories.join('/');
    }
    else {
        if (path.substring(0, 2) === './') {
            path = path.substring(2);
        }
        var baseSegments = base.split('/');
        baseSegments[baseSegments.length - 1] = path;
        return baseSegments.join('/');
    }
}
function readMetaConfigUrl() {
    return new Promise(function (resolve) {
        if (environment_1.Environment.isSourcePlugin()) {
            var configObj = {};
            // initialize config URL if necessary
            try {
                var config = internal_1.exec('GetConfiguration');
                configObj = JSON.parse(config);
            }
            catch (e) {
            }
            finally {
                var metas = document.getElementsByTagName("meta");
                for (var i = metas.length - 1; i >= 0; i--) {
                    if (metas[i].name === 'xsplit:config-url') {
                        var url = resolveRelativePath(metas[i].content, window.location.href);
                        configObj['configUrl'] = url;
                        var persist = {
                            configUrl: url
                        };
                        global_1.Global.setPersistentConfig(persist);
                        break;
                    }
                }
                internal_1.exec('SetBrowserProperty', 'Configuration', JSON.stringify(configObj));
                resolve();
            }
        }
        else {
            resolve();
        }
    });
}
function getCurrentSourceID() {
    return new Promise(function (resolve) {
        if (environment_1.Environment.isSourcePlugin() || environment_1.Environment.isSourceConfig()) {
            // initialize Item.getSource() functions
            internal_1.exec('GetLocalPropertyAsync', 'prop:id', function (result) {
                var id = decodeURIComponent(result);
                item_1.Item.setBaseID(id);
                if (environment_1.Environment.isSourcePlugin()) {
                    item_1.Item.lockSourceSlot(id);
                }
                resolve();
            });
        }
        else {
            resolve();
        }
    });
}
function informWhenConfigLoaded() {
    return new Promise(function (resolve) {
        if (environment_1.Environment.isSourceConfig()) {
            window.addEventListener('load', function () {
                config_1.SourceConfigWindow.getInstance().emit('config-load');
                resolve();
            });
        }
        else {
            resolve(); // other environments don't care if config iframe has loaded
        }
    });
}
function init() {
    global_1.Global.addInitializationPromise(readMetaConfigUrl());
    global_1.Global.addInitializationPromise(getCurrentSourceID());
    global_1.Global.addInitializationPromise(informWhenConfigLoaded());
    Promise.all(global_1.Global.getInitializationPromises()).then(function () {
        document.dispatchEvent(new CustomEvent('xsplit-js-ready', {
            bubbles: true
        }));
    });
}
init();
},{"../context/config":1,"../core/environment":5,"../util/ready":34,"./global":20,"./internal":22,"./item":23}],22:[function(require,module,exports){
/// <reference path="../../defs/window.d.ts" />
exports.DEBUG = false;
var _callbacks = {};
/**
* Executes an external function
*/
function exec(funcName) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var callback = null, ret = false;
    if (args.length > 0) {
        callback = args[args.length - 1];
        if (callback instanceof Function) {
            args.pop();
        }
        else {
            callback = null;
        }
    }
    if (exports.DEBUG) {
        console.log([
            'internal.exec("', funcName, '") ', JSON.stringify(args)
        ].join(' '));
    }
    if (window.external &&
        window.external[funcName] &&
        window.external[funcName] instanceof Function) {
        ret = window.external[funcName].apply(this, args);
    }
    // register callback if present
    if (callback !== null) {
        _callbacks[ret] = callback;
    }
    return ret;
}
exports.exec = exec;
window.OnAsyncCallback = function (asyncID, result) {
    var callback = _callbacks[asyncID];
    if (callback instanceof Function) {
        callback.call(this, decodeURIComponent(result));
    }
};
window.OnSceneLoad = function (view, scene) {
    document.dispatchEvent(new CustomEvent('scene-load', { detail: { view: view, scene: scene } }));
};
window.SetConfiguration = function (config) {
    document.dispatchEvent(new CustomEvent('set-configuration', { config: config }));
};
window.SetBackGroundColor = function (color) {
    document.dispatchEvent(new CustomEvent('set-background-color', { color: color }));
};
window.SetVolume = function (volume) {
    document.dispatchEvent(new CustomEvent('set-volume', { volume: volume }));
};
window.OnDialogResult = function (result) {
    document.dispatchEvent(new CustomEvent('dialog-result', { detail: { result: result } }));
};
},{}],23:[function(require,module,exports){
/// <reference path="../../defs/es6-promise.d.ts" />
var internal_1 = require('./internal');
var environment_1 = require('../core/environment');
var Item = (function () {
    function Item() {
    }
    /** Prepare an item for manipulation */
    Item.attach = function (itemID) {
        var slot = Item.itemSlotMap.indexOf(itemID);
        if (slot === -1) {
            slot = ++Item.lastSlot % Item.MAX_SLOTS;
            if (Item.islockedSourceSlot && slot === 0) {
                ++slot; // source cannot attach to first slot
            }
            Item.lastSlot = slot;
            Item.itemSlotMap[slot] = itemID;
            if (environment_1.Environment.isExtension()) {
                internal_1.exec('SearchVideoItem' +
                    (String(slot) === '0' ? '' : (slot + 1)), itemID);
            }
            else {
                internal_1.exec('AttachVideoItem' +
                    (String(slot) === '0' ? '' : (slot + 1)), itemID);
            }
        }
        return slot;
    };
    /** used for source plugins. lock an id to slot 0 */
    Item.lockSourceSlot = function (itemID) {
        if (itemID !== undefined) {
            Item.islockedSourceSlot = true;
            Item.itemSlotMap[0] = itemID;
        }
        else {
            Item.islockedSourceSlot = false;
            Item.itemSlotMap[0] = '';
        }
    };
    /** Get an item's local property asynchronously */
    Item.get = function (name, slot) {
        if (slot === void 0) { slot = 0; }
        return new Promise(function (resolve) {
            internal_1.exec('GetLocalPropertyAsync' +
                (String(slot) === '0' ? '' : slot + 1), name, function (val) {
                resolve(val);
            });
        });
    };
    /** Sets an item's local property */
    Item.set = function (name, value, slot) {
        if (slot === void 0) { slot = 0; }
        return new Promise(function (resolve) {
            internal_1.exec('SetLocalPropertyAsync' +
                (String(slot) === '0' ? '' : slot + 1), name, value, function (val) {
                resolve(!(Number(val) < 0));
            });
        });
    };
    /** Calls a function defined in an item/source */
    Item.callFunc = function (func, arg) {
        internal_1.exec('CallInner', func, arg);
    };
    /** helper function to get current source on init */
    Item.setBaseID = function (id) {
        Item.baseID = id;
    };
    /** helper function for Item.getCurrentSource() */
    Item.getBaseID = function () {
        return Item.baseID;
    };
    Item.MAX_SLOTS = 2;
    Item.lastSlot = Item.MAX_SLOTS - 1;
    Item.itemSlotMap = [];
    Item.islockedSourceSlot = false;
    return Item;
})();
exports.Item = Item;
},{"../core/environment":5,"./internal":22}],24:[function(require,module,exports){
var xml_1 = require('./xml');
var JSON = (function () {
    function JSON(xml) {
        if (xml === undefined || xml === '') {
            return;
        }
        var sxml = xml;
        if (xml instanceof xml_1.XML) {
            sxml = xml.toString();
        }
        var openingRegex = /<([^\s>\/]+)/g;
        var selfCloseRegex = /(\/>)/g;
        var openResult = openingRegex.exec(sxml);
        var selfCloseResult = selfCloseRegex.exec(sxml);
        var xmlDocument = (new DOMParser()).parseFromString(sxml, 'application/xml');
        if (xmlDocument.getElementsByTagName('parsererror').length > 0) {
            throw new Error('XML parsing error. Invalid XML string');
        }
        var processNode = function (node) {
            var obj = new JSON();
            obj.tag = node.tagName;
            // FIXME: optimize complex condition
            // every time we process a new node, we advance the opening tag regex
            openResult = openingRegex.exec(sxml);
            if (openResult === null && selfCloseRegex.lastIndex === 0) {
            }
            else if (openResult === null && selfCloseRegex.lastIndex > 0) {
                // no more opening tags, so by default the self-closing belongs to this
                obj.selfclosing = true;
                selfCloseResult = selfCloseRegex.exec(sxml);
            }
            else if (openResult !== null &&
                selfCloseRegex.lastIndex > openingRegex.lastIndex) {
            }
            else if (openResult !== null &&
                selfCloseRegex.lastIndex < openingRegex.lastIndex &&
                selfCloseRegex.lastIndex === openingRegex.lastIndex -
                    openResult[0].length // make sure self-closing pattern belongs to
            ) {
                obj.selfclosing = true;
                selfCloseResult = selfCloseRegex.exec(sxml);
            }
            for (var i = 0; i < node.attributes.length; i++) {
                var att = node.attributes[i];
                obj[att.name] = att.value;
            }
            obj.children = [];
            // FIXME: self-closing nodes do not have children, maybe optimize then?
            for (var j = 0; j < node.childNodes.length; j++) {
                var child = node.childNodes[j];
                if (child instanceof Element) {
                    obj.children.push(processNode(child));
                }
            }
            // process text value
            if (obj.value === undefined && obj.children.length === 0) {
                delete obj.children;
                obj.value = node.textContent;
            }
            return obj;
        };
        return processNode(xmlDocument.childNodes[0]);
    }
    JSON.parse = function (xml) {
        return new JSON(xml);
    };
    return JSON;
})();
exports.JSON = JSON;
},{"./xml":26}],25:[function(require,module,exports){
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(function (baseCtor) {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
            if (name === 'constructor') {
                return;
            }
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
exports.applyMixins = applyMixins;
},{}],26:[function(require,module,exports){
var XML = (function () {
    function XML(json) {
        var attributes = '';
        var value = '';
        if (json.value === undefined) {
            json.value = '';
        }
        for (var key in json) {
            if (!XML.RESERVED_ATTRIBUTES.test(key) &&
                json[key] !== undefined) {
                attributes += [' ', key, '="', json[key], '"'].join('');
            }
        }
        if (json.children === undefined) {
            json.children = [];
        }
        for (var _i = 0, _a = json.children; _i < _a.length; _i++) {
            var child = _a[_i];
            json.value += new XML(child).toString();
        }
        if (json.selfclosing === true) {
            this.xml = ['<', json.tag, attributes, '/>'].join('');
        }
        else if (value !== '') {
            this.xml = ['<', json.tag, attributes, '>',
                value, '</', json.tag, '>'].join('');
        }
        else {
            // json actually contains text content
            this.xml = ['<', json.tag, attributes, '>',
                json.value, '</', json.tag, '>'].join('');
        }
    }
    XML.prototype.toString = function () {
        return this.xml;
    };
    XML.parseJSON = function (json) {
        return new XML(json);
    };
    XML.encode = function (str) {
        return str.replace(/[&<>'']/g, function ($0) {
            return '&' + {
                '&': 'amp',
                '<': 'lt',
                '>': 'gt',
                '\'': 'quot',
                '"': '#39'
            }[$0] + ';';
        });
    };
    XML.RESERVED_ATTRIBUTES = /^(children|tag|value|selfclosing)$/i;
    return XML;
})();
exports.XML = XML;
},{}],27:[function(require,module,exports){
/// <reference path="../../defs/es6-promise.d.ts" />
var json_1 = require('../internal/util/json');
var xml_1 = require('../internal/util/xml');
/**
 * The AudioDevice Class is the object returned by
 * {@link #system/System System Class'} getAudioDevices method. It provides you
 * with methods to fetch the audio device object's attributes, and also provides
 * methods to convert it back to an XML object that is compatible with XBC
 *
 * ### Basic Usage
 *
 * ```javascript
 * var XJS = require('xjs');
 * var System = XJS.System;
 *
 * System.getAudioDevices().then(function(audios) {
 *   for (var i in audios) {
 *     // Do not include the imaginary xsplit audio device if that ever exist
 *     if (audios[i].getName().indexOf('xsplit') === -1) {
 *       xml = audios[i].toXML();
 *       // do something with the XML here
 *     }
 *   }
 * });
 * ```
 */
var AudioDevice = (function () {
    function AudioDevice(props) {
        this._defaultConsole = false;
        this._defaultMultimedia = false;
        this._defaultCommunication = false;
        props = props || {};
        this._id = props['id'];
        this._name = props['name'];
        this._adapter = props['adapter'];
        this._adapterdev = props['adapterdev'];
        this._dSoundGuid = props['dSoundGuid'];
        this._dataFlow = props['dataFlow'];
        this._state = props['state'];
        this._defaultConsole = props['defaultConsole'];
        this._defaultMultimedia = props['defaultMultimedia'];
        this._defaultCommunication = props['defaultCommunication'];
        this._level = props['level'] !== undefined ? props['level'] : 1.000000;
        this._enable = props['enable'] !== undefined ? props['enable'] : true;
        this._hwlevel = props['hwlevel'] !== undefined ? props['hwlevel'] : -1.000000;
        this._hwenable = props['hwenable'] !== undefined ? props['hwenable'] : 255;
        this._delay = props['delay'] !== undefined ? props['delay'] : 0;
        this._mix = props['mix'] !== undefined ? props['mix'] : 0;
    }
    /**
     * return: string
     *
     * Gets the device ID
     *
     * #### Usage
     *
     * ```javascript
     * var audioDeviceID = device.getID();
     * ```
     */
    AudioDevice.prototype.getId = function () {
        return this._id;
    };
    /**
     * return: string
     *
     * Gets the device name
     *
     * #### Usage
     *
     * ```javascript
     * var audioDeviceName = device.getName();
     * ```
     */
    AudioDevice.prototype.getName = function () {
        return this._name;
    };
    /**
     * return: string
     *
     * Gets whether device is capturing or rendering audio
     *
     * #### Usage
     *
     * ```javascript
     * var audioDataFlow = device.getDataFlow();
     *   //where possible values are "render" or "capture"
     * ```
     */
    AudioDevice.prototype.getDataFlow = function () {
        return this._dataFlow;
    };
    /**
     * return: boolean
     *
     * Gets whether audio device is the system default
     *
     * #### Usage
     *
     * ```javascript
     * var audioIsDefaultDevice = audioDevice.isDefaultDevice();
     * ```
     */
    AudioDevice.prototype.isDefaultDevice = function () {
        return (this._defaultConsole && this._defaultMultimedia);
    };
    /**
     * return: number
     *
     * Gets the device audio level in the application
     *
     * #### Usage
     *
     * ```javascript
     * var audioDeviceVolumeLevel = audioDevice.getLevel();
     * ```
     */
    AudioDevice.prototype.getLevel = function () {
        return this._level;
    };
    /**
     * param: level<number>
     * ```
     * return: AudioDevice (used for chaining)
     * ```
     *
     * Sets the device audio level in the application
     *
     * #### Usage
     *
     * ```javascript
     * audioDevice.setLevel(100);
     * ```
     */
    AudioDevice.prototype.setLevel = function (level) {
        this._level = level;
        return this;
    };
    /**
     * return: boolean
     *
     * Gets whether audio device is the system default
     *
     * #### Usage
     *
     * ```javascript
     * var isAudioDeviceEnabled = audioDevice.isEnabled();
     * ```
     */
    AudioDevice.prototype.isEnabled = function () {
        return this._enable;
    };
    /**
     * param: enabled<boolean>
     * ```
     * return: AudioDevice (used for chaining)
     * ```
     *
     * Enables audio device/sets software mute
     *
     * #### Usage
     *
     * ```javascript
     * audioDevice.setEnabled(true);
     * ```
     */
    AudioDevice.prototype.setEnabled = function (enabled) {
        this._enable = enabled;
        return this;
    };
    /**
     * return: number
     *
     * Gets the device system volume
     *
     * #### Usage
     *
     * ```javascript
     * var systemVolumeLevel = audioDevice.getSystemLevel();
     * ```
     */
    AudioDevice.prototype.getSystemLevel = function () {
        return this._hwlevel;
    };
    /**
     * param: volume<number>
     * ```
     * return: AudioDevice (used for chaining)
     * ```
     *
     * Sets the device system volume
     *
     * #### Usage
     *
     * ```javascript
     * audioDevice.setSystemLevel(100);
     * ```
     */
    AudioDevice.prototype.setSystemLevel = function (hwlevel) {
        this._hwlevel = hwlevel;
        return this;
    };
    /**
     * return: number
     *
     * Gets whether audio device is enabled/muted in the system
     *
     * #### Usage
     *
     * ```javascript
     * var systemAudioDeviceEnabled = audioDevice.getSystemEnabled();
     * ```
     */
    AudioDevice.prototype.getSystemEnabled = function () {
        return this._hwenable;
    };
    /**
     * param: systemEnabled<number>
     * ```
     * return: AudioDevice (used for chaining)
     * ```
     *
     * Enables audio device/sets software mute
     *
     * #### Usage
     *
     * ```javascript
     * // you may use the following:
     * //     * AudioDevice.SYSTEM_LEVEL_MUTE (0)
     * //     * AudioDevice.SYSTEM_LEVEL_ENABLE (1)
     * //     * AudioDevice.SYSTEM_MUTE_CHANGE_NOT_ALLOWED (255)
     * audioDevice.setSystemEnabled(AudioDevice.SYSTEM_LEVEL_MUTE);
     * ```
     */
    AudioDevice.prototype.setSystemEnabled = function (hwenabled) {
        this._hwenable = hwenabled;
        return this;
    };
    /**
     * return: number (100 nanoseconds in units)
     *
     * Get the loopback capture delay value
     *
     * #### Usage
     *
     * ```javascript
     * var audioDelay = audioDevice.getDelay();
     * ```
     */
    AudioDevice.prototype.getDelay = function () {
        return this._delay;
    };
    /**
     * param: delay<number> (100 nanoseconds in units)
     * ```
     * return: AudioDevice (used for chaining)
     * ```
     *
     * Sets the loopback capture delay value
     *
     * #### Usage
     *
     * ```javascript
     * audioDevice.setDelay(100);
     * ```
     */
    AudioDevice.prototype.setDelay = function (delay) {
        this._delay = delay;
        return this;
    };
    /**
     * return: string
     *
     * Converts the AudioDevice item to XML-formatted string
     *
     * #### Usage
     *
     * ```javascript
     * var audioDeviceXMLString = AudioDevice.toString();
     * ```
     */
    AudioDevice.prototype.toString = function () {
        var device = new json_1.JSON();
        device.tag = 'dev';
        device.selfclosing = true;
        device['id'] = this.getId();
        device['level'] = this.getLevel().toFixed(6);
        device['enable'] = this.isEnabled() ? 1 : 0;
        device['hwlevel'] = this.getSystemLevel().toFixed(6);
        device['hwenable'] = this.getSystemEnabled();
        device['delay'] = this.getDelay();
        device['mix'] = this._mix;
        return xml_1.XML.parseJSON(device).toString();
    };
    /**
     * param: deviceJXON<JSON>
     * ```
     * return: AudioDevice
     * ```
     *
     * Converts a JSON object into an AudioDevice object
     *
     * #### Usage
     *
     * ```javascript
     * var newAudioDevice = AudioDevice.parse(deviceJSONObj);
     * ```
     */
    AudioDevice.parse = function (deviceJXON) {
        var audio = new AudioDevice({
            id: deviceJXON['id'],
            name: deviceJXON['name'],
            adapter: deviceJXON['adapter'],
            adapterdev: deviceJXON['adapterdev'],
            dataFlow: deviceJXON['DataFlow'],
            state: deviceJXON['State'],
            dSoundGuid: deviceJXON['DSoundGuid'],
            defaultCommunication: (deviceJXON['DefaultCommunication'] === '1'),
            defaultConsole: (deviceJXON['DefaultConsole'] === '1'),
            defaultMultimedia: (deviceJXON['DefaultMultimedia'] === '1')
        });
        audio.setLevel(Number(deviceJXON['level'] !== undefined ? deviceJXON['level'] : 1))
            .setEnabled(deviceJXON['enable'] !== undefined ? deviceJXON['enable'] === '1' : true)
            .setSystemLevel(Number(deviceJXON['hwlevel'] !== undefined ? deviceJXON['hwlevel'] : -1))
            .setSystemEnabled(deviceJXON['hwenable'] !== undefined ? deviceJXON['hwenable'] : 255)
            .setDelay(Number(deviceJXON['delay'] !== undefined ? deviceJXON['delay'] : 0));
        return audio;
    };
    AudioDevice.STATE_ACTIVE = 'Active';
    AudioDevice.DATAFLOW_RENDER = 'Render';
    AudioDevice.DATAFLOW_CAPTURE = 'Capture';
    AudioDevice.SYSTEM_LEVEL_MUTE = 0;
    AudioDevice.SYSTEM_LEVEL_ENABLE = 1;
    AudioDevice.SYSTEM_MUTE_CHANGE_NOT_ALLOWED = 255;
    return AudioDevice;
})();
exports.AudioDevice = AudioDevice;
},{"../internal/util/json":24,"../internal/util/xml":26}],28:[function(require,module,exports){
/// <reference path="../../defs/es6-promise.d.ts" />
var json_1 = require('../internal/util/json');
var xml_1 = require('../internal/util/xml');
/**
 * The CameraDevice Class is the object returned by
 * {@link #system/System System Class'} getCameraDevices method. It provides
 * you with methods to fetch the Camera Device's id, name, and convert it to
 * an XML object that is compatible with XBC
 *
 * ### Basic Usage
 *
 * ```javascript
 * var XJS = require('xjs');
 * var System = XJS.System;
 *
 * System.getCameraDevices().then(function(cameras) {
 *   for (var i in cameras) {
 *     // Do not include the imaginary xsplit camera if that ever exist
 *     if (cameras[i].getName().indexOf('xsplit') === -1) {
 *       xml = cameras[i].toXML();
 *       // do something with the XML here
 *     }
 *   }
 * });
 * ```
 */
var CameraDevice = (function () {
    function CameraDevice(props) {
        this._id = props['id'];
        this._name = props['name'];
    }
    /**
     * return: string
     *
     * Get the ID of the device. The ID of the device is based on the `disp`
     * attribute of the devices XML
     *
     * #### Usage
     *
     * ```javascript
     * var cameraID = device.getID();
     * ```
     */
    CameraDevice.prototype.getId = function () {
        return this._id;
    };
    /**
     * return: string
     *
     * Get the Name of the device.
     *
     * #### Usage
     *
     * ```javascript
     * var cameraName = device.getName();
     * ```
     */
    CameraDevice.prototype.getName = function () {
        return this._name;
    };
    /**
     * return: XML
     *
     * Convert the current CameraDevice object to XML
     *
     * #### Usage
     *
     * ```javascript
     * var xml = device.toXML();
     * ```
     */
    CameraDevice.prototype.toXML = function () {
        var json = new json_1.JSON();
        json['disp'] = this._id;
        json['name'] = this._name;
        return xml_1.XML.parseJSON(json);
    };
    /**
     * param: deviceJSON<JXON>
     * ```
     * return: CameraDevice
     * ```
     *
     * Create a CameraDevice object based on a JXON object
     *
     * #### Usage
     *
     * ```javascript
     * var camera = CameraDevice.parse(JSONObj);
     * ```
     */
    CameraDevice.parse = function (deviceJSON) {
        var cam = new CameraDevice({
            id: deviceJSON['disp'],
            name: deviceJSON['name']
        });
        return cam;
    };
    return CameraDevice;
})();
exports.CameraDevice = CameraDevice;
},{"../internal/util/json":24,"../internal/util/xml":26}],29:[function(require,module,exports){
/// <reference path="../../defs/es6-promise.d.ts" />
var rectangle_1 = require('../util/rectangle');
var json_1 = require('../internal/util/json');
var xml_1 = require('../internal/util/xml');
var app_1 = require('../internal/app');
/**
 * The Game Class is the object returned by {@link #system/System System Class'}
 * getGames method. It provides you with methods to fetch the game object's
 * attributes, and also provides methods to convert it back to an XML object
 * that is compatible with XBC
 *
 * ### Basic Usage
 *
 * ```javascript
 * var XJS = require('xjs');
 * var System = XJS.System;
 * var xml;
 *
 * System.getGames().then(function(games) {
 * 	for (var i in games) {
 * 		if(games[i].isFullscreen()) {
 * 			xml = games[i].toXML();
 * 			// Do something with the xml here. Probably add it to the current scene
 * 		}
 * 	}
 * });
 * ```
 */
var Game = (function () {
    function Game() {
    }
    /**
     * return: number
     *
     * Gets the game's process ID.
     *
     * #### Usage
     *
     * ```javascript
     * var processId = game.getPid();
     * ```
     */
    Game.prototype.getPid = function () {
        return this._pid;
    };
    /**
     * return: number
     *
     * Gets the Graphics API handle.
     *
     * #### Usage
     *
     * ```javascript
     * var handle = game.getHandle();
     * ```
     */
    Game.prototype.getHandle = function () {
        return this._handle;
    };
    /**
     * return: number
     *
     * Gets the window handle.
     *
     * #### Usage
     *
     * ```javascript
     * var windowHandle = game.getWindowHandle();
     * ```
     */
    Game.prototype.getWindowHandle = function () {
        return this._hwnd;
    };
    /**
     * return: string
     *
     * Gets the Graphics API type.
     *
     * #### Usage
     *
     * ```javascript
     * var gApiType = game.getGapiType();
     * ```
     *
     * #### Possible Values
     *
     * ```
     * OGL, DX8, DX8_SwapChain, DX9, DX9Ex, DX9_SwapChain,
     * DX9_PresentEx, DX10, DX11, DX11.1, DX11.1_Present1
     * ```
     */
    Game.prototype.getGapiType = function () {
        return this._gapitype;
    };
    /**
     * return: Rectangle
     *
     * Gets the game resolution.
     *
     * #### Usage
     *
     * ```javascript
     * var resolution = game.getResolution();
     * ```
     */
    Game.prototype.getResolution = function () {
        return rectangle_1.Rectangle.fromDimensions(this._width, this._height);
    };
    /**
     * return: boolean
     *
     * Checks if game has exclusive full screen.
     *
     * #### Usage
     *
     * ```javascript
     * var isFullscreen = game.isFullscreen();
     * ```
     */
    Game.prototype.isFullscreen = function () {
        return this._flags === 1 ? true : false;
    };
    /**
     * return: string
     *
     * Gets the window title
     *
     * #### Usage
     *
     * ```javascript
     * var windowName = game.getWindowName();
     * ```
     */
    Game.prototype.getWindowName = function () {
        return this._wndname;
    };
    /**
     * return: number
     *
     * Gets timestamp of last frame in milliseconds.
     *
     * #### Usage
     *
     * ```javascript
     * var lastFrameTimestamp = game.getLastFrameTimestamp();
     * ```
     */
    Game.prototype.getLastFrameTimestamp = function () {
        return this._lastframets;
    };
    /**
     * Get the FPS Render of the game
     */
    Game.prototype.getFpsRender = function () {
        return this._fpsRender;
    };
    /**
     * Get the Captured FPS of the game
     */
    Game.prototype.getFpsCapture = function () {
        return this._fpsCapture;
    };
    /**
     * Get the image name of the game
     */
    Game.prototype.getImageName = function () {
        return this._imagename;
    };
    /**
     * Get the replace image value of the game
     */
    Game.prototype.getReplace = function () {
        return this._replace;
    };
    /**
     * param: gameJSON<JXON>
     * ```
     * return: Game
     * ```
     *
     * Converts a JSON object into a Game object
     *
     * #### Usage
     *
     * ```javascript
     * var XJS = require('xjs');
     * var game = XJS.Game.parse(jsonObj);
     * ```
     */
    Game.parse = function (jxon) {
        var g = new Game();
        g._pid = jxon['pid'] !== undefined ? parseInt(jxon['pid']) : undefined;
        g._handle = jxon['handle'] !== undefined ? parseInt(jxon['handle']) :
            undefined;
        g._hwnd = jxon['hwnd'] !== undefined ? parseInt(jxon['hwnd']) : undefined;
        g._gapitype = jxon['GapiType'];
        g._width = jxon['width'] !== undefined ? parseInt(jxon['width']) :
            undefined;
        g._height = jxon['height'] !== undefined ? parseInt(jxon['height']) :
            undefined;
        g._flags = jxon['flags'] !== undefined ? parseInt(jxon['flags']) :
            undefined;
        g._wndname = jxon['wndname'];
        g._lastframets = jxon['lastframets'] !== undefined ?
            parseInt(jxon['lastframets']) : undefined;
        g._fpsRender = jxon['fpsRender'] !== undefined ? Number(jxon['fpsRender']) :
            undefined;
        g._fpsCapture = jxon['fpsCapture'] !== undefined ?
            Number(jxon['fpsCapture']) : undefined;
        g._imagename = jxon['imagename'];
        g._replace = jxon['replace'];
        return g;
    };
    /**
     * return: XML
     *
     * Converts Game object into an XML object
     *
     * #### Usage
     *
     * ```javascript
     * var gameXML = game.toXML();
     * ```
     */
    Game.prototype.toXML = function () {
        var gamesource = new json_1.JSON();
        gamesource.tag = 'src';
        gamesource['pid'] = this._pid;
        gamesource['handle'] = this._handle;
        gamesource['hwnd'] = this._hwnd;
        gamesource['gapitype'] = this._gapitype;
        gamesource['width'] = this._width;
        gamesource['height'] = this._height;
        gamesource['flags'] = this._flags;
        gamesource['wndname'] = this._wndname;
        gamesource['lastframets'] = this._lastframets;
        gamesource['selfclosing'] = true;
        return xml_1.XML.parseJSON(gamesource);
    };
    Game.prototype.addToScene = function () {
        var _this = this;
        return new Promise(function (resolve) {
            app_1.App.callFunc('addgamesource', 'dev:' + _this.toXML()).then(function () {
                resolve(true);
            });
        });
    };
    return Game;
})();
exports.Game = Game;
},{"../internal/app":19,"../internal/util/json":24,"../internal/util/xml":26,"../util/rectangle":35}],30:[function(require,module,exports){
/// <reference path="../../defs/es6-promise.d.ts" />
var json_1 = require('../internal/util/json');
var xml_1 = require('../internal/util/xml');
var app_1 = require('../internal/app');
var MicrophoneDevice = (function () {
    function MicrophoneDevice() {
    }
    MicrophoneDevice.parse = function (jxon) {
        var m = new MicrophoneDevice();
        m._disp = jxon['disp'];
        m._name = jxon['name'];
        return m;
    };
    /**
     * return: XML
     *
     * Converts Microphone object into an XML object
     *
     * #### Usage
     *
     * ```javascript
     * var microphoneXML = microphone.toXML();
     * ```
     */
    MicrophoneDevice.prototype.toXML = function () {
        var microphone = new json_1.JSON();
        microphone.tag = 'item';
        microphone['item'] = this._disp;
        microphone['name'] = this._name;
        microphone['type'] = '2'; // type LIVE
        microphone['selfclosing'] = true;
        return xml_1.XML.parseJSON(microphone);
    };
    MicrophoneDevice.prototype.addToScene = function () {
        var _this = this;
        return new Promise(function (resolve) {
            app_1.App.callFunc('additem', _this.toXML().toString()).then(function () {
                resolve(true);
            });
        });
    };
    return MicrophoneDevice;
})();
exports.MicrophoneDevice = MicrophoneDevice;
},{"../internal/app":19,"../internal/util/json":24,"../internal/util/xml":26}],31:[function(require,module,exports){
/// <reference path="../../defs/es6-promise.d.ts" />
var app_1 = require('../internal/app');
var audio_1 = require('./audio');
var microphone_1 = require('./microphone');
var camera_1 = require('./camera');
var game_1 = require('./game');
var environment_1 = require('../core/environment');
var internal_1 = require('../internal/internal');
/**
 * This enum is used for {@link #system/System System Class'} getAudioDevices
 * method's first parameter.
 *
 * ### Basic Usage
 *
 * ```javascript
 * var XJS = require('xjs');
 * XJS.System.getAudioDevices(XJS.AudioDeviceDataflow.CAPTURE, ...);
 * ```
 */
(function (AudioDeviceDataflow) {
    AudioDeviceDataflow[AudioDeviceDataflow["RENDER"] = 1] = "RENDER";
    AudioDeviceDataflow[AudioDeviceDataflow["CAPTURE"] = 2] = "CAPTURE";
    AudioDeviceDataflow[AudioDeviceDataflow["ALL"] = 3] = "ALL";
})(exports.AudioDeviceDataflow || (exports.AudioDeviceDataflow = {}));
var AudioDeviceDataflow = exports.AudioDeviceDataflow;
/**
 * This enum is used for {@link #system/System System Class'} getAudioDevices
 * method's second parameter.
 *
 * ### Basic Usage
 *
 * ```javascript
 * var XJS = require('xjs');
 * XJS.System.getAudioDevices(..., XJS.AudioDeviceState.ACTIVE);
 * ```
 */
(function (AudioDeviceState) {
    AudioDeviceState[AudioDeviceState["ACTIVE"] = 1] = "ACTIVE";
    AudioDeviceState[AudioDeviceState["DISABLED"] = 2] = "DISABLED";
    AudioDeviceState[AudioDeviceState["UNPLUGGED"] = 4] = "UNPLUGGED";
    AudioDeviceState[AudioDeviceState["NOTPRESENT"] = 8] = "NOTPRESENT";
    AudioDeviceState[AudioDeviceState["ALL"] = 15] = "ALL";
})(exports.AudioDeviceState || (exports.AudioDeviceState = {}));
var AudioDeviceState = exports.AudioDeviceState;
/**
 * The System class provides you methods to fetch audio devices to manipulate
 * the application's audio settings. It also allows you to fetch games,
 * microphone devices and camera devices to add to scenes. Finally, some
 * system-level functionality such as cursor position is exposed.
 *
 * ### Basic Usage
 *
 * ```javascript
 * var XJS = require('xjs');
 * var System = XJS.System;
 *
 * System.getCameraDevices().then(function(cameras) {
 *   window.cameras = cameras;
 * });
 * ```
 */
var System = (function () {
    function System() {
    }
    /**
     * return: Promise<AudioDevice[]>
     *
     * Gets audio devices, both input and output
     * See also: System/AudioDevice
     *
     * #### Usage
     *
     * ```javascript
     * System.getAudioDevices(
     *   XML.AudioDeviceDataflow.ALL,
     *   XML.AudioDeviceState.ACTIVE
     * ).then(function(devices) {
     *   // devices is an array of AudioDevice object
     *   window.audios = devices;
     * });
     * ```
     */
    System.getAudioDevices = function (dataflow, state) {
        if (dataflow === void 0) { dataflow = AudioDeviceDataflow.ALL; }
        if (state === void 0) { state = AudioDeviceState.ACTIVE; }
        return new Promise(function (resolve) {
            app_1.App.getAsList('wasapienum').then(function (devicesJXON) {
                var devices = [];
                if (devicesJXON !== undefined) {
                    var devicesJXONLength = devicesJXON.length;
                    for (var i = 0; i < devicesJXONLength; ++i) {
                        var device = devicesJXON[i];
                        var bitsState = AudioDeviceState[String(device['State'])
                            .toUpperCase().replace(/\s+/g, '')];
                        if ((bitsState & state) !== bitsState) {
                            continue;
                        }
                        var bitsFlow = AudioDeviceDataflow[String(device['DataFlow'])
                            .toUpperCase()];
                        if ((bitsFlow & dataflow) !== bitsFlow) {
                            continue;
                        }
                        if (device['name'].toLowerCase().indexOf('xsplit') > -1) {
                            continue;
                        }
                        devices.push(audio_1.AudioDevice.parse(device));
                    }
                }
                resolve(devices);
            });
        });
    };
    /**
     * return: Promise<CameraDevice[]>
     *
     * Gets all camera devices
     * See also: System/CameraDevice
     *
     * #### Usage
     *
     * ```javascript
     * System.getCameraDevices().then(function(devices) {
     *   // devices is an array of CameraDevice object
     *   window.cameras = devices;
     * });
     * ```
     */
    System.getCameraDevices = function () {
        return new Promise(function (resolve) {
            app_1.App.getAsList('dshowenum:vsrc').then(function (devicesJSON) {
                var devices = [];
                if (devicesJSON !== undefined) {
                    for (var _i = 0; _i < devicesJSON.length; _i++) {
                        var device = devicesJSON[_i];
                        if (String(device['disp']).toLowerCase().indexOf('xsplit') === -1 &&
                            String(device['disp']).toLowerCase() !==
                                ("@DEVICE:SW:{860BB310-5D01-11D0-BD3B-00A0C911CE86}\\" +
                                    "{778abfb2-e87b-48a2-8d33-675150fcf8a2}").toLowerCase()) {
                            devices.push(camera_1.CameraDevice.parse(device));
                        }
                    }
                    resolve(devices);
                }
            });
        });
    };
    /**
     * return: Promise<Game[]>
     *
     * Gets all currently running games
     * See also: System/Game
     *
     * #### Usage
     *
     * ```javascript
     * System.getGames().then(function(games) {
     *   // games is an array of Game object
     *   window.games = games;
     * });
     * ```
     */
    System.getGames = function () {
        return new Promise(function (resolve) {
            app_1.App.getAsList('gsenum').then(function (gamesJXON) {
                var games = [];
                if (gamesJXON !== undefined) {
                    var gamesJXONLength = gamesJXON.length;
                    for (var i = 0; i < gamesJXONLength; ++i) {
                        games.push(game_1.Game.parse(gamesJXON[i]));
                    }
                }
                resolve(games);
            });
        });
    };
    /**
     * return: Promise<MicrophoneDevice[]>
     *
     * Gets all audio capture devices that may be added to the stage
     * See also: System/MicrophoneDevice
     *
     * #### Usage
     *
     * ```javascript
     * System.getMicrophones().then(function(microphones) {
     *   microphones[0].addToScene(); // add first microphone to stage
     * });
     * ```
     */
    System.getMicrophones = function () {
        return new Promise(function (resolve) {
            app_1.App.getAsList('dshowenum:asrc').then(function (micsJXON) {
                var mics = [];
                if (micsJXON !== undefined) {
                    var micsJXONLength = micsJXON.length;
                    for (var i = 0; i < micsJXONLength; ++i) {
                        mics.push(microphone_1.MicrophoneDevice.parse(micsJXON[i]));
                    }
                }
                resolve(mics);
            });
        });
    };
    /**
     * return: Promise<JSON>
     *
     * Gets the position of the cursor. Does not work on Source Plugins.
     *
     * #### Usage
     *
     * ```javascript
     * System.getCursorPosition().then(function(pos) {
     *   var x = pos.x; // X Axis
     *   var y = pos.y; // Y Axis
     * });
     * ```
     */
    System.getCursorPosition = function () {
        return new Promise(function (resolve, reject) {
            if (environment_1.Environment.isSourcePlugin()) {
                reject(Error('function is not available for source'));
            }
            else {
                var res = internal_1.exec('GetCursorPos');
                if (typeof res === 'string') {
                    var posArr = res.split(',');
                    var pos = {};
                    pos['x'] = Number(posArr[0]);
                    pos['y'] = Number(posArr[1]);
                    resolve(pos);
                }
                else {
                    reject(Error('cannot fetch current cursor position'));
                }
            }
        });
    };
    /**
     * param: JSON: {x: number, y: number}
     *
     * Sets the position of the cursor. Does not work on Source Plugins.
     *
     * #### Usage
     *
     * ```javascript
     * System.setCursorPosition({x:0, y:0});
     * ```
     */
    System.setCursorPosition = function (pos) {
        return new Promise(function (resolve, reject) {
            if (environment_1.Environment.isSourcePlugin()) {
                reject(Error('function is not available for source'));
            }
            else if (typeof pos.x !== 'number' || typeof pos.y !== 'number') {
                reject(Error('invalid parameters'));
            }
            else {
                internal_1.exec('SetCursorPos', String(pos.x), String(pos.y));
                resolve(true);
            }
        });
    };
    return System;
})();
exports.System = System;
},{"../core/environment":5,"../internal/app":19,"../internal/internal":22,"./audio":27,"./camera":28,"./game":29,"./microphone":30}],32:[function(require,module,exports){
var Color = (function () {
    function Color(props) {
        if (props['rgb'] !== undefined) {
            this.setRgb(props['rgb']);
        }
        else if (props['irgb'] !== undefined) {
            this.setIrgb(props['irgb']);
        }
        else if (props['bgr'] !== undefined) {
            this.setBgr(props['bgr']);
        }
        else if (props['ibgr'] !== undefined) {
            this.setIbgr(props['ibgr']);
        }
        else {
            throw new Error('Do not call Color constructor without parameters.');
        }
    }
    Color.fromRGBString = function (rgb) {
        return new Color({ rgb: rgb });
    };
    Color.fromRGBInt = function (irgb) {
        return new Color({ irgb: irgb });
    };
    Color.fromBGRString = function (bgr) {
        return new Color({ bgr: bgr });
    };
    Color.fromBGRInt = function (ibgr) {
        return new Color({ ibgr: ibgr });
    };
    Color.prototype.getRgb = function () {
        return this._rgb;
    };
    Color.prototype.setRgb = function (rgb) {
        this._rgb = rgb.replace(/^#/, '');
        this._irgb = parseInt(this._rgb, 16);
        this._bgr = [this._rgb.substring(4, 6), this._rgb.substring(2, 4),
            this._rgb.substring(0, 2)].join('');
        this._ibgr = parseInt(this._bgr, 16);
        return this;
    };
    Color.prototype.getBgr = function () {
        return this._bgr;
    };
    Color.prototype.setBgr = function (bgr) {
        this.setRgb([bgr.substring(4, 6), bgr.substring(2, 4),
            bgr.substring(0, 2)
        ].join(''));
        return this;
    };
    Color.prototype.getIrgb = function () {
        return this._irgb;
    };
    Color.prototype.setIrgb = function (irgb) {
        var rgb = irgb.toString(16);
        while (rgb.length < 6) {
            rgb = '0' + rgb;
        }
        this.setRgb(rgb);
        return this;
    };
    Color.prototype.getIbgr = function () {
        return this._ibgr;
    };
    Color.prototype.setIbgr = function (ibgr) {
        var bgr = ibgr.toString(16);
        while (bgr.length < 6) {
            bgr = '0' + bgr;
        }
        this.setBgr(bgr);
        return this;
    };
    return Color;
})();
exports.Color = Color;
},{}],33:[function(require,module,exports){
/// <reference path="../../defs/es6-promise.d.ts" />
var internal_1 = require('../internal/internal');
var IO = (function () {
    function IO() {
    }
    /**
     * Returns a base-64 encoded string of the target file's contents.
     * UTF-8 encoded files may be decoded through:
     * ```javascript
     * var decodedContent = decodeURIComponent(escape(window.atob(base64Content));
     * ```
     */
    IO.getFileContent = function (path) {
        return new Promise(function (resolve) {
            resolve(internal_1.exec('GetFileContent', path));
        });
    };
    /**
     * Returns a base-64 encoded string of the target endpoint's contents.
     * Redirects are resolved, and this bypasses access-control-allow-origin.
     *
     * UTF-8 encoded content may be decoded through:
     * ```javascript
     * var decodedContent = decodeURIComponent(escape(window.atob(base64Content));
     * ```
     */
    IO.getWebContent = function (url) {
        return new Promise(function (resolve) {
            internal_1.exec('GetWebContent', url, function (encoded) {
                resolve(encoded);
            });
        });
    };
    /** Opens a URL in the user's default browser. URLs need to
     *
     */
    IO.openUrl = function (url) {
        internal_1.exec('OpenUrl', url);
    };
    /**
     * Opens a file dialog for the user to select a file (or multiple files).
     * Returns an array of strings, each of which contains the full path
     * and filename of a selected file. Rejects when the dialog is canceled.
     *
     * The first (optional) argument is a JSON object that can be used to indicate
     * that certain flags should be true. These are documented as follows:
     * - `allowMultiSelect`: allows users to select multiple files.
     * - `fileMustExist`: prevents users from typing a name of a nonexistent file
     * - `forceShowHidden`: lets the dialog show files marked as System or Hidden
     *  (but not both)
     *
     * The second argument (also optional) is a JSON object used to specify the
     * filter for items to be displayed. It takes two members:
     * - `name`: the description of the filter (for example: Image Files)
     * - `extensions`: an array of file extensions (for example: `['jpg','bmp']`);
     */
    IO.openFileDialog = function (optionBag, filter) {
        return new Promise(function (resolve, reject) {
            var flags = 0;
            if (optionBag !== undefined && optionBag !== null) {
                if (optionBag.allowMultiSelect === true) {
                    flags = flags | IO._ALLOW_MULTI_SELECT;
                }
                if (optionBag.fileMustExist === true) {
                    flags = flags | IO._FILE_MUST_EXIST;
                }
                if (optionBag.forceShowHidden === true) {
                    flags = flags | IO._FORCE_SHOW_HIDDEN;
                }
            }
            var filterString = '';
            if (filter !== undefined && filter !== null &&
                filter.name !== undefined && filter.extensions !== undefined) {
                filterString = filter.name + '|';
                filterString += (filter.extensions.map(function (val) {
                    return '*.' + val;
                })).join(';');
                filterString += '||';
            }
            internal_1.exec('OpenFileDialogAsync', null, null, String(flags), filterString, function (path) {
                if (path !== "null") {
                    resolve(path.split('|'));
                }
                else {
                    reject(Error('File selection cancelled.'));
                }
            });
        });
    };
    IO._ALLOW_MULTI_SELECT = 0x200;
    IO._FILE_MUST_EXIST = 0x1000;
    IO._FORCE_SHOW_HIDDEN = 0x10000000;
    return IO;
})();
exports.IO = IO;
},{"../internal/internal":22}],34:[function(require,module,exports){
/// <reference path="../../defs/es6-promise.d.ts" />
var isReady = false;
var readyPromise = new Promise(function (resolve) {
    document.addEventListener('xsplit-js-ready', function () {
        resolve();
    });
    if (isReady) {
        resolve();
    }
});
function ready() {
    return readyPromise;
}
exports.ready = ready;
function setReady() {
    isReady = true;
}
exports.setReady = setReady;
},{}],35:[function(require,module,exports){
var Rectangle = (function () {
    function Rectangle() {
    }
    /** Gets the top value */
    Rectangle.prototype.getTop = function () {
        return this._top;
    };
    /** Sets the top value */
    Rectangle.prototype.setTop = function (top) {
        this._top = top;
        if (this._bottom !== undefined &&
            this._height !== (this._top - this._bottom)) {
            this.setHeight(Math.abs(this._top - this._bottom));
        }
        else if (this._height !== undefined &&
            this._bottom !== (this._top + this._height)) {
            this.setBottom(this._top + this._height);
        }
        return this;
    };
    /** Gets the left value */
    Rectangle.prototype.getLeft = function () {
        return this._left;
    };
    /** Sets the left value */
    Rectangle.prototype.setLeft = function (left) {
        this._left = left;
        if (this._right !== undefined &&
            this._width !== Math.abs(this._right - this._left)) {
            this.setWidth(Math.abs(this._right - this._left));
        }
        else if (this._width !== undefined &&
            this._height !== (this._left + this._width)) {
            this.setRight(this._left + this._width);
        }
        return this;
    };
    /** Gets the right value */
    Rectangle.prototype.getRight = function () {
        return this._right;
    };
    /** Sets the right value */
    Rectangle.prototype.setRight = function (right) {
        this._right = right;
        if (this._left !== undefined &&
            this._width !== Math.abs(this._right - this._left)) {
            this.setWidth(Math.abs(this._right - this._left));
        }
        else if (this._width !== undefined &&
            this._left !== (this._right - this._width)) {
            this.setLeft(this._right - this._width);
        }
        return this;
    };
    /** Gets the bottom value */
    Rectangle.prototype.getBottom = function () {
        return this._bottom;
    };
    /** Sets the bottom value */
    Rectangle.prototype.setBottom = function (bottom) {
        this._bottom = bottom;
        if (this._top !== undefined &&
            this._height !== Math.abs(this._top - this._bottom)) {
            this.setHeight(Math.abs(this._top - this._bottom));
        }
        else if (this._height !== undefined &&
            this._top !== (this._bottom - this._height)) {
            this.setTop(this._bottom - this._height);
        }
        return this;
    };
    /** Gets the width value */
    Rectangle.prototype.getWidth = function () {
        return this._width;
    };
    /** Sets the width value */
    Rectangle.prototype.setWidth = function (width) {
        this._width = width;
        if (this._right !== undefined &&
            this._left !== (this._right - this._width)) {
            this.setLeft(this._right - this._width);
        }
        else if (this._left !== undefined &&
            this._right !== (this._left + this._width)) {
            this.setRight(this._left + this._width);
        }
        return this;
    };
    /** Gets the height value */
    Rectangle.prototype.getHeight = function () {
        return this._height;
    };
    /** Sets the height value */
    Rectangle.prototype.setHeight = function (height) {
        this._height = height;
        if (this._top !== undefined &&
            this._bottom !== (this._top + this._height)) {
            this.setBottom(this._top + this._height);
        }
        else if (this._bottom !== undefined &&
            this._top !== (this._bottom - this._height)) {
            this.setTop(this._bottom - this._height);
        }
        return this;
    };
    Rectangle.fromDimensions = function (width, height) {
        if (width < 0 || height < 0) {
            throw new Error('Rectangle dimensions cannot be negative.');
        }
        var rect = new Rectangle();
        rect._width = width;
        rect._height = height;
        return rect;
    };
    Rectangle.fromCoordinates = function (top, left, right, bottom) {
        if (top > bottom) {
            throw new Error('Top coordinate must be smaller than bottom.');
        }
        else if (left > right) {
            throw new Error('Right coordinate must be smaller than left.');
        }
        var rect = new Rectangle();
        rect._top = top;
        rect._left = left;
        rect.setRight(right); // calculates width
        rect.setBottom(bottom); // calculates height
        return rect;
    };
    Rectangle.prototype.toDimensionString = function () {
        return this._width + ',' + this._height;
    };
    Rectangle.prototype.toCoordinateString = function () {
        if (this._left === undefined) {
            throw new Error('This Rectangle instance does not have coordinates.');
        }
        else {
            return this._left + ',' + this._top + ',' + this._right + ',' + this._bottom;
        }
    };
    Rectangle.prototype.toString = function (value) {
        if (value === undefined) {
            return this.toDimensionString(); // all rectangles have dimensions
        }
        else {
            var format = value;
            format = format.replace(':left', String(this._left));
            format = format.replace(':top', String(this._top));
            format = format.replace(':right', String(this._right));
            format = format.replace(':bottom', String(this._bottom));
            format = format.replace(':width', String(this._width));
            format = format.replace(':height', String(this._height));
            return format;
        }
    };
    return Rectangle;
})();
exports.Rectangle = Rectangle;
},{}],"xjs":[function(require,module,exports){
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
require('./internal/init');
__export(require('./util/color'));
__export(require('./util/rectangle'));
__export(require('./util/io'));
__export(require('./core/environment'));
__export(require('./core/app'));
__export(require('./core/scene'));
__export(require('./core/transition'));
__export(require('./core/item/item'));
__export(require('./core/item/camera'));
__export(require('./core/item/game'));
__export(require('./core/item/audio'));
__export(require('./core/item/html'));
__export(require('./system/system'));
__export(require('./system/audio'));
__export(require('./system/game'));
__export(require('./system/camera'));
__export(require('./system/microphone'));
__export(require('./context/config'));
__export(require('./context/source'));
var ready_1 = require('./util/ready');
exports.ready = ready_1.ready;
},{"./context/config":1,"./context/source":3,"./core/app":4,"./core/environment":5,"./core/item/audio":6,"./core/item/camera":7,"./core/item/game":8,"./core/item/html":9,"./core/item/item":15,"./core/scene":17,"./core/transition":18,"./internal/init":21,"./system/audio":27,"./system/camera":28,"./system/game":29,"./system/microphone":30,"./system/system":31,"./util/color":32,"./util/io":33,"./util/ready":34,"./util/rectangle":35}]},{},["xjs"]);