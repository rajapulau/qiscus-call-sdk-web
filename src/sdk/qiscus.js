import {EventEmitter} from 'events';

class qiscusSDK extends EventEmitter {
  constructor() {
    super();
    this.UI = new UI(this);
    this.isLoading = false; 
    this.isInitted = false;
    this.isOnGoingCall = false;
    this.userData = {
      email: '',
      username: '',
      key: '',
      token: ''
    }
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