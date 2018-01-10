'use strict';

/* QiscusRTC Signaling Hub
 */

function QiscusRTC() {
  var rtc = this;
  rtc.ws = null;
  rtc.appId = null;
  rtc.appSecret = null;
  rtc.appToken = null;
  rtc.clientId = null;
  rtc.clientStream = null;
  rtc.room = null;
  rtc.initiator = false;
  rtc.devices = null;
  rtc.selectedDevices = {};
  rtc.roomFeeds = [];

  // Auto populate devices
  getDevices();

  function getDevices() {
    rtc.devices = { microphones: [], cameras: [], speakers: [] };
    navigator.mediaDevices.enumerateDevices()
    .then(function(deviceInfos) {
      for (var i = 0; i != deviceInfos.length; ++i) {
        var deviceInfo = deviceInfos[i];
        if (deviceInfo.kind == "audioinput") {
          rtc.devices.microphones.push(deviceInfo);
        } else if (deviceInfo.kind == "videoinput") {
          rtc.devices.cameras.push(deviceInfo);
        } else if (deviceInfo.kind == "audiooutput") {
          rtc.devices.speakers.push(deviceInfo);
        }
      }
    })
    .catch(function(error) {
      rtc.onError(error);
    });
  };
}

QiscusRTC.prototype.init = function(appId, appSecret, clientId, room,initiator) {
  var rtc = this;

  rtc.appId = appId;
  rtc.appSecret = appSecret;
  rtc.clientId = clientId;
  rtc.room = room;
  rtc.initiator = initiator;
  rtc.connectWebSocket();
};

QiscusRTC.prototype.connectWebSocket = function() {
  var rtc = this;

  rtc.ws = new WebSocket('wss://rtc.qiscus.com/signal');

  rtc.ws.onopen = function() {
    console.log("Socket connection established");
    register();
  };

  rtc.ws.onmessage = function(message) {
    var res = JSON.parse(message.data);
    var data = JSON.parse(res.data);

    if (res.response == "register") {
      if (data.success) {
        rtc.appToken = data.token;
        captureLocalVideo();
      } else {
        rtc.onError(data.message);
      }
    } else if (res.response == "room_join") {
      if (data.success) {
        var feeds = JSON.parse(data.message);
        console.log(feeds);
        feeds = feeds.users;
        for (var i = 0; i < feeds.length; i++) {
          if (feeds[i] != rtc.clientId) {
            rtc.roomFeeds[feeds[i]] = {id: feeds[i], status: 0, pc: null};
            createPeer(feeds[i], true);
            setTimeout(function() {
              return;
            }, 250);
          }
        }
      } else {
        rtc.onError(data.message);
      }
    }

    if (res.event == "user_new") {
      rtc.roomFeeds[data.user] = {id: data.user, status: 0, pc: null};
    } else if (res.event == "user_leave") {
      setTimeout(function() {
        if (rtc.roomFeeds[data.user]) {
          removeFeed(data.user);
        }
      }, 2000);
    } else if (res.event == "room_data") {
      rtc.onMessage(res.sender, data);
    } else if (res.event == "room_data_private") {
      if (data.type == "offer") {
        if (rtc.roomFeeds[res.sender]) {
          createPeer(res.sender, false);
          rtc.roomFeeds[res.sender].pc.signal(data);
        } else if (rtc.roomFeeds[res.sender].pc != null) {
          resetPeer(res.sender);
          createPeer(res.sender, false);
          rtc.roomFeeds[res.sender].pc.signal(data);
        } else {
          rtc.roomFeeds[res.sender] = {id: res.sender, status: 0, pc: null};
          createPeer(res.sender, false);
          rtc.roomFeeds[res.sender].pc.signal(data);
        }
      } else if (data.type == "answer") {
        rtc.roomFeeds[res.sender].pc.signal(data);
      } else if (data.candidate) {
        rtc.roomFeeds[res.sender].pc.signal(data);
      }
    }
  };

  rtc.ws.onclose = function() {
    rtc.onError("Disconnected from server");
  };

  function captureLocalVideo() {
    if (rtc.selectedDevices.microphone) {
      var audiosel = { deviceId: rtc.selectedDevices.microphone };
    } else {
      var audiosel = true;
    }

    if (rtc.selectedDevices.camera) {
      var videosel = {
        deviceId: rtc.selectedDevices.camera,
        width: rtc.selectedDevices.videoWidth ? { exact: parseInt(rtc.selectedDevices.videoWidth) } : { exact: 320 },
        height: rtc.selectedDevices.videoHeight ? { exact: parseInt(rtc.selectedDevices.videoHeight) } : { exact: 240 }
      };
    } else {
      var videosel = {
        width: rtc.selectedDevices.videoWidth ? { exact: parseInt(rtc.selectedDevices.videoWidth) } : { exact: 320 },
        height: rtc.selectedDevices.videoHeight ? { exact: parseInt(rtc.selectedDevices.videoHeight) } : { exact: 240 }
      };
    }

    navigator.mediaDevices.getUserMedia({
      audio: audiosel,
      video: videosel
    })
    .then(function(stream) {
      rtc.clientStream = stream;
      rtc.onLocalStream(stream);

      if (rtc.initiator) {
        createRoom();
      } else {
        joinRoom();
      }
    })
    .catch(function(error) {
      var errstr = '';
      if (error.name == 'OverconstrainedError' && error.constraint) {
        errstr = 'Camera resolution is not supported: ' + rtc.selectedDevices.videoWidth + 'X' + rtc.selectedDevices.videoHeight;
      }
      if (errstr) {
        rtc.onError(errstr);
      } else {
        rtc.onError(error.name + ": " + error.constraint);
      }
    });
  };

  function register() {
    var payload = {
      request: "register",
      data: JSON.stringify({ username: rtc.clientId, app_id: rtc.appId, app_secret: rtc.appSecret })
    };

    rtc.ws.send(JSON.stringify(payload));
  };

  function createRoom() {
    var payload = {
      request: "room_create",
      room: rtc.room,
      data: JSON.stringify({ token: rtc.appToken, max_participant: 2 })
    };

    rtc.ws.send(JSON.stringify(payload));
  };

  function joinRoom() {
    var payload = {
      request: "room_join",
      room: rtc.room,
      data: JSON.stringify({ token: rtc.appToken })
    };

    rtc.ws.send(JSON.stringify(payload));
  };

  function createPeer(feed, i) {
    var pc = new SimplePeer({ initiator: i, stream: rtc.clientStream, config: { iceServers: [
      { urls: 'stun:139.59.110.14:3478' },
      { urls: 'turn:139.59.110.14:3478', credential: 'qiscuslova', username: 'sangkil' }
    ]}});
    rtc.roomFeeds[feed].pc = pc;

    rtc.roomFeeds[feed].pc.on('signal', function(data) {
      var payload = {
        request: "room_data",
        room: rtc.room,
        recipient: feed,
        data: JSON.stringify(data)
      };

      rtc.ws.send(JSON.stringify(payload));
    });

    rtc.roomFeeds[feed].pc.on('stream', function(stream) {
      rtc.onRemoteStream(feed, stream);
    });

    rtc.roomFeeds[feed].pc.on('close', function() {
      rtc.onPeerClosed(feed);
      removeFeed(feed);
    });
  }

  function resetPeer(feed) {
    if (rtc.roomFeeds[feed].pc) {
      rtc.roomFeeds[feed].pc.destroy();
    }

    if (rtc.roomFeeds[feed].pc) {
      rtc.roomFeeds[feed].pc = null;
    }
  }

  function removeFeed(feed) {
    if (rtc.roomFeeds[feed]) {
      resetPeer(feed);
      delete rtc.roomFeeds[feed];
    }
  }
};

QiscusRTC.prototype.startCall = function(appId, appSecret) {
  var rtc = this;

  rtc.appId = appId;
  rtc.appSecret = appSecret;
};

QiscusRTC.prototype.onMessage = function(id, data) {};

QiscusRTC.prototype.onLocalStream = function(stream) {};

QiscusRTC.prototype.onRemoteStream = function(id, stream) {};

QiscusRTC.prototype.onPeerConnected = function(id) {};

QiscusRTC.prototype.onPeerClosed = function(id) {};

QiscusRTC.prototype.onClosed = function() {};

QiscusRTC.prototype.onError = function(error) {};
