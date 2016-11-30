export default {
  toggleWidget: ({commit}) => commit('TOGGLE_WIDGET'),
  init: ({commit}, payload) => {
    commit('TOGGLE_WIDGET');
    qiscus.init(payload.email, payload.username)
    .then((res) => {
      commit('TOGGLE_WIDGET');
    })
  },
  call: ({commit}, emails) => {
    commit('EXPAND_WIDGET');
    commit('CALL', emails);
  },
  endCall: ({commit}) => {
    commit('END_CALL');
    commit('SET_TOASTR', { message: 'Ending call ...', style: 'info'});
    window.setTimeout(function(){
      commit('TOGGLE_WIDGET');
      commit('SET_TOASTR', { message: 'Call Ended', style: 'success'});
      commit('HIDE_TOASTR');
    }, 1500);
  }
}