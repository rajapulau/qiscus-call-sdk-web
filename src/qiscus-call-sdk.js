"use strict";

/* Qiscus Call Signaling Hub
 */

function QiscusCall(appId, appToken) {
  var call = this;
  call.ws = null;
  call.room = null;
  call.devices = null;
  call.clientId = null;
  call.initiator = false;
  call.autoAccept = false;
  call.clientStream = null;
  call.selectedDevices = {};
  call.roomFeeds = [];

  call.appId = appId;
  call.appToken = appToken;
  call.appSecret = null;


  // Auto populate devices
  getDevices();

  function getDevices() {
    call.devices = { microphones: [], cameras: [], speakers: [] };
    navigator.mediaDevices.enumerateDevices()
    .then(function(deviceInfos) {
      for (var i = 0; i != deviceInfos.length; ++i) {
        var deviceInfo = deviceInfos[i];
        if (deviceInfo.kind == "audioinput") {
          call.devices.microphones.push(deviceInfo);
        } else if (deviceInfo.kind == "videoinput") {
          call.devices.cameras.push(deviceInfo);
        } else if (deviceInfo.kind == "audiooutput") {
          call.devices.speakers.push(deviceInfo);
        }
      }
    })
    .catch(function(error) {
      call.onError(error);
    });
  };
}

QiscusCall.prototype.initCall = function(clientId, room, initiator, autoAccept) {
  var call = this;

  call.clientId = clientId;
  call.room = room;
  call.initiator = initiator === true;
  call.autoAccept = autoAccept === true;
  call.connectWebSocket();
};

QiscusCall.prototype.connectWebSocket = function() {
  var call = this;

  call.ws = new WebSocket("wss://rtc.qiscus.com/signal");

  call.ws.onopen = function() {
    console.log("Socket connection established");
    register();
  };

  call.ws.onmessage = function(message) {
    var res = JSON.parse(message.data);
    var data = JSON.parse(res.data);

    if (res.response == "register") {
      if (data.success) {
        call.appSecret = data.token;
        captureLocalVideo();
      } else {
        call.onError(data.message);
      }
    } else if (res.response == "room_join") {
      if (data.success) {
        var feeds = JSON.parse(data.message);
        feeds = feeds.users;
        for (var i = 0; i < feeds.length; i++) {
          if (feeds[i] != call.clientId) {
            call.roomFeeds[feeds[i]] = {id: feeds[i], status: 0, pc: null};

            if (call.autoAccept) {
              autoAccept(feeds[i]);
            }
          }
        }
      } else {
        call.onError(data.message);
      }
    } else {
      //console.log(res);
    }

    if (res.event == "user_new") {
      call.roomFeeds[data.user] = {id: data.user, status: 0, pc: null};
    } else if (res.event == "user_leave") {
      setTimeout(function() {
        if (call.roomFeeds[data.user]) {
          if (call.roomFeeds[data.user] != null) {
            removeFeed(data.user);
          }
        }
      }, 2000);
    } else if (res.event == "room_data") {
      call.onMessage(res.sender, data);
    } else if (res.event == "room_data_private") {
      if (data.event == "call_sync") {
        //
      } else if (data.event == "call_ack") {
        //
      } else if (data.event == "call_accept") {
        createPeer(res.sender, true);
      }

      if (data.type == "offer") {
        if (call.roomFeeds[res.sender]) {
          createPeer(res.sender, false);
          call.roomFeeds[res.sender].pc.signal(data);
        } else if (call.roomFeeds[res.sender].pc != null) {
          resetPeer(res.sender);
          createPeer(res.sender, false);
          call.roomFeeds[res.sender].pc.signal(data);
        } else {
          call.roomFeeds[res.sender] = {id: res.sender, status: 0, pc: null};
          createPeer(res.sender, false);
          call.roomFeeds[res.sender].pc.signal(data);
        }
      } else if (data.type == "answer") {
        call.roomFeeds[res.sender].pc.signal(data);
      } else if (data.candidate) {
        if (data.type) {
          delete data.type;
          var candidate = { candidate: data };
        } else {
          var candidate = data;
        }

        call.roomFeeds[res.sender].pc.signal(candidate);
      }
    } else {
      //console.log(res);
    }
  };

  call.ws.onclose = function() {
    call.onError("Disconnected from server");
  };

  function captureLocalVideo() {
    if (call.selectedDevices.microphone) {
      var audiosel = { deviceId: call.selectedDevices.microphone };
    } else {
      var audiosel = true;
    }

    if (call.selectedDevices.camera) {
      var videosel = {
        deviceId: call.selectedDevices.camera,
        width: call.selectedDevices.videoWidth ? { exact: parseInt(call.selectedDevices.videoWidth) } : { exact: 320 },
        height: call.selectedDevices.videoHeight ? { exact: parseInt(call.selectedDevices.videoHeight) } : { exact: 240 }
      };
    } else {
      var videosel = {
        width: call.selectedDevices.videoWidth ? { exact: parseInt(call.selectedDevices.videoWidth) } : { exact: 320 },
        height: call.selectedDevices.videoHeight ? { exact: parseInt(call.selectedDevices.videoHeight) } : { exact: 240 }
      };
    }

    navigator.mediaDevices.getUserMedia({
      audio: audiosel,
      video: videosel
    })
    .then(function(stream) {
      call.clientStream = stream;
      call.onLocalStream(stream);

      if (call.initiator) {
        createRoom();
      } else {
        joinRoom();
      }
    })
    .catch(function(error) {
      var errstr = "";
      if (error.name == "OverconstrainedError" && error.constraint) {
        errstr = "Camera resolution is not supported: " + call.selectedDevices.videoWidth + "X" + call.selectedDevices.videoHeight;
      }
      if (errstr) {
        call.onError(errstr);
      } else {
        call.onError(error.name + ": " + error.constraint);
      }
    });
  };

  function register() {
    var payload = {
      request: "register",
      data: JSON.stringify({ username: call.clientId, app_id: call.appId, app_secret: call.appToken })
    };

    call.ws.send(JSON.stringify(payload));
  };

  function createRoom() {
    var payload = {
      request: "room_create",
      room: call.room,
      data: JSON.stringify({ token: call.appSecret, max_participant: 2 })
    };

    call.ws.send(JSON.stringify(payload));
  };

  function joinRoom() {
    var payload = {
      request: "room_join",
      room: call.room,
      data: JSON.stringify({ token: call.appSecret })
    };

    call.ws.send(JSON.stringify(payload));
  };

  function autoAccept(id) {
    var payload = {
      request: "room_data",
      room: call.room,
      recipient: id,
      data: JSON.stringify({ event: "call_accept" })
    };

    call.ws.send(JSON.stringify(payload));
  };

  function createPeer(feed, i) {
    var pc = new SimplePeer({ initiator: i, stream: call.clientStream, trickle: false, config: { iceServers: [
      { urls: "stun:139.59.110.14:3478" },
      { urls: "turn:139.59.110.14:3478", credential: "qiscuslova", username: "sangkil" }
    ]}});
    call.roomFeeds[feed].pc = pc;

    call.roomFeeds[feed].pc.on("signal", function(data) {
      var payload = {
        request: "room_data",
        room: call.room,
        recipient: feed,
        data: JSON.stringify(data)
      };

      call.ws.send(JSON.stringify(payload));
    });

    call.roomFeeds[feed].pc.on("stream", function(stream) {
      call.onRemoteStream(feed, stream);
    });

    call.roomFeeds[feed].pc.on("close", function() {
      call.onPeerClosed(feed);
      removeFeed(feed);
    });
  }

  function resetPeer(feed) {
    if (call.roomFeeds[feed].pc) {
      call.roomFeeds[feed].pc.destroy();
    }

    if (call.roomFeeds[feed].pc != null) {
      call.roomFeeds[feed].pc = null;
    }
  }

  function removeFeed(feed) {
    if (call.roomFeeds[feed]) {

      if (call.roomFeeds[feed] != null) {
        resetPeer(feed);
        delete call.roomFeeds[feed];
      }
    }
  }
};

QiscusCall.prototype.startCall = function(appId, appSecret) {
  var call = this;

  call.appId = appId;
  call.appSecret = appSecret;
};

QiscusCall.prototype.endCall = function() {
  var call = this;

  for (var i = 0; i < call.clientStream.getVideoTracks().length; i++) {
    call.clientStream.getVideoTracks()[i].enabled = false;
  }

  for (var i = 0; i < call.clientStream.getAudioTracks().length; i++) {
    call.clientStream.getAudioTracks()[i].enabled = false;
  }

  for (var i = 0; i < call.roomFeeds.length; i++) {
    call.roomFeeds[i].destroy();
  }
};

QiscusCall.prototype.muteMic = function(mute) {
  var call = this;

  for (var i = 0; i < call.clientStream.getAudioTracks().length; i++) {
    call.clientStream.getAudioTracks()[i].enabled = !mute;
  }
};

QiscusCall.prototype.disableCamera = function(disable) {
  var call = this;

  for (var i = 0; i < call.clientStream.getVideoTracks().length; i++) {
    call.clientStream.getVideoTracks()[i].enabled = !disable;
  }
};

QiscusCall.prototype.onMessage = function(id, data) {};

QiscusCall.prototype.onLocalStream = function(stream) {};

QiscusCall.prototype.onRemoteStream = function(id, stream) {};

QiscusCall.prototype.onPeerConnected = function(id) {};

QiscusCall.prototype.onPeerClosed = function(id) {};

QiscusCall.prototype.onClosed = function() {};

QiscusCall.prototype.onError = function(error) {};
