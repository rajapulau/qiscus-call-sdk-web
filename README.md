# Qiscus Call SDK Web

This SDK contains functionalities to enable audio/video call on your web application.

## Installation
```javascript
<script src="https://s3-ap-southeast-1.amazonaws.com/qiscus-call-sdk/web/1.0.1/qiscus-call-sdk.min.js"></script>
```

## Initialization
```javascript
var qiscuscall = new QiscusCall('app_Id', 'app_Token');
```

Please contact us to get this AppId and AppToken.

### Start Call
```javascript
qiscuscall.initCall(username, room, stream, initiator, autoaccept);
```

#### For caller
```javascript
qiscuscall.initCall(username, room, null, true, true);
```

#### For callee
```javascript
qiscuscall.initCall(username, room, null, false, true);
```

### Start Conference
```javascript
qiscuscall.initConf(username, room, stream, initiator, autoaccept);
```

#### For room creator / initiator
```javascript
qiscuscall.initConf(username, room, null, true, true);
```

#### For room participant
```javascript
qiscuscall.initConf(username, room, null, false, true);
```

### End Call
```javascript
qiscuscall.endCall();
```

## Methods and Events
### `var qiscuscall = new QiscusCall('app_Id', 'app_Token')`
Initialization method.

### `qiscuscall.initCall(username, room, stream, initiator, autoaccept)`
Start call.

### `qiscuscall.initConf(username, room, stream, initiator, autoaccept)`
Start conference.

### `qiscuscall.endCall()`
End call.

### `qiscuscall.onLocalStream = function(stream)`
This events will be fired when successfully captured your video using webcam. It gives you `stream` object.

### `qiscuscall.onRemoteStream = function(id, stream)`
This events will be fired when receive remote video from your partner. It gives remote `id` and remote `stream` object.

### `qiscuscall.onPeerClosed = function(id)`
This events will be fired when your call session ended. It gives remote `id`.

## Sample
- Basic sample ()
- Multiparty / conference ()
- Qiscus Chat SDK integration ()
