import {EventEmitter} from 'events';
import RtcWrapper from './RtcWrapper';

class qiscusSDK extends EventEmitter {
  constructor() {
    super();
    this.UI = new UI(this);
    this.isLoading = false; 
    this.isInitted = false;
    this.isOnGoingCall = false;
    this.userData = {
      email: '', username: '',
      key:   '', token:    ''
    }

    // rtc related variables
    this.iceServers = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
    this.rtc_server = "https://qiscus-rtc-api.herokuapp.com";
    this.wrapper    = null;
    this.pc_publisher = null;
  }

  init(email, username) {
    const self          = this;
    // self.isLoading      = true;
    self.userData.email = email;
    self.userData.username = username;
    // simulating ajax call
    return new Promise((resolve, reject) => {
      // self.isLoading = false;
      self.isInitted = true;
      return resolve(qiscus);
    })
  }

  endCall() {}

  // rtc related function
  createWrapper(address, callback) {
    const self = this;
    self.wrapper = new WebSocket(address, 'halodoc-janus-protocol')

    self.wrapper.onerror = function(error) {
      console.error('Wrapper failing', error);
      self.wrapper = null;
    }

    self.wrapper.onclose = function() {
      console.info('Disconnected from wrapper (closed)');
      self.wrapper = null;
    }

    self.wrapper.onmessage = function(message) {
      var parsedMessage = JSON.parse(message.data);
      if (json.hasOwnProperty('response')) {
        if(json.response === 'open') {
          
        }
      }

    }
  }

  setRemoteDescription(type, payload) {
    return {
      sessionDescription: new RTCSessionDescription(payload),
      onSuccess: () => console.log(`${type} Remote Description accepted`) ,
      onError: (error) => console.error(`${type} Remote Description Declined`, error) 
    }
  }

  parseMessage(type) {
    if(type == 'response') {

    }
  }
}

class UI {
  constructor(parent) {
    this.parent = parent
    this.toastr = { message: '', style: 'info' };
    this.callee = []
  }
  call(targets) {
    if(!this.parent.isInitted) return false;
    this.callee.length = 0;
    if(typeof targets != "object") targets = [targets];
    targets.map((target) => {
      this.callee.push(target);
    })
    this.parent.isOnGoingCall = true;
    vStore.dispatch('call', targets);
  }
  endCall() {
    this.isOnGoingCall = false;
  }
}

window.qiscus = null;
export default (function QiscusStoreSingleton() {
  if (!qiscus) qiscus = new qiscusSDK();
  return qiscus;
})();