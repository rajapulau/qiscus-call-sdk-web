import Vue from 'vue'
import Vuex from 'vuex'
import actions from './actions'
// import MqttAdapter from '../../MqttAdapter'

// Make vue aware of Vuex
Vue.use(Vuex)

// Create an object to hold the initial state when
// the app starts up
const toastrPrimitive = { message: '', style: 'info' };
const state = {
  qiscus: qiscus,
  widgetIsToggled: false,
  isOnGoingCall: false,
  toastr: Object.assign({}, toastrPrimitive)
  // isLoading: qiscus.isLoading
}

// Create an object storing various mutations. We will write the mutation
const mutations = {
  TOGGLE_WIDGET(state) {
    state.widgetIsToggled = !state.widgetIsToggled
  },
  INIT(state, payload) {
    qiscus.init(payload.email, payload.username, payload.key)
  },
  CALL(state, payload) {
    state.isOnGoingCall = true;
  },
  END_CALL(state) {
    state.isOnGoingCall = false;
  },
  EXPAND_WIDGET(state) {
    state.widgetIsToggled = true;
  },
  SET_TOASTR(state, payload) {
    state.toastr.message = payload.message;
    state.toastr.style = payload.info;
  },
  HIDE_TOASTR(state) {
    state.toastr = Object.assign({}, toastrPrimitive);
  }
}

// Set the Getters
const getters = {
  triggerLabel: (state) => {
    if(!state.qiscus.isLogin) return `initializing qiscus widget ...`;
    if(state.qiscus.isLoading) return `loading chat data ...`;
    return 'Chat'
  }
}

window.vStore = null;
export default (function QiscusStoreSingleton() {
  if (!vStore) vStore = new Vuex.Store({
    state,
    mutations,
    getters,
    actions
  })
  return vStore;
})();
