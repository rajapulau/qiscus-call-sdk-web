export default {
  toggleWidget: ({commit}) => commit('TOGGLE_WIDGET'),
  init: ({commit}, payload) => {
    commit('TOGGLE_WIDGET');
    qiscus.init(payload.email, payload.username)
    .then((res) => {
      commit('TOGGLE_WIDGET');
    })
  }
}