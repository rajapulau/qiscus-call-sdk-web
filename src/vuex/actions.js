export default {
  toggleWidget: ({commit}) => commit('TOGGLE_WIDGET'),
  init: ({commit}, payload) => {
    commit('TOGGLE_WIDGET');
    commit('SET_TOASTR', {message: 'Logging In ...'})
    qiscus.isLoading = true;
    window.setTimeout(function(){
      qiscus.init(payload.email, payload.username)
      .then((res) => {
        commit('TOGGLE_WIDGET');
        commit('HIDE_TOASTR');
        qiscus.isLoading = false;
      })
    }, 1500)
  },
  call: ({commit}, emails) => {
    commit('SET_TOASTR', { message: `Calling ${emails}`, style: 'info'});
    qiscus.isLoading = true;
    window.setTimeout(function(){
      commit('EXPAND_WIDGET');
      commit('CALL', emails);
      commit('HIDE_TOASTR');
      qiscus.isLoading = false;
    }, 1500);
  },
  endCall: ({commit}) => {
    commit('END_CALL');
    commit('SET_TOASTR', { message: 'Ending call ...', style: 'info'});
    qiscus.isLoading = true;
    window.setTimeout(function(){
      commit('TOGGLE_WIDGET');
      commit('SET_TOASTR', { message: 'Call Ended', style: 'success'});
      commit('HIDE_TOASTR');
      qiscus.isLoading = false;
    }, 1500);
  }
}