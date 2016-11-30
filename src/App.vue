<template>
  <div class="qiscus-rtc-app__container">
    <toastr v-if="toastr.message.length > 0"></toastr>
    <rtc-toggle :loading="isLoading" :is-initted="isInitted" :click-handler="toggleWidget"></rtc-toggle>
    <rtc-widget :expand="widgetIsToggled"
      :is-initted="isInitted" 
      :is-on-going-call="isOnGoingCall"
      :minimize-handler="toggleWidget">
    </rtc-widget>
  </div>
</template>

<script>
import store from './vuex/store'
import RtcToggle from './components/RtcToggle.vue'
import RtcWidget from './components/RtcWidget.vue'

require('./scss/qiscus-rtc.scss');

export default {
  name: 'app',
  components: { RtcToggle, RtcWidget },
  store,
  computed: {
    isLoading: function(){ return this.$store.state.qiscus.isLoading },
    isInitted: function(){ return this.$store.state.qiscus.isInitted },
    widgetIsToggled: function() { return this.$store.state.widgetIsToggled },
    isOnGoingCall: function() { return this.$store.state.isOnGoingCall },
    toastr: function() { return this.$store.state.qiscus.UI.toastr }
  },
  methods: {
    toggleWidget() {
      if(!this.isLoading) this.$store.dispatch('toggleWidget');
    }
  }
}
</script>