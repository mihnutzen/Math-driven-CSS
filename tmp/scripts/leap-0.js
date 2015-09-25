/*!                                                              
 * LeapJS v0.5.0                                                  
 * http://github.com/leapmotion/leapjs/                                        
 *                                                                             
 * Copyright 2013 LeapMotion, Inc. and other contributors                      
 * Released under the BSD-2-Clause license                                     
 * http://github.com/leapmotion/leapjs/blob/master/LICENSE.txt                 
 */
"use strict";

!(function (a, b, c) {
  function d(c, f) {
    if (!b[c]) {
      if (!a[c]) {
        var g = "function" == typeof require && require;if (!f && g) return g(c, !0);if (e) return e(c, !0);throw new Error("Cannot find module '" + c + "'");
      }var h = b[c] = { exports: {} };a[c][0].call(h.exports, function (b) {
        var e = a[c][1][b];return d(e ? e : b);
      }, h, h.exports);
    }return b[c].exports;
  }for (var e = "function" == typeof require && require, f = 0; f < c.length; f++) d(c[f]);return d;
})({ 1: [function (a, b) {
    var c = b.exports = function (a) {
      this.pos = 0, this._buf = [], this.size = a;
    };c.prototype.get = function (a) {
      return (void 0 == a && (a = 0), a >= this.size ? void 0 : a >= this._buf.length ? void 0 : this._buf[(this.pos - a - 1) % this.size]);
    }, c.prototype.push = function (a) {
      return (this._buf[this.pos % this.size] = a, this.pos++);
    };
  }, {}], 2: [function (a, b) {
    var c = a("../protocol").chooseProtocol,
        d = a("events").EventEmitter,
        e = a("underscore"),
        f = b.exports = function (a) {
      this.opts = e.defaults(a || {}, { host: "127.0.0.1", enableGestures: !1, port: 6437, background: !1, requestProtocolVersion: 5 }), this.host = this.opts.host, this.port = this.opts.port, this.protocolVersionVerified = !1, this.on("ready", function () {
        this.enableGestures(this.opts.enableGestures), this.setBackground(this.opts.background);
      });
    };f.prototype.getUrl = function () {
      return "ws://" + this.host + ":" + this.port + "/v" + this.opts.requestProtocolVersion + ".json";
    }, f.prototype.setBackground = function (a) {
      this.opts.background = a, this.protocol && this.protocol.sendBackground && this.background !== this.opts.background && (this.background = this.opts.background, this.protocol.sendBackground(this, this.opts.background));
    }, f.prototype.handleOpen = function () {
      this.connected || (this.connected = !0, this.emit("connect"));
    }, f.prototype.enableGestures = function (a) {
      this.gesturesEnabled = a ? !0 : !1, this.send(this.protocol.encode({ enableGestures: this.gesturesEnabled }));
    }, f.prototype.handleClose = function (a) {
      this.connected && (this.disconnect(), 1001 === a && this.opts.requestProtocolVersion > 1 && (this.protocolVersionVerified ? this.protocolVersionVerified = !1 : this.opts.requestProtocolVersion--), this.startReconnection());
    }, f.prototype.startReconnection = function () {
      var a = this;this.reconnectionTimer || (this.reconnectionTimer = setInterval(function () {
        a.reconnect();
      }, 500));
    }, f.prototype.stopReconnection = function () {
      this.reconnectionTimer = clearInterval(this.reconnectionTimer);
    }, f.prototype.disconnect = function (a) {
      return (a || this.stopReconnection(), this.socket ? (this.socket.close(), delete this.socket, delete this.protocol, delete this.background, delete this.focusedState, this.connected && (this.connected = !1, this.emit("disconnect")), !0) : void 0);
    }, f.prototype.reconnect = function () {
      this.connected ? this.stopReconnection() : (this.disconnect(!0), this.connect());
    }, f.prototype.handleData = function (a) {
      var b,
          d = JSON.parse(a);void 0 === this.protocol ? (b = this.protocol = c(d), this.protocolVersionVerified = !0, this.emit("ready")) : b = this.protocol(d), this.emit(b.type, b);
    }, f.prototype.connect = function () {
      return this.socket ? void 0 : (this.socket = this.setupSocket(), !0);
    }, f.prototype.send = function (a) {
      this.socket.send(a);
    }, f.prototype.reportFocus = function (a) {
      this.connected && this.focusedState !== a && (this.focusedState = a, this.emit(this.focusedState ? "focus" : "blur"), this.protocol && this.protocol.sendFocused && this.protocol.sendFocused(this, this.focusedState));
    }, e.extend(f.prototype, d.prototype);
  }, { "../protocol": 12, events: 18, underscore: 21 }], 3: [function (a, b) {
    var c = b.exports = a("./base"),
        d = a("underscore"),
        e = b.exports = function (a) {
      c.call(this, a);var b = this;this.on("ready", function () {
        b.startFocusLoop();
      }), this.on("disconnect", function () {
        b.stopFocusLoop();
      });
    };d.extend(e.prototype, c.prototype), e.prototype.setupSocket = function () {
      var a = this,
          b = new WebSocket(this.getUrl());return (b.onopen = function () {
        a.handleOpen();
      }, b.onclose = function (b) {
        a.handleClose(b.code, b.reason);
      }, b.onmessage = function (b) {
        a.handleData(b.data);
      }, b);
    }, e.prototype.startFocusLoop = function () {
      if (!this.focusDetectorTimer) {
        var a = this,
            b = null;b = "undefined" != typeof document.hidden ? "hidden" : "undefined" != typeof document.mozHidden ? "mozHidden" : "undefined" != typeof document.msHidden ? "msHidden" : "undefined" != typeof document.webkitHidden ? "webkitHidden" : void 0, void 0 === a.windowVisible && (a.windowVisible = void 0 === b ? !0 : document[b] === !1);var c = window.addEventListener("focus", function () {
          a.windowVisible = !0, e();
        }),
            d = window.addEventListener("blur", function () {
          a.windowVisible = !1, e();
        });this.on("disconnect", function () {
          window.removeEventListener("focus", c), window.removeEventListener("blur", d);
        });var e = function e() {
          var c = void 0 === b ? !0 : document[b] === !1;a.reportFocus(c && a.windowVisible);
        };e(), this.focusDetectorTimer = setInterval(e, 100);
      }
    }, e.prototype.stopFocusLoop = function () {
      this.focusDetectorTimer && (clearTimeout(this.focusDetectorTimer), delete this.focusDetectorTimer);
    };
  }, { "./base": 2, underscore: 21 }], 4: [function (a, b) {
    var c = a("__browserify_process"),
        d = a("./frame"),
        e = a("./hand"),
        f = a("./pointable"),
        g = a("./circular_buffer"),
        h = a("./pipeline"),
        i = a("events").EventEmitter,
        j = a("./gesture").gestureListener,
        k = a("underscore"),
        l = b.exports = function (b) {
      var e = "undefined" != typeof c && c.versions && c.versions.node,
          f = this;b = k.defaults(b || {}, { inNode: e }), this.inNode = b.inNode, b = k.defaults(b || {}, { frameEventName: this.useAnimationLoop() ? "animationFrame" : "deviceFrame", suppressAnimationLoop: !this.useAnimationLoop(), loopWhileDisconnected: !1, useAllPlugins: !1 }), this.animationFrameRequested = !1, this.onAnimationFrame = function () {
        f.emit("animationFrame", f.lastConnectionFrame), f.loopWhileDisconnected && (f.connection.focusedState || f.connection.opts.background) ? window.requestAnimationFrame(f.onAnimationFrame) : f.animationFrameRequested = !1;
      }, this.suppressAnimationLoop = b.suppressAnimationLoop, this.loopWhileDisconnected = b.loopWhileDisconnected, this.frameEventName = b.frameEventName, this.useAllPlugins = b.useAllPlugins, this.history = new g(200), this.lastFrame = d.Invalid, this.lastValidFrame = d.Invalid, this.lastConnectionFrame = d.Invalid, this.accumulatedGestures = [], this.connectionType = void 0 === b.connectionType ? a(this.inBrowser() ? "./connection/browser" : "./connection/node") : b.connectionType, this.connection = new this.connectionType(b), this.streamingCount = 0, this.devices = {}, this.plugins = {}, this._pluginPipelineSteps = {}, this._pluginExtendedMethods = {}, b.useAllPlugins && this.useRegisteredPlugins(), this.setupConnectionEvents();
    };l.prototype.gesture = function (a, b) {
      var c = j(this, a);return (void 0 !== b && c.stop(b), c);
    }, l.prototype.setBackground = function (a) {
      return (this.connection.setBackground(a), this);
    }, l.prototype.inBrowser = function () {
      return !this.inNode;
    }, l.prototype.useAnimationLoop = function () {
      return this.inBrowser() && !this.inBackgroundPage();
    }, l.prototype.inBackgroundPage = function () {
      return "undefined" != typeof chrome && chrome.extension && chrome.extension.getBackgroundPage && chrome.extension.getBackgroundPage() === window;
    }, l.prototype.connect = function () {
      return (this.connection.connect(), this);
    }, l.prototype.streaming = function () {
      return this.streamingCount > 0;
    }, l.prototype.connected = function () {
      return !!this.connection.connected;
    }, l.prototype.runAnimationLoop = function () {
      this.suppressAnimationLoop || this.animationFrameRequested || (this.animationFrameRequested = !0, window.requestAnimationFrame(this.onAnimationFrame));
    }, l.prototype.disconnect = function () {
      return (this.connection.disconnect(), this);
    }, l.prototype.frame = function (a) {
      return this.history.get(a) || d.Invalid;
    }, l.prototype.loop = function (a) {
      switch (a.length) {case 1:
          this.on(this.frameEventName, a);break;case 2:
          var b = this,
              c = function c(d) {
            a(d, function () {
              b.lastFrame != d ? c(b.lastFrame) : b.once(b.frameEventName, c);
            });
          };this.once(this.frameEventName, c);}return this.connect();
    }, l.prototype.addStep = function (a) {
      this.pipeline || (this.pipeline = new h(this)), this.pipeline.addStep(a);
    }, l.prototype.processFrame = function (a) {
      a.gestures && (this.accumulatedGestures = this.accumulatedGestures.concat(a.gestures)), this.lastConnectionFrame = a, this.runAnimationLoop(), this.emit("deviceFrame", a);
    }, l.prototype.processFinishedFrame = function (a) {
      if ((this.lastFrame = a, a.valid && (this.lastValidFrame = a), a.controller = this, a.historyIdx = this.history.push(a), a.gestures)) {
        a.gestures = this.accumulatedGestures, this.accumulatedGestures = [];for (var b = 0; b != a.gestures.length; b++) this.emit("gesture", a.gestures[b], a);
      }this.pipeline && (a = this.pipeline.run(a), a || (a = d.Invalid)), this.emit("frame", a);
    }, l.prototype.setupConnectionEvents = function () {
      var a = this;this.connection.on("frame", function (b) {
        a.processFrame(b);
      }), this.on(this.frameEventName, function (b) {
        a.processFinishedFrame(b);
      });var b = function b() {
        if (a.connection.opts.requestProtocolVersion < 5 && 0 == a.streamingCount) {
          a.streamingCount = 1;var c = { attached: !0, streaming: !0, type: "unknown", id: "Lx00000000000" };a.devices[c.id] = c, a.emit("deviceAttached", c), a.emit("deviceStreaming", c), a.emit("streamingStarted", c), a.connection.removeListener("frame", b);
        }
      },
          c = function c() {
        if (a.streamingCount > 0) {
          for (var b in a.devices) a.emit("deviceStopped", a.devices[b]), a.emit("deviceRemoved", a.devices[b]);a.emit("streamingStopped", a.devices[b]), a.streamingCount = 0;for (var b in a.devices) delete a.devices[b];
        }
      };this.connection.on("focus", function () {
        a.emit("focus"), a.runAnimationLoop();
      }), this.connection.on("blur", function () {
        a.emit("blur");
      }), this.connection.on("protocol", function (b) {
        a.emit("protocol", b);
      }), this.connection.on("ready", function () {
        a.emit("ready");
      }), this.connection.on("connect", function () {
        a.emit("connect"), a.connection.removeListener("frame", b), a.connection.on("frame", b);
      }), this.connection.on("disconnect", function () {
        a.emit("disconnect"), c();
      }), this.connection.on("deviceConnect", function (d) {
        d.state ? (a.emit("deviceConnected"), a.connection.removeListener("frame", b), a.connection.on("frame", b)) : (a.emit("deviceDisconnected"), c());
      }), this.connection.on("deviceEvent", function (b) {
        var c = b.state,
            d = a.devices[c.id],
            e = {};for (var f in c) d && d.hasOwnProperty(f) && d[f] == c[f] || (e[f] = !0);a.devices[c.id] = c, e.attached && a.emit(c.attached ? "deviceAttached" : "deviceRemoved", c), e.streaming && (c.streaming ? (a.streamingCount++, a.emit("deviceStreaming", c), 1 == a.streamingCount && a.emit("streamingStarted", c), e.attached || a.emit("deviceConnected")) : e.attached && c.attached || (a.streamingCount--, a.emit("deviceStopped", c), 0 == a.streamingCount && a.emit("streamingStopped", c), a.emit("deviceDisconnected")));
      }), this.on("newListener", function (a) {
        ("deviceConnected" == a || "deviceDisconnected" == a) && console.warn(a + " events are depricated.  Consider using 'streamingStarted/streamingStopped' or 'deviceStreaming/deviceStopped' instead");
      });
    }, l._pluginFactories = {}, l.plugin = function (a, b) {
      if (this._pluginFactories[a]) throw 'Plugin "' + a + '" already registered';return this._pluginFactories[a] = b;
    }, l.plugins = function () {
      return k.keys(this._pluginFactories);
    }, l.prototype.use = function (a, b) {
      var c, g, i, j, m;if ((g = "function" == typeof a ? a : l._pluginFactories[a], !g)) throw "Leap Plugin " + a + " not found.";if ((b || (b = {}), this.plugins[a])) return (k.extend(this.plugins[a], b), this);this.plugins[a] = b, j = g.call(this, b);for (i in j) if ((c = j[i], "function" == typeof c)) this.pipeline || (this.pipeline = new h(this)), this._pluginPipelineSteps[a] || (this._pluginPipelineSteps[a] = []), this._pluginPipelineSteps[a].push(this.pipeline.addWrappedStep(i, c));else {
        switch ((this._pluginExtendedMethods[a] || (this._pluginExtendedMethods[a] = []), i)) {case "frame":
            m = d;break;case "hand":
            m = e;break;case "pointable":
            m = f;break;default:
            throw a + ' specifies invalid object type "' + i + '" for prototypical extension';}k.extend(m.prototype, c), k.extend(m.Invalid, c), this._pluginExtendedMethods[a].push([m, c]);
      }return this;
    }, l.prototype.stopUsing = function (a) {
      var b,
          c,
          d = this._pluginPipelineSteps[a],
          e = this._pluginExtendedMethods[a],
          f = 0;if (this.plugins[a]) {
        if (d) for (f = 0; f < d.length; f++) this.pipeline.removeStep(d[f]);if (e) for (f = 0; f < e.length; f++) {
          b = e[f][0], c = e[f][1];for (var g in c) delete b.prototype[g], delete b.Invalid[g];
        }return (delete this.plugins[a], this);
      }
    }, l.prototype.useRegisteredPlugins = function () {
      for (var a in l._pluginFactories) this.use(a);
    }, k.extend(l.prototype, i.prototype);
  }, { "./circular_buffer": 1, "./connection/browser": 3, "./connection/node": 17, "./frame": 5, "./gesture": 6, "./hand": 7, "./pipeline": 10, "./pointable": 11, __browserify_process: 19, events: 18, underscore: 21 }], 5: [function (a, b) {
    var c = a("./hand"),
        d = a("./pointable"),
        e = a("./gesture").createGesture,
        f = a("gl-matrix"),
        g = f.mat3,
        h = f.vec3,
        i = a("./interaction_box"),
        j = a("underscore"),
        k = b.exports = function (a) {
      this.valid = !0, this.id = a.id, this.timestamp = a.timestamp, this.hands = [], this.handsMap = {}, this.pointables = [], this.tools = [], this.fingers = [], a.interactionBox && (this.interactionBox = new i(a.interactionBox)), this.gestures = [], this.pointablesMap = {}, this._translation = a.t, this._rotation = j.flatten(a.r), this._scaleFactor = a.s, this.data = a, this.type = "frame", this.currentFrameRate = a.currentFrameRate;for (var b = {}, f = 0, g = a.hands.length; f != g; f++) {
        var h = new c(a.hands[f]);h.frame = this, this.hands.push(h), this.handsMap[h.id] = h, b[h.id] = f;
      }for (var k = 0, l = a.pointables.length; k != l; k++) {
        var m = new d(a.pointables[k]);if ((m.frame = this, this.pointables.push(m), this.pointablesMap[m.id] = m, (m.tool ? this.tools : this.fingers).push(m), void 0 !== m.handId && b.hasOwnProperty(m.handId))) {
          var h = this.hands[b[m.handId]];h.pointables.push(m), (m.tool ? h.tools : h.fingers).push(m);
        }
      }if (a.gestures) for (var n = 0, o = a.gestures.length; n != o; n++) this.gestures.push(e(a.gestures[n]));
    };k.prototype.tool = function (a) {
      var b = this.pointable(a);return b.tool ? b : d.Invalid;
    }, k.prototype.pointable = function (a) {
      return this.pointablesMap[a] || d.Invalid;
    }, k.prototype.finger = function (a) {
      var b = this.pointable(a);return b.tool ? d.Invalid : b;
    }, k.prototype.hand = function (a) {
      return this.handsMap[a] || c.Invalid;
    }, k.prototype.rotationAngle = function (a, b) {
      if (!this.valid || !a.valid) return 0;var c = this.rotationMatrix(a),
          d = .5 * (c[0] + c[4] + c[8] - 1),
          e = Math.acos(d);if ((e = isNaN(e) ? 0 : e, void 0 !== b)) {
        var f = this.rotationAxis(a);e *= h.dot(f, h.normalize(h.create(), b));
      }return e;
    }, k.prototype.rotationAxis = function (a) {
      return this.valid && a.valid ? h.normalize(h.create(), [this._rotation[7] - a._rotation[5], this._rotation[2] - a._rotation[6], this._rotation[3] - a._rotation[1]]) : h.create();
    }, k.prototype.rotationMatrix = function (a) {
      if (!this.valid || !a.valid) return g.create();var b = g.transpose(g.create(), this._rotation);return g.multiply(g.create(), a._rotation, b);
    }, k.prototype.scaleFactor = function (a) {
      return this.valid && a.valid ? Math.exp(this._scaleFactor - a._scaleFactor) : 1;
    }, k.prototype.translation = function (a) {
      return this.valid && a.valid ? h.subtract(h.create(), this._translation, a._translation) : h.create();
    }, k.prototype.toString = function () {
      var a = "Frame [ id:" + this.id + " | timestamp:" + this.timestamp + " | Hand count:(" + this.hands.length + ") | Pointable count:(" + this.pointables.length + ")";return (this.gestures && (a += " | Gesture count:(" + this.gestures.length + ")"), a += " ]");
    }, k.prototype.dump = function () {
      var a = "";a += "Frame Info:<br/>", a += this.toString(), a += "<br/><br/>Hands:<br/>";for (var b = 0, c = this.hands.length; b != c; b++) a += "  " + this.hands[b].toString() + "<br/>";a += "<br/><br/>Pointables:<br/>";for (var d = 0, e = this.pointables.length; d != e; d++) a += "  " + this.pointables[d].toString() + "<br/>";if (this.gestures) {
        a += "<br/><br/>Gestures:<br/>";for (var f = 0, g = this.gestures.length; f != g; f++) a += "  " + this.gestures[f].toString() + "<br/>";
      }return (a += "<br/><br/>Raw JSON:<br/>", a += JSON.stringify(this.data));
    }, k.Invalid = { valid: !1, hands: [], fingers: [], tools: [], gestures: [], pointables: [], pointable: function pointable() {
        return d.Invalid;
      }, finger: function finger() {
        return d.Invalid;
      }, hand: function hand() {
        return c.Invalid;
      }, toString: function toString() {
        return "invalid frame";
      }, dump: function dump() {
        return this.toString();
      }, rotationAngle: function rotationAngle() {
        return 0;
      }, rotationMatrix: function rotationMatrix() {
        return g.create();
      }, rotationAxis: function rotationAxis() {
        return h.create();
      }, scaleFactor: function scaleFactor() {
        return 1;
      }, translation: function translation() {
        return h.create();
      } };
  }, { "./gesture": 6, "./hand": 7, "./interaction_box": 9, "./pointable": 11, "gl-matrix": 20, underscore: 21 }], 6: [function (a, b, c) {
    var d = a("gl-matrix"),
        e = d.vec3,
        f = a("events").EventEmitter,
        g = a("underscore"),
        h = (c.createGesture = function (a) {
      var b;switch (a.type) {case "circle":
          b = new i(a);break;case "swipe":
          b = new j(a);break;case "screenTap":
          b = new k(a);break;case "keyTap":
          b = new l(a);break;default:
          throw "unkown gesture type";}return (b.id = a.id, b.handIds = a.handIds, b.pointableIds = a.pointableIds, b.duration = a.duration, b.state = a.state, b.type = a.type, b);
    }, c.gestureListener = function (a, b) {
      var c = {},
          d = {};a.on("gesture", function (a, e) {
        if (a.type == b) {
          if (("start" == a.state || "stop" == a.state) && void 0 === d[a.id]) {
            var f = new h(a, e);d[a.id] = f, g.each(c, function (a, b) {
              f.on(b, a);
            });
          }d[a.id].update(a, e), "stop" == a.state && delete d[a.id];
        }
      });var e = { start: function start(a) {
          return (c.start = a, e);
        }, stop: function stop(a) {
          return (c.stop = a, e);
        }, complete: function complete(a) {
          return (c.stop = a, e);
        }, update: function update(a) {
          return (c.update = a, e);
        } };return e;
    }, c.Gesture = function (a, b) {
      this.gestures = [a], this.frames = [b];
    });h.prototype.update = function (a, b) {
      this.lastGesture = a, this.lastFrame = b, this.gestures.push(a), this.frames.push(b), this.emit(a.state, this);
    }, h.prototype.translation = function () {
      return e.subtract(e.create(), this.lastGesture.startPosition, this.lastGesture.position);
    }, g.extend(h.prototype, f.prototype);var i = function i(a) {
      this.center = a.center, this.normal = a.normal, this.progress = a.progress, this.radius = a.radius;
    };i.prototype.toString = function () {
      return "CircleGesture [" + JSON.stringify(this) + "]";
    };var j = function j(a) {
      this.startPosition = a.startPosition, this.position = a.position, this.direction = a.direction, this.speed = a.speed;
    };j.prototype.toString = function () {
      return "SwipeGesture [" + JSON.stringify(this) + "]";
    };var k = function k(a) {
      this.position = a.position, this.direction = a.direction, this.progress = a.progress;
    };k.prototype.toString = function () {
      return "ScreenTapGesture [" + JSON.stringify(this) + "]";
    };var l = function l(a) {
      this.position = a.position, this.direction = a.direction, this.progress = a.progress;
    };l.prototype.toString = function () {
      return "KeyTapGesture [" + JSON.stringify(this) + "]";
    };
  }, { events: 18, "gl-matrix": 20, underscore: 21 }], 7: [function (a, b) {
    var c = a("./pointable"),
        d = a("gl-matrix"),
        e = d.mat3,
        f = d.vec3,
        g = a("underscore"),
        h = b.exports = function (a) {
      this.id = a.id, this.palmPosition = a.palmPosition, this.direction = a.direction, this.palmVelocity = a.palmVelocity, this.palmNormal = a.palmNormal, this.sphereCenter = a.sphereCenter, this.sphereRadius = a.sphereRadius, this.valid = !0, this.pointables = [], this.fingers = [], this.tools = [], this._translation = a.t, this._rotation = g.flatten(a.r), this._scaleFactor = a.s, this.timeVisible = a.timeVisible, this.stabilizedPalmPosition = a.stabilizedPalmPosition;
    };h.prototype.finger = function (a) {
      var b = this.frame.finger(a);return b && b.handId == this.id ? b : c.Invalid;
    }, h.prototype.rotationAngle = function (a, b) {
      if (!this.valid || !a.valid) return 0;var c = a.hand(this.id);if (!c.valid) return 0;var d = this.rotationMatrix(a),
          e = .5 * (d[0] + d[4] + d[8] - 1),
          g = Math.acos(e);if ((g = isNaN(g) ? 0 : g, void 0 !== b)) {
        var h = this.rotationAxis(a);g *= f.dot(h, f.normalize(f.create(), b));
      }return g;
    }, h.prototype.rotationAxis = function (a) {
      if (!this.valid || !a.valid) return f.create();var b = a.hand(this.id);return b.valid ? f.normalize(f.create(), [this._rotation[7] - b._rotation[5], this._rotation[2] - b._rotation[6], this._rotation[3] - b._rotation[1]]) : f.create();
    }, h.prototype.rotationMatrix = function (a) {
      if (!this.valid || !a.valid) return e.create();var b = a.hand(this.id);if (!b.valid) return e.create();var c = e.transpose(e.create(), this._rotation),
          d = e.multiply(e.create(), b._rotation, c);return d;
    }, h.prototype.scaleFactor = function (a) {
      if (!this.valid || !a.valid) return 1;var b = a.hand(this.id);return b.valid ? Math.exp(this._scaleFactor - b._scaleFactor) : 1;
    }, h.prototype.translation = function (a) {
      if (!this.valid || !a.valid) return f.create();var b = a.hand(this.id);return b.valid ? [this._translation[0] - b._translation[0], this._translation[1] - b._translation[1], this._translation[2] - b._translation[2]] : f.create();
    }, h.prototype.toString = function () {
      return "Hand [ id: " + this.id + " | palm velocity:" + this.palmVelocity + " | sphere center:" + this.sphereCenter + " ] ";
    }, h.prototype.pitch = function () {
      return Math.atan2(this.direction[1], -this.direction[2]);
    }, h.prototype.yaw = function () {
      return Math.atan2(this.direction[0], -this.direction[2]);
    }, h.prototype.roll = function () {
      return Math.atan2(this.palmNormal[0], -this.palmNormal[1]);
    }, h.Invalid = { valid: !1, fingers: [], tools: [], pointables: [], pointable: function pointable() {
        return c.Invalid;
      }, finger: function finger() {
        return c.Invalid;
      }, toString: function toString() {
        return "invalid frame";
      }, dump: function dump() {
        return this.toString();
      }, rotationAngle: function rotationAngle() {
        return 0;
      }, rotationMatrix: function rotationMatrix() {
        return e.create();
      }, rotationAxis: function rotationAxis() {
        return f.create();
      }, scaleFactor: function scaleFactor() {
        return 1;
      }, translation: function translation() {
        return f.create();
      } };
  }, { "./pointable": 11, "gl-matrix": 20, underscore: 21 }], 8: [function (a, b) {
    b.exports = { Controller: a("./controller"), Frame: a("./frame"), Gesture: a("./gesture"), Hand: a("./hand"), Pointable: a("./pointable"), InteractionBox: a("./interaction_box"), CircularBuffer: a("./circular_buffer"), UI: a("./ui"), glMatrix: a("gl-matrix"), mat3: a("gl-matrix").mat3, vec3: a("gl-matrix").vec3, loopController: void 0, version: a("./version.js"), loop: function loop(a, b) {
        return (void 0 === b && (b = a, a = {}), this.loopController || (this.loopController = new this.Controller(a)), this.loopController.loop(b), this.loopController);
      }, plugin: function plugin(a, b) {
        this.Controller.plugin(a, b);
      } };
  }, { "./circular_buffer": 1, "./controller": 4, "./frame": 5, "./gesture": 6, "./hand": 7, "./interaction_box": 9, "./pointable": 11, "./ui": 13, "./version.js": 16, "gl-matrix": 20 }], 9: [function (a, b) {
    var c = a("gl-matrix"),
        d = c.vec3,
        e = b.exports = function (a) {
      this.valid = !0, this.center = a.center, this.size = a.size, this.width = a.size[0], this.height = a.size[1], this.depth = a.size[2];
    };e.prototype.denormalizePoint = function (a) {
      return d.fromValues((a[0] - .5) * this.size[0] + this.center[0], (a[1] - .5) * this.size[1] + this.center[1], (a[2] - .5) * this.size[2] + this.center[2]);
    }, e.prototype.normalizePoint = function (a, b) {
      var c = d.fromValues((a[0] - this.center[0]) / this.size[0] + .5, (a[1] - this.center[1]) / this.size[1] + .5, (a[2] - this.center[2]) / this.size[2] + .5);return (b && (c[0] = Math.min(Math.max(c[0], 0), 1), c[1] = Math.min(Math.max(c[1], 0), 1), c[2] = Math.min(Math.max(c[2], 0), 1)), c);
    }, e.prototype.toString = function () {
      return "InteractionBox [ width:" + this.width + " | height:" + this.height + " | depth:" + this.depth + " ]";
    }, e.Invalid = { valid: !1 };
  }, { "gl-matrix": 20 }], 10: [function (a, b) {
    var c = b.exports = function (a) {
      this.steps = [], this.controller = a;
    };c.prototype.addStep = function (a) {
      this.steps.push(a);
    }, c.prototype.run = function (a) {
      for (var b = this.steps.length, c = 0; c != b && a; c++) a = this.steps[c](a);return a;
    }, c.prototype.removeStep = function (a) {
      var b = this.steps.indexOf(a);if (-1 === b) throw "Step not found in pipeline";this.steps.splice(b, 1);
    }, c.prototype.addWrappedStep = function (a, b) {
      var c = this.controller,
          d = function d(_d) {
        var e, f, g;for (e = "frame" == a ? [_d] : _d[a + "s"] || [], f = 0, g = e.length; g > f; f++) b.call(c, e[f]);return _d;
      };return (this.addStep(d), d);
    };
  }, {}], 11: [function (a, b) {
    var c = a("gl-matrix"),
        d = (c.vec3, b.exports = function (a) {
      this.valid = !0, this.id = a.id, this.handId = a.handId, this.length = a.length, this.tool = a.tool, this.width = a.width, this.direction = a.direction, this.stabilizedTipPosition = a.stabilizedTipPosition, this.tipPosition = a.tipPosition, this.tipVelocity = a.tipVelocity, this.touchZone = a.touchZone, this.touchDistance = a.touchDistance, this.timeVisible = a.timeVisible;
    });d.prototype.toString = function () {
      return 1 == this.tool ? "Pointable [ id:" + this.id + " " + this.length + "mmx | with:" + this.width + "mm | direction:" + this.direction + " ]" : "Pointable [ id:" + this.id + " " + this.length + "mmx | direction: " + this.direction + " ]";
    }, d.prototype.hand = function () {
      return this.frame.hand(this.handId);
    }, d.Invalid = { valid: !1 };
  }, { "gl-matrix": 20 }], 12: [function (a, b, c) {
    var d = a("./frame"),
        e = function e(a) {
      this.type = a.type, this.state = a.state;
    };c.chooseProtocol = function (a) {
      var b;switch (a.version) {case 1:case 2:case 3:case 4:case 5:
          b = f(a.version, function (a) {
            return a.event ? new e(a.event) : new d(a);
          }), b.serviceVersion = a.serviceVersion, b.sendBackground = function (a, c) {
            a.send(b.encode({ background: c }));
          }, b.sendFocused = function (a, c) {
            a.send(b.encode({ focused: c }));
          };break;default:
          throw "unrecognized version";}return b;
    };var f = function f(a, b) {
      var c = b;return (c.encode = function (a) {
        return JSON.stringify(a);
      }, c.version = a, c.versionLong = "Version " + a, c.type = "protocol", c);
    };
  }, { "./frame": 5 }], 13: [function (a, b, c) {
    c.UI = { Region: a("./ui/region"), Cursor: a("./ui/cursor") };
  }, { "./ui/cursor": 14, "./ui/region": 15 }], 14: [function (a, b) {
    b.exports = function () {
      return function (a) {
        var b = a.pointables.sort(function (a, b) {
          return a.z - b.z;
        })[0];return (b && b.valid && (a.cursorPosition = b.tipPosition), a);
      };
    };
  }, {}], 15: [function (a, b) {
    var c = a("events").EventEmitter,
        d = a("underscore"),
        e = b.exports = function (a, b) {
      this.start = new Vector(a), this.end = new Vector(b), this.enteredFrame = null;
    };e.prototype.hasPointables = function (a) {
      for (var b = 0; b != a.pointables.length; b++) {
        var c = a.pointables[b].tipPosition;if (c.x >= this.start.x && c.x <= this.end.x && c.y >= this.start.y && c.y <= this.end.y && c.z >= this.start.z && c.z <= this.end.z) return !0;
      }return !1;
    }, e.prototype.listener = function (a) {
      var b = this;return (a && a.nearThreshold && this.setupNearRegion(a.nearThreshold), function (a) {
        return b.updatePosition(a);
      });
    }, e.prototype.clipper = function () {
      var a = this;return function (b) {
        return (a.updatePosition(b), a.enteredFrame ? b : null);
      };
    }, e.prototype.setupNearRegion = function (a) {
      var b = this.nearRegion = new e([this.start.x - a, this.start.y - a, this.start.z - a], [this.end.x + a, this.end.y + a, this.end.z + a]),
          c = this;b.on("enter", function (a) {
        c.emit("near", a);
      }), b.on("exit", function (a) {
        c.emit("far", a);
      }), c.on("exit", function (a) {
        c.emit("near", a);
      });
    }, e.prototype.updatePosition = function (a) {
      return (this.nearRegion && this.nearRegion.updatePosition(a), this.hasPointables(a) && null == this.enteredFrame ? (this.enteredFrame = a, this.emit("enter", this.enteredFrame)) : this.hasPointables(a) || null == this.enteredFrame || (this.enteredFrame = null, this.emit("exit", this.enteredFrame)), a);
    }, e.prototype.normalize = function (a) {
      return new Vector([(a.x - this.start.x) / (this.end.x - this.start.x), (a.y - this.start.y) / (this.end.y - this.start.y), (a.z - this.start.z) / (this.end.z - this.start.z)]);
    }, e.prototype.mapToXY = function (a, b, c) {
      var d = this.normalize(a),
          e = d.x,
          f = d.y;return (e > 1 ? e = 1 : -1 > e && (e = -1), f > 1 ? f = 1 : -1 > f && (f = -1), [(e + 1) / 2 * b, (1 - f) / 2 * c, d.z]);
    }, d.extend(e.prototype, c.prototype);
  }, { events: 18, underscore: 21 }], 16: [function (a, b) {
    b.exports = { full: "0.5.0", major: 0, minor: 5, dot: 0 };
  }, {}], 17: [function () {}, {}], 18: [function (a, b, c) {
    function d(a, b) {
      if (a.indexOf) return a.indexOf(b);for (var c = 0; c < a.length; c++) if (b === a[c]) return c;return -1;
    }var e = a("__browserify_process");e.EventEmitter || (e.EventEmitter = function () {});var f = c.EventEmitter = e.EventEmitter,
        g = "function" == typeof Array.isArray ? Array.isArray : function (a) {
      return "[object Array]" === Object.prototype.toString.call(a);
    },
        h = 10;f.prototype.setMaxListeners = function (a) {
      this._events || (this._events = {}), this._events.maxListeners = a;
    }, f.prototype.emit = function (a) {
      if ("error" === a && (!this._events || !this._events.error || g(this._events.error) && !this._events.error.length)) throw arguments[1] instanceof Error ? arguments[1] : new Error("Uncaught, unspecified 'error' event.");if (!this._events) return !1;var b = this._events[a];if (!b) return !1;if ("function" == typeof b) {
        switch (arguments.length) {case 1:
            b.call(this);break;case 2:
            b.call(this, arguments[1]);break;case 3:
            b.call(this, arguments[1], arguments[2]);break;default:
            var c = Array.prototype.slice.call(arguments, 1);b.apply(this, c);}return !0;
      }if (g(b)) {
        for (var c = Array.prototype.slice.call(arguments, 1), d = b.slice(), e = 0, f = d.length; f > e; e++) d[e].apply(this, c);return !0;
      }return !1;
    }, f.prototype.addListener = function (a, b) {
      if ("function" != typeof b) throw new Error("addListener only takes instances of Function");if ((this._events || (this._events = {}), this.emit("newListener", a, b), this._events[a])) if (g(this._events[a])) {
        if (!this._events[a].warned) {
          var c;c = void 0 !== this._events.maxListeners ? this._events.maxListeners : h, c && c > 0 && this._events[a].length > c && (this._events[a].warned = !0, console.error("(node) warning: possible EventEmitter memory leak detected. %d listeners added. Use emitter.setMaxListeners() to increase limit.", this._events[a].length), console.trace());
        }this._events[a].push(b);
      } else this._events[a] = [this._events[a], b];else this._events[a] = b;return this;
    }, f.prototype.on = f.prototype.addListener, f.prototype.once = function (a, b) {
      var c = this;return (c.on(a, function d() {
        c.removeListener(a, d), b.apply(this, arguments);
      }), this);
    }, f.prototype.removeListener = function (a, b) {
      if ("function" != typeof b) throw new Error("removeListener only takes instances of Function");if (!this._events || !this._events[a]) return this;var c = this._events[a];if (g(c)) {
        var e = d(c, b);if (0 > e) return this;c.splice(e, 1), 0 == c.length && delete this._events[a];
      } else this._events[a] === b && delete this._events[a];return this;
    }, f.prototype.removeAllListeners = function (a) {
      return 0 === arguments.length ? (this._events = {}, this) : (a && this._events && this._events[a] && (this._events[a] = null), this);
    }, f.prototype.listeners = function (a) {
      return (this._events || (this._events = {}), this._events[a] || (this._events[a] = []), g(this._events[a]) || (this._events[a] = [this._events[a]]), this._events[a]);
    }, f.listenerCount = function (a, b) {
      var c;return c = a._events && a._events[b] ? "function" == typeof a._events[b] ? 1 : a._events[b].length : 0;
    };
  }, { __browserify_process: 19 }], 19: [function (a, b) {
    var c = b.exports = {};c.nextTick = (function () {
      var a = "undefined" != typeof window && window.setImmediate,
          b = "undefined" != typeof window && window.postMessage && window.addEventListener;if (a) return function (a) {
        return window.setImmediate(a);
      };if (b) {
        var c = [];return (window.addEventListener("message", function (a) {
          if (a.source === window && "process-tick" === a.data && (a.stopPropagation(), c.length > 0)) {
            var b = c.shift();b();
          }
        }, !0), function (a) {
          c.push(a), window.postMessage("process-tick", "*");
        });
      }return function (a) {
        setTimeout(a, 0);
      };
    })(), c.title = "browser", c.browser = !0, c.env = {}, c.argv = [], c.binding = function () {
      throw new Error("process.binding is not supported");
    }, c.cwd = function () {
      return "/";
    }, c.chdir = function () {
      throw new Error("process.chdir is not supported");
    };
  }, {}], 20: [function (a, b, c) {
    !(function () {
      "use strict";var a = {};"undefined" == typeof c ? "function" == typeof define && "object" == typeof define.amd && define.amd ? (a.exports = {}, define(function () {
        return a.exports;
      })) : a.exports = window : a.exports = c, (function (a) {
        var b = {};if (!c) var c = 1e-6;b.create = function () {
          return new Float32Array(2);
        }, b.clone = function (a) {
          var b = new Float32Array(2);return (b[0] = a[0], b[1] = a[1], b);
        }, b.fromValues = function (a, b) {
          var c = new Float32Array(2);return (c[0] = a, c[1] = b, c);
        }, b.copy = function (a, b) {
          return (a[0] = b[0], a[1] = b[1], a);
        }, b.set = function (a, b, c) {
          return (a[0] = b, a[1] = c, a);
        }, b.add = function (a, b, c) {
          return (a[0] = b[0] + c[0], a[1] = b[1] + c[1], a);
        }, b.sub = b.subtract = function (a, b, c) {
          return (a[0] = b[0] - c[0], a[1] = b[1] - c[1], a);
        }, b.mul = b.multiply = function (a, b, c) {
          return (a[0] = b[0] * c[0], a[1] = b[1] * c[1], a);
        }, b.div = b.divide = function (a, b, c) {
          return (a[0] = b[0] / c[0], a[1] = b[1] / c[1], a);
        }, b.min = function (a, b, c) {
          return (a[0] = Math.min(b[0], c[0]), a[1] = Math.min(b[1], c[1]), a);
        }, b.max = function (a, b, c) {
          return (a[0] = Math.max(b[0], c[0]), a[1] = Math.max(b[1], c[1]), a);
        }, b.scale = function (a, b, c) {
          return (a[0] = b[0] * c, a[1] = b[1] * c, a);
        }, b.dist = b.distance = function (a, b) {
          var c = b[0] - a[0],
              d = b[1] - a[1];return Math.sqrt(c * c + d * d);
        }, b.sqrDist = b.squaredDistance = function (a, b) {
          var c = b[0] - a[0],
              d = b[1] - a[1];return c * c + d * d;
        }, b.len = b.length = function (a) {
          var b = a[0],
              c = a[1];return Math.sqrt(b * b + c * c);
        }, b.sqrLen = b.squaredLength = function (a) {
          var b = a[0],
              c = a[1];return b * b + c * c;
        }, b.negate = function (a, b) {
          return (a[0] = -b[0], a[1] = -b[1], a);
        }, b.normalize = function (a, b) {
          var c = b[0],
              d = b[1],
              e = c * c + d * d;return (e > 0 && (e = 1 / Math.sqrt(e), a[0] = b[0] * e, a[1] = b[1] * e), a);
        }, b.dot = function (a, b) {
          return a[0] * b[0] + a[1] * b[1];
        }, b.cross = function (a, b, c) {
          var d = b[0] * c[1] - b[1] * c[0];return (a[0] = a[1] = 0, a[2] = d, a);
        }, b.lerp = function (a, b, c, d) {
          var e = b[0],
              f = b[1];return (a[0] = e + d * (c[0] - e), a[1] = f + d * (c[1] - f), a);
        }, b.transformMat2 = function (a, b, c) {
          var d = b[0],
              e = b[1];return (a[0] = d * c[0] + e * c[1], a[1] = d * c[2] + e * c[3], a);
        }, b.forEach = (function () {
          var a = new Float32Array(2);return function (b, c, d, e, f, g) {
            var h, i;for (c || (c = 2), d || (d = 0), i = e ? Math.min(e * c + d, b.length) : b.length, h = d; i > h; h += c) a[0] = b[h], a[1] = b[h + 1], f(a, a, g), b[h] = a[0], b[h + 1] = a[1];return b;
          };
        })(), b.str = function (a) {
          return "vec2(" + a[0] + ", " + a[1] + ")";
        }, "undefined" != typeof a && (a.vec2 = b);var d = {};if (!c) var c = 1e-6;d.create = function () {
          return new Float32Array(3);
        }, d.clone = function (a) {
          var b = new Float32Array(3);return (b[0] = a[0], b[1] = a[1], b[2] = a[2], b);
        }, d.fromValues = function (a, b, c) {
          var d = new Float32Array(3);return (d[0] = a, d[1] = b, d[2] = c, d);
        }, d.copy = function (a, b) {
          return (a[0] = b[0], a[1] = b[1], a[2] = b[2], a);
        }, d.set = function (a, b, c, d) {
          return (a[0] = b, a[1] = c, a[2] = d, a);
        }, d.add = function (a, b, c) {
          return (a[0] = b[0] + c[0], a[1] = b[1] + c[1], a[2] = b[2] + c[2], a);
        }, d.sub = d.subtract = function (a, b, c) {
          return (a[0] = b[0] - c[0], a[1] = b[1] - c[1], a[2] = b[2] - c[2], a);
        }, d.mul = d.multiply = function (a, b, c) {
          return (a[0] = b[0] * c[0], a[1] = b[1] * c[1], a[2] = b[2] * c[2], a);
        }, d.div = d.divide = function (a, b, c) {
          return (a[0] = b[0] / c[0], a[1] = b[1] / c[1], a[2] = b[2] / c[2], a);
        }, d.min = function (a, b, c) {
          return (a[0] = Math.min(b[0], c[0]), a[1] = Math.min(b[1], c[1]), a[2] = Math.min(b[2], c[2]), a);
        }, d.max = function (a, b, c) {
          return (a[0] = Math.max(b[0], c[0]), a[1] = Math.max(b[1], c[1]), a[2] = Math.max(b[2], c[2]), a);
        }, d.scale = function (a, b, c) {
          return (a[0] = b[0] * c, a[1] = b[1] * c, a[2] = b[2] * c, a);
        }, d.dist = d.distance = function (a, b) {
          var c = b[0] - a[0],
              d = b[1] - a[1],
              e = b[2] - a[2];return Math.sqrt(c * c + d * d + e * e);
        }, d.sqrDist = d.squaredDistance = function (a, b) {
          var c = b[0] - a[0],
              d = b[1] - a[1],
              e = b[2] - a[2];return c * c + d * d + e * e;
        }, d.len = d.length = function (a) {
          var b = a[0],
              c = a[1],
              d = a[2];return Math.sqrt(b * b + c * c + d * d);
        }, d.sqrLen = d.squaredLength = function (a) {
          var b = a[0],
              c = a[1],
              d = a[2];return b * b + c * c + d * d;
        }, d.negate = function (a, b) {
          return (a[0] = -b[0], a[1] = -b[1], a[2] = -b[2], a);
        }, d.normalize = function (a, b) {
          var c = b[0],
              d = b[1],
              e = b[2],
              f = c * c + d * d + e * e;return (f > 0 && (f = 1 / Math.sqrt(f), a[0] = b[0] * f, a[1] = b[1] * f, a[2] = b[2] * f), a);
        }, d.dot = function (a, b) {
          return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
        }, d.cross = function (a, b, c) {
          var d = b[0],
              e = b[1],
              f = b[2],
              g = c[0],
              h = c[1],
              i = c[2];return (a[0] = e * i - f * h, a[1] = f * g - d * i, a[2] = d * h - e * g, a);
        }, d.lerp = function (a, b, c, d) {
          var e = b[0],
              f = b[1],
              g = b[2];return (a[0] = e + d * (c[0] - e), a[1] = f + d * (c[1] - f), a[2] = g + d * (c[2] - g), a);
        }, d.transformMat4 = function (a, b, c) {
          var d = b[0],
              e = b[1],
              f = b[2];return (a[0] = c[0] * d + c[4] * e + c[8] * f + c[12], a[1] = c[1] * d + c[5] * e + c[9] * f + c[13], a[2] = c[2] * d + c[6] * e + c[10] * f + c[14], a);
        }, d.transformQuat = function (a, b, c) {
          var d = b[0],
              e = b[1],
              f = b[2],
              g = c[0],
              h = c[1],
              i = c[2],
              j = c[3],
              k = j * d + h * f - i * e,
              l = j * e + i * d - g * f,
              m = j * f + g * e - h * d,
              n = -g * d - h * e - i * f;return (a[0] = k * j + n * -g + l * -i - m * -h, a[1] = l * j + n * -h + m * -g - k * -i, a[2] = m * j + n * -i + k * -h - l * -g, a);
        }, d.forEach = (function () {
          var a = new Float32Array(3);return function (b, c, d, e, f, g) {
            var h, i;for (c || (c = 3), d || (d = 0), i = e ? Math.min(e * c + d, b.length) : b.length, h = d; i > h; h += c) a[0] = b[h], a[1] = b[h + 1], a[2] = b[h + 2], f(a, a, g), b[h] = a[0], b[h + 1] = a[1], b[h + 2] = a[2];return b;
          };
        })(), d.str = function (a) {
          return "vec3(" + a[0] + ", " + a[1] + ", " + a[2] + ")";
        }, "undefined" != typeof a && (a.vec3 = d);var e = {};if (!c) var c = 1e-6;e.create = function () {
          return new Float32Array(4);
        }, e.clone = function (a) {
          var b = new Float32Array(4);return (b[0] = a[0], b[1] = a[1], b[2] = a[2], b[3] = a[3], b);
        }, e.fromValues = function (a, b, c, d) {
          var e = new Float32Array(4);return (e[0] = a, e[1] = b, e[2] = c, e[3] = d, e);
        }, e.copy = function (a, b) {
          return (a[0] = b[0], a[1] = b[1], a[2] = b[2], a[3] = b[3], a);
        }, e.set = function (a, b, c, d, e) {
          return (a[0] = b, a[1] = c, a[2] = d, a[3] = e, a);
        }, e.add = function (a, b, c) {
          return (a[0] = b[0] + c[0], a[1] = b[1] + c[1], a[2] = b[2] + c[2], a[3] = b[3] + c[3], a);
        }, e.sub = e.subtract = function (a, b, c) {
          return (a[0] = b[0] - c[0], a[1] = b[1] - c[1], a[2] = b[2] - c[2], a[3] = b[3] - c[3], a);
        }, e.mul = e.multiply = function (a, b, c) {
          return (a[0] = b[0] * c[0], a[1] = b[1] * c[1], a[2] = b[2] * c[2], a[3] = b[3] * c[3], a);
        }, e.div = e.divide = function (a, b, c) {
          return (a[0] = b[0] / c[0], a[1] = b[1] / c[1], a[2] = b[2] / c[2], a[3] = b[3] / c[3], a);
        }, e.min = function (a, b, c) {
          return (a[0] = Math.min(b[0], c[0]), a[1] = Math.min(b[1], c[1]), a[2] = Math.min(b[2], c[2]), a[3] = Math.min(b[3], c[3]), a);
        }, e.max = function (a, b, c) {
          return (a[0] = Math.max(b[0], c[0]), a[1] = Math.max(b[1], c[1]), a[2] = Math.max(b[2], c[2]), a[3] = Math.max(b[3], c[3]), a);
        }, e.scale = function (a, b, c) {
          return (a[0] = b[0] * c, a[1] = b[1] * c, a[2] = b[2] * c, a[3] = b[3] * c, a);
        }, e.dist = e.distance = function (a, b) {
          var c = b[0] - a[0],
              d = b[1] - a[1],
              e = b[2] - a[2],
              f = b[3] - a[3];return Math.sqrt(c * c + d * d + e * e + f * f);
        }, e.sqrDist = e.squaredDistance = function (a, b) {
          var c = b[0] - a[0],
              d = b[1] - a[1],
              e = b[2] - a[2],
              f = b[3] - a[3];return c * c + d * d + e * e + f * f;
        }, e.len = e.length = function (a) {
          var b = a[0],
              c = a[1],
              d = a[2],
              e = a[3];return Math.sqrt(b * b + c * c + d * d + e * e);
        }, e.sqrLen = e.squaredLength = function (a) {
          var b = a[0],
              c = a[1],
              d = a[2],
              e = a[3];return b * b + c * c + d * d + e * e;
        }, e.negate = function (a, b) {
          return (a[0] = -b[0], a[1] = -b[1], a[2] = -b[2], a[3] = -b[3], a);
        }, e.normalize = function (a, b) {
          var c = b[0],
              d = b[1],
              e = b[2],
              f = b[3],
              g = c * c + d * d + e * e + f * f;return (g > 0 && (g = 1 / Math.sqrt(g), a[0] = b[0] * g, a[1] = b[1] * g, a[2] = b[2] * g, a[3] = b[3] * g), a);
        }, e.dot = function (a, b) {
          return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
        }, e.lerp = function (a, b, c, d) {
          var e = b[0],
              f = b[1],
              g = b[2],
              h = b[3];return (a[0] = e + d * (c[0] - e), a[1] = f + d * (c[1] - f), a[2] = g + d * (c[2] - g), a[3] = h + d * (c[3] - h), a);
        }, e.transformMat4 = function (a, b, c) {
          var d = b[0],
              e = b[1],
              f = b[2],
              g = b[3];return (a[0] = c[0] * d + c[4] * e + c[8] * f + c[12] * g, a[1] = c[1] * d + c[5] * e + c[9] * f + c[13] * g, a[2] = c[2] * d + c[6] * e + c[10] * f + c[14] * g, a[3] = c[3] * d + c[7] * e + c[11] * f + c[15] * g, a);
        }, e.transformQuat = function (a, b, c) {
          var d = b[0],
              e = b[1],
              f = b[2],
              g = c[0],
              h = c[1],
              i = c[2],
              j = c[3],
              k = j * d + h * f - i * e,
              l = j * e + i * d - g * f,
              m = j * f + g * e - h * d,
              n = -g * d - h * e - i * f;return (a[0] = k * j + n * -g + l * -i - m * -h, a[1] = l * j + n * -h + m * -g - k * -i, a[2] = m * j + n * -i + k * -h - l * -g, a);
        }, e.forEach = (function () {
          var a = new Float32Array(4);return function (b, c, d, e, f, g) {
            var h, i;for (c || (c = 4), d || (d = 0), i = e ? Math.min(e * c + d, b.length) : b.length, h = d; i > h; h += c) a[0] = b[h], a[1] = b[h + 1], a[2] = b[h + 2], a[3] = b[h + 3], f(a, a, g), b[h] = a[0], b[h + 1] = a[1], b[h + 2] = a[2], b[h + 3] = a[3];return b;
          };
        })(), e.str = function (a) {
          return "vec4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
        }, "undefined" != typeof a && (a.vec4 = e);var f = {},
            g = new Float32Array([1, 0, 0, 1]);if (!c) var c = 1e-6;f.create = function () {
          return new Float32Array(g);
        }, f.clone = function (a) {
          var b = new Float32Array(4);return (b[0] = a[0], b[1] = a[1], b[2] = a[2], b[3] = a[3], b);
        }, f.copy = function (a, b) {
          return (a[0] = b[0], a[1] = b[1], a[2] = b[2], a[3] = b[3], a);
        }, f.identity = function (a) {
          return (a[0] = 1, a[1] = 0, a[2] = 0, a[3] = 1, a);
        }, f.transpose = function (a, b) {
          if (a === b) {
            var c = b[1];a[1] = b[2], a[2] = c;
          } else a[0] = b[0], a[1] = b[2], a[2] = b[1], a[3] = b[3];return a;
        }, f.invert = function (a, b) {
          var c = b[0],
              d = b[1],
              e = b[2],
              f = b[3],
              g = c * f - e * d;return g ? (g = 1 / g, a[0] = f * g, a[1] = -d * g, a[2] = -e * g, a[3] = c * g, a) : null;
        }, f.adjoint = function (a, b) {
          var c = b[0];return (a[0] = b[3], a[1] = -b[1], a[2] = -b[2], a[3] = c, a);
        }, f.determinant = function (a) {
          return a[0] * a[3] - a[2] * a[1];
        }, f.mul = f.multiply = function (a, b, c) {
          var d = b[0],
              e = b[1],
              f = b[2],
              g = b[3],
              h = c[0],
              i = c[1],
              j = c[2],
              k = c[3];return (a[0] = d * h + e * j, a[1] = d * i + e * k, a[2] = f * h + g * j, a[3] = f * i + g * k, a);
        }, f.rotate = function (a, b, c) {
          var d = b[0],
              e = b[1],
              f = b[2],
              g = b[3],
              h = Math.sin(c),
              i = Math.cos(c);return (a[0] = d * i + e * h, a[1] = d * -h + e * i, a[2] = f * i + g * h, a[3] = f * -h + g * i, a);
        }, f.scale = function (a, b, c) {
          var d = b[0],
              e = b[1],
              f = b[2],
              g = b[3],
              h = c[0],
              i = c[1];return (a[0] = d * h, a[1] = e * i, a[2] = f * h, a[3] = g * i, a);
        }, f.str = function (a) {
          return "mat2(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
        }, "undefined" != typeof a && (a.mat2 = f);var h = {},
            i = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);if (!c) var c = 1e-6;h.create = function () {
          return new Float32Array(i);
        }, h.clone = function (a) {
          var b = new Float32Array(9);return (b[0] = a[0], b[1] = a[1], b[2] = a[2], b[3] = a[3], b[4] = a[4], b[5] = a[5], b[6] = a[6], b[7] = a[7], b[8] = a[8], b);
        }, h.copy = function (a, b) {
          return (a[0] = b[0], a[1] = b[1], a[2] = b[2], a[3] = b[3], a[4] = b[4], a[5] = b[5], a[6] = b[6], a[7] = b[7], a[8] = b[8], a);
        }, h.identity = function (a) {
          return (a[0] = 1, a[1] = 0, a[2] = 0, a[3] = 0, a[4] = 1, a[5] = 0, a[6] = 0, a[7] = 0, a[8] = 1, a);
        }, h.transpose = function (a, b) {
          if (a === b) {
            var c = b[1],
                d = b[2],
                e = b[5];a[1] = b[3], a[2] = b[6], a[3] = c, a[5] = b[7], a[6] = d, a[7] = e;
          } else a[0] = b[0], a[1] = b[3], a[2] = b[6], a[3] = b[1], a[4] = b[4], a[5] = b[7], a[6] = b[2], a[7] = b[5], a[8] = b[8];return a;
        }, h.invert = function (a, b) {
          var c = b[0],
              d = b[1],
              e = b[2],
              f = b[3],
              g = b[4],
              h = b[5],
              i = b[6],
              j = b[7],
              k = b[8],
              l = k * g - h * j,
              m = -k * f + h * i,
              n = j * f - g * i,
              o = c * l + d * m + e * n;return o ? (o = 1 / o, a[0] = l * o, a[1] = (-k * d + e * j) * o, a[2] = (h * d - e * g) * o, a[3] = m * o, a[4] = (k * c - e * i) * o, a[5] = (-h * c + e * f) * o, a[6] = n * o, a[7] = (-j * c + d * i) * o, a[8] = (g * c - d * f) * o, a) : null;
        }, h.adjoint = function (a, b) {
          var c = b[0],
              d = b[1],
              e = b[2],
              f = b[3],
              g = b[4],
              h = b[5],
              i = b[6],
              j = b[7],
              k = b[8];return (a[0] = g * k - h * j, a[1] = e * j - d * k, a[2] = d * h - e * g, a[3] = h * i - f * k, a[4] = c * k - e * i, a[5] = e * f - c * h, a[6] = f * j - g * i, a[7] = d * i - c * j, a[8] = c * g - d * f, a);
        }, h.determinant = function (a) {
          var b = a[0],
              c = a[1],
              d = a[2],
              e = a[3],
              f = a[4],
              g = a[5],
              h = a[6],
              i = a[7],
              j = a[8];return b * (j * f - g * i) + c * (-j * e + g * h) + d * (i * e - f * h);
        }, h.mul = h.multiply = function (a, b, c) {
          var d = b[0],
              e = b[1],
              f = b[2],
              g = b[3],
              h = b[4],
              i = b[5],
              j = b[6],
              k = b[7],
              l = b[8],
              m = c[0],
              n = c[1],
              o = c[2],
              p = c[3],
              q = c[4],
              r = c[5],
              s = c[6],
              t = c[7],
              u = c[8];return (a[0] = m * d + n * g + o * j, a[1] = m * e + n * h + o * k, a[2] = m * f + n * i + o * l, a[3] = p * d + q * g + r * j, a[4] = p * e + q * h + r * k, a[5] = p * f + q * i + r * l, a[6] = s * d + t * g + u * j, a[7] = s * e + t * h + u * k, a[8] = s * f + t * i + u * l, a);
        }, h.str = function (a) {
          return "mat3(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ")";
        }, "undefined" != typeof a && (a.mat3 = h);var j = {},
            k = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);if (!c) var c = 1e-6;j.create = function () {
          return new Float32Array(k);
        }, j.clone = function (a) {
          var b = new Float32Array(16);return (b[0] = a[0], b[1] = a[1], b[2] = a[2], b[3] = a[3], b[4] = a[4], b[5] = a[5], b[6] = a[6], b[7] = a[7], b[8] = a[8], b[9] = a[9], b[10] = a[10], b[11] = a[11], b[12] = a[12], b[13] = a[13], b[14] = a[14], b[15] = a[15], b);
        }, j.copy = function (a, b) {
          return (a[0] = b[0], a[1] = b[1], a[2] = b[2], a[3] = b[3], a[4] = b[4], a[5] = b[5], a[6] = b[6], a[7] = b[7], a[8] = b[8], a[9] = b[9], a[10] = b[10], a[11] = b[11], a[12] = b[12], a[13] = b[13], a[14] = b[14], a[15] = b[15], a);
        }, j.identity = function (a) {
          return (a[0] = 1, a[1] = 0, a[2] = 0, a[3] = 0, a[4] = 0, a[5] = 1, a[6] = 0, a[7] = 0, a[8] = 0, a[9] = 0, a[10] = 1, a[11] = 0, a[12] = 0, a[13] = 0, a[14] = 0, a[15] = 1, a);
        }, j.transpose = function (a, b) {
          if (a === b) {
            var c = b[1],
                d = b[2],
                e = b[3],
                f = b[6],
                g = b[7],
                h = b[11];a[1] = b[4], a[2] = b[8], a[3] = b[12], a[4] = c, a[6] = b[9], a[7] = b[13], a[8] = d, a[9] = f, a[11] = b[14], a[12] = e, a[13] = g, a[14] = h;
          } else a[0] = b[0], a[1] = b[4], a[2] = b[8], a[3] = b[12], a[4] = b[1], a[5] = b[5], a[6] = b[9], a[7] = b[13], a[8] = b[2], a[9] = b[6], a[10] = b[10], a[11] = b[14], a[12] = b[3], a[13] = b[7], a[14] = b[11], a[15] = b[15];return a;
        }, j.invert = function (a, b) {
          var c = b[0],
              d = b[1],
              e = b[2],
              f = b[3],
              g = b[4],
              h = b[5],
              i = b[6],
              j = b[7],
              k = b[8],
              l = b[9],
              m = b[10],
              n = b[11],
              o = b[12],
              p = b[13],
              q = b[14],
              r = b[15],
              s = c * h - d * g,
              t = c * i - e * g,
              u = c * j - f * g,
              v = d * i - e * h,
              w = d * j - f * h,
              x = e * j - f * i,
              y = k * p - l * o,
              z = k * q - m * o,
              A = k * r - n * o,
              B = l * q - m * p,
              C = l * r - n * p,
              D = m * r - n * q,
              E = s * D - t * C + u * B + v * A - w * z + x * y;return E ? (E = 1 / E, a[0] = (h * D - i * C + j * B) * E, a[1] = (e * C - d * D - f * B) * E, a[2] = (p * x - q * w + r * v) * E, a[3] = (m * w - l * x - n * v) * E, a[4] = (i * A - g * D - j * z) * E, a[5] = (c * D - e * A + f * z) * E, a[6] = (q * u - o * x - r * t) * E, a[7] = (k * x - m * u + n * t) * E, a[8] = (g * C - h * A + j * y) * E, a[9] = (d * A - c * C - f * y) * E, a[10] = (o * w - p * u + r * s) * E, a[11] = (l * u - k * w - n * s) * E, a[12] = (h * z - g * B - i * y) * E, a[13] = (c * B - d * z + e * y) * E, a[14] = (p * t - o * v - q * s) * E, a[15] = (k * v - l * t + m * s) * E, a) : null;
        }, j.adjoint = function (a, b) {
          var c = b[0],
              d = b[1],
              e = b[2],
              f = b[3],
              g = b[4],
              h = b[5],
              i = b[6],
              j = b[7],
              k = b[8],
              l = b[9],
              m = b[10],
              n = b[11],
              o = b[12],
              p = b[13],
              q = b[14],
              r = b[15];return (a[0] = h * (m * r - n * q) - l * (i * r - j * q) + p * (i * n - j * m), a[1] = -(d * (m * r - n * q) - l * (e * r - f * q) + p * (e * n - f * m)), a[2] = d * (i * r - j * q) - h * (e * r - f * q) + p * (e * j - f * i), a[3] = -(d * (i * n - j * m) - h * (e * n - f * m) + l * (e * j - f * i)), a[4] = -(g * (m * r - n * q) - k * (i * r - j * q) + o * (i * n - j * m)), a[5] = c * (m * r - n * q) - k * (e * r - f * q) + o * (e * n - f * m), a[6] = -(c * (i * r - j * q) - g * (e * r - f * q) + o * (e * j - f * i)), a[7] = c * (i * n - j * m) - g * (e * n - f * m) + k * (e * j - f * i), a[8] = g * (l * r - n * p) - k * (h * r - j * p) + o * (h * n - j * l), a[9] = -(c * (l * r - n * p) - k * (d * r - f * p) + o * (d * n - f * l)), a[10] = c * (h * r - j * p) - g * (d * r - f * p) + o * (d * j - f * h), a[11] = -(c * (h * n - j * l) - g * (d * n - f * l) + k * (d * j - f * h)), a[12] = -(g * (l * q - m * p) - k * (h * q - i * p) + o * (h * m - i * l)), a[13] = c * (l * q - m * p) - k * (d * q - e * p) + o * (d * m - e * l), a[14] = -(c * (h * q - i * p) - g * (d * q - e * p) + o * (d * i - e * h)), a[15] = c * (h * m - i * l) - g * (d * m - e * l) + k * (d * i - e * h), a);
        }, j.determinant = function (a) {
          var b = a[0],
              c = a[1],
              d = a[2],
              e = a[3],
              f = a[4],
              g = a[5],
              h = a[6],
              i = a[7],
              j = a[8],
              k = a[9],
              l = a[10],
              m = a[11],
              n = a[12],
              o = a[13],
              p = a[14],
              q = a[15],
              r = b * g - c * f,
              s = b * h - d * f,
              t = b * i - e * f,
              u = c * h - d * g,
              v = c * i - e * g,
              w = d * i - e * h,
              x = j * o - k * n,
              y = j * p - l * n,
              z = j * q - m * n,
              A = k * p - l * o,
              B = k * q - m * o,
              C = l * q - m * p;return r * C - s * B + t * A + u * z - v * y + w * x;
        }, j.mul = j.multiply = function (a, b, c) {
          var d = b[0],
              e = b[1],
              f = b[2],
              g = b[3],
              h = b[4],
              i = b[5],
              j = b[6],
              k = b[7],
              l = b[8],
              m = b[9],
              n = b[10],
              o = b[11],
              p = b[12],
              q = b[13],
              r = b[14],
              s = b[15],
              t = c[0],
              u = c[1],
              v = c[2],
              w = c[3];return (a[0] = t * d + u * h + v * l + w * p, a[1] = t * e + u * i + v * m + w * q, a[2] = t * f + u * j + v * n + w * r, a[3] = t * g + u * k + v * o + w * s, t = c[4], u = c[5], v = c[6], w = c[7], a[4] = t * d + u * h + v * l + w * p, a[5] = t * e + u * i + v * m + w * q, a[6] = t * f + u * j + v * n + w * r, a[7] = t * g + u * k + v * o + w * s, t = c[8], u = c[9], v = c[10], w = c[11], a[8] = t * d + u * h + v * l + w * p, a[9] = t * e + u * i + v * m + w * q, a[10] = t * f + u * j + v * n + w * r, a[11] = t * g + u * k + v * o + w * s, t = c[12], u = c[13], v = c[14], w = c[15], a[12] = t * d + u * h + v * l + w * p, a[13] = t * e + u * i + v * m + w * q, a[14] = t * f + u * j + v * n + w * r, a[15] = t * g + u * k + v * o + w * s, a);
        }, j.translate = function (a, b, c) {
          var d,
              e,
              f,
              g,
              h,
              i,
              j,
              k,
              l,
              m,
              n,
              o,
              p = c[0],
              q = c[1],
              r = c[2];return (b === a ? (a[12] = b[0] * p + b[4] * q + b[8] * r + b[12], a[13] = b[1] * p + b[5] * q + b[9] * r + b[13], a[14] = b[2] * p + b[6] * q + b[10] * r + b[14], a[15] = b[3] * p + b[7] * q + b[11] * r + b[15]) : (d = b[0], e = b[1], f = b[2], g = b[3], h = b[4], i = b[5], j = b[6], k = b[7], l = b[8], m = b[9], n = b[10], o = b[11], a[0] = d, a[1] = e, a[2] = f, a[3] = g, a[4] = h, a[5] = i, a[6] = j, a[7] = k, a[8] = l, a[9] = m, a[10] = n, a[11] = o, a[12] = d * p + h * q + l * r + b[12], a[13] = e * p + i * q + m * r + b[13], a[14] = f * p + j * q + n * r + b[14], a[15] = g * p + k * q + o * r + b[15]), a);
        }, j.scale = function (a, b, c) {
          var d = c[0],
              e = c[1],
              f = c[2];return (a[0] = b[0] * d, a[1] = b[1] * d, a[2] = b[2] * d, a[3] = b[3] * d, a[4] = b[4] * e, a[5] = b[5] * e, a[6] = b[6] * e, a[7] = b[7] * e, a[8] = b[8] * f, a[9] = b[9] * f, a[10] = b[10] * f, a[11] = b[11] * f, a[12] = b[12], a[13] = b[13], a[14] = b[14], a[15] = b[15], a);
        }, j.rotate = function (a, b, d, e) {
          var f,
              g,
              h,
              i,
              j,
              k,
              l,
              m,
              n,
              o,
              p,
              q,
              r,
              s,
              t,
              u,
              v,
              w,
              x,
              y,
              z,
              A,
              B,
              C,
              D = e[0],
              E = e[1],
              F = e[2],
              G = Math.sqrt(D * D + E * E + F * F);return Math.abs(G) < c ? null : (G = 1 / G, D *= G, E *= G, F *= G, f = Math.sin(d), g = Math.cos(d), h = 1 - g, i = b[0], j = b[1], k = b[2], l = b[3], m = b[4], n = b[5], o = b[6], p = b[7], q = b[8], r = b[9], s = b[10], t = b[11], u = D * D * h + g, v = E * D * h + F * f, w = F * D * h - E * f, x = D * E * h - F * f, y = E * E * h + g, z = F * E * h + D * f, A = D * F * h + E * f, B = E * F * h - D * f, C = F * F * h + g, a[0] = i * u + m * v + q * w, a[1] = j * u + n * v + r * w, a[2] = k * u + o * v + s * w, a[3] = l * u + p * v + t * w, a[4] = i * x + m * y + q * z, a[5] = j * x + n * y + r * z, a[6] = k * x + o * y + s * z, a[7] = l * x + p * y + t * z, a[8] = i * A + m * B + q * C, a[9] = j * A + n * B + r * C, a[10] = k * A + o * B + s * C, a[11] = l * A + p * B + t * C, b !== a && (a[12] = b[12], a[13] = b[13], a[14] = b[14], a[15] = b[15]), a);
        }, j.rotateX = function (a, b, c) {
          var d = Math.sin(c),
              e = Math.cos(c),
              f = b[4],
              g = b[5],
              h = b[6],
              i = b[7],
              j = b[8],
              k = b[9],
              l = b[10],
              m = b[11];return (b !== a && (a[0] = b[0], a[1] = b[1], a[2] = b[2], a[3] = b[3], a[12] = b[12], a[13] = b[13], a[14] = b[14], a[15] = b[15]), a[4] = f * e + j * d, a[5] = g * e + k * d, a[6] = h * e + l * d, a[7] = i * e + m * d, a[8] = j * e - f * d, a[9] = k * e - g * d, a[10] = l * e - h * d, a[11] = m * e - i * d, a);
        }, j.rotateY = function (a, b, c) {
          var d = Math.sin(c),
              e = Math.cos(c),
              f = b[0],
              g = b[1],
              h = b[2],
              i = b[3],
              j = b[8],
              k = b[9],
              l = b[10],
              m = b[11];return (b !== a && (a[4] = b[4], a[5] = b[5], a[6] = b[6], a[7] = b[7], a[12] = b[12], a[13] = b[13], a[14] = b[14], a[15] = b[15]), a[0] = f * e - j * d, a[1] = g * e - k * d, a[2] = h * e - l * d, a[3] = i * e - m * d, a[8] = f * d + j * e, a[9] = g * d + k * e, a[10] = h * d + l * e, a[11] = i * d + m * e, a);
        }, j.rotateZ = function (a, b, c) {
          var d = Math.sin(c),
              e = Math.cos(c),
              f = b[0],
              g = b[1],
              h = b[2],
              i = b[3],
              j = b[4],
              k = b[5],
              l = b[6],
              m = b[7];return (b !== a && (a[8] = b[8], a[9] = b[9], a[10] = b[10], a[11] = b[11], a[12] = b[12], a[13] = b[13], a[14] = b[14], a[15] = b[15]), a[0] = f * e + j * d, a[1] = g * e + k * d, a[2] = h * e + l * d, a[3] = i * e + m * d, a[4] = j * e - f * d, a[5] = k * e - g * d, a[6] = l * e - h * d, a[7] = m * e - i * d, a);
        }, j.fromRotationTranslation = function (a, b, c) {
          var d = b[0],
              e = b[1],
              f = b[2],
              g = b[3],
              h = d + d,
              i = e + e,
              j = f + f,
              k = d * h,
              l = d * i,
              m = d * j,
              n = e * i,
              o = e * j,
              p = f * j,
              q = g * h,
              r = g * i,
              s = g * j;return (a[0] = 1 - (n + p), a[1] = l + s, a[2] = m - r, a[3] = 0, a[4] = l - s, a[5] = 1 - (k + p), a[6] = o + q, a[7] = 0, a[8] = m + r, a[9] = o - q, a[10] = 1 - (k + n), a[11] = 0, a[12] = c[0], a[13] = c[1], a[14] = c[2], a[15] = 1, a);
        }, j.frustum = function (a, b, c, d, e, f, g) {
          var h = 1 / (c - b),
              i = 1 / (e - d),
              j = 1 / (f - g);return (a[0] = 2 * f * h, a[1] = 0, a[2] = 0, a[3] = 0, a[4] = 0, a[5] = 2 * f * i, a[6] = 0, a[7] = 0, a[8] = (c + b) * h, a[9] = (e + d) * i, a[10] = (g + f) * j, a[11] = -1, a[12] = 0, a[13] = 0, a[14] = g * f * 2 * j, a[15] = 0, a);
        }, j.perspective = function (a, b, c, d, e) {
          var f = 1 / Math.tan(b / 2),
              g = 1 / (d - e);return (a[0] = f / c, a[1] = 0, a[2] = 0, a[3] = 0, a[4] = 0, a[5] = f, a[6] = 0, a[7] = 0, a[8] = 0, a[9] = 0, a[10] = (e + d) * g, a[11] = -1, a[12] = 0, a[13] = 0, a[14] = 2 * e * d * g, a[15] = 0, a);
        }, j.ortho = function (a, b, c, d, e, f, g) {
          var h = 1 / (b - c),
              i = 1 / (d - e),
              j = 1 / (f - g);return (a[0] = -2 * h, a[1] = 0, a[2] = 0, a[3] = 0, a[4] = 0, a[5] = -2 * i, a[6] = 0, a[7] = 0, a[8] = 0, a[9] = 0, a[10] = 2 * j, a[11] = 0, a[12] = (b + c) * h, a[13] = (e + d) * i, a[14] = (g + f) * j, a[15] = 1, a);
        }, j.lookAt = function (a, b, d, e) {
          var f,
              g,
              h,
              i,
              k,
              l,
              m,
              n,
              o,
              p,
              q = b[0],
              r = b[1],
              s = b[2],
              t = e[0],
              u = e[1],
              v = e[2],
              w = d[0],
              x = d[1],
              y = d[2];return Math.abs(q - w) < c && Math.abs(r - x) < c && Math.abs(s - y) < c ? j.identity(a) : (m = q - w, n = r - x, o = s - y, p = 1 / Math.sqrt(m * m + n * n + o * o), m *= p, n *= p, o *= p, f = u * o - v * n, g = v * m - t * o, h = t * n - u * m, p = Math.sqrt(f * f + g * g + h * h), p ? (p = 1 / p, f *= p, g *= p, h *= p) : (f = 0, g = 0, h = 0), i = n * h - o * g, k = o * f - m * h, l = m * g - n * f, p = Math.sqrt(i * i + k * k + l * l), p ? (p = 1 / p, i *= p, k *= p, l *= p) : (i = 0, k = 0, l = 0), a[0] = f, a[1] = i, a[2] = m, a[3] = 0, a[4] = g, a[5] = k, a[6] = n, a[7] = 0, a[8] = h, a[9] = l, a[10] = o, a[11] = 0, a[12] = -(f * q + g * r + h * s), a[13] = -(i * q + k * r + l * s), a[14] = -(m * q + n * r + o * s), a[15] = 1, a);
        }, j.str = function (a) {
          return "mat4(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ", " + a[4] + ", " + a[5] + ", " + a[6] + ", " + a[7] + ", " + a[8] + ", " + a[9] + ", " + a[10] + ", " + a[11] + ", " + a[12] + ", " + a[13] + ", " + a[14] + ", " + a[15] + ")";
        }, "undefined" != typeof a && (a.mat4 = j);var l = {},
            m = new Float32Array([0, 0, 0, 1]);if (!c) var c = 1e-6;l.create = function () {
          return new Float32Array(m);
        }, l.clone = e.clone, l.fromValues = e.fromValues, l.copy = e.copy, l.set = e.set, l.identity = function (a) {
          return (a[0] = 0, a[1] = 0, a[2] = 0, a[3] = 1, a);
        }, l.setAxisAngle = function (a, b, c) {
          c = .5 * c;var d = Math.sin(c);return (a[0] = d * b[0], a[1] = d * b[1], a[2] = d * b[2], a[3] = Math.cos(c), a);
        }, l.add = e.add, l.mul = l.multiply = function (a, b, c) {
          var d = b[0],
              e = b[1],
              f = b[2],
              g = b[3],
              h = c[0],
              i = c[1],
              j = c[2],
              k = c[3];return (a[0] = d * k + g * h + e * j - f * i, a[1] = e * k + g * i + f * h - d * j, a[2] = f * k + g * j + d * i - e * h, a[3] = g * k - d * h - e * i - f * j, a);
        }, l.scale = e.scale, l.rotateX = function (a, b, c) {
          c *= .5;var d = b[0],
              e = b[1],
              f = b[2],
              g = b[3],
              h = Math.sin(c),
              i = Math.cos(c);return (a[0] = d * i + g * h, a[1] = e * i + f * h, a[2] = f * i - e * h, a[3] = g * i - d * h, a);
        }, l.rotateY = function (a, b, c) {
          c *= .5;var d = b[0],
              e = b[1],
              f = b[2],
              g = b[3],
              h = Math.sin(c),
              i = Math.cos(c);return (a[0] = d * i - f * h, a[1] = e * i + g * h, a[2] = f * i + d * h, a[3] = g * i - e * h, a);
        }, l.rotateZ = function (a, b, c) {
          c *= .5;var d = b[0],
              e = b[1],
              f = b[2],
              g = b[3],
              h = Math.sin(c),
              i = Math.cos(c);return (a[0] = d * i + e * h, a[1] = e * i - d * h, a[2] = f * i + g * h, a[3] = g * i - f * h, a);
        }, l.calculateW = function (a, b) {
          var c = b[0],
              d = b[1],
              e = b[2];return (a[0] = c, a[1] = d, a[2] = e, a[3] = -Math.sqrt(Math.abs(1 - c * c - d * d - e * e)), a);
        }, l.dot = e.dot, l.lerp = e.lerp, l.slerp = function (a, b, c, d) {
          var e,
              f,
              g,
              h,
              i = b[0],
              j = b[1],
              k = b[2],
              l = b[3],
              m = c[0],
              n = c[1],
              o = c[2],
              p = b[3],
              q = i * m + j * n + k * o + l * p;return Math.abs(q) >= 1 ? (a !== b && (a[0] = i, a[1] = j, a[2] = k, a[3] = l), a) : (e = Math.acos(q), f = Math.sqrt(1 - q * q), Math.abs(f) < .001 ? (a[0] = .5 * i + .5 * m, a[1] = .5 * j + .5 * n, a[2] = .5 * k + .5 * o, a[3] = .5 * l + .5 * p, a) : (g = Math.sin((1 - d) * e) / f, h = Math.sin(d * e) / f, a[0] = i * g + m * h, a[1] = j * g + n * h, a[2] = k * g + o * h, a[3] = l * g + p * h, a));
        }, l.invert = function (a, b) {
          var c = b[0],
              d = b[1],
              e = b[2],
              f = b[3],
              g = c * c + d * d + e * e + f * f,
              h = g ? 1 / g : 0;return (a[0] = -c * h, a[1] = -d * h, a[2] = -e * h, a[3] = f * h, a);
        }, l.conjugate = function (a, b) {
          return (a[0] = -b[0], a[1] = -b[1], a[2] = -b[2], a[3] = b[3], a);
        }, l.len = l.length = e.length, l.sqrLen = l.squaredLength = e.squaredLength, l.normalize = e.normalize, l.str = function (a) {
          return "quat(" + a[0] + ", " + a[1] + ", " + a[2] + ", " + a[3] + ")";
        }, "undefined" != typeof a && (a.quat = l);
      })(a.exports);
    })();
  }, {}], 21: [function (a, b, c) {
    (function () {
      var a = this,
          d = a._,
          e = {},
          f = Array.prototype,
          g = Object.prototype,
          h = Function.prototype,
          i = f.push,
          j = f.slice,
          k = f.concat,
          l = g.toString,
          m = g.hasOwnProperty,
          n = f.forEach,
          o = f.map,
          p = f.reduce,
          q = f.reduceRight,
          r = f.filter,
          s = f.every,
          t = f.some,
          u = f.indexOf,
          v = f.lastIndexOf,
          w = Array.isArray,
          x = Object.keys,
          y = h.bind,
          z = function z(a) {
        return a instanceof z ? a : this instanceof z ? void (this._wrapped = a) : new z(a);
      };"undefined" != typeof c ? ("undefined" != typeof b && b.exports && (c = b.exports = z), c._ = z) : a._ = z, z.VERSION = "1.4.4";var A = z.each = z.forEach = function (a, b, c) {
        if (null != a) if (n && a.forEach === n) a.forEach(b, c);else if (a.length === +a.length) {
          for (var d = 0, f = a.length; f > d; d++) if (b.call(c, a[d], d, a) === e) return;
        } else for (var g in a) if (z.has(a, g) && b.call(c, a[g], g, a) === e) return;
      };z.map = z.collect = function (a, b, c) {
        var d = [];return null == a ? d : o && a.map === o ? a.map(b, c) : (A(a, function (a, e, f) {
          d[d.length] = b.call(c, a, e, f);
        }), d);
      };var B = "Reduce of empty array with no initial value";z.reduce = z.foldl = z.inject = function (a, b, c, d) {
        var e = arguments.length > 2;if ((null == a && (a = []), p && a.reduce === p)) return (d && (b = z.bind(b, d)), e ? a.reduce(b, c) : a.reduce(b));if ((A(a, function (a, f, g) {
          e ? c = b.call(d, c, a, f, g) : (c = a, e = !0);
        }), !e)) throw new TypeError(B);return c;
      }, z.reduceRight = z.foldr = function (a, b, c, d) {
        var e = arguments.length > 2;if ((null == a && (a = []), q && a.reduceRight === q)) return (d && (b = z.bind(b, d)), e ? a.reduceRight(b, c) : a.reduceRight(b));var f = a.length;if (f !== +f) {
          var g = z.keys(a);f = g.length;
        }if ((A(a, function (h, i, j) {
          i = g ? g[--f] : --f, e ? c = b.call(d, c, a[i], i, j) : (c = a[i], e = !0);
        }), !e)) throw new TypeError(B);return c;
      }, z.find = z.detect = function (a, b, c) {
        var d;return (C(a, function (a, e, f) {
          return b.call(c, a, e, f) ? (d = a, !0) : void 0;
        }), d);
      }, z.filter = z.select = function (a, b, c) {
        var d = [];return null == a ? d : r && a.filter === r ? a.filter(b, c) : (A(a, function (a, e, f) {
          b.call(c, a, e, f) && (d[d.length] = a);
        }), d);
      }, z.reject = function (a, b, c) {
        return z.filter(a, function (a, d, e) {
          return !b.call(c, a, d, e);
        }, c);
      }, z.every = z.all = function (a, b, c) {
        b || (b = z.identity);var d = !0;return null == a ? d : s && a.every === s ? a.every(b, c) : (A(a, function (a, f, g) {
          return (d = d && b.call(c, a, f, g)) ? void 0 : e;
        }), !!d);
      };var C = z.some = z.any = function (a, b, c) {
        b || (b = z.identity);var d = !1;return null == a ? d : t && a.some === t ? a.some(b, c) : (A(a, function (a, f, g) {
          return d || (d = b.call(c, a, f, g)) ? e : void 0;
        }), !!d);
      };z.contains = z.include = function (a, b) {
        return null == a ? !1 : u && a.indexOf === u ? -1 != a.indexOf(b) : C(a, function (a) {
          return a === b;
        });
      }, z.invoke = function (a, b) {
        var c = j.call(arguments, 2),
            d = z.isFunction(b);return z.map(a, function (a) {
          return (d ? b : a[b]).apply(a, c);
        });
      }, z.pluck = function (a, b) {
        return z.map(a, function (a) {
          return a[b];
        });
      }, z.where = function (a, b, c) {
        return z.isEmpty(b) ? c ? null : [] : z[c ? "find" : "filter"](a, function (a) {
          for (var c in b) if (b[c] !== a[c]) return !1;return !0;
        });
      }, z.findWhere = function (a, b) {
        return z.where(a, b, !0);
      }, z.max = function (a, b, c) {
        if (!b && z.isArray(a) && a[0] === +a[0] && a.length < 65535) return Math.max.apply(Math, a);if (!b && z.isEmpty(a)) return -1 / 0;var d = { computed: -1 / 0, value: -1 / 0 };return (A(a, function (a, e, f) {
          var g = b ? b.call(c, a, e, f) : a;g >= d.computed && (d = { value: a, computed: g });
        }), d.value);
      }, z.min = function (a, b, c) {
        if (!b && z.isArray(a) && a[0] === +a[0] && a.length < 65535) return Math.min.apply(Math, a);if (!b && z.isEmpty(a)) return 1 / 0;var d = { computed: 1 / 0, value: 1 / 0 };return (A(a, function (a, e, f) {
          var g = b ? b.call(c, a, e, f) : a;g < d.computed && (d = { value: a, computed: g });
        }), d.value);
      }, z.shuffle = function (a) {
        var b,
            c = 0,
            d = [];return (A(a, function (a) {
          b = z.random(c++), d[c - 1] = d[b], d[b] = a;
        }), d);
      };var D = function D(a) {
        return z.isFunction(a) ? a : function (b) {
          return b[a];
        };
      };z.sortBy = function (a, b, c) {
        var d = D(b);return z.pluck(z.map(a, function (a, b, e) {
          return { value: a, index: b, criteria: d.call(c, a, b, e) };
        }).sort(function (a, b) {
          var c = a.criteria,
              d = b.criteria;if (c !== d) {
            if (c > d || void 0 === c) return 1;if (d > c || void 0 === d) return -1;
          }return a.index < b.index ? -1 : 1;
        }), "value");
      };var E = function E(a, b, c, d) {
        var e = {},
            f = D(b || z.identity);return (A(a, function (b, g) {
          var h = f.call(c, b, g, a);d(e, h, b);
        }), e);
      };z.groupBy = function (a, b, c) {
        return E(a, b, c, function (a, b, c) {
          (z.has(a, b) ? a[b] : a[b] = []).push(c);
        });
      }, z.countBy = function (a, b, c) {
        return E(a, b, c, function (a, b) {
          z.has(a, b) || (a[b] = 0), a[b]++;
        });
      }, z.sortedIndex = function (a, b, c, d) {
        c = null == c ? z.identity : D(c);for (var e = c.call(d, b), f = 0, g = a.length; g > f;) {
          var h = f + g >>> 1;c.call(d, a[h]) < e ? f = h + 1 : g = h;
        }return f;
      }, z.toArray = function (a) {
        return a ? z.isArray(a) ? j.call(a) : a.length === +a.length ? z.map(a, z.identity) : z.values(a) : [];
      }, z.size = function (a) {
        return null == a ? 0 : a.length === +a.length ? a.length : z.keys(a).length;
      }, z.first = z.head = z.take = function (a, b, c) {
        return null == a ? void 0 : null == b || c ? a[0] : j.call(a, 0, b);
      }, z.initial = function (a, b, c) {
        return j.call(a, 0, a.length - (null == b || c ? 1 : b));
      }, z.last = function (a, b, c) {
        return null == a ? void 0 : null == b || c ? a[a.length - 1] : j.call(a, Math.max(a.length - b, 0));
      }, z.rest = z.tail = z.drop = function (a, b, c) {
        return j.call(a, null == b || c ? 1 : b);
      }, z.compact = function (a) {
        return z.filter(a, z.identity);
      };var F = function F(a, b, c) {
        return (A(a, function (a) {
          z.isArray(a) ? b ? i.apply(c, a) : F(a, b, c) : c.push(a);
        }), c);
      };z.flatten = function (a, b) {
        return F(a, b, []);
      }, z.without = function (a) {
        return z.difference(a, j.call(arguments, 1));
      }, z.uniq = z.unique = function (a, b, c, d) {
        z.isFunction(b) && (d = c, c = b, b = !1);var e = c ? z.map(a, c, d) : a,
            f = [],
            g = [];return (A(e, function (c, d) {
          (b ? d && g[g.length - 1] === c : z.contains(g, c)) || (g.push(c), f.push(a[d]));
        }), f);
      }, z.union = function () {
        return z.uniq(k.apply(f, arguments));
      }, z.intersection = function (a) {
        var b = j.call(arguments, 1);return z.filter(z.uniq(a), function (a) {
          return z.every(b, function (b) {
            return z.indexOf(b, a) >= 0;
          });
        });
      }, z.difference = function (a) {
        var b = k.apply(f, j.call(arguments, 1));return z.filter(a, function (a) {
          return !z.contains(b, a);
        });
      }, z.zip = function () {
        for (var a = j.call(arguments), b = z.max(z.pluck(a, "length")), c = new Array(b), d = 0; b > d; d++) c[d] = z.pluck(a, "" + d);return c;
      }, z.object = function (a, b) {
        if (null == a) return {};for (var c = {}, d = 0, e = a.length; e > d; d++) b ? c[a[d]] = b[d] : c[a[d][0]] = a[d][1];return c;
      }, z.indexOf = function (a, b, c) {
        if (null == a) return -1;var d = 0,
            e = a.length;if (c) {
          if ("number" != typeof c) return (d = z.sortedIndex(a, b), a[d] === b ? d : -1);d = 0 > c ? Math.max(0, e + c) : c;
        }if (u && a.indexOf === u) return a.indexOf(b, c);for (; e > d; d++) if (a[d] === b) return d;return -1;
      }, z.lastIndexOf = function (a, b, c) {
        if (null == a) return -1;var d = null != c;if (v && a.lastIndexOf === v) return d ? a.lastIndexOf(b, c) : a.lastIndexOf(b);for (var e = d ? c : a.length; e--;) if (a[e] === b) return e;return -1;
      }, z.range = function (a, b, c) {
        arguments.length <= 1 && (b = a || 0, a = 0), c = arguments[2] || 1;for (var d = Math.max(Math.ceil((b - a) / c), 0), e = 0, f = new Array(d); d > e;) f[e++] = a, a += c;return f;
      }, z.bind = function (a, b) {
        if (a.bind === y && y) return y.apply(a, j.call(arguments, 1));var c = j.call(arguments, 2);return function () {
          return a.apply(b, c.concat(j.call(arguments)));
        };
      }, z.partial = function (a) {
        var b = j.call(arguments, 1);return function () {
          return a.apply(this, b.concat(j.call(arguments)));
        };
      }, z.bindAll = function (a) {
        var b = j.call(arguments, 1);return (0 === b.length && (b = z.functions(a)), A(b, function (b) {
          a[b] = z.bind(a[b], a);
        }), a);
      }, z.memoize = function (a, b) {
        var c = {};return (b || (b = z.identity), function () {
          var d = b.apply(this, arguments);return z.has(c, d) ? c[d] : c[d] = a.apply(this, arguments);
        });
      }, z.delay = function (a, b) {
        var c = j.call(arguments, 2);return setTimeout(function () {
          return a.apply(null, c);
        }, b);
      }, z.defer = function (a) {
        return z.delay.apply(z, [a, 1].concat(j.call(arguments, 1)));
      }, z.throttle = function (a, b) {
        var c,
            d,
            e,
            f,
            g = 0,
            h = function h() {
          g = new Date(), e = null, f = a.apply(c, d);
        };return function () {
          var i = new Date(),
              j = b - (i - g);return (c = this, d = arguments, 0 >= j ? (clearTimeout(e), e = null, g = i, f = a.apply(c, d)) : e || (e = setTimeout(h, j)), f);
        };
      }, z.debounce = function (a, b, c) {
        var d, e;return function () {
          var f = this,
              g = arguments,
              h = function h() {
            d = null, c || (e = a.apply(f, g));
          },
              i = c && !d;return (clearTimeout(d), d = setTimeout(h, b), i && (e = a.apply(f, g)), e);
        };
      }, z.once = function (a) {
        var b,
            c = !1;return function () {
          return c ? b : (c = !0, b = a.apply(this, arguments), a = null, b);
        };
      }, z.wrap = function (a, b) {
        return function () {
          var c = [a];return (i.apply(c, arguments), b.apply(this, c));
        };
      }, z.compose = function () {
        var a = arguments;return function () {
          for (var b = arguments, c = a.length - 1; c >= 0; c--) b = [a[c].apply(this, b)];return b[0];
        };
      }, z.after = function (a, b) {
        return 0 >= a ? b() : function () {
          return --a < 1 ? b.apply(this, arguments) : void 0;
        };
      }, z.keys = x || function (a) {
        if (a !== Object(a)) throw new TypeError("Invalid object");var b = [];for (var c in a) z.has(a, c) && (b[b.length] = c);return b;
      }, z.values = function (a) {
        var b = [];for (var c in a) z.has(a, c) && b.push(a[c]);return b;
      }, z.pairs = function (a) {
        var b = [];for (var c in a) z.has(a, c) && b.push([c, a[c]]);return b;
      }, z.invert = function (a) {
        var b = {};for (var c in a) z.has(a, c) && (b[a[c]] = c);return b;
      }, z.functions = z.methods = function (a) {
        var b = [];for (var c in a) z.isFunction(a[c]) && b.push(c);return b.sort();
      }, z.extend = function (a) {
        return (A(j.call(arguments, 1), function (b) {
          if (b) for (var c in b) a[c] = b[c];
        }), a);
      }, z.pick = function (a) {
        var b = {},
            c = k.apply(f, j.call(arguments, 1));return (A(c, function (c) {
          c in a && (b[c] = a[c]);
        }), b);
      }, z.omit = function (a) {
        var b = {},
            c = k.apply(f, j.call(arguments, 1));for (var d in a) z.contains(c, d) || (b[d] = a[d]);return b;
      }, z.defaults = function (a) {
        return (A(j.call(arguments, 1), function (b) {
          if (b) for (var c in b) null == a[c] && (a[c] = b[c]);
        }), a);
      }, z.clone = function (a) {
        return z.isObject(a) ? z.isArray(a) ? a.slice() : z.extend({}, a) : a;
      }, z.tap = function (a, b) {
        return (b(a), a);
      };var G = function G(a, b, c, d) {
        if (a === b) return 0 !== a || 1 / a == 1 / b;if (null == a || null == b) return a === b;a instanceof z && (a = a._wrapped), b instanceof z && (b = b._wrapped);var e = l.call(a);if (e != l.call(b)) return !1;switch (e) {case "[object String]":
            return a == String(b);case "[object Number]":
            return a != +a ? b != +b : 0 == a ? 1 / a == 1 / b : a == +b;case "[object Date]":case "[object Boolean]":
            return +a == +b;case "[object RegExp]":
            return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;}if ("object" != typeof a || "object" != typeof b) return !1;for (var f = c.length; f--;) if (c[f] == a) return d[f] == b;c.push(a), d.push(b);var g = 0,
            h = !0;if ("[object Array]" == e) {
          if ((g = a.length, h = g == b.length)) for (; g-- && (h = G(a[g], b[g], c, d)););
        } else {
          var i = a.constructor,
              j = b.constructor;if (i !== j && !(z.isFunction(i) && i instanceof i && z.isFunction(j) && j instanceof j)) return !1;for (var k in a) if (z.has(a, k) && (g++, !(h = z.has(b, k) && G(a[k], b[k], c, d)))) break;if (h) {
            for (k in b) if (z.has(b, k) && ! g--) break;h = !g;
          }
        }return (c.pop(), d.pop(), h);
      };z.isEqual = function (a, b) {
        return G(a, b, [], []);
      }, z.isEmpty = function (a) {
        if (null == a) return !0;if (z.isArray(a) || z.isString(a)) return 0 === a.length;for (var b in a) if (z.has(a, b)) return !1;return !0;
      }, z.isElement = function (a) {
        return !(!a || 1 !== a.nodeType);
      }, z.isArray = w || function (a) {
        return "[object Array]" == l.call(a);
      }, z.isObject = function (a) {
        return a === Object(a);
      }, A(["Arguments", "Function", "String", "Number", "Date", "RegExp"], function (a) {
        z["is" + a] = function (b) {
          return l.call(b) == "[object " + a + "]";
        };
      }), z.isArguments(arguments) || (z.isArguments = function (a) {
        return !(!a || !z.has(a, "callee"));
      }), "function" != typeof /./ && (z.isFunction = function (a) {
        return "function" == typeof a;
      }), z.isFinite = function (a) {
        return isFinite(a) && !isNaN(parseFloat(a));
      }, z.isNaN = function (a) {
        return z.isNumber(a) && a != +a;
      }, z.isBoolean = function (a) {
        return a === !0 || a === !1 || "[object Boolean]" == l.call(a);
      }, z.isNull = function (a) {
        return null === a;
      }, z.isUndefined = function (a) {
        return void 0 === a;
      }, z.has = function (a, b) {
        return m.call(a, b);
      }, z.noConflict = function () {
        return (a._ = d, this);
      }, z.identity = function (a) {
        return a;
      }, z.times = function (a, b, c) {
        for (var d = Array(a), e = 0; a > e; e++) d[e] = b.call(c, e);return d;
      }, z.random = function (a, b) {
        return (null == b && (b = a, a = 0), a + Math.floor(Math.random() * (b - a + 1)));
      };var H = { escape: { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "/": "&#x2F;" } };H.unescape = z.invert(H.escape);var I = { escape: new RegExp("[" + z.keys(H.escape).join("") + "]", "g"), unescape: new RegExp("(" + z.keys(H.unescape).join("|") + ")", "g") };z.each(["escape", "unescape"], function (a) {
        z[a] = function (b) {
          return null == b ? "" : ("" + b).replace(I[a], function (b) {
            return H[a][b];
          });
        };
      }), z.result = function (a, b) {
        if (null == a) return null;var c = a[b];return z.isFunction(c) ? c.call(a) : c;
      }, z.mixin = function (a) {
        A(z.functions(a), function (b) {
          var c = z[b] = a[b];z.prototype[b] = function () {
            var a = [this._wrapped];return (i.apply(a, arguments), N.call(this, c.apply(z, a)));
          };
        });
      };var J = 0;z.uniqueId = function (a) {
        var b = ++J + "";return a ? a + b : b;
      }, z.templateSettings = { evaluate: /<%([\s\S]+?)%>/g, interpolate: /<%=([\s\S]+?)%>/g, escape: /<%-([\s\S]+?)%>/g };var K = /(.)^/,
          L = { "'": "'", "\\": "\\", "\r": "r", "\n": "n", "	": "t", "\u2028": "u2028", "\u2029": "u2029" },
          M = /\\|'|\r|\n|\t|\u2028|\u2029/g;z.template = function (a, b, c) {
        var d;c = z.defaults({}, c, z.templateSettings);var e = new RegExp([(c.escape || K).source, (c.interpolate || K).source, (c.evaluate || K).source].join("|") + "|$", "g"),
            f = 0,
            g = "__p+='";a.replace(e, function (b, c, d, e, h) {
          return (g += a.slice(f, h).replace(M, function (a) {
            return "\\" + L[a];
          }), c && (g += "'+\n((__t=(" + c + "))==null?'':_.escape(__t))+\n'"), d && (g += "'+\n((__t=(" + d + "))==null?'':__t)+\n'"), e && (g += "';\n" + e + "\n__p+='"), f = h + b.length, b);
        }), g += "';\n", c.variable || (g = "with(obj||{}){\n" + g + "}\n"), g = "var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n" + g + "return __p;\n";try {
          d = new Function(c.variable || "obj", "_", g);
        } catch (h) {
          throw (h.source = g, h);
        }if (b) return d(b, z);var i = function i(a) {
          return d.call(this, a, z);
        };return (i.source = "function(" + (c.variable || "obj") + "){\n" + g + "}", i);
      }, z.chain = function (a) {
        return z(a).chain();
      };var N = function N(a) {
        return this._chain ? z(a).chain() : a;
      };z.mixin(z), A(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (a) {
        var b = f[a];z.prototype[a] = function () {
          var c = this._wrapped;return (b.apply(c, arguments), "shift" != a && "splice" != a || 0 !== c.length || delete c[0], N.call(this, c));
        };
      }), A(["concat", "join", "slice"], function (a) {
        var b = f[a];z.prototype[a] = function () {
          return N.call(this, b.apply(this._wrapped, arguments));
        };
      }), z.extend(z.prototype, { chain: function chain() {
          return (this._chain = !0, this);
        }, value: function value() {
          return this._wrapped;
        } });
    }).call(this);
  }, {}], 22: [function (a) {
    "undefined" != typeof window && "function" != typeof window.requestAnimationFrame && (window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (a) {
      setTimeout(a, 1e3 / 60);
    }), Leap = a("../lib/index");
  }, { "../lib/index": 8 }] }, {}, [22]);
//# sourceMappingURL=leap-0.js.map
