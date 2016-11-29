import {EventEmitter} from 'events';

class qiscusSDK extends EventEmitter {
  constructor() {
    super();
    this.UI = new UI();
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
    self.isLoading      = true;
    self.userData.email = email;
    self.userData.username = username;
    // simulating ajax call
    return new Promise((resolve, reject) => {
      window.setTimeout(function() {
        self.isLoading = false;
        self.isInitted = true;
        console.info('ajax call')
        return resolve(qiscus);
      }, 2000)
    })
  }
  call() {}
  endCall() {}
}

class UI {
  constructor() {
    self.isLoading = false
    this.isOnGoingCall = false
    this.isInitted = false
    this.callee = []
  }
  call(targets) {
    this.isLoading = true;
    this.callee.length = 0;
    targets.map((target) => {
      this.callee.push(target);
    })
    this.isOnGoingCall = true;
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