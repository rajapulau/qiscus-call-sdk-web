# Qiscus Call SDK Web

This SDK contains functionalities to enable audio/video call on your web application.

## Installation
```javascript
<script src="https://rawgit.com/qiscus/qiscus-call-sdk-web/master/src/qiscus-call-sdk.js"></script>
```

## Initialization
```javascript
var qiscuscall = new QiscusCall('app_Id', 'app_Token');
```

Please contact us to get this AppId and AppToken.

## Start Call
```javascript
qiscuscall.initCall(username, room, initiator, autoaccept);
```

### For caller
```javascript
qiscuscall.initCall(username, room, true, true);
```

### For callee
```javascript
qiscuscall.initCall(username, room, false, true);
```

## Methods and Events
### `var qiscuscall = new QiscusCall('app_Id', 'app_Token')`
Initialization method.

### `qiscuscall.initCall(username, room, initiator, autoaccept)`
Start call.

### `qiscuscall.onLocalStream = function(stream)`
This events will be fired when successfully captured your video using webcam. It gives you `stream` object.

### `qiscuscall.onRemoteStream = function(id, stream)`
This events will be fired when receive remote video from your partner. It gives remote `id` and remote `stream` object.

### `qiscuscall.onPeerClosed = function(id)`
This events will be fired when your call session ended. It gives remote `id`.
